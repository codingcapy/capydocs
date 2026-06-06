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

export function DocumentThumbnailSmall(props: { d: Document }) {
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
    <div key={props.d.documentId} className="relative py-1 bg-white">
      <Link to="/docs/$path" params={{ path: props.d.path }}>
        <div className="relative border border-[#a0a0a0] bg-white w-[170px] h-[200px] cursor-pointer hover:border-cyan-500">
          <div className="absolute bottom-0 left-0 border-t border-t-[#a0a0a0] w-full h-[55px]">
            <div className="px-5 pt-3">
              <div className="truncate">{props.d.title}</div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
