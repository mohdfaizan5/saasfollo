'use client';

import { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import type { OutputData, API } from '@editorjs/editorjs';

// @ts-ignore - These packages don't have type definitions
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Checklist from '@editorjs/checklist';
// @ts-ignore
import Code from '@editorjs/code';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import InlineCode from '@editorjs/inline-code';
// @ts-ignore
import Paragraph from '@editorjs/paragraph';

// Editor.js tools configuration
const EDITOR_TOOLS = {
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
};

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
    const editorRef = useRef<EditorJS | null>(null);
    const holderRef = useRef<HTMLDivElement>(null);
    const isReady = useRef(false);

    // Initialize editor
    useEffect(() => {
        if (!holderRef.current || editorRef.current) return;

        const initialData: OutputData = data && typeof data === 'object' && 'blocks' in data
            ? data
            : {
                time: Date.now(),
                blocks: [],
                version: '2.28.0',
            };

        const editor = new EditorJS({
            holder: holderRef.current,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: EDITOR_TOOLS as any,
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

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
                isReady.current = false;
            }
        };
    }, []); // Only run once on mount

    return (
        <div
            ref={holderRef}
            className="prose prose-sm dark:prose-invert max-w-none min-h-[300px] [&_.ce-block__content]:max-w-none [&_.ce-toolbar__content]:max-w-none bg-transparent"
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

