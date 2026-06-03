import {
  index,
  pgTable,
  varchar,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
import { users as usersTable } from "./users";

export const documents = pgTable(
  "documents",
  {
    documentId: serial("document_id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.userId),
    title: varchar("title").notNull(),
    content: varchar("content").default("active").notNull(),
    path: varchar("path").notNull(),
    thumbnail: varchar("thumbnail"),
    visibility: varchar("visibility").default("private").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    editedAt: timestamp("edited_at").defaultNow().notNull(),
  },
  (table) => [index("documents_user_id_idx").on(table.userId)],
);

export type Document = InferSelectModel<typeof documents>;
