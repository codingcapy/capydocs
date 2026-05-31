import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import capyness from "/capyness.png";
import { useCreateUserMutation } from "../lib/api/users";
import { useEffect, useState } from "react";
import useAuthStore from "../store/AuthStore";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mutate: createUser, isPending: createUserPending } =
    useCreateUserMutation();
  const [notification, setNotification] = useState("");
  const { loginService, authLoading, user } = useAuthStore();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (createUserPending) return;
    const username = (e.target as HTMLFormElement).username.value;
    const email = (e.target as HTMLFormElement).email.value;
    const password = (e.target as HTMLFormElement).password.value;
    if (username.length > 32)
      return setNotification("Username too long! Max 32 characters");
    if (email.length > 255) return setNotification("Email too long!");
    if (password.length > 80)
      return setNotification("Password too long! Max character limit is 80");
    if (password.length < 8)
      return setNotification("Password must be at least 8 characters");
    createUser(
      { username, password, email },
      {
        onSuccess: () => {
          loginService(email, password);
          if (authLoading) setNotification("Loading...");
        },
        onError: (errorMessage) => setNotification(errorMessage.toString()),
      },
    );
  }

  useEffect(() => {
    if (!!user) navigate({ to: "/dashboard" });
  }, [user]);

  return (
    <div className="flex flex-col bg-[#222222] min-h-screen text-white justify-center">
      <div className="sm:flex mx-auto items-center justify-center bg-[#111111] px-5 py-10 rounded-2xl">
        <div className="px-5 md:mb-40 xl:w-[500px]">
          <img src={capyness} alt="" className="w-[50px]" />
          <div className="text-4xl my-2">Create a CapyDocs account</div>
          <div>Write content and collaborate with others</div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col px-5">
          <input
            type="username"
            placeholder="Username"
            name="username"
            id="username"
            className="border border-[#a0a0a0] px-3 py-2 my-1 rounded sm:w-[300px] xl:w-[400px]"
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            id="email"
            className="border border-[#a0a0a0] px-3 py-2 my-1 rounded sm:w-[300px] xl:w-[400px]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            className="border border-[#a0a0a0] px-3 py-2 my-1 rounded"
            required
          />
          <div className="text-yellow-500">{notification}</div>
          <div className="flex mt-10 items-center justify-end">
            <button className="bg-cyan-300 rounded-full px-6 py-2 text-[#222222]">
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
