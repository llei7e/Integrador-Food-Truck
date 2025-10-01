import { Platform } from "react-native";
import { getToken } from "./storage";

const WEB_OR_IOS = "http://localhost:8000";   // Web / iOS simulador
const ANDROID_EMULATOR = "http://10.0.2.2:8000"; // Android emulador
export const BASE_URL = Platform.OS === "android" ? ANDROID_EMULATOR : WEB_OR_IOS;
// export const BASE_URL = "http://SEU-IP-LOCAL:8000";

export class ApiError extends Error {
  status: number; body?: any;
  constructor(message: string, status: number, body?: any) { super(message); this.status = status; this.body = body; }
}

export type ApiOptions = RequestInit & { auth?: boolean; timeoutMs?: number };

export async function api(path: string, opts: ApiOptions = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);

  const headers: Record<string, string> = { Accept: "application/json", ...(opts.headers as any) };

  if (opts.auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers, signal: controller.signal }).catch((e) => {
    clearTimeout(timer); throw new ApiError(e?.message || "Falha de rede", 0);
  });

  clearTimeout(timer);

  let data: any = null; try { data = await res.json(); } catch {}
  if (!res.ok) throw new ApiError(data?.message || data?.detail || `Erro ${res.status}`, res.status, data);
  return data;
}
