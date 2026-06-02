import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { useEffect, useRef, useState } from "react";
import useAuthStore from "../store/AuthStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getDocumentsInfiniteQueryOptions,
  useCreateDocumentMutation,
} from "../lib/api/documents";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { logoutService, user } = useAuthStore();
  const navigate = useNavigate();
  const documentsSentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    data: documentsData,
    isLoading: documentsLoading,
    error: documentsError,
    fetchNextPage: fetchNextDocumentsPage,
    hasNextPage: hasNextDocumentsPage,
    isFetchingNextPage: isFetchingNextDocumentsPage,
  } = useInfiniteQuery({
    ...getDocumentsInfiniteQueryOptions(),
  });
  const documents = documentsData?.pages.flatMap((p) => p.documents);
  const { mutate: createDocument, isPending: createDocumentPending } =
    useCreateDocumentMutation();
  const [notification, setNotification] = useState("");

  function handleSubmit() {
    if (createDocumentPending) return;
    createDocument(
      {
        title: "Untitled",
        content: "",
      },
      {
        onSuccess: (data) => navigate({ to: `/docs/${data.path}` }),
        onError: () => setNotification("yikes"),
      },
    );
  }

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user]);

  return (
    <div className="min-h-screen p-2 xl:p-0">
      <Header />
      <div className="bg-[#edf0f5]">
        <div className="pt-[80px] xl:w-[1150px] mx-auto">
          <div>Start a new document</div>
          <div className="pt-5 pb-15">
            <div
              onClick={handleSubmit}
              className="border border-[#a0a0a0] bg-white w-[150px] h-[200px] flex justify-center items-center cursor-pointer hover:border-cyan-500"
            >
              <div className="text-8xl text-cyan-500 mb-5">+</div>
            </div>
          </div>
        </div>
      </div>
      <div className="xl:w-[1150px] mx-auto pt-5">
        <div className="font-semibold">Your documents</div>
        {documentsLoading ? (
          <div>Loading documents...</div>
        ) : documentsError ? (
          <div>Error loading documents</div>
        ) : documents ? (
          <div className="grid grid-cols-5">
            {documents.map((d) => (
              <Link
                to="/docs/$path"
                params={{ path: d.path }}
                key={d.documentId}
                className="py-6"
              >
                <div className="relative border border-[#a0a0a0] bg-white w-[210px] h-[260px] cursor-pointer hover:border-cyan-500">
                  <div className="absolute bottom-0 left-0 w-full border-t border-t-[#a0a0a0] h-[75px] px-5 py-3 truncate">
                    <div>{d.title}</div>
                  </div>
                </div>
              </Link>
            ))}
            {isFetchingNextDocumentsPage && (
              <div className="py-3 text-sm text-[#a0a0a0]">Loading more...</div>
            )}
            <div className="h-[50px]" ref={documentsSentinelRef} />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
