import { index, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
import { users as usersTable } from "./users";

export const documents = pgTable(
  "documents",
  {
    documentId: varchar("document_id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.userId),
    content: varchar("content").default("active").notNull(),
    thumbnail: varchar("thumbnail"),
    visibility: varchar("visibility").default("private").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("documents_user_id_idx").on(table.userId)],
);

export type User = InferSelectModel<typeof documents>;
