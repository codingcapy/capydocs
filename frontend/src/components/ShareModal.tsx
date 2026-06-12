import { IoCloseOutline, IoEarth } from "react-icons/io5";
import type { PopupMode } from "./DocumentHeader";
import { MdLockOutline } from "react-icons/md";
import { IoMdLink } from "react-icons/io";
import type { Document } from "@server/schemas/documents";
import { useUpdateDocumentVisibilityMutation } from "../lib/api/documents";
import { useState } from "react";

export function ShareModal(props: {
  document: Document | undefined;
  setPopupMode: (value: React.SetStateAction<PopupMode>) => void;
}) {
  const { mutate: updateVisibility, isPending: updateVisibilityPending } =
    useUpdateDocumentVisibilityMutation();
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  function handleSubmit(visibility: string) {
    if (updateVisibilityPending || !props.document) return;
    if (visibility === props.document.visibility)
      return setShowVisibilityMenu(false);
    updateVisibility(
      {
        documentId: props.document.documentId,
        visibility: visibility,
      },
      { onSuccess: () => setShowVisibilityMenu(false) },
    );
  }

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[35%] z-100`}
    >
      <div className="flex justify-between items-center pb-5">
        <div className="text-2xl max-w-[300px] truncate">
          Share "{props.document && props.document.title}"
        </div>
        <div
          onClick={() => props.setPopupMode("none")}
          className="cursor-pointer"
        >
          <IoCloseOutline size={25} />
        </div>
      </div>
      <div className="font-semibold">General access</div>
      {props.document && props.document.visibility === "public" ? (
        <div
          onClick={() => setShowVisibilityMenu(true)}
          className="flex items-center py-2 cursor-pointer"
        >
          <div className="p-3 rounded-full bg-green-200 w-[40px]">
            <MdLockOutline />
          </div>
          <div className="ml-2">Anyone with the link</div>
        </div>
      ) : (
        <div
          onClick={() => setShowVisibilityMenu(true)}
          className="flex items-center py-2 cursor-pointer"
        >
          <div className="p-3 rounded-full bg-[#d0d0d0] w-[40px]">
            <IoEarth />
          </div>
          <div className="ml-2">Restricted</div>
        </div>
      )}
      {showVisibilityMenu && (
        <div className="absolute bottom-4 left-15 bg-white rounded shadow-black shadow-lg">
          <div
            onClick={() => handleSubmit("private")}
            className="px-6 pt-3 pb-1 cursor-pointer"
          >
            Restricted
          </div>
          <div
            onClick={() => handleSubmit("public")}
            className="px-6 pb-3 pt-1 cursor-pointer"
          >
            Anyone with the link
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mt-5">
        <div className="flex items-center justify-center border border-[#222222] rounded-full w-[120px] py-2 text-cyan-600 cursor-pointer">
          <IoMdLink />
          <div className="ml-2">Copy link</div>
        </div>
        <div className="px-5 py-2 rounded-full bg-cyan-500 text-white cursor-pointer">
          Done
        </div>
      </div>
    </div>
  );
}
