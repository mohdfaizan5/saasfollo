'use client';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Layers, User, Folder, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryState } from 'nuqs';
import type { Version, ProjectCollaborator } from '@/lib/types/database';

const ALL_VERSIONS_VALUE = 'all';
const UNASSIGNED_VERSION_VALUE = 'unassigned';

interface TaskFiltersProps {
    versions: Version[];
    collaborators: ProjectCollaborator[];
    currentUserId: string;
    categories: string[];
    onAddCategory: (name: string) => void;
    onDeleteCategory?: (name: string) => void;
}

function getCategoryLabel(value: string | null, categories: string[]): string {
    if (!value) return '';
    const found = categories.find((category) => category.toLowerCase() === value.toLowerCase());
    return found ?? value;
}

function getVersionLabel(value: string | null, versions: Version[]): string {
    if (!value) return '';
    if (value === ALL_VERSIONS_VALUE) return 'All versions';
    if (value === UNASSIGNED_VERSION_VALUE) return 'Unassigned';
    const version = versions.find(v => v.id.toString() === value);
    return version ? version.name : value;
}

function getAssigneeLabel(value: string | null, currentUserId: string, collaborators: ProjectCollaborator[]): string {
    if (!value) return '';
    if (value === currentUserId) return 'You';
    if (value === 'team') return 'Team';
    if (value === 'unassigned') return 'Unassigned';
    const collab = collaborators.find(c => c.user_id === value);
    return collab ? collab.email.split('@')[0] : value;
}

export function TaskFilters({
    versions,
    collaborators,
    currentUserId,
    categories,
    onAddCategory,
    onDeleteCategory,
}: TaskFiltersProps) {
    const [selectedCategory, setSelectedCategory] = useQueryState('category');
    const [selectedVersionId, setSelectedVersionId] = useQueryState('version');
    const [selectedAssignee, setSelectedAssignee] = useQueryState('assignee');

    const hasActiveFilters = selectedCategory || selectedVersionId || selectedAssignee;

    const clearAllFilters = () => {
        setSelectedCategory(null);
        setSelectedVersionId(null);
        setSelectedAssignee(null);
    };

    const activeVersion = versions.find(v => v.is_active);
    const displayedVersionValue = selectedVersionId ?? activeVersion?.id.toString() ?? ALL_VERSIONS_VALUE;
    const showVersionFilterAsActive = displayedVersionValue !== ALL_VERSIONS_VALUE;

    const handleCategorySelect = (value: string | null) => {
        if (!value || value === 'all') {
            setSelectedCategory(null);
            return;
        }

        if (value === '__add_category__') {
            const name = prompt('New category name');
            const normalized = name?.trim();
            if (!normalized) return;
            onAddCategory(normalized);
            setSelectedCategory(normalized);
            return;
        }

        setSelectedCategory(value);
    };

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            <Select
                value={selectedCategory || 'all'}
                onValueChange={handleCategorySelect}
            >
                <SelectTrigger className={cn(
                    "w-32 sm:w-40 h-9 text-xs sm:text-sm border border-muted rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                    selectedCategory && "bg-card"
                )}>
                    <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <SelectValue>
                            {selectedCategory ? (
                                <span>category: {getCategoryLabel(selectedCategory, categories)}</span>
                            ) : (
                                <span className="text-muted-foreground">All categories</span>
                            )}
                        </SelectValue>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                        <SelectItem 
                            key={category} 
                            value={category}
                            className="text-foreground w-full cursor-pointer"
                        >
                            <div className="flex items-center justify-between gap-2 w-full">
                                <span className="break-words pr-2">{category}</span>
                                {onDeleteCategory && (
                                    <Trash 
                                        className="h-3 w-3 text-muted-foreground hover:text-destructive shrink-0"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (confirm(`Are you sure you want to delete category "${category}"? Tasks in this category will be updated to None.`)) {
                                                onDeleteCategory(category);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value="__add_category__">
                        <span className="inline-flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5" />
                            Add category
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* Version Filter - Default to active version */}
            {versions.length > 0 && (
                <Select
                    value={displayedVersionValue}
                    onValueChange={(value) => setSelectedVersionId(value === activeVersion?.id.toString() ? null : value)}
                >
                    <SelectTrigger className={cn(
                        "w-32 sm:w-40 h-9 text-xs sm:text-sm border border-muted rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                        showVersionFilterAsActive && "bg-card"
                    )}>
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <SelectValue>
                                {displayedVersionValue !== ALL_VERSIONS_VALUE ? (
                                    <span>version: {getVersionLabel(displayedVersionValue, versions)}</span>
                                ) : (
                                    <span className="text-muted-foreground">All versions</span>
                                )}
                            </SelectValue>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_VERSIONS_VALUE}>All versions</SelectItem>
                        <SelectItem value={UNASSIGNED_VERSION_VALUE}>Unassigned</SelectItem>
                        {versions.map((version) => (
                            <SelectItem 
                                key={version.id} 
                                value={version.id.toString()}
                                className={cn(
                                    version.is_active && 'bg-primary/10 text-primary border border-primary/20 font-medium'
                                )}
                            >
                                {version.name}
                                {version.is_active && <span className="ml-1">✓</span>}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Assigned To Filter */}
            <Select
                value={selectedAssignee || 'all'}
                onValueChange={(v) => setSelectedAssignee(v === 'all' ? null : v)}
            >
                <SelectTrigger className={cn(
                    "w-32 sm:w-40 h-9 text-xs sm:text-sm border border-muted rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                    selectedAssignee && "bg-card"
                )}>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <SelectValue>
                            {selectedAssignee ? (
                                <span>{getAssigneeLabel(selectedAssignee, currentUserId, collaborators)}</span>
                            ) : (
                                <span className="text-muted-foreground">Everyone</span>
                            )}
                        </SelectValue>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    {currentUserId && <SelectItem value={currentUserId}>You</SelectItem>}
                    <SelectItem value="team">Team</SelectItem>
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
