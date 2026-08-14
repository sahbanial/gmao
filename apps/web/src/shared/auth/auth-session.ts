import type { PublicUser } from "../api/types";

const TOKEN_KEY = "gmao.accessToken";
const USER_KEY = "gmao.user";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PublicUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

export function saveAuthSession(accessToken: string, user: PublicUser): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
