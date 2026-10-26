const TOKEN_KEY = "bangla-bazar-admin-token";

export const AUTH_COOKIE_NAME = "bb_admin_session";

const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const listeners = new Set<() => void>();

const notify = (): void => {
  for (const listener of listeners) listener();
};

const cookieAttributes = (): string => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  return `Path=/; SameSite=Lax${secure}`;
};

const writeSessionCookie = (): void => {
  document.cookie = `${AUTH_COOKIE_NAME}=1; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; ${cookieAttributes()}`;
};

const deleteSessionCookie = (): void => {
  document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; ${cookieAttributes()}`;
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  writeSessionCookie();
  notify();
};

export const clearAuthToken = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  deleteSessionCookie();
  notify();
};

export const syncSessionCookie = (): void => {
  if (typeof window === "undefined") return;

  if (window.localStorage.getItem(TOKEN_KEY)) writeSessionCookie();
  else deleteSessionCookie();
};

export const subscribeToAuthToken = (listener: () => void): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
