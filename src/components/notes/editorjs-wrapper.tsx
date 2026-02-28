'use client';

import { useEffect, useRef } from 'react';
import type { OutputData, API } from '@editorjs/editorjs';

interface EditorJSWrapperProps {
    data?: OutputData | null;
    onChange?: (data: OutputData) => void;
    readOnly?: boolean;
    placeholder?: string;
}

export function EditorJSWrapper({
    data,
    onChange,
    readOnly = false,
    placeholder = 'Start writing...',
}: EditorJSWrapperProps) {
    const editorRef = useRef<{ destroy?: () => void } | null>(null);
    const holderRef = useRef<HTMLDivElement>(null);
    const isReady = useRef(false);

    // Initialize editor
    useEffect(() => {
        if (!holderRef.current || editorRef.current) return;

        let isMounted = true;

        const initialData: OutputData = data && typeof data === 'object' && 'blocks' in data
            ? data
            : {
                time: Date.now(),
                blocks: [],
                version: '2.28.0',
            };

        const initEditor = async () => {
            const [{ default: EditorJS }, { default: Header }, { default: List }, { default: Checklist }, { default: Code }, { default: Quote }, { default: InlineCode }, { default: Paragraph }] = await Promise.all([
                import('@editorjs/editorjs'),
                import('@editorjs/header'),
                import('@editorjs/list'),
                import('@editorjs/checklist'),
                import('@editorjs/code'),
                import('@editorjs/quote'),
                import('@editorjs/inline-code'),
                import('@editorjs/paragraph'),
            ]);

            if (!isMounted || !holderRef.current || editorRef.current) {
                return;
            }

            const editor = new EditorJS({
                holder: holderRef.current,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                tools: {
                    header: {
                        class: Header,
                        config: {
                            levels: [1, 2, 3, 4],
                            defaultLevel: 2,
                        },
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                    },
                    checklist: {
                        class: Checklist,
                        inlineToolbar: true,
                    },
                    code: Code,
                    quote: {
                        class: Quote,
                        inlineToolbar: true,
                    },
                    inlineCode: InlineCode,
                    paragraph: {
                        class: Paragraph,
                        inlineToolbar: true,
                    },
                } as any,
                data: initialData,
                readOnly,
                placeholder,
                minHeight: 200,
                onChange: async (api: API) => {
                    if (!onChange || !isReady.current) return;
                    try {
                        const savedData = await api.saver.save();
                        onChange(savedData);
                    } catch (error) {
                        console.error('Failed to save editor data:', error);
                    }
                },
                onReady: () => {
                    isReady.current = true;
                },
            });

            editorRef.current = editor;
        };

        initEditor().catch((error) => {
            console.error('Failed to initialize Editor.js:', error);
        });

        return () => {
            isMounted = false;
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
                isReady.current = false;
            }
        };
    }, []); // Only run once on mount

    useEffect(() => {
        const holder = holderRef.current;
        if (!holder) return;

        const handleUndoRedo = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const isUndo = (event.ctrlKey || event.metaKey) && !event.shiftKey && key === 'z';
            const isRedo = (event.ctrlKey || event.metaKey) && ((event.shiftKey && key === 'z') || key === 'y');

            if (isUndo || isRedo) {
                event.stopPropagation();
            }
        };

        holder.addEventListener('keydown', handleUndoRedo, true);

        return () => {
            holder.removeEventListener('keydown', handleUndoRedo, true);
        };
    }, []);

    return (
        <div
            ref={holderRef}
            className="notes-editor-content max-w-none min-h-75 [&_.ce-block__content]:max-w-none [&_.ce-toolbar__content]:max-w-none bg-transparent"
        />
    );
}

// Helper to parse stored content (could be JSON string or plain text)
export function parseEditorContent(content: string | null): OutputData | null {
    if (!content) return null;

    try {
        const parsed = JSON.parse(content);
        // Check if it's valid Editor.js data
        if (parsed && typeof parsed === 'object' && 'blocks' in parsed) {
            return parsed;
        }
        // If it's not Editor.js format, convert plain text to a paragraph block
        return {
            time: Date.now(),
            blocks: [
                {
                    type: 'paragraph',
                    data: { text: content },
                },
            ],
            version: '2.28.0',
        };
    } catch {
        // If parsing fails, it's plain text - convert to paragraph block
        return {
            time: Date.now(),
            blocks: [
                {
                    type: 'paragraph',
                    data: { text: content },
                },
            ],
            version: '2.28.0',
        };
    }
}

// Helper to stringify editor data for storage
export function stringifyEditorContent(data: OutputData): string {
    return JSON.stringify(data);
}

