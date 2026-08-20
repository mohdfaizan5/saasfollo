'use client';

import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SlashCommandItem } from './slash-command-items';

interface SlashCommandListProps {
    items: SlashCommandItem[];
    command: (item: SlashCommandItem) => void;
}

export interface SlashCommandListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * The floating popup rendered by the slash-command Suggestion plugin. Exposes
 * onKeyDown imperatively so the Tiptap Suggestion renderer can forward
 * ArrowUp/ArrowDown/Enter/Escape into this list without owning React state.
 */
export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
    ({ items, command }, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0);

        // Reset the selection whenever the filtered item list changes (e.g. the
        // user keeps typing the query). Adjusted during render, per React's
        // guidance, rather than in an effect — avoids an extra render pass.
        const [previousItems, setPreviousItems] = useState(items);
        if (items !== previousItems) {
            setPreviousItems(items);
            setSelectedIndex(0);
        }

        const selectItem = (index: number) => {
            const item = items[index];
            if (item) command(item);
        };

        useImperativeHandle(ref, () => ({
            onKeyDown: ({ event }) => {
                if (items.length === 0) return false;

                if (event.key === 'ArrowUp') {
                    setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
                    return true;
                }
                if (event.key === 'ArrowDown') {
                    setSelectedIndex((prev) => (prev + 1) % items.length);
                    return true;
                }
                if (event.key === 'Enter' || event.key === 'Tab') {
                    selectItem(selectedIndex);
                    return true;
                }
                return false;
            },
        }));

        const groupedByAvailability = useMemo(() => items, [items]);

        if (groupedByAvailability.length === 0) {
            return (
                <div className="w-72 rounded-xl border border-border bg-popover p-2 shadow-lg">
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">No matching blocks</p>
                </div>
            );
        }

        return (
            <div className="max-h-80 w-72 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
                {groupedByAvailability.map((item, index) => {
                    const Icon = item.icon;
                    const isSelected = index === selectedIndex;
                    return (
                        <button
                            key={item.title}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectItem(index)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors',
                                isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
                            )}
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                                <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">{item.title}</span>
                                <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    },
);

SlashCommandList.displayName = 'SlashCommandList';
