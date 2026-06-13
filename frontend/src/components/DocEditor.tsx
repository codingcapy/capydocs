import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { EditorToolbar } from "./EditorToolbar";
import { useUpdateDocumentContentMutation } from "../lib/api/documents";
import { useEffect, useRef, useState } from "react";
import type { Document } from "@server/schemas/documents";
import { socket } from "../services/socket.service";

export function DocEditor(props: { document: Document | undefined }) {
  const {
    mutate: updateDocumentContent,
    isPending: updateDocumentContentPending,
  } = useUpdateDocumentContentMutation();
  const isFirstRender = useRef(true);
  const isRemoteUpdate = useRef(false);
  const [documentContent, setDocumentContent] = useState("");
  const documentRef = useRef(props.document);

  useEffect(() => {
    documentRef.current = props.document;
  }, [props.document]);

  function handleSubmitUpdateContent() {
    if (updateDocumentContentPending || !documentRef.current) return;
    updateDocumentContent({
      documentId: documentRef.current.documentId,
      content: documentContent,
    });
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(handleSubmitUpdateContent, 500);
    return () => clearTimeout(timeout);
  }, [documentContent]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "<p></p>",
    onUpdate: ({ editor }) => {
      if (isRemoteUpdate.current) return;
      const html = editor.getHTML();
      setDocumentContent(html);
      if (documentRef.current?.visibility === "public") {
        socket.emit("document:content_change", {
          documentId: documentRef.current.path,
          content: html,
        });
      }
    },
    editorProps: {
      attributes: {
        class:
          "outline-none min-h-full prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && props.document) {
      editor.commands.setContent(props.document.content || "<p></p>");
    }
  }, [editor, props.document?.documentId]);

  // Join the document room for live updates — works for both authed and anon users
  useEffect(() => {
    if (!props.document || props.document.visibility !== "public") return;
    if (!socket.connected) socket.connect();
    socket.emit("document:subscribe", { documentId: props.document.path });
  }, [props.document?.documentId, props.document?.visibility]);

  useEffect(() => {
    if (!props.document || props.document.visibility !== "public") return;

    const handleRemoteContentChange = ({ content }: { content: string }) => {
      if (!editor) return;
      isRemoteUpdate.current = true;
      editor.commands.setContent(content);
      isRemoteUpdate.current = false;
    };

    socket.on("document:content_change", handleRemoteContentChange);
    return () => {
      socket.off("document:content_change", handleRemoteContentChange);
    };
  }, [props.document?.documentId, props.document?.visibility, editor]);

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto p-6" />
    </div>
  );
}
