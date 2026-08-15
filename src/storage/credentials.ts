const STORAGE_KEY = "fathi_saved_login_v1";
const DB_NAME = "fathi-credentials-v1";
const STORE_NAME = "keys";
const KEY_ID = "remember-password";

type Envelope = { v: 1; iv: string; ciphertext: string };

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB error"));
  });
}

async function getKey(create = false): Promise<CryptoKey> {
  if (!crypto?.subtle) throw new Error("WebCrypto unavailable");
  const db = await openDb();
  const existing = await new Promise<CryptoKey | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(KEY_ID);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (existing) return existing;
  if (!create) throw new Error("Credential key unavailable");
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(key, KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return key;
}

export async function saveRememberedLogin(username: string, password: string): Promise<boolean> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey(true);
    const plaintext = new TextEncoder().encode(JSON.stringify({ username, password }));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) }));
    return true;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

export async function loadRememberedLogin(): Promise<{ username: string; password: string } | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as Envelope;
    if (envelope.v !== 1) return null;
    const key = await getKey();
    const data = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(envelope.iv) }, key, fromBase64(envelope.ciphertext));
    const parsed = JSON.parse(new TextDecoder().decode(data));
    return typeof parsed.username === "string" && typeof parsed.password === "string" ? parsed : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearRememberedLogin(): void {
  localStorage.removeItem(STORAGE_KEY);
}
