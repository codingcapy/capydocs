import { createFileRoute } from "@tanstack/react-router";
import { DocumentHeader } from "../../components/DocumentHeader";

export const Route = createFileRoute("/docs/$path")({
  component: RouteComponent,
});

function RouteComponent() {
  const { path: documentPath } = Route.useParams();
  console.log(documentPath);
  return (
    <div className="bg-[#edf0f5] min-h-screen p-2">
      <DocumentHeader />
      <div className="bg-white w-[800px] h-[800px] mx-auto border border-[#d0d0d0] mt-[100px] p-10">
        Hello "/docs/$path"!
      </div>
    </div>
  );
}
