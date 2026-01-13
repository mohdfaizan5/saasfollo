'use client';

import { useState } from 'react';
import { Layers, Plus, Play, Pause, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { createVersion, setVersionActive, deleteVersion } from '@/lib/actions/versions';
import type { Version } from '@/lib/types/database';

interface VersionsClientProps {
    initialVersions: Version[];
    projectId: number;
    activeVersionId: number | null;
}

export function VersionsClient({ initialVersions, projectId, activeVersionId }: VersionsClientProps) {
    const [versions, setVersions] = useState<Version[]>(initialVersions);
    const [currentActiveId, setCurrentActiveId] = useState<number | null>(activeVersionId);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newName.trim()) {
            setError('Version name is required');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const version = await createVersion({
                project_id: projectId,
                name: newName.trim(),
                description: newDescription.trim() || null,
            });
            setVersions((prev) => [version, ...prev]);
            setIsDialogOpen(false);
            setNewName('');
            setNewDescription('');
        } catch (err) {
            console.error('Failed to create version:', err);
            setError('Failed to create version');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSetActive = async (versionId: number) => {
        try {
            await setVersionActive(versionId, projectId);
            setCurrentActiveId(versionId);
            setVersions((prev) =>
                prev.map((v) => ({
                    ...v,
                    status: v.id === versionId ? 'active' : 'inactive',
                }))
            );
        } catch (err) {
            console.error('Failed to set active version:', err);
        }
    };

    const handleDelete = async (versionId: number) => {
        if (!confirm('Are you sure you want to delete this version?')) return;
        try {
            await deleteVersion(versionId, projectId);
            setVersions((prev) => prev.filter((v) => v.id !== versionId));
            if (currentActiveId === versionId) {
                setCurrentActiveId(null);
            }
        } catch (err) {
            console.error('Failed to delete version:', err);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Versions</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage scope-based versions for your project
                        </p>
                    </div>
                </div>

                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />New Version</Button>} />
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Create New Version</AlertDialogTitle>
                            <AlertDialogDescription>
                                Define a new scope-based version (e.g., MVP, v1, Beta)
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="version-name">Version Name</Label>
                                <Input
                                    id="version-name"
                                    placeholder="e.g., v1 MVP"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    disabled={isCreating}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="version-description">Description (optional)</Label>
                                <Textarea
                                    id="version-description"
                                    placeholder="What's in scope for this version..."
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    disabled={isCreating}
                                    rows={3}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isCreating}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCreate} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Version'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Versions Grid */}
            {versions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No versions created yet</p>
                    <p className="text-sm">Create your first version to define scope</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {versions.map((version) => (
                        <Card key={version.id} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold">{version.name}</h3>
                                    {version.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {version.description}
                                        </p>
                                    )}
                                </div>
                                <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                                    {version.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                {version.status !== 'active' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSetActive(version.id)}
                                    >
                                        <Play className="h-4 w-4 mr-1" />
                                        Set Active
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(version.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
