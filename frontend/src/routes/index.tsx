import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import capyness from "/capyness.png";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col bg-[#222222] min-h-screen text-white justify-center">
      <div className="sm:flex mx-auto items-center justify-center bg-[#111111] px-5 py-10 rounded-2xl">
        <div className="px-5 md:mb-40 xl:w-[500px]">
          <img src={capyness} alt="" className="w-[50px]" />
          <div className="text-4xl my-2">Sign in</div>
          <div>Write content and collaborate with others</div>
        </div>
        <form action="" className="flex flex-col px-5">
          <input
            type="email"
            placeholder="Email"
            className="border border-[#a0a0a0] px-3 py-2 my-1 rounded sm:w-[300px] xl:w-[400px]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-[#a0a0a0] px-3 py-2 my-1 rounded"
            required
          />
          <div className="flex mt-10 items-center justify-end">
            <Link to="/" className="mx-5 font-semibold text-cyan-300">
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
