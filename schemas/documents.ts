import { index, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const documents = pgTable(
  "documents",
  {
    documentId: varchar("document_id").primaryKey(),
    username: varchar("username").notNull(),
    content: varchar("content").default("active").notNull(),
    visibility: varchar("visibility").default("private").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("users_username_idx").on(table.username)],
);

export type User = InferSelectModel<typeof documents>;
