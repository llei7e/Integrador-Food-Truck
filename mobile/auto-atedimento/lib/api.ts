import { Platform } from "react-native";
import { getToken } from "./storage";

const AWS_IP = "54.146.16.231"; 

const PORT = "8080"; 

const API_URL = `http://${AWS_IP}:${PORT}`;

export const BASE_URL = API_URL;

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

  console.log(`📡 AWS Request: ${BASE_URL}${path}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers, signal: controller.signal }).catch((e) => {
    clearTimeout(timer); 
    console.error("Erro de conexão AWS:", e);
    throw new ApiError(e?.message || "Falha de conexão com o servidor", 0);
  });

  clearTimeout(timer);

  let data: any = null; try { data = await res.json(); } catch {}
  if (!res.ok) throw new ApiError(data?.message || data?.detail || `Erro ${res.status}`, res.status, data);
  return data;
}