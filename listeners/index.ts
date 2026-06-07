import type { Server } from "socket.io";

type PresenceUser = {
  userId: string;
  username: string;
  profilePic: string | null;
  socketId: string;
};

// documentId -> (socketId -> PresenceUser)
const documentPresence = new Map<string, Map<string, PresenceUser>>();

export function attachListeners(io: Server) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", (room: string) => {
      socket.join(room);
    });

    socket.on("leaveRoom", (room: string) => {
      socket.leave(room);
    });

    socket.on("message", (body) => {
      socket.to(`chat:${body.chatId}`).emit("message", body);
    });

    // ── Presence ──────────────────────────────────────────────────────────────

    socket.on(
      "document:join",
      (data: {
        documentId: string;
        user: Omit<PresenceUser, "socketId">;
      }) => {
        const room = `doc:${data.documentId}`;
        socket.join(room);

        if (!documentPresence.has(data.documentId)) {
          documentPresence.set(data.documentId, new Map());
        }
        const users = documentPresence.get(data.documentId)!;
        users.set(socket.id, { ...data.user, socketId: socket.id });

        // Send the full presence list to the joining user
        socket.emit("document:presence", Array.from(users.values()));

        // Notify everyone else in the room
        socket
          .to(room)
          .emit("document:user_joined", { ...data.user, socketId: socket.id });
      },
    );

    socket.on("document:leave", (data: { documentId: string }) => {
      const room = `doc:${data.documentId}`;
      socket.leave(room);

      const users = documentPresence.get(data.documentId);
      if (users) {
        users.delete(socket.id);
        if (users.size === 0) documentPresence.delete(data.documentId);
      }

      socket.to(room).emit("document:user_left", { socketId: socket.id });
    });

    socket.on("disconnect", () => {
      for (const [documentId, users] of documentPresence.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          const room = `doc:${documentId}`;
          io.to(room).emit("document:user_left", { socketId: socket.id });
          if (users.size === 0) documentPresence.delete(documentId);
        }
      }
    });
  });
}
