import { useEffect, useState } from "react";
import { socket } from "../services/socket.service";
import useAuthStore from "../store/AuthStore";

export type PresenceUser = {
  userId: string;
  username: string;
  profilePic: string | null;
  socketId: string;
};

export function usePresence(documentId: string) {
  const { user } = useAuthStore();
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) socket.connect();

    socket.emit("document:join", {
      documentId,
      user: {
        userId: user.userId,
        username: user.username,
        profilePic: user.profilePic ?? null,
      },
    });

    socket.on("document:presence", (users: PresenceUser[]) => {
      // Exclude self from the list
      setPresentUsers(users.filter((u) => u.userId !== user.userId));
    });

    socket.on("document:user_joined", (presenceUser: PresenceUser) => {
      if (presenceUser.userId === user.userId) return;
      setPresentUsers((prev) => {
        if (prev.some((u) => u.socketId === presenceUser.socketId)) return prev;
        return [...prev, presenceUser];
      });
    });

    socket.on("document:user_left", ({ socketId }: { socketId: string }) => {
      setPresentUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    });

    return () => {
      socket.emit("document:leave", { documentId });
      socket.off("document:presence");
      socket.off("document:user_joined");
      socket.off("document:user_left");
    };
  }, [documentId, user]);

  return { presentUsers };
}
