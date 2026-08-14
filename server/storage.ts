import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const SERVER_SCHEMA_VERSION = 1;

export interface ServerStoreOptions {
  dataDir: string;
  legacyJsonPaths?: string[];
  now?: () => Date;
}

function safeTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export class ServerStore {
  readonly dataDir: string;
  readonly backupDir: string;
  readonly databasePath: string;
  private readonly now: () => Date;
  private readonly database: DatabaseSync;
  private lastAutomaticBackupAt = 0;

  constructor(options: ServerStoreOptions) {
    this.dataDir = path.resolve(options.dataDir);
    this.backupDir = path.join(this.dataDir, "backups");
    this.databasePath = path.join(this.dataDir, "fathi-aqua.sqlite");
    this.now = options.now ?? (() => new Date());

    fs.mkdirSync(this.backupDir, { recursive: true });
    this.database = new DatabaseSync(this.databasePath, {
      timeout: 5_000,
      enableForeignKeyConstraints: true,
    });
    this.database.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;");
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS app_data (
        key TEXT PRIMARY KEY NOT NULL,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      ) STRICT;
    `);

    this.setMetadata("schema_version", String(SERVER_SCHEMA_VERSION));
    this.setMetadata("app_version", process.env.npm_package_version || "5.2.0");
    this.lastAutomaticBackupAt = Date.now();
    this.migrateLegacyJson(options.legacyJsonPaths ?? []);
    this.createBackup("startup");
  }

  read(): Record<string, unknown> {
    const rows = this.database.prepare("SELECT key, value_json FROM app_data ORDER BY key").all() as Array<{
      key: string;
      value_json: string;
    }>;
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value_json);
      } catch {
        result[row.key] = row.value_json;
      }
    }
    return result;
  }

  write(data: Record<string, unknown>): void {
    this.createAutomaticBackupIfNeeded();
    const timestamp = this.now().toISOString();
    const upsert = this.database.prepare(`
      INSERT INTO app_data (key, value_json, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
    `);
    const remove = this.database.prepare("DELETE FROM app_data WHERE key = ?");
    const existingKeys = new Set(
      (this.database.prepare("SELECT key FROM app_data").all() as Array<{ key: string }>).map((row) => row.key),
    );

    this.database.exec("BEGIN IMMEDIATE");
    try {
      for (const [key, value] of Object.entries(data)) {
        upsert.run(key, JSON.stringify(value), timestamp);
        existingKeys.delete(key);
      }
      for (const key of existingKeys) remove.run(key);
      this.setMetadata("last_write_at", timestamp);
      this.database.exec("COMMIT");
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  createBackup(reason = "manual"): string {
    const baseName = `fathi-aqua-${safeTimestamp(this.now())}-${reason.replace(/[^a-z0-9_-]/gi, "-")}`;
    let destination = path.join(this.backupDir, `${baseName}.sqlite`);
    let suffix = 1;
    while (fs.existsSync(destination)) {
      destination = path.join(this.backupDir, `${baseName}-${suffix}.sqlite`);
      suffix += 1;
    }
    this.database.exec(`VACUUM INTO ${sqlString(destination)}`);
    this.lastAutomaticBackupAt = Date.now();
    this.pruneBackups(30);
    return destination;
  }

  close(): void {
    this.database.close();
  }

  private setMetadata(key: string, value: string): void {
    this.database.prepare(`
      INSERT INTO app_metadata (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, value);
  }

  private getMetadata(key: string): string | undefined {
    const row = this.database.prepare("SELECT value FROM app_metadata WHERE key = ?").get(key) as
      | { value: string }
      | undefined;
    return row?.value;
  }

  private migrateLegacyJson(candidates: string[]): void {
    if (this.getMetadata("legacy_json_migrated_at")) return;
    const hasData = (this.database.prepare("SELECT COUNT(*) AS count FROM app_data").get() as { count: number }).count > 0;
    if (hasData) {
      this.setMetadata("legacy_json_migrated_at", this.now().toISOString());
      return;
    }

    for (const candidate of [...new Set(candidates.map((entry) => path.resolve(entry)))]) {
      if (!fs.existsSync(candidate)) continue;
      try {
        const parsed = JSON.parse(fs.readFileSync(candidate, "utf8")) as Record<string, unknown>;
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          this.write(parsed);
          this.setMetadata("legacy_json_source", candidate);
          break;
        }
      } catch (error) {
        console.error(`[Storage] Legacy database could not be imported from ${candidate}:`, error);
      }
    }
    this.setMetadata("legacy_json_migrated_at", this.now().toISOString());
  }

  private createAutomaticBackupIfNeeded(): void {
    if (Date.now() - this.lastAutomaticBackupAt >= 60 * 60 * 1000) this.createBackup("automatic");
  }

  private pruneBackups(maxFiles: number): void {
    const files = fs.readdirSync(this.backupDir)
      .filter((file) => file.endsWith(".sqlite"))
      .map((file) => ({ file, time: fs.statSync(path.join(this.backupDir, file)).mtimeMs }))
      .sort((a, b) => b.time - a.time);
    for (const old of files.slice(maxFiles)) fs.unlinkSync(path.join(this.backupDir, old.file));
  }
}

export function resolveDataDirectory(): string {
  if (process.env.FATHI_ERP_DATA_DIR) return path.resolve(process.env.FATHI_ERP_DATA_DIR);
  if (process.platform === "win32") {
    const base = process.env.PROGRAMDATA || process.env.LOCALAPPDATA || process.cwd();
    return path.join(base, "FathiAquaSuperERP");
  }
  return path.join(process.cwd(), "data");
}
