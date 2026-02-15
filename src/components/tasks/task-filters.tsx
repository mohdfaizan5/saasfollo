'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Version, ProjectCollaborator, TaskCategory } from '@/lib/types/database';

interface TaskFiltersProps {
    versions: Version[];
    collaborators: ProjectCollaborator[];
    currentUserId: string;
    selectedCategory: TaskCategory;
    selectedVersionId: string;
    selectedAssignee: string;
    onCategoryChange: (category: TaskCategory) => void;
    onVersionChange: (versionId: string) => void;
    onAssigneeChange: (assignee: string) => void;
}

const CATEGORIES: { value: TaskCategory; label: string }[] = [
    { value: 'website', label: 'Website' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'seo', label: 'SEO' },
    { value: 'content', label: 'Content' },
];

export function TaskFilters({
    versions,
    collaborators,
    currentUserId,
    selectedCategory,
    selectedVersionId,
    selectedAssignee,
    onCategoryChange,
    onVersionChange,
    onAssigneeChange,
}: TaskFiltersProps) {
    const hasActiveFilters = selectedCategory || selectedVersionId || selectedAssignee;

    const clearAllFilters = () => {
        onCategoryChange(null);
        onVersionChange('');
        onAssigneeChange('');
    };

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            <Select
                value={selectedCategory || 'all'}
                onValueChange={(v) => onCategoryChange(v === 'all' ? null : v as TaskCategory)}
            >
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value!}>
                            {cat.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Version Filter */}
            {versions.length > 0 && (
                <Select
                    value={selectedVersionId || 'all'}
                    onValueChange={(v) => onVersionChange(v === 'all' ? '' : v ?? '')}
                >
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Versions</SelectItem>
                        {versions.map((version) => (
                            <SelectItem key={version.id} value={version.id.toString()}>
                                {version.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Assigned To Filter */}
            <Select
                value={selectedAssignee || 'all'}
                onValueChange={(v) => onAssigneeChange(v === 'all' ? '' : v ?? '')}
            >
                <SelectTrigger className="w-[160px] h-9">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value={currentUserId}>You</SelectItem>
                    {collaborators
                        .filter((c) => c.user_id !== currentUserId)
                        .map((collab) => (
                            <SelectItem key={collab.id} value={collab.user_id}>
                                {collab.email.split('@')[0]}
                            </SelectItem>
                        ))}
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-9 px-2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
}
