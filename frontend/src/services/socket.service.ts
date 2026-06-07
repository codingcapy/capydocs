import { io, type Socket } from "socket.io-client";

const devServer = "http://localhost:3333";
const prodServer = "https://capydocs.up.railway.app";

const URL = import.meta.env.DEV ? devServer : prodServer;

export const socket: Socket = io(URL, {
  path: "/ws",
  autoConnect: false,
});
