import { Link } from "@tanstack/react-router";
import capyness from "/capyness.png";
import useAuthStore from "../store/AuthStore";
import { useEffect, useRef, useState } from "react";
import { MdLogout } from "react-icons/md";
import capypaul from "/capypaul01.jpg";

export function DocumentHeader() {
  const { logoutService, user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-screen flex justify-between items-center px-5 py-3 bg-white">
      <div className="flex">
        <Link to="/dashboard" className="flex items-center">
          <img src={capyness} alt="" className="w-[35px]" />
        </Link>
        <div className="ml-5">
          <div className="text-lg">{"Document title"}</div>
          <div className="flex">
            <div className="pr-1 cursor-pointer">File</div>
            <div className="px-1 cursor-pointer">Edit</div>
            <div className="px-1 cursor-pointer">View</div>
            <div className="px-1 cursor-pointer">Insert</div>
            <div className="px-1 cursor-pointer">Format</div>
            <div className="px-1 cursor-pointer">Tools</div>
            <div className="px-1 cursor-pointer">Help</div>
          </div>
        </div>
      </div>
      <div
        ref={menuRef}
        onClick={() => setShowMenu(!showMenu)}
        className="pr-5 font-bold cursor-pointer"
      >
        {user && user.username}
      </div>
      {user && showMenu && (
        <div className="absolute px-3 top-[65px] right-[40px] flex flex-col shadow-lg rounded-2xl w-[300px] h-[300px] border border-[#d0d0d0] text-center ">
          <div className="mx-auto">
            <Link to="/" onClick={() => setShowMenu(false)}>
              <div className="py-2 font-semibold">{user.email}</div>
            </Link>
            <img
              src={capypaul}
              alt=""
              className="w-[90px] rounded-full mx-auto mt-4 mb-2"
            />
            <div className="text-2xl">Hi {user.username}!</div>
            <div
              onClick={() => {
                logoutService();
                setShowMenu(false);
              }}
              className="flex items-center py-2 my-5 cursor-pointer hover:text-blue-500 transition-all ease-in-out duration-300 bg-white px-5 py-3 rounded-full font-semibold"
            >
              <MdLogout />
              <div className="ml-2">Sign out</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
