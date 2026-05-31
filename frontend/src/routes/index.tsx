import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import capyness from "/capyness.png";
import useAuthStore from "../store/AuthStore";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { loginService, authLoading, user } = useAuthStore();
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!!user) navigate({ to: "/dashboard" });
  }, [user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;
    const password = (e.target as HTMLFormElement).password.value;
    loginService(email, password);
    if (authLoading) setNotification("Loading...");
    if (!user) {
      setTimeout(() => {
        setNotification("Invalid login credentials");
      }, 700);
    }
  }

  return (
    <div className="flex flex-col bg-[#222222] min-h-screen text-white justify-center">
      <div className="sm:flex mx-auto items-center justify-center bg-[#111111] px-5 py-10 rounded-2xl">
        <div className="px-5 md:mb-40 xl:w-[500px]">
          <img src={capyness} alt="" className="w-[50px]" />
          <div className="text-4xl my-2">Sign in</div>
          <div>Write content and collaborate with others</div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col px-5">
          <input
            type="email"
            placeholder="Email"
            className="border border-[#a0a0a0] px-3 py-2 my-1 rounded sm:w-[300px] xl:w-[400px]"
            name="email"
            id="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-[#a0a0a0] px-3 py-2 my-1 rounded"
            name="password"
            id="password"
            required
          />
          <div className="text-yellow-500">{notification}</div>
          <div className="flex mt-10 items-center justify-end">
            <Link to="/signup" className="mx-5 font-semibold text-cyan-300">
              Create account
            </Link>
            <button className="bg-cyan-300 rounded-full px-6 py-2 text-[#222222]">
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
