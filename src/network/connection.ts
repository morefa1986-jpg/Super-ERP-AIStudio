export interface ConnectionSettings { protocol: "http" | "https"; host: string; port: number; useSameOrigin: boolean; }
export const CONNECTION_STORAGE_KEY = "sturgeon_connection_settings_v1";

export function validateConnection(settings: ConnectionSettings): string | null {
  if (settings.protocol !== "http" && settings.protocol !== "https") return "پروتکل فقط می‌تواند HTTP یا HTTPS باشد.";
  if (!settings.useSameOrigin && (!settings.host || /[\s/]/.test(settings.host))) return "Host نامعتبر است.";
  if (!settings.useSameOrigin && (!Number.isInteger(settings.port) || settings.port < 1 || settings.port > 65535)) return "Port باید بین 1 و 65535 باشد.";
  return null;
}

export function getConnectionSettings(): ConnectionSettings {
  const fallback: ConnectionSettings = { protocol: window.location.protocol === "https:" ? "https" : "http", host: window.location.hostname || "localhost", port: Number(window.location.port) || (window.location.protocol === "https:" ? 443 : 3000), useSameOrigin: true };
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(CONNECTION_STORAGE_KEY) || "{}")} as ConnectionSettings; } catch { return fallback; }
}

export function saveConnectionSettings(settings: ConnectionSettings): void {
  const error = validateConnection(settings); if (error) throw new Error(error);
  localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(settings));
}

export function getApiUrl(path: string): string {
  if (getConnectionSettings().useSameOrigin) return path;
  const s = getConnectionSettings(); return `${s.protocol}://${s.host}:${s.port}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getWebSocketUrl(): string {
  const s = getConnectionSettings();
  if (s.useSameOrigin) return `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
  return `${s.protocol === "https" ? "wss" : "ws"}://${s.host}:${s.port}`;
}
