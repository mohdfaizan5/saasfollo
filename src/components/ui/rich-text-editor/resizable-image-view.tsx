'use client';

/**
 * React node view for images inside the rich-text editor. Renders the image and,
 * when the editor is editable, a drag handle on the bottom-right corner to resize
 * it. The chosen pixel width is stored on the node's `width` attribute so it
 * persists in the saved HTML and is reflected wherever the description renders.
 */

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

export function ResizableImageView({ node, updateAttributes, selected, editor }: NodeViewProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const { src, alt, title, width } = node.attrs as {
        src: string;
        alt: string | null;
        title: string | null;
        width: number | string | null;
    };

    const handleResizeStart = (event: React.PointerEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const startX = event.clientX;
        const startWidth = imageRef.current?.offsetWidth ?? 0;

        const handleMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startX;
            // Clamp to a sane minimum; max is handled by the container's max-width.
            const nextWidth = Math.max(60, Math.round(startWidth + delta));
            updateAttributes({ width: nextWidth });
        };

        const handleUp = () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    };

    return (
        <NodeViewWrapper
            className="relative my-2 inline-block max-w-full leading-none"
            data-drag-handle
        >
            {/* next/image can't be used here: dynamic user uploads rendered and
                resized inside a ProseMirror contenteditable node view. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imageRef}
                src={src}
                alt={alt ?? ''}
                title={title ?? undefined}
                draggable={false}
                style={{ width: width ? `${typeof width === 'number' ? `${width}px` : width}` : undefined }}
                className={cn(
                    'max-w-full h-auto rounded-lg border border-white/10 select-none',
                    selected && 'ring-2 ring-primary/60',
                )}
            />

            {editor.isEditable && (
                <span
                    onPointerDown={handleResizeStart}
                    role="presentation"
                    className="absolute -bottom-1 -right-1 h-4 w-4 cursor-nwse-resize rounded-sm border border-white/40 bg-primary/80 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                    style={{ opacity: selected ? 1 : undefined }}
                />
            )}
        </NodeViewWrapper>
    );
}
