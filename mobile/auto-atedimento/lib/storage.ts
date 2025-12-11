import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@token";
const REFRESH_KEY = "@refresh";
const USER_KEY = "@user";

export async function saveAuth(token: string, user: any, refresh?: string | null) {
  const ops: [string, string][] = [
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user ?? null)],
  ];
  if (refresh) ops.push([REFRESH_KEY, refresh]);
  await AsyncStorage.multiSet(ops);
}

export async function getAuth(): Promise<{ token: string | null; refresh: string | null; user: any | null; }> {
  const [[, token], [, refresh], [, rawUser]] = await AsyncStorage.multiGet([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
  let user: any = null;
  try { user = rawUser ? JSON.parse(rawUser) : null; } catch {}
  return { token: token ?? null, refresh: refresh ?? null, user };
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
}

export async function getToken() {
  const v = await AsyncStorage.getItem(TOKEN_KEY);
  return v ?? null;
}
export async function setUser(user: any) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
}
