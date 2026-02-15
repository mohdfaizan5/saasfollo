'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { ChangelogEntry as ChangelogEntryType } from '@/types/changelog';
import { FaCaretDown } from 'react-icons/fa6';

interface ChangelogEntryProps {
    entry: ChangelogEntryType;
    isLatest?: boolean;
}

export function ChangelogEntry({ entry, isLatest }: ChangelogEntryProps) {
    const [improvementsOpen, setImprovementsOpen] = useState(false);
    const [fixesOpen, setFixesOpen] = useState(false);
    const [patchesOpen, setPatchesOpen] = useState(false);

    return (
        <Card className="p-6 sm:p-8 transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Version & Date */}
                <div className="sm:w-32 flex-shrink-0">
                    <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                        <p className="text-lg font-bold">{entry.version}</p>
                        {isLatest && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/30">
                                Latest
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{entry.date}</p>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                    {/* Title & Description */}
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{entry.title}</h2>
                        <p className="text-muted-foreground">{entry.description}</p>
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                        {/* Improvements */}
                        <div className="border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setImprovementsOpen(!improvementsOpen)}
                                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium">
                                    Improvements ({entry.improvements.length})
                                </span>
                                <FaCaretDown
                                    className={`h-4 w-4 transition-transform ${improvementsOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {improvementsOpen && entry.improvements.length > 0 && (
                                <div className="px-3 pb-3 space-y-2">
                                    {entry.improvements.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <p className="text-sm">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fixes */}
                        <div className="border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setFixesOpen(!fixesOpen)}
                                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium">Fixes ({entry.fixes.length})</span>
                                <FaCaretDown
                                    className={`h-4 w-4 transition-transform ${fixesOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {fixesOpen && entry.fixes.length > 0 && (
                                <div className="px-3 pb-3 space-y-2">
                                    {entry.fixes.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="text-blue-500 mt-1">●</span>
                                            <p className="text-sm">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Patches */}
                        <div className="border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setPatchesOpen(!patchesOpen)}
                                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-medium">Patches ({entry.patches.length})</span>
                                <FaCaretDown
                                    className={`h-4 w-4 transition-transform ${patchesOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {patchesOpen && entry.patches.length > 0 && (
                                <div className="px-3 pb-3 space-y-2">
                                    {entry.patches.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="text-purple-500 mt-1">◆</span>
                                            <p className="text-sm">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
