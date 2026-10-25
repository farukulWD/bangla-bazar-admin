import { io, type Socket } from "socket.io-client";

import { SOCKET_URL } from "@/store/api/config";
import { getAuthToken } from "@/store/api/token";

export const NOTIFICATION_EVENT = "notification:new";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  socket ??= io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    auth: (cb) => cb({ token: getAuthToken() ?? "" }),
  });

  return socket;
};
