import type { Server } from "socket.io";

export function attachListeners(io: Server) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", (room: string) => {
      socket.join(room);
    });

    socket.on("leaveRoom", (room: string) => {
      socket.leave(room);
    });

    socket.on("message", (body) => {
      // body = { content, chatId, userId, createdAt }
      // socket.to excludes the sender (same behaviour as the old broadcast)
      socket.to(`chat:${body.chatId}`).emit("message", body);
    });
  });
}
