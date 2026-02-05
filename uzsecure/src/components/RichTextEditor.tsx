"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered,
    Link as LinkIcon, Image as ImageIcon, Undo, Redo
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Image,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Enter URL');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-800' : ''
                        }`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-800' : ''
                        }`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-800' : ''
                        }`}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-800' : ''
                        }`}
                    title="Code"
                >
                    <Code className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-800' : ''
                        }`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-800' : ''
                        }`}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

                <button
                    onClick={addLink}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-800' : ''
                        }`}
                    title="Add Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={addImage}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                    title="Add Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
