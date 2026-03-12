import { io } from "socket.io-client";
import { serverUrl } from "./App";

let socket;

export function getSocket(userId) {
  if (!socket) {
    socket = io(serverUrl, { withCredentials: true });
    if (userId) {
      socket.on("connect", () => {
        socket.emit("identify", { userId });
      });
    }
  }
  return socket;
}
