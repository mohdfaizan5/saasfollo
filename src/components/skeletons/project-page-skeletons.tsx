import { Skeleton } from '@/components/ui/skeleton';

export function ProjectsPageSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="h-16 border-b bg-background" />
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-44" />
                            <Skeleton className="h-4 w-52" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-32 rounded-lg" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="rounded-xl border bg-card p-5 space-y-4 min-h-44">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                                <div className="space-y-2 min-w-0 flex-1">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-5 w-28 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ProjectPageFallbackSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-72 rounded-xl" />
                <Skeleton className="h-72 rounded-xl" />
            </div>
        </div>
    );
}

export function DashboardPageSkeleton() {
    return (
        <div className="space-y-4 bg-[#F6F6F6]">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-72" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-primary p-4 col-span-1 md:col-span-2 lg:col-span-4 min-h-20">
                    <Skeleton className="h-5 w-40 bg-white/25" />
                    <Skeleton className="h-4 w-28 mt-2 bg-white/20" />
                </div>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl border bg-card p-4 min-h-24 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border bg-card p-5 space-y-3 min-h-72">
                    <Skeleton className="h-5 w-36" />
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full rounded-lg" />
                    ))}
                </div>
                <div className="rounded-xl border bg-card p-5 space-y-3 min-h-72">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-9 w-full rounded-lg" />
                        <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BuildPageSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
            </div>

            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-2 w-full rounded-full" />

            <div className="overflow-x-auto pb-4 -mx-6 px-6">
                <div className="flex gap-4 min-w-max">
                    {Array.from({ length: 4 }).map((_, columnIndex) => (
                        <div key={columnIndex} className="w-72 rounded-xl border bg-card p-3 space-y-3 min-h-130">
                            <Skeleton className="h-6 w-32" />
                            {Array.from({ length: 4 }).map((_, cardIndex) => (
                                <div key={cardIndex} className="rounded-xl border bg-background p-3 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-14" />
                                        <Skeleton className="h-4 w-10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function VersionsPageSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>
                <Skeleton className="h-8 w-28 rounded-lg" />
            </div>

            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl border bg-card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-4/5" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Array.from({ length: 4 }).map((_, statIndex) => (
                                <Skeleton key={statIndex} className="h-14 rounded-lg" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GrowthPageSkeleton() {
    return (
        <div className="space-y-8 pb-24">
            <div className="space-y-2">
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-5 w-52" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl border bg-card p-4 space-y-2 min-h-24">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-xl border bg-card min-h-80">
                        <div className="p-4 border-b">
                            <Skeleton className="h-5 w-36" />
                        </div>
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-11 w-full" />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card min-h-72">
                        <div className="p-4 border-b">
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="p-6 space-y-5">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border bg-card min-h-80">
                        <div className="p-4 border-b">
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-10 w-full" />
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function NotesPageSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-36" />
                        <Skeleton className="h-4 w-52" />
                    </div>
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="rounded-xl border bg-card p-4 space-y-3 min-h-36">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="notes-masonry">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="rounded-xl border bg-card p-5 min-h-52 space-y-3 mb-4 break-inside-avoid">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-3 w-24 mt-6" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function NoteEditorSkeleton() {
    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-36 rounded-lg" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
            </div>

            <Skeleton className="h-12 w-2/3" />

            <div className="rounded-lg p-4 min-h-[50vh] space-y-3">
                {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="h-4 w-full" />
                ))}
            </div>
        </div>
    );
}

export function LinksPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-24" />
                        <Skeleton className="h-4 w-52" />
                    </div>
                </div>
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>

            <Skeleton className="h-28 w-full rounded-xl" />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="h-36 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}

export function SecretsPageSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>

            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-44" />
                                <Skeleton className="h-4 w-56" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SettingsPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-7 w-44" />
                <Skeleton className="h-4 w-72" />
            </div>

            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-card space-y-4">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TeamspaceSettingsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-7 w-52" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="border rounded-lg bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    );
}