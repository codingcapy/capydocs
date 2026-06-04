import { Link, useNavigate } from "@tanstack/react-router";
import capyness from "/capyness.png";
import useAuthStore from "../store/AuthStore";
import { useEffect, useRef, useState } from "react";
import { MdLogout } from "react-icons/md";
import capypaul from "/capypaul01.jpg";
import type { Document } from "@server/schemas/documents";
import {
  useDeleteDocumentMutation,
  useUpdateDocumentTitleMutation,
} from "../lib/api/documents";
import { FaFileAlt } from "react-icons/fa";
import { FaRegFolder } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";

type MenuMode = "none" | "user" | "file";

export function DocumentHeader(props: { document: Document | undefined }) {
  const { logoutService, user } = useAuthStore();
  const [menuMode, setMenuMode] = useState<MenuMode>("none");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [titleContent, setTitleContent] = useState(
    props.document ? props.document.title : "",
  );
  const { mutate: updateTitle, isPending: updateTitlePending } =
    useUpdateDocumentTitleMutation();
  const isFirstRender = useRef(true);
  const { mutate: deleteDocument, isPending: deleteDocumentPending } =
    useDeleteDocumentMutation();
  const navigate = useNavigate();

  function handleSubmitUpdateTitle() {
    if (updateTitlePending || !props.document) return;
    updateTitle({
      documentId: props.document.documentId,
      title: titleContent,
    });
  }

  function handleSubmitDelete() {
    if (deleteDocumentPending || !props.document) return;
    deleteDocument(
      {
        documentId: props.document.documentId,
      },
      { onSuccess: () => navigate({ to: "/dashboard" }) },
    );
  }

  useEffect(() => {
    if (props.document) {
      setTitleContent(props.document.title);
    }
  }, [props.document?.title]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(handleSubmitUpdateTitle, 500);
    return () => clearTimeout(timeout);
  }, [titleContent]);

  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuMode("none");
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      ref={menuRef}
      className="fixed top-0 left-0 w-screen flex justify-between items-center px-5 py-3 bg-white"
    >
      <div className="flex">
        <Link to="/dashboard" className="flex items-center">
          <img src={capyness} alt="" className="w-[35px]" />
        </Link>
        <div className="ml-5">
          <div className="text-lg">
            <input
              type="text"
              value={titleContent}
              onChange={(e) => setTitleContent(e.target.value)}
              className="hover:outline-1 focus:outline-1 w-full"
            />
          </div>
          <div className="flex">
            <div
              onClick={() => setMenuMode("file")}
              className="pr-1 cursor-pointer hover:bg-[#f0f0f0]"
            >
              File
            </div>
            <div className="px-1 cursor-pointer hover:bg-[#f0f0f0]">Edit</div>
            <div className="px-1 cursor-pointer hover:bg-[#f0f0f0]">View</div>
            <div className="px-1 cursor-pointer hover:bg-[#f0f0f0]">Insert</div>
            <div className="px-1 cursor-pointer hover:bg-[#f0f0f0]">Format</div>
            <div className="px-1 cursor-pointer hover:bg-[#f0f0f0]">Tools</div>
            <div className="px-1 cursor-pointer hover:bg-[#f0f0f0]">Help</div>
          </div>
        </div>
      </div>
      <div
        onClick={() => setMenuMode("user")}
        className="pr-5 font-bold cursor-pointer"
      >
        {user && user.username}
      </div>
      {user && menuMode === "user" && (
        <div className="absolute px-3 top-[65px] right-[40px] flex flex-col shadow-lg rounded-2xl w-[300px] h-[300px] border border-[#d0d0d0] text-center bg-[#edf0f5]">
          <div className="mx-auto">
            <Link to="/" onClick={() => setMenuMode("none")}>
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
                setMenuMode("none");
              }}
              className="flex items-center py-2 my-5 cursor-pointer hover:text-blue-500 transition-all ease-in-out duration-300 bg-white px-5 py-3 rounded-full font-semibold"
            >
              <MdLogout />
              <div className="ml-2">Sign out</div>
            </div>
          </div>
        </div>
      )}
      {user && menuMode === "file" && (
        <div className="absolute top-[65px] left-[70px] w-[300px] h-[180px] bg-white border border-[#d0d0d0] shadow-lg py-2 px-[1px]">
          <div className="flex items-center px-3 py-1 hover:bg-[#d0d0d0]">
            <FaFileAlt />
            <div className="ml-2 cursor-pointer">New</div>
          </div>
          <div className="flex items-center px-3 py-1 hover:bg-[#d0d0d0]">
            <FaRegFolder />
            <div className="ml-2 cursor-pointer">Open</div>
          </div>
          <div className="flex items-center px-3 py-1 hover:bg-[#d0d0d0]">
            <MdContentCopy />
            <div className="ml-2 cursor-pointer">Make a copy</div>
          </div>
          <div className="flex items-center px-3 py-1 hover:bg-[#d0d0d0]">
            <MdOutlineModeEdit />
            <div className="ml-2 cursor-pointer">Rename</div>
          </div>
          <div
            onClick={handleSubmitDelete}
            className="flex items-center px-3 py-1 hover:bg-[#d0d0d0]"
          >
            <FaRegTrashAlt />
            <div className="ml-2 cursor-pointer">Move to trash</div>
          </div>
        </div>
      )}
    </div>
  );
}
