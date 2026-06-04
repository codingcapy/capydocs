import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getSession } from "../utils";
import { client, type ArgumentTypes, type ExtractData } from "./client";

type CreateDocumentArgs = ArgumentTypes<
  typeof client.api.v0.documents.$post
>[0]["json"];

export type DocumentsCursor = {
  documentId: number;
} | null;

type UpdateDocumentTitleArgs = ArgumentTypes<
  typeof client.api.v0.documents.update.title.$post
>[0]["json"];

type deleteDocumentArgs = ArgumentTypes<
  typeof client.api.v0.documents.delete.$post
>[0]["json"];

export type SerializeDocument = ExtractData<
  Awaited<
    ReturnType<(typeof client.api.v0.documents.document)[":path"]["$get"]>
  >
>["document"];

export function mapSerializedDocumentToSchema(
  SerializedDocument: SerializeDocument,
) {
  return {
    ...SerializedDocument,
    createdAt: new Date(SerializedDocument.createdAt),
    editedAt: new Date(SerializedDocument.editedAt),
  };
}

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
    documents: data.documents.map(mapSerializedDocumentToSchema),
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

async function getDocumentById(path: string) {
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
    throw new Error("Error getting document by id");
  }
  const { document } = await res.json();
  return mapSerializedDocumentToSchema(document);
}

export const getDocumentByIdQueryOptions = (path: string) =>
  queryOptions({
    queryKey: ["document"],
    queryFn: () => getDocumentById(path),
  });

async function UpdateDocumentTitle(args: UpdateDocumentTitleArgs) {
  const token = getSession();
  const res = await client.api.v0.documents.update.title.$post(
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
      "There was an issue updating your document title :( We'll look into it ASAP!";
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
  return mapSerializedDocumentToSchema(result.document);
}

export const useUpdateDocumentTitleMutation = (
  onError?: (message: string) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UpdateDocumentTitle,
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["document"],
      });
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

async function deleteDocument(args: deleteDocumentArgs) {
  const token = getSession();
  const res = await client.api.v0.documents.delete.$post(
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
      "There was an issue deleting your document title :( We'll look into it ASAP!";
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
  return result;
}

export function useDeleteDocumentMutation(onError?: (message: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDocument,
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["document"],
      });
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
}
