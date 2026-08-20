/**
 * The command palette shown when typing "/" in the editor (Notion-style).
 * Each item knows how to apply itself to the editor given the "/query" range
 * that should be deleted first. `onInsertImage` is injected by the editor
 * instance so the "Image" item can reuse the same upload flow as the toolbar.
 */

import type { Editor, Range } from '@tiptap/core';
import {
    Heading1,
    Heading2,
    Heading3,
    Pilcrow,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    Code2,
    Table as TableIcon,
    Image as ImageIcon,
    Minus,
} from 'lucide-react';

export interface SlashCommandItem {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    keywords: string[];
    command: (props: { editor: Editor; range: Range }) => void;
}

interface SlashCommandContext {
    onInsertImage: () => void;
}

export function getSlashCommandItems(context: SlashCommandContext): SlashCommandItem[] {
    return [
        {
            title: 'Text',
            description: 'Plain paragraph text',
            icon: Pilcrow,
            keywords: ['paragraph', 'text', 'plain'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setParagraph().run();
            },
        },
        {
            title: 'Heading 1',
            description: 'Big section heading',
            icon: Heading1,
            keywords: ['h1', 'title', 'heading'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading',
            icon: Heading2,
            keywords: ['h2', 'subtitle', 'heading'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
            },
        },
        {
            title: 'Heading 3',
            description: 'Small section heading',
            icon: Heading3,
            keywords: ['h3', 'heading'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
            },
        },
        {
            title: 'Bullet list',
            description: 'A simple bulleted list',
            icon: List,
            keywords: ['bullet', 'list', 'ul', 'unordered'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
        },
        {
            title: 'Numbered list',
            description: 'A list with numbering',
            icon: ListOrdered,
            keywords: ['ordered', 'list', 'ol', 'numbered'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
        },
        {
            title: 'To-do list',
            description: 'Track tasks with checkboxes',
            icon: ListChecks,
            keywords: ['todo', 'task', 'checkbox', 'checklist'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run();
            },
        },
        {
            title: 'Quote',
            description: 'Capture a quote',
            icon: Quote,
            keywords: ['blockquote', 'quote', 'citation'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
            },
        },
        {
            title: 'Code block',
            description: 'Syntax-highlighted code snippet',
            icon: Code2,
            keywords: ['code', 'snippet', 'pre'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
            },
        },
        {
            title: 'Table',
            description: 'Insert a 3x3 table',
            icon: TableIcon,
            keywords: ['table', 'grid', 'rows', 'columns'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            },
        },
        {
            title: 'Image',
            description: 'Upload an image',
            icon: ImageIcon,
            keywords: ['image', 'picture', 'photo', 'upload'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run();
                context.onInsertImage();
            },
        },
        {
            title: 'Divider',
            description: 'A horizontal dividing line',
            icon: Minus,
            keywords: ['divider', 'hr', 'line', 'separator'],
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run();
            },
        },
    ];
}
