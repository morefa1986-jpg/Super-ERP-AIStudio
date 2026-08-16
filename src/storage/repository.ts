/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Pool, 
  Hall, 
  MovementLog, 
  FeedingMeal, 
  MortalityLog, 
  WaterTestLog, 
  SonographyLog, 
  User, 
  AppNotification, 
  AuditLog, 
  SturgeonBreed 
} from "../types";
import { 
  INITIAL_POOLS, 
  INITIAL_HALLS, 
  INITIAL_MOVEMENTS, 
  INITIAL_FEEDINGS, 
  INITIAL_MORTALITY 
} from "../constants/initialData";
import { applyBatchesToPool } from "../core/stock";
import bcrypt from "bcryptjs";
import { getApiUrl } from "../network/connection";

const STORAGE_KEYS = {
  POOLS: "sturgeon_pools_v2",
  HALLS: "sturgeon_halls_v2",
  MOVEMENTS: "sturgeon_movements_v2",
  FEEDINGS: "sturgeon_feedings_v2",
  MORTALITIES: "sturgeon_mortalities_v2",
  LAB_TESTS: "sturgeon_lab_tests_v2",
  SONOGRAPHIES: "sturgeon_sonographies_v2",
  NOTIFICATIONS: "sturgeon_notifications_v2",
  USER: "sturgeon_current_user_v2",
  USERS: "sturgeon_users_v2",
  AUDIT_LOGS: "sturgeon_audit_logs_v2",
  PENDING_QUEUE: "sturgeon_pending_sync_queue_v2"
};

const DEFAULT_USER: User = {
  id: "admin",
  name: "مدیر سیستم (ادمین)",
  role: "admin",
  permissions: ["all"],
  username: "admin"
};

// Simple helper to write to localStorage
const writeJson = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing to localStorage under key ${key}:`, e);
  }
};

// Simple helper to read from localStorage with fallback
const readJson = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      // Migrate "واننیرو" to "ونیرو" if found
      const migrated = item.replace(/واننیرو/g, "ونیرو");
      return JSON.parse(migrated) as T;
    }
  } catch (e) {
    console.error(`Error reading from localStorage under key ${key}:`, e);
  }
  return fallback;
};

export const SturgeonRepository = {
  // --- USER SESSION ---
  getCurrentUser(): User | null {
    return readJson<User | null>(STORAGE_KEYS.USER, null);
  },

  setCurrentUser(user: User): void {
    writeJson(STORAGE_KEYS.USER, user);
    this.addAuditLog(
      user.id,
      user.name,
      "USER_LOGIN_SWITCH",
      `ورود کاربر جدید با نام کاربری ${user.username || user.name}`
    );
  },

  getUsers(): User[] {
    return readJson<User[]>(STORAGE_KEYS.USERS, [
      {
        id: "admin",
        name: "مدیریت سیستم",
        username: "admin",
        password: "",
        role: "admin",
        permissions: ["all"]
      }
    ]);
  },

  // --- OFFLINE QUEUE TRACKING ---
  getPendingQueue(): Array<{ id: string; timestamp: string; action: string; detail: string }> {
    return readJson<Array<{ id: string; timestamp: string; action: string; detail: string }>>(
      STORAGE_KEYS.PENDING_QUEUE,
      []
    );
  },

  recordOfflineChange(action: string, detail: string): void {
    const queue = this.getPendingQueue();
    queue.push({
      id: `pending-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      detail
    });
    writeJson(STORAGE_KEYS.PENDING_QUEUE, queue);
    // If online, immediately try to sync with server
    if (navigator.onLine) {
      this.syncWithServer().catch(() => {});
    }
  },

  clearPendingQueue(): void {
    localStorage.removeItem(STORAGE_KEYS.PENDING_QUEUE);
  },

  saveUsers(users: User[]): void {
    const safeUsers = users.map(user => {
      const copy = { ...user };
      if (copy.password && !/^\$2[aby]\$/.test(copy.password)) {
        copy.password = bcrypt.hashSync(copy.password, 10);
      }
      return copy;
    });
    writeJson(STORAGE_KEYS.USERS, safeUsers);
    this.recordOfflineChange("SAVE_USERS", `بروزرسانی فهرست کاربران (${users.length} کاربر)`);
  },

  getRolePermissions(): Record<string, string[]> {
    return readJson<Record<string, string[]>>("sturgeon_role_permissions_v3", {
      admin: ["all"],
      supervisor: ["map", "stats", "realtime", "feeding", "lab", "mortality", "transfer", "archive", "feedmill", "inventory", "facilities", "chat", "settings"],
      operator: ["map", "realtime", "feeding", "lab", "mortality", "chat"],
      viewer: ["map", "stats", "realtime", "archive"]
    });
  },

  saveRolePermissions(perms: Record<string, string[]>): void {
    writeJson("sturgeon_role_permissions_v3", perms);
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem("sturgeon_auth_token");
  },

  async loginWithServer(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem("sturgeon_auth_token", data.token);
        }
        this.setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "خطا در احراز هویت" };
    } catch (err: any) {
      console.warn("Server auth failed, falling back to local credentials:", err.message);
      // Fallback local check
      const users = this.getUsers();
      const match = users.find(u => u.username?.toLowerCase() === username.toLowerCase());
      const validLocalPassword = match?.password
        ? (/^\$2[aby]\$/.test(match.password) ? bcrypt.compareSync(password, match.password) : match.password === password)
        : false;
      if (match && validLocalPassword) {
        if (match.password && !/^\$2[aby]\$/.test(match.password)) {
          match.password = bcrypt.hashSync(password, 10);
          this.saveUsers(users);
        }
        const safeUser = { ...match };
        delete safeUser.password;
        this.setCurrentUser(safeUser);
        return { success: true, user: safeUser };
      }
      return { success: false, error: "نام کاربری یا رمز عبور اشتباه است." };
    }
  },

  // --- HALLS ---
  getHalls(): Hall[] {
    const rawHalls = readJson<Hall[]>(STORAGE_KEYS.HALLS, INITIAL_HALLS);
    return rawHalls.map(h => {
      if (h.id === 1) {
        return {
          ...h,
          name: "سالن ۱ (نرسری)",
          description: "شامل ۵۲ ونیرو (استخر قطر ۲ متر) جهت نگهداری لارو و بچه ماهی خاویاری",
          poolIds: h.poolIds.filter(id => {
            const num = parseInt(id.replace("h1p", ""));
            return isNaN(num) || num <= 52;
          })
        };
      }
      return h;
    });
  },

  saveHalls(halls: Hall[]): void {
    writeJson(STORAGE_KEYS.HALLS, halls);
    this.recordOfflineChange("SAVE_HALLS", `ذخیره پیکربندی سالن‌ها (${halls.length} سالن)`);
  },

  // --- POOLS (WITH AUTOMATIC BIOMASS CALCULATIONS) ---
  getPools(): Pool[] {
    const rawPools = readJson<Pool[]>(STORAGE_KEYS.POOLS, INITIAL_POOLS);
    // Filter out pools h1p53..h1p70 if present
    const filteredPools = rawPools.filter(p => {
      if (p.hallId === 1) {
        const num = parseInt(p.id.replace("h1p", ""));
        return isNaN(num) || num <= 52;
      }
      return true;
    });

    // Fish batches are the single source of truth whenever they exist.
    return filteredPools.map(p => {
      const name = p.hallId === 1 ? p.name.replace("استخر", "ونیرو") : p.name;
      if (p.fishBatches?.length) return { ...applyBatchesToPool(p, p.fishBatches), name };
      const actualBiomass = parseFloat(((p.count * p.avgWeightGrams) / 1000).toFixed(1));
      return {
        ...p,
        name,
        totalBiomassKg: actualBiomass
      };
    });
  },

  savePools(pools: Pool[]): void {
    const processedPools = pools.map(p => {
      if (p.fishBatches?.length) return applyBatchesToPool(p, p.fishBatches);
      const actualBiomass = parseFloat(((p.count * p.avgWeightGrams) / 1000).toFixed(1));
      return { ...p, totalBiomassKg: actualBiomass };
    });
    writeJson(STORAGE_KEYS.POOLS, processedPools);
    this.recordOfflineChange("SAVE_POOLS", `ذخیره داده‌های استخرها (${pools.length} استخر)`);
  },

  // --- MOVEMENTS ---
  getMovements(): MovementLog[] {
    return readJson<MovementLog[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  },

  saveMovements(movements: MovementLog[]): void {
    writeJson(STORAGE_KEYS.MOVEMENTS, movements);
    this.recordOfflineChange("SAVE_MOVEMENTS", `ثبت جابجایی ماهیان (${movements.length} سابقه)`);
  },

  // --- FEEDINGS ---
  getFeedings(): FeedingMeal[] {
    return readJson<FeedingMeal[]>(STORAGE_KEYS.FEEDINGS, INITIAL_FEEDINGS);
  },

  saveFeedings(feedings: FeedingMeal[]): void {
    writeJson(STORAGE_KEYS.FEEDINGS, feedings);
    this.recordOfflineChange("SAVE_FEEDINGS", `ثبت وعده تغذیه (${feedings.length} وعده)`);
  },

  // --- MORTALITIES ---
  getMortalities(): MortalityLog[] {
    return readJson<MortalityLog[]>(STORAGE_KEYS.MORTALITIES, INITIAL_MORTALITY);
  },

  saveMortalities(logs: MortalityLog[]): void {
    writeJson(STORAGE_KEYS.MORTALITIES, logs);
    this.recordOfflineChange("SAVE_MORTALITIES", `ثبت تلفات استخر (${logs.length} مورد)`);
  },

  // --- WATER LAB TESTS ---
  getLabTests(): WaterTestLog[] {
    return readJson<WaterTestLog[]>(STORAGE_KEYS.LAB_TESTS, []);
  },

  saveLabTests(tests: WaterTestLog[]): void {
    writeJson(STORAGE_KEYS.LAB_TESTS, tests);
    this.recordOfflineChange("SAVE_LAB_TESTS", `ثبت آنالیز پارامترهای آب (${tests.length} نمونه)`);
  },

  // --- SONOGRAPHIES ---
  getSonographies(): SonographyLog[] {
    return readJson<SonographyLog[]>(STORAGE_KEYS.SONOGRAPHIES, []);
  },

  saveSonographies(logs: SonographyLog[]): void {
    writeJson(STORAGE_KEYS.SONOGRAPHIES, logs);
    this.recordOfflineChange("SAVE_SONOGRAPHIES", `ثبت سونوگرافی و تعیین جنسیت (${logs.length} رکورد)`);
  },

  // --- NOTIFICATIONS & CENTRAL ALERTS ---
  getNotifications(): AppNotification[] {
    return readJson<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  saveNotifications(alerts: AppNotification[]): void {
    writeJson(STORAGE_KEYS.NOTIFICATIONS, alerts);
    this.recordOfflineChange("SAVE_NOTIFICATIONS", `بروزرسانی اعلانات سامانه (${alerts.length} اعلان)`);
  },

  // --- AUDIT LOGGING SERVICE ---
  getAuditLogs(): AuditLog[] {
    return readJson<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  },

  addAuditLog(userId: string, userName: string, action: string, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestampJalali: "1405/03/10",
      timestampGregorian: new Date().toISOString(),
      userId,
      userName,
      action,
      details
    };
    logs.unshift(newLog); // Newest first
    writeJson(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 1000)); // Maintain maximum 1000 audits
  },

  // --- GLOBAL RESET ---
  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.POOLS);
    localStorage.removeItem(STORAGE_KEYS.HALLS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.FEEDINGS);
    localStorage.removeItem(STORAGE_KEYS.MORTALITIES);
    localStorage.removeItem(STORAGE_KEYS.LAB_TESTS);
    localStorage.removeItem(STORAGE_KEYS.SONOGRAPHIES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    writeJson(STORAGE_KEYS.USER, DEFAULT_USER);
  },

  // --- CENTRALIZED NETWORK SYNC (FOR SHARED MULTI-USER LOCAL LAN STORAGE) ---
  async syncWithServer(): Promise<{ success: boolean; lastSynced?: string; error?: string; status?: "synced" | "offline" | "unauthorized" | "error" }> {
    try {
      const keysToSync = [
        "sturgeon_pools_v2",
        "sturgeon_halls_v2",
        "sturgeon_movements_v2",
        "sturgeon_feedings_v2",
        "sturgeon_mortalities_v2",
        "sturgeon_lab_tests_v2",
        "sturgeon_sonographies_v2",
        "sturgeon_notifications_v2",
        "sturgeon_users_v2",
        "sturgeon_audit_logs_v2",
        "sturgeon_general_settings_v2",
        "sturgeon_role_permissions_v3"
      ];

      const clientPayload: Record<string, any> = {};
      keysToSync.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            clientPayload[key] = JSON.parse(val);
          } catch (e) {
            // ignore
          }
        }
      });

      const token = localStorage.getItem("sturgeon_auth_token");
      if (!token) {
        return { success: false, status: "unauthorized", error: "توکن ورود وجود ندارد؛ برای همگام‌سازی دوباره وارد شوید." };
      }
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(getApiUrl("/api/db/sync"), {
        method: "POST",
        headers,
        body: JSON.stringify(clientPayload)
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, status: "unauthorized", error: "نشست ورود منقضی شده یا معتبر نیست." };
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const resData = await response.json();
      if (resData && resData.success && resData.db) {
        const db = resData.db;
        Object.keys(db).forEach(key => {
          if (keysToSync.includes(key)) {
            localStorage.setItem(key, JSON.stringify(db[key]));
          }
        });
        // Clear pending offline queue after successful server sync
        this.clearPendingQueue();
        return { success: true, status: "synced", lastSynced: db.lastSyncedAt };
      }
      return { success: false, status: "error", error: "ساختار پاسخ نامعتبر از سرور" };
    } catch (err: any) {
      console.warn("Local Network Sync failed (using offline mode):", err.message);
      return { success: false, status: "offline", error: err.message };
    }
  }
};
