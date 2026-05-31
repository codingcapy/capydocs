import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { useEffect } from "react";
import useAuthStore from "../store/AuthStore";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { logoutService, user } = useAuthStore();
  const navigate = useNavigate();

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
            <div className="border border-[#a0a0a0] bg-white w-[150px] h-[200px] flex justify-center items-center cursor-pointer hover:border-cyan-500">
              <div className="text-8xl text-cyan-500 mb-5">+</div>
            </div>
          </div>
        </div>
      </div>
      <div className="xl:w-[1150px] mx-auto pt-5">
        <div className="font-semibold">Your documents</div>
        <div className="grid grid-cols-5">
          <div className="py-6">
            <div className="relative border border-[#a0a0a0] bg-white w-[210px] h-[260px] cursor-pointer hover:border-cyan-500">
              <div className="absolute bottom-0 left-0 w-full border-t border-t-[#a0a0a0] h-[75px] px-5 py-3 truncate">
                <div>Placeholder title 123</div>
              </div>
            </div>
          </div>
          <div className="py-6">
            <div className="relative border border-[#a0a0a0] bg-white w-[210px] h-[260px] cursor-pointer hover:border-cyan-500">
              <div className="absolute bottom-0 left-0 w-full border-t border-t-[#a0a0a0] h-[75px] px-5 py-3 truncate">
                <div>Placeholder title 123</div>
              </div>
            </div>
          </div>
          <div className="py-6">
            <div className="relative border border-[#a0a0a0] bg-white w-[210px] h-[260px] cursor-pointer hover:border-cyan-500">
              <div className="absolute bottom-0 left-0 w-full border-t border-t-[#a0a0a0] h-[75px] px-5 py-3 truncate">
                <div>Placeholder title 123</div>
              </div>
            </div>
          </div>
          <div className="py-6">
            <div className="relative border border-[#a0a0a0] bg-white w-[210px] h-[260px] cursor-pointer hover:border-cyan-500">
              <div className="absolute bottom-0 left-0 w-full border-t border-t-[#a0a0a0] h-[75px] px-5 py-3 truncate">
                <div>Placeholder title 123</div>
              </div>
            </div>
          </div>
          <div className="py-6">
            <div className="relative border border-[#a0a0a0] bg-white w-[210px] h-[260px] cursor-pointer hover:border-cyan-500">
              <div className="absolute bottom-0 left-0 w-full border-t border-t-[#a0a0a0] h-[75px] px-5 py-3 truncate">
                <div>Placeholder title 123</div>
              </div>
            </div>
          </div>
          <div className="py-6">
            <div className="relative border border-[#a0a0a0] bg-white w-[210px] h-[260px] cursor-pointer hover:border-cyan-500">
              <div className="absolute bottom-0 left-0 w-full border-t border-t-[#a0a0a0] h-[75px] px-5 py-3 truncate">
                <div>Placeholder title 123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
