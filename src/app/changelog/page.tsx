import { changelog } from '@/data/changelog';
import { ChangelogEntry } from '@/components/changelog/changelog-entry';
import { Sparkle } from 'lucide-react';

export const metadata = {
    title: 'Changelog - ContentCreator OS',
    description: 'Latest updates, improvements, and fixes for ContentCreator OS',
};

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Sparkle className="h-5 w-5 text-purple-500"
                            //  weight="duotone"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Changelog</h1>
                    <p className="text-muted-foreground text-lg">
                        Latest updates, improvements, and fixes
                    </p>
                </div>

                {/* Changelog Entries */}
                <div className="space-y-8">
                    {changelog.map((entry, index) => (
                        <ChangelogEntry key={entry.version} entry={entry} isLatest={index === 0} />
                    ))}
                </div>
            </div>
        </div>
    );
}
