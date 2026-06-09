import { Link, useNavigate } from "@tanstack/react-router";
import capyness from "/capyness.png";
import useAuthStore from "../store/AuthStore";
import { useEffect, useRef, useState } from "react";
import { MdLogout } from "react-icons/md";
import capypaul from "/capypaul01.jpg";
import type { Document } from "@server/schemas/documents";
import {
  getDocumentsInfiniteQueryOptions,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useUpdateDocumentTitleMutation,
} from "../lib/api/documents";
import { FaFileAlt } from "react-icons/fa";
import { FaRegFolder } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { useInfiniteQuery } from "@tanstack/react-query";
import { IoCloseOutline } from "react-icons/io5";
import { DocumentThumbnailSmall } from "./DocumentThumbnailSmall";
import type { PresenceUser } from "../hooks/usePresence";
import { MdLockOutline } from "react-icons/md";
import { IoEarth } from "react-icons/io5";
import { IoMdLink } from "react-icons/io";
import { ShareModal } from "./ShareModal";

type MenuMode = "none" | "user" | "file";
export type PopupMode = "none" | "open" | "share";

function avatarColor(userId: string) {
  const colors = [
    "#f87171",
    "#fb923c",
    "#fbbf24",
    "#34d399",
    "#38bdf8",
    "#818cf8",
    "#e879f9",
    "#a3e635",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++)
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function DocumentHeader(props: {
  document: Document | undefined;
  presentUsers?: PresenceUser[];
}) {
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
  const { mutate: createDocument, isPending: createDocumentPending } =
    useCreateDocumentMutation();
  const [notification, setNotification] = useState("");
  const titleInputRef = useRef<HTMLInputElement | null>(null);
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
  const [popupMode, setPopupMode] = useState<PopupMode>("none");

  function handleSubmitCreate() {
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

  function handleSubmitCopy() {
    if (createDocumentPending || !props.document) return;
    createDocument(
      {
        title: `${titleContent} - copy`,
        content: props.document.content,
      },
      {
        onSuccess: (data) => navigate({ to: `/docs/${data.path}` }),
        onError: () => setNotification("yikes"),
      },
    );
  }

  useEffect(() => {
    if (props.document) {
      isFirstRender.current = true;
      setTitleContent(props.document.title);
    }
  }, [props.document?.documentId]);

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
      className="fixed top-0 left-0 w-screen flex justify-between items-center px-5 py-3 bg-white z-10"
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
              ref={titleInputRef}
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
      <div className="flex items-center gap-3 pr-5">
        {props.presentUsers && props.presentUsers.length > 0 && (
          <div className="flex items-center -space-x-2">
            {props.presentUsers.slice(0, 5).map((u) => (
              <div
                key={u.socketId}
                title={u.username}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white select-none"
                style={{ backgroundColor: avatarColor(u.userId) }}
              >
                {u.username.charAt(0).toUpperCase()}
              </div>
            ))}
            {props.presentUsers.length > 5 && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400 text-white text-xs font-bold ring-2 ring-white">
                +{props.presentUsers.length - 5}
              </div>
            )}
          </div>
        )}
        <div
          onClick={() => setPopupMode("share")}
          className="bg-cyan-200 px-5 py-2 rounded-full flex items-center cursor-pointer"
        >
          <MdLockOutline />
          <div className="ml-2 font-semibold">Share</div>
        </div>
        <div
          onClick={() => setMenuMode("user")}
          className="font-bold cursor-pointer"
        >
          {user && user.username}
        </div>
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
          <div className="flex items-center px-3 py-1 hover:bg-[#d0d0d0] cursor-pointer">
            <FaFileAlt />
            <div onClick={handleSubmitCreate} className="ml-2">
              New
            </div>
          </div>
          <div
            onClick={() => setPopupMode("open")}
            className="flex items-center px-3 py-1 hover:bg-[#d0d0d0] cursor-pointer"
          >
            <FaRegFolder />
            <div className="ml-2">Open</div>
          </div>
          <div
            onClick={handleSubmitCopy}
            className="flex items-center px-3 py-1 hover:bg-[#d0d0d0] cursor-pointer"
          >
            <MdContentCopy />
            <div className="ml-2">Make a copy</div>
          </div>
          <div
            onClick={() => {
              setMenuMode("none");
              setTimeout(() => titleInputRef.current?.focus(), 0);
            }}
            className="flex items-center px-3 py-1 hover:bg-[#d0d0d0] cursor-pointer"
          >
            <MdOutlineModeEdit />
            <div className="ml-2">Rename</div>
          </div>
          <div
            onClick={handleSubmitDelete}
            className="flex items-center px-3 py-1 hover:bg-[#d0d0d0] cursor-pointer"
          >
            <FaRegTrashAlt />
            <div className="ml-2">Move to trash</div>
          </div>
        </div>
      )}
      {popupMode === "open" && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[65%] z-100`}
        >
          <div className="flex justify-between items-center pb-5">
            <div className="font-semibold">Open a file</div>
            <div
              onClick={() => setPopupMode("none")}
              className="cursor-pointer"
            >
              <IoCloseOutline size={25} />
            </div>
          </div>
          {documentsLoading ? (
            <div>Loading documents...</div>
          ) : documentsError ? (
            <div>Error loading documents</div>
          ) : documents ? (
            <div className="grid grid-cols-5 gap-0 bg-white">
              {documents.map((d) => (
                <DocumentThumbnailSmall key={d.documentId} d={d} />
              ))}
              {isFetchingNextDocumentsPage && (
                <div className="py-3 text-sm text-[#a0a0a0]">
                  Loading more...
                </div>
              )}
              <div className="h-[50px]" ref={documentsSentinelRef} />
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}
      {popupMode === "share" && (
        <ShareModal document={props.document} setPopupMode={setPopupMode} />
      )}
      {popupMode !== "none" && (
        <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
      )}
    </div>
  );
}
