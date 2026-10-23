import { syncSessionCookie } from "@/store/api/token";

export const postAuthRedirect = (path: string): void => {
  syncSessionCookie();

  window.location.assign(path);
};
