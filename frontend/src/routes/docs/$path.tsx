import { createFileRoute } from "@tanstack/react-router";
import { DocumentHeader } from "../../components/DocumentHeader";
import { DocEditor } from "../../components/DocEditor";
import { getDocumentByIdQueryOptions } from "../../lib/api/documents";
import { useQuery } from "@tanstack/react-query";
import { usePresence } from "../../hooks/usePresence";

export const Route = createFileRoute("/docs/$path")({
  component: RouteComponent,
});

function RouteComponent() {
  const { path: documentPath } = Route.useParams();
  const {
    data: document,
    isLoading: documentLoading,
    error: documentError,
  } = useQuery(getDocumentByIdQueryOptions(documentPath));
  const { presentUsers } = usePresence(documentPath);

  return (
    <div className="bg-[#edf0f5] min-h-screen p-2">
      <DocumentHeader key={documentPath} document={document} presentUsers={presentUsers} />
      <div className="bg-white w-[800px] h-[800px] mx-auto border border-[#d0d0d0] mt-[100px] p-10">
        {documentLoading ? (
          <div>Loading...</div>
        ) : documentError ? (
          <div>Error loading content</div>
        ) : document ? (
          <DocEditor key={documentPath} document={document} />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
