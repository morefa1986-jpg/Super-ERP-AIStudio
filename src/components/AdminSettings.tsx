/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Building, 
  PlusCircle, 
  Info, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle,
  Waves,
  Hammer,
  RotateCcw,
  Factory,
  Layers,
  FileSpreadsheet,
  History,
  Search,
  CheckCircle,
  Clock,
  User as UserIcon,
  UserPlus,
  Users,
  X,
  FileText
} from "lucide-react";
import { Pool, Hall, SturgeonBreed, AuditLog, User } from "../types";
import { SturgeonRepository } from "../storage/repository";
import { SettingsManager } from "./SettingsManager";

interface AdminSettingsProps {
  pools: Pool[];
  halls: Hall[];
  setPools: React.Dispatch<React.SetStateAction<Pool[]>>;
  setHalls: React.Dispatch<React.SetStateAction<Hall[]>>;
  onReloadData?: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  pools,
  halls,
  setPools,
  setHalls,
  onReloadData
}) => {
  // Navigation inside Admin Panel
  const [adminTab, setAdminTab] = useState<"settings" | "halls" | "pools" | "processing_setup" | "audit_logs" | "users">("settings");

  // All sections / tabs list for granular permission checkboxes
  const ALL_SECTIONS = [
    { id: "map", label: "نقشه و جانمایی استخرها" },
    { id: "stats", label: "جدول بیوماس و آمار کلی" },
    { id: "realtime", label: "کنترل آنلاین پارامترها" },
    { id: "feeding", label: "ماشین حساب و دفتر جیره" },
    { id: "lab", label: "آزمایشگاه و کنترل کیفی" },
    { id: "mortality", label: "دفتر ثبت تلفات و بیوپسی" },
    { id: "transfer", label: "دفتر جابه‌جایی و ردیابی" },
    { id: "archive", label: "بایگانی و گزارش‌گیری" },
    { id: "facilities", label: "بخش تأسیسات" },
    { id: "feedmill", label: "کارگاه خوراک‌سازی" },
    { id: "inventory", label: "بخش انبارداری" },
    { id: "processing", label: "کارخانه فراوری" },
    { id: "coldstorage", label: "سردخانه مرکزی" },
    { id: "traceability", label: "زنجیره تأمین و رهگیری" },
    { id: "accounting", label: "امور مالی و حسابداری" },
    { id: "security", label: "نگهبانی و حراست" },
    { id: "chat", label: "سامانه گفتگو و بیسیم" },
    { id: "settings", label: "پیکربندی عمومی و آستانه‌ها" },
    { id: "admin", label: "تنظیمات کالبدی و احداث سالن" }
  ];

  // User Management State
  const [userList, setUserList] = useState<User[]>(() => SturgeonRepository.getUsers());
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffUsername, setNewStaffUsername] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"admin" | "supervisor" | "operator" | "viewer">("operator");
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState("");
  const [expandedPermissionsUserId, setExpandedPermissionsUserId] = useState<string | null>(null);

  // Role permissions state and handlers for customizable roles
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(() => SturgeonRepository.getRolePermissions());
  const [activePermissionRoleTab, setActivePermissionRoleTab] = useState<"supervisor" | "operator" | "viewer">("supervisor");

  const handleToggleRolePermission = (role: string, permissionId: string) => {
    if (role === "admin") return;
    const current = rolePermissions[role] || [];
    const updated = current.includes(permissionId)
      ? current.filter(p => p !== permissionId)
      : [...current, permissionId];
    
    const newRoles = { ...rolePermissions, [role]: updated };
    setRolePermissions(newRoles);
    SturgeonRepository.saveRolePermissions(newRoles);
    logAuditAction("UPDATE_ROLE_PERMISSION", `تغییر دسترسی نقش "${role}" - بخش "${permissionId}"`);
    showToast("دسترسی نقش با موفقیت بروزرسانی شد.");
    if (onReloadData) onReloadData();
  };

  const handleToggleRoleGroupPermissions = (role: string, sectionIds: string[], selectAll: boolean) => {
    if (role === "admin") return;
    const current = rolePermissions[role] || [];
    const base = current.filter(p => !sectionIds.includes(p));
    const updated = selectAll ? [...base, ...sectionIds] : base;

    const newRoles = { ...rolePermissions, [role]: updated };
    setRolePermissions(newRoles);
    SturgeonRepository.saveRolePermissions(newRoles);
    logAuditAction("UPDATE_ROLE_PERMISSION_GROUP", `تغییر گروهی دسترسی‌های نقش "${role}"`);
    showToast(selectAll ? "دسترسی‌های گروهی فعال شد." : "دسترسی‌های گروهی لغو شد.");
    if (onReloadData) onReloadData();
  };

  const handleResetRolePermissions = () => {
    const factoryDefaults = {
      admin: ["all"],
      supervisor: ["map", "stats", "realtime", "feeding", "lab", "mortality", "transfer", "archive", "feedmill", "inventory", "facilities", "chat", "settings"],
      operator: ["map", "realtime", "feeding", "lab", "mortality", "chat"],
      viewer: ["map", "stats", "realtime", "archive"]
    };
    setRolePermissions(factoryDefaults);
    SturgeonRepository.saveRolePermissions(factoryDefaults);
    logAuditAction("RESET_ROLE_PERMISSIONS", "بازنشانی دسترسی تمامی نقش‌ها به تنظیمات پیش‌فرض کارخانه");
    showToast("دسترسی نقش‌ها به تنظیمات پیش‌فرض بازنشانی شد.");
    if (onReloadData) onReloadData();
  };

  // Toggle single permission check box
  const handleTogglePermission = (userId: string, permissionId: string) => {
    const updated = userList.map(u => {
      if (u.id === userId) {
        const currentPerms = u.permissions || [];
        const hasPermission = currentPerms.includes(permissionId);
        const newPermissions = hasPermission
          ? currentPerms.filter(p => p !== permissionId)
          : [...currentPerms, permissionId];
        return { ...u, permissions: newPermissions };
      }
      return u;
    });
    setUserList(updated);
    SturgeonRepository.saveUsers(updated);
    
    const targetUser = userList.find(u => u.id === userId);
    if (targetUser) {
      logAuditAction("UPDATE_PERMISSIONS", `بروزرسانی دسترسی اختصاصی "${permissionId}" برای کاربر "${targetUser.name}" (${targetUser.username})`);
    }
  };

  // Select/Deselect all helper for a user
  const handleSelectAllPermissions = (userId: string) => {
    const updated = userList.map(u => {
      if (u.id === userId) {
        return { ...u, permissions: ALL_SECTIONS.map(s => s.id) };
      }
      return u;
    });
    setUserList(updated);
    SturgeonRepository.saveUsers(updated);
    logAuditAction("UPDATE_PERMISSIONS_ALL", `فعال‌سازی تمامی دسترسی‌ها برای کاربر`);
    showToast("تمامی دسترسی‌ها برای کاربر فعال شد.");
  };

  const handleClearAllPermissions = (userId: string) => {
    const updated = userList.map(u => {
      if (u.id === userId) {
        return { ...u, permissions: [] };
      }
      return u;
    });
    setUserList(updated);
    SturgeonRepository.saveUsers(updated);
    logAuditAction("UPDATE_PERMISSIONS_NONE", `غیرفعال‌سازی تمامی دسترسی‌ها برای کاربر`);
    showToast("تمامی دسترسی‌های کاربر لغو شد.");
  };

  // Group selection / toggle helper for a user
  const handleToggleGroupPermissions = (userId: string, sectionIds: string[], selectAll: boolean) => {
    const updated = userList.map(u => {
      if (u.id === userId) {
        const currentPerms = u.permissions || [];
        const basePerms = currentPerms.filter(p => !sectionIds.includes(p));
        const newPermissions = selectAll
          ? [...basePerms, ...sectionIds]
          : basePerms;
        return { ...u, permissions: newPermissions };
      }
      return u;
    });
    setUserList(updated);
    SturgeonRepository.saveUsers(updated);
    logAuditAction("UPDATE_PERMISSIONS_GROUP", `بروزرسانی گروهی دسترسی‌ها برای کاربر`);
    showToast(selectAll ? "دسترسی‌های گروه فعال شد." : "دسترسی‌های گروه لغو شد.");
  };

  // Success/Error notification states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // State for internal Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("sturgeon_audit_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse sturgeon_audit_logs:", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("sturgeon_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper to record audits
  const logAuditAction = (action: string, details: string) => {
    const now = new Date();
    // Jalali time representation matching application's standard
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const jalaliTimestamp = `1405/03/10 ${timeStr}`;

    const currentUser = SturgeonRepository.getCurrentUser();
    const newLog: AuditLog = {
      id: `audit-${Math.random().toString(36).substring(2, 9)}`,
      timestampJalali: jalaliTimestamp,
      timestampGregorian: now.toISOString(),
      userId: currentUser?.username || "admin",
      userName: currentUser?.name || "مدیر سیستم",
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffUsername.trim() || !newStaffPassword.trim()) {
      showToast("لطفاً تمام مشخصات پرسنل را به دقت وارد کنید.", "error");
      return;
    }

    const usernameLower = newStaffUsername.trim().toLowerCase();
    if (userList.some(u => u.username?.toLowerCase() === usernameLower)) {
      showToast("این نام کاربری از قبل در سامانه تعریف شده است.", "error");
      return;
    }

    const newUser: User = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      name: newStaffName.trim(),
      username: usernameLower,
      password: newStaffPassword.trim(),
      role: newStaffRole,
      permissions: []
    };

    const updated = [...userList, newUser];
    setUserList(updated);
    SturgeonRepository.saveUsers(updated);
    logAuditAction("CREATE_USER", `تعریف پرسنل جدید بنام "${newUser.name}" با نام کاربری "${newUser.username}" و نقش ${newUser.role}`);
    showToast(`کاربر جدید "${newUser.name}" با موفقیت تعریف شد.`);
    setNewStaffName("");
    setNewStaffUsername("");
    setNewStaffPassword("");
  };

  const handleDeleteStaff = (userId: string) => {
    if (userId === "admin") {
      showToast("حساب کاربری ارشد سیستم (admin) غیرقابل حذف است.", "error");
      return;
    }

    const userToDelete = userList.find(u => u.id === userId);
    if (!userToDelete) return;

    if (window.confirm(`آیا از حذف حساب کاربری "${userToDelete.name}" اطمینان دارید؟`)) {
      const updated = userList.filter(u => u.id !== userId);
      setUserList(updated);
      SturgeonRepository.saveUsers(updated);
      logAuditAction("DELETE_USER", `حذف حساب کاربری "${userToDelete.name}" (${userToDelete.username})`);
      showToast(`کاربر "${userToDelete.name}" از سامانه حذف گردید.`);
    }
  };

  const handleUpdatePassword = (userId: string) => {
    if (!tempPassword.trim()) {
      showToast("رمز عبور جدید نمی‌تواند خالی باشد.", "error");
      return;
    }
    const userToUpdate = userList.find(u => u.id === userId);
    if (!userToUpdate) return;

    const updated = userList.map(u => u.id === userId ? { ...u, password: tempPassword.trim() } : u);
    setUserList(updated);
    SturgeonRepository.saveUsers(updated);
    logAuditAction("UPDATE_PASSWORD", `تغییر رمز عبور کاربر "${userToUpdate.name}" (${userToUpdate.username})`);
    showToast(`رمز عبور کاربر "${userToUpdate.name}" با موفقیت تغییر یافت.`);
    setEditingPasswordUserId(null);
    setTempPassword("");
  };

  // Temporary Undo state for deletions
  const [undoState, setUndoState] = useState<{
    type: "hall" | "pool";
    payload: {
      hall?: Hall;
      pools?: Pool[];
      pool?: Pool;
    };
  } | null>(null);

  // Auto clear undo after 12 seconds
  useEffect(() => {
    if (undoState) {
      const timer = setTimeout(() => {
        setUndoState(null);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [undoState]);

  // Execute undo
  const handleTriggerUndo = () => {
    if (!undoState) return;

    if (undoState.type === "hall") {
      const { hall, pools: restoredPools } = undoState.payload;
      if (hall) {
        setHalls(prev => {
          if (prev.some(h => h.id === hall.id)) return prev;
          return [...prev, hall].sort((a, b) => a.id - b.id);
        });
        logAuditAction("UNDO_DELETE_HALL", `بازگردانی سالن "${hall.name}" به همراه استخرهای تابعه`);
      }
      if (restoredPools && restoredPools.length > 0) {
        setPools(prev => {
          const filterIds = restoredPools.map(rp => rp.id);
          const cleanPrev = prev.filter(p => !filterIds.includes(p.id));
          return [...cleanPrev, ...restoredPools];
        });
      }
      showToast(`سالن "${hall?.name}" و تمامی استخرهای تابعه آن با موفقیت بازگردانی شدند.`, "success");
    } else if (undoState.type === "pool") {
      const { pool } = undoState.payload;
      if (pool) {
        setPools(prev => {
          if (prev.some(p => p.id === pool.id)) return prev;
          return [...prev, pool];
        });
        
        // Link back to the parent Hall
        setHalls(prevHalls => 
          prevHalls.map(h => h.id === pool.hallId 
            ? { ...h, poolIds: Array.from(new Set([...(h.poolIds || []), pool.id])) } 
            : h
          )
        );
        logAuditAction("UNDO_DELETE_POOL", `بازگردانی استخر "${pool.name}" در سالن ${pool.hallId}`);
        showToast(`استخر "${pool.name}" با موفقیت بازیابی شد.`, "success");
      }
    }
    setUndoState(null);
  };

  // Multi-step Confirmation Dialog state
  const [activeConfirmation, setActiveConfirmation] = useState<{
    type: "hall" | "pool";
    id: number | string;
    step: 1 | 2;
    title: string;
    description: string;
    itemsToImpact: string[];
    safetyChecked: boolean;
    verificationText: string;
  } | null>(null);

  // Form states for NEW HALL
  const [newHallName, setNewHallName] = useState("");
  const [newHallDesc, setNewHallDesc] = useState("");
  const [newHallIsUnderConstruction, setNewHallIsUnderConstruction] = useState(false);
  const [newHallType, setNewHallType] = useState<"standard" | "processing" | "breeding">("standard");

  // Form states for NEW POOL
  const [selectedHallForPool, setSelectedHallForPool] = useState<number>(halls[0]?.id || 1);
  const [newPoolName, setNewPoolName] = useState("");
  const [newPoolPurpose, setNewPoolPurpose] = useState("پیش پروار");
  const [newPoolBreed, setNewPoolBreed] = useState<SturgeonBreed>(SturgeonBreed.SIBERIAN);
  const [newPoolDiameter, setNewPoolDiameter] = useState(4);
  const [newPoolCount, setNewPoolCount] = useState(250);
  const [newPoolAvgWeight, setNewPoolAvgWeight] = useState(650);

  // Edit/Modify Existing Pool State
  const [editingPoolId, setEditingPoolId] = useState<string | null>(null);
  const [editPoolCount, setEditPoolCount] = useState<number>(0);
  const [editPoolWeight, setEditPoolWeight] = useState<number>(0);

  // Search in Audit Logs
  const [searchAuditQuery, setSearchAuditQuery] = useState("");
  const [filterAuditAction, setFilterAuditAction] = useState("ALL");

  // -----------------------------------------------------
  // 1. ADD NEW HALL
  // -----------------------------------------------------
  const handleCreateHall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHallName.trim()) {
      showToast("لطفاً نام سالن را وارد کنید", "error");
      return;
    }

    // Generate unique ID
    const nextId = halls.length > 0 ? Math.max(...halls.map(h => h.id)) + 1 : 1;

    let finalDesc = newHallDesc.trim();
    if (newHallType === "processing") {
      finalDesc = `[بخش فرآوری] ${finalDesc || "کارگاه تخصصی صید، نمک‌سود کاری، استحصال خاویار و بسته‌بندی صادراتی"}`;
    } else if (newHallType === "breeding") {
      finalDesc = `[بخش تکثیر] ${finalDesc || "سالن شبیه‌سازی فصول، سونوگرافی جنسی و انکوباسیون تخم خاویار"}`;
    }

    const newHall: Hall = {
      id: nextId,
      name: newHallName,
      description: finalDesc,
      isUnderConstruction: newHallIsUnderConstruction,
      poolIds: []
    };

    setHalls(prev => [...prev, newHall]);
    logAuditAction("CREATE_HALL", `احداث سالن جدید به شماره ${nextId} بنام "${newHallName}" (${newHallType})`);
    
    // Auto populate sample pool inside the new hall if NOT under construction
    if (!newHallIsUnderConstruction) {
      const samplePoolId = `h${nextId}p1`;
      const samplePool: Pool = {
        id: samplePoolId,
        name: "استخر ۱",
        hallId: nextId,
        diameter: 4,
        dimensionsDesc: "قطر ۴ متر",
        purpose: newHallType === "processing" ? "تخلیه شکم و انتقال" : "پیش پروار",
        breed: SturgeonBreed.SIBERIAN,
        count: newHallType === "processing" ? 0 : 100,
        avgWeightGrams: newHallType === "processing" ? 0 : 500,
        totalBiomassKg: newHallType === "processing" ? 0 : 50,
        temperature: 17.5,
        oxygenLevel: 7.2,
        phLevel: 7.6,
        lastFedDate: "1405/03/10"
      };
      
      setPools(prev => [...prev, samplePool]);
      setHalls(currentHalls => 
        currentHalls.map(h => h.id === nextId ? { ...h, poolIds: [samplePoolId] } : h)
      );
      logAuditAction("CREATE_POOL", `ایجاد خودکار استخر تابعه "${samplePoolId}" در سالن تازه تاسیس`);
    }

    showToast(`سالن جدید "${newHallName}" با موفقیت ایجاد گردید.`);
    setNewHallName("");
    setNewHallDesc("");
    setNewHallIsUnderConstruction(false);
  };

  // -----------------------------------------------------
  // 2. MULTI-STEP CONFIRMATION DELETE TRIGGERS
  // -----------------------------------------------------
  const triggerDeleteHallConfirmation = (id: number) => {
    const hall = halls.find(h => h.id === id);
    if (!hall) return;

    const connectedPools = pools.filter(p => p.hallId === id);
    const totalFishes = connectedPools.reduce((sum, p) => sum + p.count, 0);
    const totalBiomass = connectedPools.reduce((sum, p) => sum + p.totalBiomassKg, 0);

    setActiveConfirmation({
      type: "hall",
      id,
      step: 1,
      title: `عملیات انحلال و حذف فیزیکی سالن "${hall.name}"`,
      description: `توجه داشته باشید که این اقدام غیرقابل بازگشت مستقیم بوده و بر ساختار کالبدی و آمار کلی فارم تأثیرگذار است.`,
      itemsToImpact: [
        `انحلال کامل سالن شماره ${id} و آزادسازی اراضی تحت پوشش`,
        `حذف دائمی تعداد ${connectedPools.length} استخر خاویاری نصب شده در این سالن`,
        `کسر کامل تعداد ${totalFishes.toLocaleString()} قطعه ماهی فعال با تراز بیولوژیکی ${totalBiomass.toLocaleString()} کیلوگرم از تراز کل مزارع`
      ],
      safetyChecked: false,
      verificationText: ""
    });
  };

  const triggerDeletePoolConfirmation = (poolId: string) => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool) return;

    setActiveConfirmation({
      type: "pool",
      id: poolId,
      step: 1,
      title: `درخواست اوراق‌سازی و حذف استخر "${pool.name}"`,
      description: `این عمل شناسه پایش هولوگرام مخزن را حذف کرده و اتصالات لوله‌کشی و هوادهی مربوطه را غیرفعال فرض می‌کند.`,
      itemsToImpact: [
        `خروج شناسه پایش "${poolId}" از سالن شماره ${pool.hallId}`,
        `حذف تعداد ${pool.count} قطعه استرژون از نژاد ${pool.breed}`,
        `بایگانی شدن فوری آمارهای سونوگرافی، تغذیه و آزمایشگاهی متصل به این مخزن`
      ],
      safetyChecked: false,
      verificationText: ""
    });
  };

  // Execution of the deletion after full steps are cleared
  const executeFinalDelete = () => {
    if (!activeConfirmation) return;

    if (activeConfirmation.type === "hall") {
      const id = activeConfirmation.id as number;
      const hall = halls.find(h => h.id === id);
      if (!hall) return;

      const connectedPools = pools.filter(p => p.hallId === id);

      // Snapshot for Undo functionality
      setUndoState({
        type: "hall",
        payload: {
          hall,
          pools: connectedPools
        }
      });

      // Perform deletions
      setHalls(prev => prev.filter(h => h.id !== id));
      setPools(prev => prev.filter(p => p.hallId !== id));

      logAuditAction("DELETE_HALL", `حذف کامل سالن شماره ${id} بنام "${hall.name}" با ${connectedPools.length} استخر`);
      showToast(`سالن "${hall.name}" با موفقیت حذف شد. قابلیت بازگردانی فعال است.`, "success");

    } else if (activeConfirmation.type === "pool") {
      const poolId = activeConfirmation.id as string;
      const pool = pools.find(p => p.id === poolId);
      if (!pool) return;

      // Snapshot for Undo functionality
      setUndoState({
        type: "pool",
        payload: {
          pool
        }
      });

      // Perform deletions
      setPools(prev => prev.filter(p => p.id !== poolId));
      setHalls(prevHalls => 
        prevHalls.map(h => h.id === pool.hallId 
          ? { ...h, poolIds: h.poolIds.filter(id => id !== poolId) } 
          : h
        )
      );

      logAuditAction("DELETE_POOL", `حذف مخزن خاویاری "${poolId}" بنام "${pool.name}" با تعداد ${pool.count} ماهی`);
      showToast(`استخر "${pool.name}" حذف گردید. قابلیت بازگردانی تا چند ثانیه فعال است.`, "success");
    }

    setActiveConfirmation(null);
  };

  // -----------------------------------------------------
  // 3. ADD NEW POOL
  // -----------------------------------------------------
  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName.trim()) {
      showToast("لطفاً نام یا شماره استخر را وارد کنید", "error");
      return;
    }

    const poolCode = `h${selectedHallForPool}p${newPoolName.replace(/\s+/g, "")}`;
    const exists = pools.some(p => p.id === poolCode);
    if (exists) {
      showToast(`استخری با شناسه ${poolCode} از قبل در این سالن وجود دارد!`, "error");
      return;
    }

    const calculatedBiomass = parseFloat(((newPoolCount * newPoolAvgWeight) / 1000).toFixed(1));

    const newPool: Pool = {
      id: poolCode,
      name: newPoolName.startsWith("استخر") ? newPoolName : `استخر ${newPoolName}`,
      hallId: selectedHallForPool,
      diameter: newPoolDiameter,
      dimensionsDesc: `قطر ${newPoolDiameter} متر`,
      purpose: newPoolPurpose,
      breed: newPoolBreed,
      count: newPoolCount,
      avgWeightGrams: newPoolAvgWeight,
      totalBiomassKg: calculatedBiomass,
      temperature: 17.8,
      oxygenLevel: 7.1,
      phLevel: 7.5,
      lastFedDate: "1405/03/10"
    };

    setPools(prev => [...prev, newPool]);
    setHalls(prevHalls => 
      prevHalls.map(h => h.id === selectedHallForPool 
        ? { ...h, poolIds: Array.from(new Set([...(h.poolIds || []), poolCode])) } 
        : h
      )
    );

    logAuditAction("CREATE_POOL", `احداث استخر جدید "${poolCode}" در سالن ${selectedHallForPool} با ${newPoolCount} قطعه ماهی`);
    showToast(`استخر جدید "${newPool.name}" با موفقیت در سالن ${selectedHallForPool} ثبت گردید.`);
    setNewPoolName("");
    setNewPoolCount(0);
  };

  // -----------------------------------------------------
  // 4. QUICK DIRECT BIOMASS EDIT FOR POOL (ADMIN ONLY)
  // -----------------------------------------------------
  const handleSaveQuickEditPool = (poolId: string) => {
    const originalPool = pools.find(p => p.id === poolId);
    if (!originalPool) return;

    setPools(prev => prev.map(p => {
      if (p.id === poolId) {
        const biomass = parseFloat(((editPoolCount * editPoolWeight) / 1000).toFixed(1));
        return {
          ...p,
          count: editPoolCount,
          avgWeightGrams: editPoolWeight,
          totalBiomassKg: biomass
        };
      }
      return p;
    }));

    logAuditAction("QUICK_EDIT_BIOMASS", `اصلاح آماری استخر ${poolId}: تعداد از ${originalPool.count} به ${editPoolCount} و وزن متوسط از ${originalPool.avgWeightGrams}g به ${editPoolWeight}g تغییر یافت.`);
    setEditingPoolId(null);
    showToast("تعداد و بیوماس استخر با دسترسی مدیریت به‌روزرسانی شد.");
  };

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = 
      log.action.toLowerCase().includes(searchAuditQuery.toLowerCase()) || 
      log.details.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchAuditQuery.toLowerCase());
    
    const matchType = filterAuditAction === "ALL" || log.action === filterAuditAction;

    return matchSearch && matchType;
  });

  return (
    <div className="bg-white border border-natural-border rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn text-right" dir="rtl" id="admin-management-panel">
      
      {/* Toast Notification Widget */}
      {toast && (
        <div className={`fixed bottom-6 left-6 z-50 p-4 rounded-2xl shadow-xl border animate-bounce flex items-center gap-3 text-xs font-bold ${
          toast.type === "success" 
            ? "bg-[#1A2E26] border-emerald-500/30 text-emerald-300" 
            : "bg-red-950 border-red-500/30 text-red-200"
        }`}>
          <ShieldCheck size={18} className="text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Floating Undo Alert (Safety net) */}
      {undoState && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-natural-dark text-white rounded-2xl shadow-2xl border border-natural-forest/40 max-w-sm flex items-center justify-between gap-4 animate-slideIn">
          <div className="space-y-0.5 text-right">
            <span className="text-[10px] text-natural-khaki block flex items-center gap-1">
              <Clock size={11} />
              چند ثانیه فرصت باقیست
            </span>
            <span className="text-xs font-bold block leading-relaxed">تغییرات حذف با موفقیت انجام شد. بازگردانی؟</span>
          </div>
          <button 
            onClick={handleTriggerUndo}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw size={13} />
            بازگردانی داده‌ها (Undo)
          </button>
        </div>
      )}

      {/* Custom Multi-step Deletion Confirmation Dialog */}
      {activeConfirmation && (
        <div className="fixed inset-0 bg-natural-dark/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-natural-border shadow-2xl w-full max-w-lg p-6 space-y-5 text-right">
            
            <div className="flex items-center gap-2 pb-3 border-b border-natural-border text-red-700">
              <AlertTriangle size={22} className="animate-pulse" />
              <h3 className="text-base font-black font-sans">{activeConfirmation.title}</h3>
            </div>

            <div className="space-y-3.5 text-xs text-natural-text">
              <p className="font-bold leading-relaxed text-natural-dark bg-red-50/50 p-3 rounded-xl border border-red-100">
                {activeConfirmation.description}
              </p>

              {activeConfirmation.step === 1 ? (
                <div className="space-y-4">
                  <span className="text-[10.5px] font-black text-red-800 block">عواقب بیولوژیکی و ساختاری این حذف:</span>
                  <ul className="space-y-2 list-disc list-inside bg-natural-khaki/20 p-3.5 rounded-xl border border-natural-border/40 text-natural-dark">
                    {activeConfirmation.itemsToImpact.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>

                  <label className="flex items-center gap-2.5 p-3 bg-white hover:bg-natural-khaki/10 rounded-xl border border-natural-border cursor-pointer select-none transition-colors">
                    <input 
                      type="checkbox"
                      checked={activeConfirmation.safetyChecked}
                      onChange={(e) => setActiveConfirmation({
                        ...activeConfirmation,
                        safetyChecked: e.target.checked
                      })}
                      className="w-4 h-4 text-red-600 rounded border-natural-border focus:ring-red-500 accent-red-600 cursor-pointer"
                    />
                    <strong className="text-natural-dark text-[11px]">عواقب فوق را به دقت مطالعه کرده و مسئولیت تراز مالی و دامی آن را می‌پذیرم.</strong>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[11px] font-black text-red-800 block">تایید امنیتی نهایی (گام ۲):</span>
                  <p className="leading-relaxed">
                    جهت تایید نهایی حذف کالبدی این ساختار شیلاتی، واژه <strong className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-black font-mono">حذف</strong> را در کادر زیر تایپ نمایید.
                  </p>
                  <input 
                    type="text"
                    value={activeConfirmation.verificationText}
                    onChange={(e) => setActiveConfirmation({
                      ...activeConfirmation,
                      verificationText: e.target.value
                    })}
                    placeholder="واژه 'حذف' را تایپ کنید"
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-red-500 font-bold text-center"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-natural-border">
              <button
                onClick={() => setActiveConfirmation(null)}
                className="py-2 px-3 bg-natural-khaki hover:bg-natural-khaki/80 text-natural-text text-xs rounded-xl font-bold cursor-pointer"
              >
                انصراف کامل
              </button>

              {activeConfirmation.step === 1 ? (
                <button
                  disabled={!activeConfirmation.safetyChecked}
                  onClick={() => setActiveConfirmation({ ...activeConfirmation, step: 2 })}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    activeConfirmation.safetyChecked
                      ? "bg-red-700 hover:bg-red-800 text-white cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  تایید و ادامه به گام بعد
                </button>
              ) : (
                <button
                  disabled={activeConfirmation.verificationText !== "حذف"}
                  onClick={executeFinalDelete}
                  className={`py-2 px-5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                    activeConfirmation.verificationText === "حذف"
                      ? "bg-red-800 hover:bg-red-900 text-white cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Trash2 size={13} />
                  انحلال قطعی ساختار شیلاتی
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-natural-border pb-5">
        <div>
          <span className="text-[10px] text-red-750 font-black bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <ShieldCheck size={11} />
            بخش کنترل زیرساخت و دسترسی ارشد ادمین
          </span>
          <h2 className="text-xl font-black text-natural-dark font-sans mt-1.5">تنظیمات کلان و توسعه فیزیکی فارم خاویاری</h2>
          <p className="text-xs text-natural-text/60 mt-1">افزایش و کاهش گنجایش استخرها، احداث سالن‌های پرورش، توسعه خطوط فرآوری خاویار و تاسیسات تکثیر</p>
        </div>

        {/* Inner Tabs for Admin Navigation */}
        <div className="flex flex-wrap bg-natural-khaki/60 p-1 rounded-xl border border-natural-border/50 shrink-0 gap-1">
          <button
            onClick={() => setAdminTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adminTab === "settings" 
                ? "bg-amber-600 text-white shadow-xs" 
                : "text-natural-text hover:text-amber-700"
            }`}
          >
            <Settings2 size={13} />
            پیکربندی عمومی و آستانه‌ها
          </button>
          <button
            onClick={() => setAdminTab("halls")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === "halls" 
                ? "bg-natural-forest text-white shadow-xs" 
                : "text-natural-text hover:text-natural-dark"
            }`}
          >
            سالن‌ها (بخش کالبدی)
          </button>
          <button
            onClick={() => setAdminTab("pools")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === "pools" 
                ? "bg-natural-forest text-white shadow-xs" 
                : "text-natural-text hover:text-natural-dark"
            }`}
          >
            توسعه استخرها (کاهش/افزایش)
          </button>
          <button
            onClick={() => setAdminTab("processing_setup")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === "processing_setup" 
                ? "bg-natural-forest text-white shadow-xs" 
                : "text-natural-text hover:text-natural-dark"
            }`}
          >
            خطوط فرآوری و صید
          </button>
          <button
            onClick={() => setAdminTab("audit_logs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              adminTab === "audit_logs" 
                ? "bg-natural-forest text-white shadow-xs" 
                : "text-natural-text hover:text-natural-dark"
            }`}
          >
            <History size={13} />
            دفترچه ممیزی
          </button>
          <button
            onClick={() => setAdminTab("users")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              adminTab === "users" 
                ? "bg-[#D68227] text-white shadow-xs" 
                : "text-natural-text hover:text-[#D68227]"
            }`}
          >
            <Users size={13} />
            پرسنل و حساب‌های کاربری
          </button>
        </div>
      </div>

      {/* 0. TAB CONTENT: SYSTEM GENERAL CONFIGURATION & THRESHOLDS */}
      {adminTab === "settings" && (
        <div className="bg-white rounded-2xl border border-natural-border/50 p-1">
          <SettingsManager
            pools={pools}
            halls={halls}
            onReloadData={onReloadData}
          />
        </div>
      )}

      {/* 1. TAB CONTENT: HALLS MANAGEMENT */}
      {adminTab === "halls" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Hall Form */}
          <div className="bg-natural-khaki/20 border border-natural-border/60 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5 border-b border-natural-border/40 pb-2">
              <Building size={14} className="text-natural-forest" />
              احداث و افزودن سالن جدید
            </h3>

            <form onSubmit={handleCreateHall} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-natural-dark block">نام یا عنوان سالن</label>
                <input 
                  type="text"
                  placeholder="مثال: سالن ۱۳ (لارو ریزی اختصاصی)"
                  value={newHallName}
                  onChange={(e) => setNewHallName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-natural-dark block">کاربری سالن جدید</label>
                <select
                  value={newHallType}
                  onChange={(e: any) => setNewHallType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest"
                >
                  <option value="standard">پرورش عادی (نرسری، پیش‌پروار یا پرواری)</option>
                  <option value="processing">سالن فرآوری گوشت، نمک‌کاری و بسته‌بندی خاویار صادراتی</option>
                  <option value="breeding">سالن سونوگرافی جنسی، شبیه‌سازی فصول و مولدگیری</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-natural-dark block">توضیحات و اهداف شیلاتی سالن</label>
                <textarea 
                  placeholder="ابعاد سالن، نوع هوادهی و دیفیوزرها..."
                  rows={2}
                  value={newHallDesc}
                  onChange={(e) => setNewHallDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest"
                />
              </div>

              <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-natural-border/50 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={newHallIsUnderConstruction}
                  onChange={(e) => setNewHallIsUnderConstruction(e.target.checked)}
                  className="w-4 h-4 rounded text-natural-forest border-natural-border accent-natural-forest cursor-pointer"
                />
                <span className="text-[11px] font-bold text-natural-dark">این سالن در دست احداث (غیرفعال موقت) است</span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-natural-forest hover:bg-natural-forest-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                تایید احداث و صدور پروانه سالن
              </button>
            </form>
          </div>

          {/* List of Halls */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-natural-dark flex justify-between items-center border-b border-natural-border/30 pb-2">
              <span>ساختار فیزیکی فعلی مجموعه شیلاتی ({halls.length} سالن)</span>
              <span className="text-[9px] text-natural-text/60 font-mono">نظارت بر زنجیره کالبدی</span>
            </h3>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {halls.map((h) => {
                const hallPools = pools.filter(p => p.hallId === h.id);
                const totalBiomass = hallPools.reduce((sum, p) => sum + p.totalBiomassKg, 0);
                const totalFishes = hallPools.reduce((sum, p) => sum + p.count, 0);

                return (
                  <div 
                    key={h.id} 
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      h.isUnderConstruction 
                        ? "bg-amber-50/20 border-amber-200/55 border-dashed" 
                        : "bg-white border-natural-border hover:shadow-2xs"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-natural-khaki text-natural-forest flex items-center justify-center text-[10px] font-mono font-black border border-natural-border">
                          {h.id}
                        </span>
                        <strong className="text-xs font-bold text-natural-dark">{h.name}</strong>
                        {h.isUnderConstruction && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                            <Hammer size={10} />
                            در دست احداث
                          </span>
                        )}
                        {h.description.includes("فرآوری") && (
                          <span className="bg-rose-100 text-rose-800 text-[8px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                            <Factory size={10} />
                            صنایع فرآوری
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-natural-text/75 line-clamp-1">{h.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-left font-sans">
                      <div className="bg-natural-khaki/30 border border-natural-border/30 px-2 py-1 rounded-lg text-right">
                        <span className="text-[8px] text-natural-text/60 block leading-none">بیوماس شناور</span>
                        <strong className="text-[10.5px] font-mono font-bold text-natural-dark">
                          {Math.round(totalBiomass).toLocaleString()} <span className="text-[8px] font-sans text-natural-text/60">kg</span>
                        </strong>
                      </div>

                      <div className="bg-natural-khaki/30 border border-natural-border/30 px-2 py-1 rounded-lg text-right">
                        <span className="text-[8px] text-natural-text/60 block leading-none">استخرهای تابعه</span>
                        <strong className="text-[10.5px] font-mono font-bold text-natural-dark">
                          {hallPools.length} <span className="text-[8px] font-sans text-natural-text/60">استخر</span>
                        </strong>
                      </div>

                      <button
                        onClick={() => triggerDeleteHallConfirmation(h.id)}
                        className="p-1.5 text-natural-clay hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
                        title="حذف سالن"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 2. TAB CONTENT: POOLS EXPANSION AND RETRACTION */}
      {adminTab === "pools" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Pool Form */}
          <div className="bg-natural-khaki/20 border border-natural-border/60 p-5 rounded-2xl space-y-4 h-fit">
            <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5 border-b border-natural-border/40 pb-2">
              <PlusCircle size={14} className="text-natural-forest" />
              توسعه ظرفیت (افزودن استخر جدید)
            </h3>

            <form onSubmit={handleCreatePool} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-natural-dark block">محل نصب استخر (انتخاب سالن)</label>
                <select
                  value={selectedHallForPool}
                  onChange={(e) => setSelectedHallForPool(parseInt(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest"
                >
                  {halls.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-natural-dark block">شماره استخر جدید</label>
                <input 
                  type="text"
                  placeholder="مثال: 71 یا 15"
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest font-mono"
                />
                <span className="text-[9px] text-natural-text/50">شناسه سیستمی این استخر به صورت منحصر به فرد ذخیره می‌شود.</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-natural-dark block">قطر استخر (متر)</label>
                  <input 
                    type="number"
                    min="1"
                    max="15"
                    value={newPoolDiameter}
                    onChange={(e) => setNewPoolDiameter(parseInt(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-natural-dark block">کاربری هیدرولیک</label>
                  <input 
                    type="text"
                    value={newPoolPurpose}
                    onChange={(e) => setNewPoolPurpose(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-natural-dark block">نژاد ماهیان استخر اولیه</label>
                <select
                  value={newPoolBreed}
                  onChange={(e: any) => setNewPoolBreed(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest"
                >
                  {Object.values(SturgeonBreed).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-natural-dark block">تعداد ماهی اولیه</label>
                  <input 
                    type="number"
                    min="0"
                    value={newPoolCount}
                    onChange={(e) => setNewPoolCount(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-natural-dark block">میانگین وزن اولیه (g)</label>
                  <input 
                    type="number"
                    min="0"
                    value={newPoolAvgWeight}
                    onChange={(e) => setNewPoolAvgWeight(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-natural-forest font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-natural-forest hover:bg-natural-forest-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <PlusCircle size={14} />
                تایید احداث استخر در سالن {selectedHallForPool}
              </button>
            </form>
          </div>

          {/* List of Pools with Delete and Direct Edit Option */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-natural-dark flex justify-between items-center border-b border-natural-border/30 pb-2">
              <span>لیست کامل استخرهای فارم جهت مدیریت بهینه ({pools.length} استخر فعال)</span>
              <span className="text-[9px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold">حالت مانیتورینگ ادمین</span>
            </h3>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {pools.map((p) => {
                const isEditing = editingPoolId === p.id;
                
                return (
                  <div 
                    key={p.id} 
                    className="p-3 bg-white rounded-xl border border-natural-border/60 hover:border-natural-border hover:shadow-2xs transition-all text-xs space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-natural-text/60 bg-natural-khaki/40 px-1.5 py-0.5 rounded border border-natural-border/20">
                          {p.id}
                        </span>
                        <strong className="text-xs font-bold text-natural-dark">{p.name}</strong>
                        <span className="text-[9px] text-natural-text/60">
                          (سالن {p.hallId} - {p.purpose})
                        </span>
                      </div>

                      {/* Remove Pool Trigger Button (کاهش استخر) */}
                      <button
                        onClick={() => triggerDeletePoolConfirmation(p.id)}
                        className="p-1 text-natural-clay hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف و کاهش استخر"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="p-2 bg-natural-khaki/30 rounded-lg border border-natural-border/30 grid grid-cols-3 gap-2 items-center">
                        <div className="space-y-1">
                          <label className="text-[8px] text-natural-text/60 block">تعداد ماهی</label>
                          <input 
                            type="number"
                            value={editPoolCount}
                            onChange={(e) => setEditPoolCount(parseInt(e.target.value) || 0)}
                            className="w-full text-[11px] p-1 border rounded bg-white font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-natural-text/60 block">وزن متوسط (g)</label>
                          <input 
                            type="number"
                            value={editPoolWeight}
                            onChange={(e) => setEditPoolWeight(parseInt(e.target.value) || 0)}
                            className="w-full text-[11px] p-1 border rounded bg-white font-mono"
                          />
                        </div>
                        <div className="flex gap-1 pt-4">
                          <button
                            onClick={() => handleSaveQuickEditPool(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded font-bold transition-colors cursor-pointer flex items-center justify-center flex-1"
                            title="تایید"
                          >
                            <Check size={11} />
                          </button>
                          <button
                            onClick={() => setEditingPoolId(null)}
                            className="bg-gray-400 hover:bg-gray-500 text-white p-1 rounded font-bold transition-colors cursor-pointer flex items-center justify-center flex-1"
                          >
                            انصراف
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-natural-khaki/10 px-2 py-1.5 rounded-lg text-[10px]">
                        <span className="text-natural-text/75 truncate max-w-[150px]">
                          نژاد: <strong>{p.breed}</strong>
                        </span>
                        
                        <div className="flex gap-3 text-[10.5px]">
                          <span>تعداد: <strong className="font-mono text-natural-dark font-black">{p.count}</strong></span>
                          <span>زیست‌توده: <strong className="font-mono text-natural-forest font-black">{p.totalBiomassKg} kg</strong></span>
                          
                          <button
                            onClick={() => {
                              setEditingPoolId(p.id);
                              setEditPoolCount(p.count);
                              setEditPoolWeight(p.avgWeightGrams);
                            }}
                            className="text-natural-forest hover:underline font-bold"
                          >
                            ویرایش تعداد دامی
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 3. TAB CONTENT: CAVIAR PROCESSING SETUP CONFIG */}
      {adminTab === "processing_setup" && (
        <div className="space-y-4">
          <div className="bg-rose-50/50 border border-rose-200 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="space-y-1">
              <strong className="text-sm font-black text-rose-950 flex items-center gap-1.5">
                <Factory size={16} className="text-rose-700" />
                توسعه صنایع فراوری و بسته‌بندی خاویار
              </strong>
              <p className="text-xs text-rose-900/80">
                با توسعه فیزیکی، می‌توانید استخر فروش زنده یا استخرهای بارانداز تخلیه شکم و استحصال خاویار را پیکربندی نمایید.
              </p>
            </div>
            <button
              onClick={() => {
                const alreadyHas = halls.some(h => h.name.includes("سالن تخصصی فراوری"));
                if (alreadyHas) {
                  showToast("سالن تخصصی فراوری از قبل در سیستم احداث شده است.", "error");
                  return;
                }
                const nextId = halls.length > 0 ? Math.max(...halls.map(h => h.id)) + 1 : 13;
                const newProcessingHall: Hall = {
                  id: nextId,
                  name: `سالن ${nextId} (کارخانه فراوری خاویار خزر)`,
                  description: "مجموعه مجهز به خط صید، بیهوشی با سرما، تخلیه تخم خاویار استرلیاد و سیبری، بسته‌بندی خلأ و انجماد سریع جیره",
                  poolIds: []
                };
                setHalls(prev => [...prev, newProcessingHall]);
                logAuditAction("CREATE_HALL", `احداث سالن فرآوری تخصصی به شماره ${nextId}`);
                showToast(`سالن توسعه تخصصی فراوری به شماره ${nextId} احداث شد.`);
              }}
              className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Plus size={14} />
              احداث فوری سالن فراوری خاویار
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-natural-border/70 rounded-2xl space-y-2">
              <strong className="text-xs font-bold text-natural-dark block">مرحله ۱: آماده‌سازی گله در سالن ۱۲</strong>
              <p className="text-[10.5px] text-natural-text/85">
                فیل‌ماهی‌ها و تاس‌ماهی‌های بالغ آماده صید، به منظور شستشوی سیستم گوارشی و افزایش کیفیت تخم‌ها به مدت ۷ روز به استخرهای سالن ۱۲ منتقل شده و تغذیه قطع می‌گردد.
              </p>
            </div>
            
            <div className="p-4 bg-white border border-natural-border/70 rounded-2xl space-y-2">
              <strong className="text-xs font-bold text-natural-dark block">مرحله ۲: صید و استحصال استریل</strong>
              <p className="text-[10.5px] text-natural-text/85">
                ماهی‌ها سونوگرافی نهایی شده، به سالن فرآوری انتقال می‌یابند. تخم‌ها به صورت کاملاً بهداشتی جدا، با نمک غنی‌شده مخصوص مخلوط و در قوطی‌های متالایز پلمب می‌گردند.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: INTERNAL SYSTEM AUDIT LOG LEDGER */}
      {adminTab === "audit_logs" && (
        <div className="space-y-4">
          <div className="bg-natural-khaki/30 border border-natural-border/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <div className="relative w-full">
                <input 
                  type="text"
                  placeholder="جستجو در وقایع و اقدامات ادمین..."
                  value={searchAuditQuery}
                  onChange={(e) => setSearchAuditQuery(e.target.value)}
                  className="w-full text-xs pr-8 pl-3 py-2 rounded-xl border border-natural-border focus:outline-none focus:border-natural-forest"
                />
                <Search size={14} className="absolute right-2.5 top-2.5 text-natural-text/60" />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-natural-dark">نوع اقدام:</span>
              <select
                value={filterAuditAction}
                onChange={(e) => setFilterAuditAction(e.target.value)}
                className="text-xs p-2 rounded-xl border border-natural-border bg-white"
              >
                <option value="ALL">همه موارد</option>
                <option value="SYSTEM_INIT">راه‌اندازی سیستم</option>
                <option value="CREATE_HALL">احداث سالن</option>
                <option value="DELETE_HALL">حذف سالن</option>
                <option value="CREATE_POOL">احداث استخر</option>
                <option value="DELETE_POOL">حذف استخر</option>
                <option value="QUICK_EDIT_BIOMASS">اصلاح تعداد/بیوماس</option>
                <option value="UNDO_DELETE_HALL">بازگردانی سالن</option>
                <option value="UNDO_DELETE_POOL">بازگردانی استخر</option>
              </select>

              <button
                onClick={() => {
                  if (window.confirm("آیا مایل به پاکسازی تاریخچه ممیزی‌های سیستمی هستید؟")) {
                    setAuditLogs([]);
                    logAuditAction("CLEAR_LOGS", "پاکسازی تاریخچه ممیزی توسط ادمین");
                  }
                }}
                className="p-2 text-red-700 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all text-xs font-bold cursor-pointer"
                title="پاکسازی تاریخچه"
              >
                پاکسازی کل دفترچه
              </button>
            </div>
          </div>

          <div className="bg-natural-khaki/10 border border-natural-border/50 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-3 bg-natural-khaki/30 border-b border-natural-border/40 grid grid-cols-12 gap-2 text-xs font-black text-natural-dark text-right">
              <span className="col-span-2">زمان (جلالی)</span>
              <span className="col-span-2">کاربر مسئول</span>
              <span className="col-span-3">نوع اقدام</span>
              <span className="col-span-5">شرح و جزئیات بیولوژیکی / ساختاری</span>
            </div>

            <div className="divide-y divide-natural-border/30 max-h-[360px] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-natural-text/60">
                  <FileText className="mx-auto text-natural-text/30 mb-2" size={32} />
                  هیچ وقایع ممیزی متناسب با فیلتر شما ثبت نشده است.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 grid grid-cols-12 gap-2 text-xs hover:bg-white transition-colors items-center text-right font-sans"
                  >
                    <span className="col-span-2 text-[10.5px] font-mono text-natural-dark font-semibold">
                      {log.timestampJalali}
                    </span>
                    <span className="col-span-2 text-natural-text/80 truncate font-mono" title={log.userName}>
                      {log.userId}
                    </span>
                    <span className="col-span-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        log.action.includes("DELETE")
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : log.action.includes("UNDO")
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100 font-black animate-pulse"
                          : log.action.includes("CREATE")
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-blue-50 text-blue-750 border border-blue-100"
                      }`}>
                        {log.action}
                      </span>
                    </span>
                    <span className="col-span-5 text-[11px] text-natural-dark leading-relaxed">
                      {log.details}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: PERSONNEL & USER ACCOUNTS */}
      {adminTab === "users" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create User Form */}
            <div className="bg-[#D68227]/5 border border-[#D68227]/20 p-5 rounded-2xl space-y-4 h-fit">
              <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5 border-b border-[#D68227]/20 pb-2">
                <UserPlus size={14} className="text-[#D68227]" />
                تعریف حساب کاربری و پرسنل جدید
              </h3>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-natural-dark block">نام و نام‌خانوادگی پرسنل</label>
                  <input 
                    type="text"
                    placeholder="مثال: مهندس رضایی (ناظر شیفت)"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-[#D68227]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-natural-dark block">نام کاربری (جهت ورود)</label>
                  <input 
                    type="text"
                    placeholder="مثال: rezaei"
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-[#D68227] font-mono text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-natural-dark block">رمز عبور ورود</label>
                  <input 
                    type="text"
                    placeholder="مثال: 5678"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-[#D68227] font-mono text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-bold text-natural-dark block">نقش در سامانه</label>
                  <select
                    value={newStaffRole}
                    onChange={(e: any) => setNewStaffRole(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-natural-border bg-white focus:outline-none focus:border-[#D68227]"
                  >
                    <option value="supervisor">سرپرست فارم (دسترسی ویرایش و ثبت انتقالات)</option>
                    <option value="operator">اپراتور شیلات (ثبت جیره و آزمایش آب)</option>
                    <option value="viewer">ناظر مهمان (فقط مشاهده آمار و نقشه‌ها)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#D68227] hover:bg-[#c3731f] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <UserPlus size={14} />
                  تایید و تعریف حساب کاربری پرسنل
                </button>
              </form>
            </div>

            {/* Role Permissions Customizer - THE CORE FEATURE */}
            <div className="lg:col-span-2 bg-white border border-natural-border/75 p-5 rounded-2xl space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-natural-border pb-3">
                <div>
                  <h3 className="text-xs font-black text-natural-dark flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-amber-600" />
                    تنظیم دسترسی کلان نقش‌ها در سامانه
                  </h3>
                  <p className="text-[10px] text-natural-text/60 mt-0.5">تغییر دسترسی هر نقش، بلافاصله روی کلیه پرسنل دارای آن نقش اعمال می‌گردد.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetRolePermissions}
                  className="px-2.5 py-1.5 border border-red-200 text-red-750 bg-red-50 hover:bg-red-100 rounded-lg text-[9px] font-black cursor-pointer transition-colors"
                >
                  بازنشانی دسترسی نقش‌ها به پیش‌فرض
                </button>
              </div>

              {/* Role Selection Tabs */}
              <div className="flex bg-natural-khaki/30 p-1 rounded-xl border border-natural-border/50 gap-1">
                <button
                  type="button"
                  onClick={() => setActivePermissionRoleTab("supervisor")}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePermissionRoleTab === "supervisor"
                      ? "bg-blue-600 text-white shadow-xs animate-fade-in"
                      : "text-natural-text hover:text-blue-700"
                  }`}
                >
                  سرپرست کارگاه (Supervisor)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePermissionRoleTab("operator")}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePermissionRoleTab === "operator"
                      ? "bg-emerald-600 text-white shadow-xs animate-fade-in"
                      : "text-natural-text hover:text-emerald-700"
                  }`}
                >
                  اپراتور شیلات (Operator)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePermissionRoleTab("viewer")}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePermissionRoleTab === "viewer"
                      ? "bg-gray-600 text-white shadow-xs animate-fade-in"
                      : "text-natural-text hover:text-gray-700"
                  }`}
                >
                  ناظر مهمان (Viewer)
                </button>
              </div>

              {/* Grouped Permissions Checklist for Active Role */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    title: "امور فنی و شیلاتی",
                    color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-900",
                    labelColor: "text-emerald-800 font-bold",
                    sections: ["map", "stats", "realtime", "feeding", "lab", "mortality", "transfer", "archive"]
                  },
                  {
                    title: "کارخانجات و زنجیره ارزش",
                    color: "border-blue-500/20 bg-blue-500/5 text-blue-900",
                    labelColor: "text-blue-800 font-bold",
                    sections: ["facilities", "feedmill", "inventory", "processing", "coldstorage", "traceability"]
                  },
                  {
                    title: "امور مدیریتی و پشتیبانی",
                    color: "border-amber-500/20 bg-amber-500/5 text-amber-900",
                    labelColor: "text-amber-800 font-bold",
                    sections: ["accounting", "security", "chat", "settings", "admin"]
                  }
                ].map((group) => {
                  const groupSections = ALL_SECTIONS.filter(s => group.sections.includes(s.id));
                  const currentRolePerms = rolePermissions[activePermissionRoleTab] || [];
                  const allGroupChecked = groupSections.every(s => currentRolePerms.includes(s.id));

                  return (
                    <div key={group.title} className="p-3 rounded-xl border border-natural-border/30 bg-natural-khaki/10 space-y-2 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-natural-border/20 pb-1.5">
                          <h4 className={`text-[10px] font-black ${group.labelColor}`}>{group.title}</h4>
                          <button
                            type="button"
                            onClick={() => handleToggleRoleGroupPermissions(activePermissionRoleTab, group.sections, !allGroupChecked)}
                            className="text-[9px] hover:underline cursor-pointer font-black opacity-80 hover:opacity-100"
                          >
                            {allGroupChecked ? "لغو همه" : "انتخاب همه"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 text-[10px] max-h-52 overflow-y-auto pr-0.5">
                          {groupSections.map((section) => {
                            const isChecked = currentRolePerms.includes(section.id);
                            return (
                              <label 
                                key={section.id} 
                                className="flex items-center gap-1.5 p-1 hover:bg-white/70 rounded cursor-pointer select-none text-right transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleRolePermission(activePermissionRoleTab, section.id)}
                                  className="w-3.5 h-3.5 rounded text-[#D68227] border-natural-border focus:ring-[#D68227] accent-[#D68227] cursor-pointer"
                                />
                                <span className={`truncate ${isChecked ? "font-bold text-natural-dark" : "text-natural-text/60"}`}>
                                  {section.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* List of Registered Users */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-natural-dark flex justify-between items-center border-b border-natural-border/30 pb-2">
              <span>لیست پرسنل فعال و ناظران سامانه ({userList.length} نفر)</span>
              <span className="text-[10px] text-[#D68227] bg-[#D68227]/10 px-2.5 py-0.5 rounded-full font-bold">تطبیق خودکار دسترسی بر اساس نقش</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
              {userList.map((user) => {
                const isAdmin = user.username === "admin";
                const userRole = user.role || "viewer";
                const activeRolePerms = rolePermissions[userRole] || [];
                
                return (
                  <div 
                    key={user.id}
                    className="p-4 bg-white rounded-2xl border border-natural-border/60 hover:border-natural-border hover:shadow-2xs transition-all space-y-3 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-natural-khaki/60 text-[#D68227] flex items-center justify-center font-bold">
                            <UserIcon size={18} />
                          </div>
                          <div>
                            <strong className="text-xs font-bold text-natural-dark block">{user.name}</strong>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block mt-0.5 font-bold ${
                              user.role === "admin" 
                                ? "bg-red-50 text-red-700"
                                : user.role === "supervisor"
                                ? "bg-blue-50 text-blue-700"
                                : user.role === "operator"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {user.role === "admin" && "مدیر کل سیستم"}
                              {user.role === "supervisor" && "سرپرست کارگاه"}
                              {user.role === "operator" && "اپراتور شیلات"}
                              {user.role === "viewer" && "ناظر ناظران"}
                            </span>
                          </div>
                        </div>

                        {!isAdmin && (
                          <button
                            onClick={() => handleDeleteStaff(user.id)}
                            className="p-1.5 text-natural-clay hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="حذف حساب کاربری"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {editingPasswordUserId === user.id ? (
                        <div className="p-2.5 bg-[#D68227]/5 rounded-xl border border-[#D68227]/30 space-y-2">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-natural-text/60 font-sans text-[9px]">رمز عبور جدید:</span>
                            <input
                              type="text"
                              value={tempPassword}
                              onChange={(e) => setTempPassword(e.target.value)}
                              placeholder="رمز جدید"
                              className="text-xs p-1 rounded border border-natural-border font-mono text-left w-28 bg-white focus:outline-none focus:border-[#D68227]"
                            />
                          </div>
                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              onClick={() => handleUpdatePassword(user.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              ذخیره
                            </button>
                            <button
                              onClick={() => {
                                setEditingPasswordUserId(null);
                                setTempPassword("");
                              }}
                              className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              انصراف
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-natural-khaki/30 rounded-xl border border-natural-border/40 space-y-2 font-mono text-[10.5px]">
                          <div className="flex justify-between">
                            <span className="text-natural-text/60 font-sans text-[9px]">نام کاربری ورود:</span>
                            <strong className="text-natural-dark font-bold">{user.username || "نامشخص"}</strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex gap-1.5 items-center">
                              <span className="text-natural-text/60 font-sans text-[9px]">رمز ورود:</span>
                              <strong className="text-natural-dark font-bold">{user.password || "••••"}</strong>
                            </div>
                            <button
                              onClick={() => {
                                setEditingPasswordUserId(user.id);
                                setTempPassword(user.password || "");
                              }}
                              className="text-[#D68227] hover:underline font-bold text-[9.5px] font-sans cursor-pointer"
                            >
                              تغییر رمز
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ⚙️ GRANULAR PERMISSIONS SUMMARY DISPLAY */}
                    <div className="border-t border-natural-border/40 pt-2.5 mt-1">
                      {isAdmin ? (
                        <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 text-[9.5px] font-bold text-center leading-relaxed">
                          مدیر ارشد دسترسی کامل به تمامی بخش‌های سامانه را دارا می‌باشد.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-natural-text/60 font-bold">بخش‌های مجاز طبق نقش:</span>
                            <span className="text-[10px] font-bold text-[#D68227] bg-[#D68227]/10 px-2 py-0.5 rounded-lg">
                              {activeRolePerms.length} بخش از ۱۹
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 bg-natural-khaki/10 rounded-lg border border-natural-border/20">
                            {activeRolePerms.length === 0 ? (
                              <span className="text-[9px] text-red-500 font-bold">فاقد هرگونه دسترسی</span>
                            ) : (
                              activeRolePerms.map((permId) => {
                                const matched = ALL_SECTIONS.find(s => s.id === permId);
                                return (
                                  <span 
                                    key={permId} 
                                    className="text-[8.5px] font-bold px-1.5 py-0.5 bg-white text-natural-dark border border-natural-border/45 rounded-md shadow-4xs animate-fade-in"
                                  >
                                    {matched ? matched.label : permId}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
