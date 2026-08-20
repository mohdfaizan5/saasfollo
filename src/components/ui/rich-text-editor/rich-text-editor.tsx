'use client';

import { useCallback, useEffect, useRef } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { Loader2, Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, ListOrdered, ListChecks, Quote, Link as LinkIcon, Image as ImageIcon, Code2, Table as TableIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ResizableImage } from './resizable-image';
import { SlashCommand } from './slash-command';
import { uploadFiles } from '@/lib/uploadthing';

interface RichTextEditorProps {
    value: string;
    onChange: (markdown: string) => void;
    projectNanoid?: string;
    placeholder?: string;
    editable?: boolean;
    className?: string;
    /**
     * 'compact' (default) caps the editor body and scrolls internally — for use
     * inside dialogs/modals with limited space. 'full' removes the internal cap
     * so the editor grows with its content and the surrounding page scrolls
     * instead (e.g. the full-page notes editor).
     */
    variant?: 'compact' | 'full';
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    label,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors',
                'hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
                active && 'bg-accent text-foreground',
            )}
        >
            {children}
        </button>
    );
}

function inferContentType(content: string): 'html' | 'markdown' {
    return /<[a-z][\s\S]*>/i.test(content) ? 'html' : 'markdown';
}

export function RichTextEditor({
    value,
    onChange,
    projectNanoid,
    placeholder = 'Write something…',
    editable = true,
    className,
    variant = 'compact',
}: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isUploadingRef = useRef(false);
    const lastAppliedValueRef = useRef(value);
    const editorRef = useRef<Editor | null>(null);

    const uploadAndInsert = useCallback(
        async (file: File, targetEditor: Editor) => {
            if (!projectNanoid) {
                toast.error('Images can only be added from within a project.');
                return;
            }

            if (isUploadingRef.current) {
                return;
            }

            isUploadingRef.current = true;
            const toastId = toast.loading('Uploading image…');

            try {
                // Uploads go to UploadThing (auth enforced server-side in the
                // file router middleware); we insert the returned public URL.
                const uploaded = await uploadFiles('editorImage', { files: [file] });
                const url = uploaded?.[0]?.url;
                if (!url) {
                    throw new Error('Upload did not return a URL.');
                }
                targetEditor.chain().focus().setImage({ src: url, alt: file.name }).run();
                toast.success('Image added', { id: toastId });
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Could not upload the image.';
                console.error('Editor image upload failed:', error);
                toast.error(message, { id: toastId });
            } finally {
                isUploadingRef.current = false;
            }
        },
        [projectNanoid],
    );

    const handleFiles = useCallback(
        (fileList: FileList | null | undefined, event?: Event): boolean => {
            const activeEditor = editorRef.current;
            if (!activeEditor || !fileList || fileList.length === 0) return false;

            const images = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
            if (images.length === 0) return false;

            event?.preventDefault();
            images.forEach((image) => void uploadAndInsert(image, activeEditor));
            return true;
        },
        [uploadAndInsert],
    );

    const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const activeEditor = editorRef.current;
        if (file && activeEditor) {
            void uploadAndInsert(file, activeEditor);
        }
        event.target.value = '';
    };

    const setLink = useCallback(() => {
        const activeEditor = editorRef.current;
        if (!activeEditor) return;

        const previous = activeEditor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Link URL', previous ?? 'https://');
        if (url === null) return;

        if (url === '') {
            activeEditor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        activeEditor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        editable,
        content: value || '',
        contentType: inferContentType(value || ''),
        extensions: [
            Markdown,
            StarterKit.configure({
                link: false,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: {
                    rel: 'noopener noreferrer nofollow',
                    target: '_blank',
                },
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            ResizableImage.configure({ inline: false, allowBase64: false }),
            Placeholder.configure({
                placeholder: ({ node, editor }) =>
                    editor.isEmpty && node.type.name === 'paragraph' ? placeholder : '',
                showOnlyWhenEditable: true,
            }),
            SlashCommand.configure({
                onInsertImage: () => fileInputRef.current?.click(),
            }),
        ],
        editorProps: {
            attributes: {
                class: cn(
                    'tiptap focus:outline-none min-h-[10rem] px-4 py-3',
                    !editable && 'cursor-default',
                ),
            },
            handlePaste: (_view, event) => handleFiles(event.clipboardData?.files),
            handleDrop: (_view, event, _slice, moved) => {
                if (moved) return false;
                return handleFiles((event as DragEvent).dataTransfer?.files, event);
            },
        },
        onUpdate: ({ editor }) => {
            const markdown = editor.getMarkdown();
            lastAppliedValueRef.current = markdown;
            onChange(markdown.trim() ? markdown : '');
        },
    });

    useEffect(() => {
        if (!editor) return;
        editorRef.current = editor;
        if (editor.isFocused) return;
        if (value === lastAppliedValueRef.current) return;

        const nextValue = value || '';
        editor.commands.setContent(nextValue, {
            contentType: inferContentType(nextValue),
            emitUpdate: false,
        });
        lastAppliedValueRef.current = nextValue;
    }, [editor, value]);

    useEffect(() => {
        if (!editor) {
            editorRef.current = null;
        }
    }, [editor]);

    if (!editor) {
        return (
            <div className={cn('rounded-xl border border-border bg-background', className)}>
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn('overflow-hidden rounded-xl  bg-background', className)}>
            {editable && (
                <div className="flex flex-wrap items-center gap-0.5 border-b border-border/70 bg-muted/40 px-2 py-1">
                    <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
                        <Strikethrough className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
                        <Code className="h-4 w-4" />
                    </ToolbarButton>

                    <span className="mx-1 h-5 w-px bg-border" />

                    <ToolbarButton label="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <Heading1 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <Heading2 className="h-4 w-4" />
                    </ToolbarButton>

                    <span className="mx-1 h-5 w-px bg-border" />

                    <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Checklist" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
                        <ListChecks className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                        <Quote className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                        <Code2 className="h-4 w-4" />
                    </ToolbarButton>

                    <span className="mx-1 h-5 w-px bg-border" />

                    <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
                        <LinkIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                        <TableIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton label="Insert image" disabled={!projectNanoid} onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon className="h-4 w-4" />
                    </ToolbarButton>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        className="hidden"
                        onChange={handleFilePick}
                    />
                </div>
            )}

            <EditorContent
                editor={editor}
                className={variant === 'compact' ? 'max-h-88 overflow-y-auto bg-background!' : undefined}
            />
        </div>
    );
}
