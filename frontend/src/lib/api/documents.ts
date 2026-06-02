import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getSession } from "../utils";
import { client, type ArgumentTypes } from "./client";

type CreateDocumentArgs = ArgumentTypes<
  typeof client.api.v0.documents.$post
>[0]["json"];

export type DocumentsCursor = {
  documentId: number;
} | null;

async function createDocument(args: CreateDocumentArgs) {
  const token = getSession();
  const res = await client.api.v0.documents.$post(
    { json: args },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  );
  if (!res.ok) {
    let errorMessage =
      "There was an issue creating your document :( We'll look into it ASAP!";
    try {
      const errorResponse = await res.json();
      if (
        errorResponse &&
        typeof errorResponse === "object" &&
        "message" in errorResponse
      ) {
        errorMessage = String(errorResponse.message);
      }
    } catch (error) {
      console.error("Failed to parse error response:", error);
    }
    throw new Error(errorMessage);
  }
  const result = await res.json();
  if (!result) {
    throw new Error("Invalid response from server");
  }
  return result;
}

export const useCreateDocumentMutation = (
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDocument,
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
    onError: (error) => {
      if (onError) {
        onError(error.message);
      }
    },
  });
};

async function getDocuments(cursor?: number) {
  const token = getSession();
  const res = await client.api.v0.documents.$get(
    {
      query: cursor !== undefined ? { cursor: cursor.toString() } : {},
    },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  );
  if (!res.ok) {
    throw new Error("Error getting documents");
  }
  const data = await res.json();
  return {
    documents: data.documents,
    nextCursor: data.nextCursor,
  };
}

export const getDocumentsInfiniteQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: ["documents"],
    queryFn: ({ pageParam }) => getDocuments(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

async function getDocumentById(path: number) {
  const token = getSession();
  const res = await client.api.v0.documents.document[":path"].$get(
    {
      param: { path: path.toString() },
    },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  );
  if (!res.ok) {
    throw new Error("Error getting post by id");
  }
  const { document } = await res.json();
  return document;
}

export const getPostByIdQueryOptions = (path: number) =>
  queryOptions({
    queryKey: ["document"],
    queryFn: () => getDocumentById(path),
  });
