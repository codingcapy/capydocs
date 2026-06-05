import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { EditorToolbar } from "./EditorToolbar";
import { useUpdateDocumentContentMutation } from "../lib/api/documents";
import { useEffect, useRef, useState } from "react";
import type { Document } from "@server/schemas/documents";

export function DocEditor(props: { document: Document | undefined }) {
  const {
    mutate: updateDocumentContent,
    isPending: updateDocumentContentPending,
    error: updateDocumentContentError,
  } = useUpdateDocumentContentMutation();
  const isFirstRender = useRef(true);
  const [documentContent, setDocumentContent] = useState("");

  function handleSubmitUpdateContent() {
    if (updateDocumentContentPending || !props.document) return;
    updateDocumentContent({
      documentId: props.document.documentId,
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
      setDocumentContent(editor.getHTML());
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

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto p-6" />
    </div>
  );
}
