/**
 * Image extension with drag-to-resize (via Tiptap's built-in resize support)
 * plus width/height persistence through the markdown round trip.
 *
 * Content is stored as markdown, and standard `![alt](src)` syntax has no room
 * for width/height — the base extension's renderMarkdown silently drops them,
 * so a resized image would always snap back to its original size after a
 * save + reload. We encode the size in a hidden suffix on the alt text when
 * rendering to markdown, and strip it back out (restoring the real alt text
 * and the width/height attributes) when parsing markdown back into the doc.
 */

import Image, { type ImageOptions } from '@tiptap/extension-image';
import type { JSONContent, MarkdownParseHelpers, MarkdownToken } from '@tiptap/core';

const SIZE_SUFFIX_PATTERN = / ?%%size=(\d+)x(\d*)%%$/;

function stripSizeSuffix(text: string): { alt: string; width: number | null; height: number | null } {
    const match = text.match(SIZE_SUFFIX_PATTERN);
    if (!match) return { alt: text, width: null, height: null };
    return {
        alt: text.slice(0, match.index).trimEnd(),
        width: Number(match[1]),
        height: match[2] ? Number(match[2]) : null,
    };
}

export const ResizableImage = Image.extend({
    addOptions(): ImageOptions {
        return {
            // `.extend()` always supplies a parent, so this is safe; spreading
            // `parent?.()` (possibly undefined) would otherwise widen every
            // field to optional and fail to satisfy ImageOptions.
            ...this.parent!(),
            resize: {
                enabled: true,
                directions: ['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
                minWidth: 80,
                minHeight: 80,
                alwaysPreserveAspectRatio: true,
            },
        };
    },

    parseMarkdown(token: MarkdownToken, helpers: MarkdownParseHelpers) {
        const { alt, width, height } = stripSizeSuffix(token.text ?? '');
        return helpers.createNode('image', {
            src: token.href,
            title: token.title,
            alt,
            width,
            height,
        });
    },

    renderMarkdown(node: JSONContent) {
        const src = node.attrs?.src ?? '';
        const alt = node.attrs?.alt ?? '';
        const title = node.attrs?.title ?? '';
        const width = node.attrs?.width;
        const height = node.attrs?.height;

        const altWithSize = width ? `${alt}${alt ? ' ' : ''}%%size=${width}x${height ?? ''}%%` : alt;

        return title ? `![${altWithSize}](${src} "${title}")` : `![${altWithSize}](${src})`;
    },
});
