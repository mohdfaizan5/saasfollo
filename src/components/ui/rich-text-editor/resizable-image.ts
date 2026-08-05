/**
 * Image extension that adds a persisted `width` attribute and a React node view
 * (see resizable-image-view.tsx) so images embedded in task descriptions can be
 * resized by dragging. Extends the official @tiptap/extension-image.
 */

import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ResizableImageView } from './resizable-image-view';

export const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: (element) => element.getAttribute('width'),
                renderHTML: (attributes) => {
                    if (!attributes.width) {
                        return {};
                    }
                    return { width: attributes.width };
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});
