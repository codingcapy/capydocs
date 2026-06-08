import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import z from "zod";
import { optionalUser, requireUser } from "../utils";
import { mightFail } from "might-fail";
import { db } from "../db";
import { documents as documentsTable } from "../schemas/documents";
import { randomUUIDv7 } from "bun";
import { HTTPException } from "hono/http-exception";
import { and, desc, eq, lt } from "drizzle-orm";

const createDocumentSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const updateDocumentTitleSchema = z.object({
  documentId: z.number(),
  title: z.string(),
});

const updateDocumentContentSchema = z.object({
  documentId: z.number(),
  content: z.string(),
});

const updateDocumentContentVisibility = z.object({
  documentId: z.number(),
  visibility: z.string(),
});

const deleteDocumentSchema = z.object({
  documentId: z.number(),
});

const getDocumentsSchema = z.object({
  cursor: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const documentsRouter = new Hono()
  .post("/", zValidator("json", createDocumentSchema), async (c) => {
    const decodedUser = requireUser(c);
    const insertValues = c.req.valid("json");
    const { result: documentInsertResult, error: documentInsertError } =
      await mightFail(
        db
          .insert(documentsTable)
          .values({
            ...insertValues,
            path: randomUUIDv7(),
            userId: decodedUser.id,
          })
          .returning(),
      );
    if (documentInsertError)
      throw new HTTPException(500, {
        message: "Error creating document",
        cause: documentInsertError,
      });
    return c.json(documentInsertResult[0]);
  })
  .get("/", zValidator("query", getDocumentsSchema), async (c) => {
    const decodedUser = requireUser(c);
    const { cursor, limit } = c.req.valid("query");
    const cursorClause = cursor
      ? lt(documentsTable.documentId, cursor)
      : undefined;
    const { result: documentsQueryResult, error: documentsQueryError } =
      await mightFail(
        db
          .select()
          .from(documentsTable)
          .where(and(cursorClause, eq(documentsTable.userId, decodedUser.id)))
          .orderBy(desc(documentsTable.documentId))
          .limit(limit + 1),
      );
    if (documentsQueryError)
      throw new HTTPException(500, {
        message: "Error fetching documents",
        cause: documentsQueryError,
      });
    const hasMore = documentsQueryResult.length > limit;
    const docs = hasMore
      ? documentsQueryResult.slice(0, limit)
      : documentsQueryResult;
    const lastDocument = docs[docs.length - 1];
    const nextCursor = hasMore && lastDocument ? lastDocument.documentId : null;
    return c.json({ documents: docs, nextCursor });
  })
  .get("/document/:path", async (c) => {
    const potentialUser = optionalUser(c);
    const pathParam = c.req.param().path;
    const { result: documentQueryResult, error: documentQueryError } =
      await mightFail(
        db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.path, pathParam)),
      );
    if (documentQueryError)
      throw new HTTPException(500, {
        message: "error fetching document",
        cause: documentQueryError,
      });
    const document = documentQueryResult[0];
    if (!document)
      throw new HTTPException(404, { message: "Document not found" });
    if (
      document.visibility === "private" &&
      document.userId !== potentialUser?.id
    )
      throw new HTTPException(401, { message: "Unauthorized" });
    return c.json({ document });
  })
  .post(
    "/update/title",
    zValidator("json", updateDocumentTitleSchema),
    async (c) => {
      const updateValues = c.req.valid("json");
      const potentialUser = optionalUser(c);
      const { result: documentQueryResult, error: documentQueryError } =
        await mightFail(
          db
            .select()
            .from(documentsTable)
            .where(eq(documentsTable.documentId, updateValues.documentId)),
        );
      if (documentQueryError)
        throw new HTTPException(500, {
          message: "error fetching document",
          cause: documentQueryError,
        });
      const document = documentQueryResult[0];
      if (!document)
        throw new HTTPException(404, { message: "Document not found" });
      if (
        document.visibility === "private" &&
        document.userId !== potentialUser?.id
      )
        throw new HTTPException(401, { message: "Unauthorized" });
      const { result: documentUpdateResult, error: documentUpdateError } =
        await mightFail(
          db
            .update(documentsTable)
            .set({ title: updateValues.title })
            .where(eq(documentsTable.documentId, updateValues.documentId))
            .returning(),
        );
      if (documentUpdateError)
        throw new HTTPException(500, {
          message: "error updating document",
          cause: documentQueryError,
        });
      return c.json({ document: documentUpdateResult[0] });
    },
  )
  .post("/delete", zValidator("json", deleteDocumentSchema), async (c) => {
    const deleteValues = c.req.valid("json");
    const decodedUser = requireUser(c);
    const { result: documentQueryResult, error: documentQueryError } =
      await mightFail(
        db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.documentId, deleteValues.documentId)),
      );
    if (documentQueryError)
      throw new HTTPException(500, {
        message: "error fetching document",
        cause: documentQueryError,
      });
    const document = documentQueryResult[0];
    if (!document)
      throw new HTTPException(404, { message: "Document not found" });
    if (document.userId !== decodedUser.id)
      throw new HTTPException(401, { message: "Unauthorized" });
    const { result: documentDeleteResult, error: documentDeleteError } =
      await mightFail(
        db
          .delete(documentsTable)
          .where(eq(documentsTable.documentId, deleteValues.documentId))
          .returning(),
      );
    if (documentDeleteError)
      throw new HTTPException(500, {
        message: "error deleting document",
        cause: documentQueryError,
      });
    return c.json({ document: documentDeleteResult[0] });
  })
  .post(
    "/update/content",
    zValidator("json", updateDocumentContentSchema),
    async (c) => {
      const updateValues = c.req.valid("json");
      const potentialUser = optionalUser(c);
      const { result: documentQueryResult, error: documentQueryError } =
        await mightFail(
          db
            .select()
            .from(documentsTable)
            .where(eq(documentsTable.documentId, updateValues.documentId)),
        );
      if (documentQueryError)
        throw new HTTPException(500, {
          message: "error fetching document",
          cause: documentQueryError,
        });
      const document = documentQueryResult[0];
      if (!document)
        throw new HTTPException(404, { message: "Document not found" });
      if (
        document.visibility === "private" &&
        document.userId !== potentialUser?.id
      )
        throw new HTTPException(401, { message: "Unauthorized" });
      const { result: documentUpdateResult, error: documentUpdateError } =
        await mightFail(
          db
            .update(documentsTable)
            .set({ content: updateValues.content })
            .where(eq(documentsTable.documentId, updateValues.documentId))
            .returning(),
        );
      if (documentUpdateError)
        throw new HTTPException(500, {
          message: "error deleting document",
          cause: documentUpdateError,
        });
      return c.json({ document: documentUpdateResult[0] });
    },
  )
  .post(
    "/update/visibility",
    zValidator("json", updateDocumentContentVisibility),
    async (c) => {
      const updateValues = c.req.valid("json");
      const decodedUser = requireUser(c);
      const { result: documentQueryResult, error: documentQueryError } =
        await mightFail(
          db
            .select()
            .from(documentsTable)
            .where(eq(documentsTable.documentId, updateValues.documentId)),
        );
      if (documentQueryError)
        throw new HTTPException(500, {
          message: "error fetching document",
          cause: documentQueryError,
        });
      const document = documentQueryResult[0];
      if (!document)
        throw new HTTPException(404, { message: "Document not found" });
      if (document.userId !== decodedUser.id)
        throw new HTTPException(401, { message: "Unauthorized" });
      const { result: documentUpdateResult, error: documentUpdateError } =
        await mightFail(
          db
            .update(documentsTable)
            .set({ visibility: updateValues.visibility })
            .where(eq(documentsTable.documentId, updateValues.documentId))
            .returning(),
        );
      if (documentUpdateError)
        throw new HTTPException(500, {
          message: "error updating document",
          cause: documentQueryError,
        });
      return c.json({ document: documentUpdateResult[0] });
    },
  );
