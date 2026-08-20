/**
 * Notion-style "/" command extension. Typing "/" opens a floating, filterable
 * menu of block types (heading, list, quote, code, table, image...); Enter or
 * click applies the selected one. Built on Tiptap's Suggestion utility using
 * its v3 `mount()` helper (Floating UI under the hood — no manual positioning
 * or extra libraries needed).
 */

import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import { SlashCommandList, type SlashCommandListRef } from './slash-command-list';
import { getSlashCommandItems, type SlashCommandItem } from './slash-command-items';

export interface SlashCommandOptions {
    onInsertImage: () => void;
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
    name: 'slashCommand',

    addOptions() {
        return {
            onInsertImage: () => {},
        };
    },

    addProseMirrorPlugins() {
        const extensionOptions = this.options;

        return [
            Suggestion<SlashCommandItem>({
                editor: this.editor,
                char: '/',
                startOfLine: false,
                items: ({ query }) => {
                    const allItems = getSlashCommandItems({ onInsertImage: extensionOptions.onInsertImage });
                    const normalizedQuery = query.trim().toLowerCase();
                    if (!normalizedQuery) return allItems;
                    return allItems.filter((item) =>
                        item.title.toLowerCase().includes(normalizedQuery) ||
                        item.keywords.some((keyword) => keyword.includes(normalizedQuery)),
                    );
                },
                render: () => {
                    let component: ReactRenderer<SlashCommandListRef> | null = null;
                    let unmount: (() => void) | null = null;

                    return {
                        onStart: (props) => {
                            component = new ReactRenderer(SlashCommandList, {
                                editor: props.editor,
                                props: {
                                    items: props.items,
                                    command: (item: SlashCommandItem) =>
                                        item.command({ editor: props.editor, range: props.range }),
                                },
                            });
                            unmount = props.mount(component.element);
                        },
                        onUpdate: (props) => {
                            component?.updateProps({
                                items: props.items,
                                command: (item: SlashCommandItem) =>
                                    item.command({ editor: props.editor, range: props.range }),
                            });
                        },
                        onKeyDown: (props) => {
                            if (props.event.key === 'Escape') {
                                unmount?.();
                                component?.destroy();
                                return true;
                            }
                            return component?.ref?.onKeyDown(props) ?? false;
                        },
                        onExit: () => {
                            unmount?.();
                            component?.destroy();
                            component = null;
                            unmount = null;
                        },
                    };
                },
            }),
        ];
    },
});
