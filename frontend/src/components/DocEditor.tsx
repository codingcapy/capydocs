import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { EditorToolbar } from "./EditorToolbar";

export function DocEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class:
          "outline-none min-h-full prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto p-6" />
    </div>
  );
}
