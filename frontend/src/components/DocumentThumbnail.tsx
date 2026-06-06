import type { Document } from "@server/schemas/documents";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaEllipsisVertical } from "react-icons/fa6";
import { MdOutlineTextFields } from "react-icons/md";
import { RxOpenInNewWindow } from "react-icons/rx";
import {
  useDeleteDocumentMutation,
  useUpdateDocumentTitleMutation,
} from "../lib/api/documents";

export function DocumentThumbnail(props: { d: Document }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { mutate: deleteDocument, isPending: deleteDocumentPending } =
    useDeleteDocumentMutation();
  const navigate = useNavigate();
  const [renameMode, setRenameMode] = useState(false);
  const { mutate: updateTitle, isPending: updateTitlePending } =
    useUpdateDocumentTitleMutation();
  const [titleContent, setTitleContent] = useState(
    props.d ? props.d.title : "",
  );

  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  }

  function handleSubmitDelete() {
    if (deleteDocumentPending || !props.d) return;
    deleteDocument(
      {
        documentId: props.d.documentId,
      },
      { onSuccess: () => navigate({ to: "/dashboard" }) },
    );
  }

  function handleSubmitUpdateTitle() {
    if (updateTitlePending || !props.d) return;
    updateTitle(
      {
        documentId: props.d.documentId,
        title: titleContent,
      },
      {
        onSuccess: () => {
          setTitleContent("");
          setRenameMode(false);
        },
      },
    );
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div key={props.d.documentId} className="relative py-6">
      <Link to="/docs/$path" params={{ path: props.d.path }}>
        <div className="relative border border-[#a0a0a0] bg-white w-[210px] h-[260px] cursor-pointer hover:border-cyan-500">
          <div className="absolute bottom-0 left-0 border-t border-t-[#a0a0a0] w-full h-[75px]">
            <div className="px-5 pt-3">
              <div className="truncate">{props.d.title}</div>
            </div>
          </div>
        </div>
      </Link>
      <div
        ref={menuRef}
        onClick={() => setShowMenu(true)}
        className="absolute bottom-8 right-7 px-2 py-2 rounded-full hover:bg-[#d0d0d0] cursor-pointer"
      >
        <FaEllipsisVertical />
      </div>
      {showMenu && (
        <div className="absolute top-[130px] right-[-60px] w-[200px] h-[110px] bg-white border border-[#d0d0d0] shadow-lg py-2 px-[1px] z-50">
          <div className="flex items-center px-3 py-1 hover:bg-[#d0d0d0]">
            <MdOutlineTextFields />
            <div
              onClick={() => setRenameMode(true)}
              className="ml-2 cursor-pointer"
            >
              Rename
            </div>
          </div>
          <div
            onClick={handleSubmitDelete}
            className="flex items-center px-3 py-1 hover:bg-[#d0d0d0]"
          >
            <FaRegTrashAlt />
            <div className="ml-2 cursor-pointer">Remove</div>
          </div>
          <div
            onClick={() => window.open(`/docs/${props.d.path}`, "_blank")}
            className="flex items-center px-3 py-1 hover:bg-[#d0d0d0]"
          >
            <RxOpenInNewWindow />
            <div className="ml-2 cursor-pointer">Open in new tab</div>
          </div>
        </div>
      )}
      {renameMode && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 rounded shadow-lg w-[90%] max-w-md z-100`}
        >
          <div className="text-2xl pt-5">Rename</div>
          <div>Please enter a new name</div>
          <input
            type="text"
            value={titleContent}
            onChange={(e) => setTitleContent(e.target.value)}
            className="pl-1 border w-full my-5"
          />
          <div className="my-5 flex justify-end">
            <div
              onClick={() => setRenameMode(false)}
              className="border border-[#a0a0a0] text-cyan-600 px-7 py-2 mr-1 rounded cursor-pointer"
            >
              Cancel
            </div>
            <div
              onClick={handleSubmitUpdateTitle}
              className="bg-cyan-500 text-white px-7 py-2 ml-1 rounded cursor-pointer"
            >
              OK
            </div>
          </div>
        </div>
      )}
      {renameMode && (
        <div className="fixed inset-0 bg-black opacity-50 z-90"></div>
      )}
    </div>
  );
}
