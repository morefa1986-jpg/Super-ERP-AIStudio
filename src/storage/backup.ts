import { BackupEnvelope } from "../types";

export const CURRENT_SCHEMA_VERSION = 6;
export const APP_VERSION = "5.2.0-offline";
const INCLUDED_PREFIXES = ["sturgeon_", "caviar_", "fathi_"];

function checksum(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function collectData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !INCLUDED_PREFIXES.some(prefix => key.startsWith(prefix))) continue;
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
  }
  return data;
}

export function createBackup(createdBy: string): BackupEnvelope {
  const data = collectData();
  const serialized = JSON.stringify(data);
  return {
    format: "fathi-aqua-backup",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
    createdBy,
    checksum: checksum(serialized),
    data
  };
}

function migrate(input: unknown): BackupEnvelope {
  if (!input || typeof input !== "object") throw new Error("ساختار فایل پشتیبان معتبر نیست.");
  const candidate = input as Partial<BackupEnvelope> & Record<string, unknown>;
  if (candidate.format === "fathi-aqua-backup" && candidate.data) return candidate as BackupEnvelope;
  const legacyData = Object.fromEntries(Object.entries(candidate).map(([key, value]) => {
    if (typeof value === "string") {
      try { return [key, JSON.parse(value)]; } catch { return [key, value]; }
    }
    return [key, value];
  }));
  return {
    format: "fathi-aqua-backup",
    schemaVersion: 1,
    appVersion: "legacy",
    createdAt: new Date().toISOString(),
    createdBy: "legacy-import",
    checksum: checksum(JSON.stringify(legacyData)),
    data: legacyData
  };
}

export function restoreBackup(input: unknown): { importedKeys: number; sourceVersion: number } {
  const envelope = migrate(input);
  if (envelope.schemaVersion > CURRENT_SCHEMA_VERSION) throw new Error("این پشتیبان متعلق به نسخه جدیدتری از برنامه است.");
  if (checksum(JSON.stringify(envelope.data)) !== envelope.checksum) throw new Error("صحت فایل پشتیبان تأیید نشد؛ فایل ممکن است ناقص باشد.");
  const entries = Object.entries(envelope.data).filter(([key]) => INCLUDED_PREFIXES.some(prefix => key.startsWith(prefix)));
  if (!entries.length) throw new Error("هیچ داده قابل بازیابی در فایل وجود ندارد.");

  const rollback = collectData();
  try {
    entries.forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    localStorage.setItem("fathi_last_restore", JSON.stringify({ at: new Date().toISOString(), sourceVersion: envelope.schemaVersion }));
  } catch (error) {
    Object.keys(localStorage).filter(key => INCLUDED_PREFIXES.some(prefix => key.startsWith(prefix))).forEach(key => localStorage.removeItem(key));
    Object.entries(rollback).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
    throw error;
  }
  return { importedKeys: entries.length, sourceVersion: envelope.schemaVersion };
}
