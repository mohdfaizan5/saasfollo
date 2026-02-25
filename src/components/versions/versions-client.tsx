'use client';

import { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { createVersion, setVersionActive, deleteVersion, updateVersion, moveVersion } from '@/lib/actions/versions';
import { useProjectRole } from '@/hooks/use-project-role';
import type { Version, Task, ProjectCollaborator } from '@/lib/types/database';
import VersionView from './version-view';

interface VersionsClientProps {
    initialVersions: Version[];
    projectId: string;
    activeVersionId: string | null;
    tasks: Task[];
    collaborators: ProjectCollaborator[];
    currentUserId: string;
}

export function VersionsClient({ initialVersions, projectId, activeVersionId, tasks, collaborators, currentUserId }: VersionsClientProps) {
    const { canEdit } = useProjectRole();
    const [versions, setVersions] = useState<Version[]>(initialVersions);
    const [currentActiveId, setCurrentActiveId] = useState<string | null>(activeVersionId);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPrd, setNewPrd] = useState('');
    const [newGoals, setNewGoals] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [step, setStep] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNextStep = () => {
        if (step === 1 && !newName.trim()) {
            setError('Version name is required');
            return;
        }
        setError(null);
        setStep(2);
    };

    const handlePrevStep = () => {
        setError(null);
        setStep(1);
    };

    const handleCreate = async () => {
        if (!newName.trim()) {
            setError('Version name is required');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const version = await createVersion(projectId, {
                name: newName.trim(),
                description: newDescription.trim() || null,
                prd: newPrd.trim() || null,
                goals: newGoals.trim() || null,
                deadline: newDeadline || null,
            });
            setVersions((prev) => [...prev, version]);
            setIsDialogOpen(false);
            setStep(1);
            setNewName('');
            setNewDescription('');
            setNewPrd('');
            setNewGoals('');
            setNewDeadline('');
            setNewDescription('');
        } catch (err) {
            console.error('Failed to create version:', err);
            setError('Failed to create version');
        } finally {
            setIsCreating(false);
        }
    };

    const handleSetActive = async (version: Version) => {
        try {
            await setVersionActive(version.nanoid, projectId);
            setCurrentActiveId(version.nanoid);
            setVersions((prev) =>
                prev.map((v) => ({
                    ...v,
                    status: v.id === version.id ? 'active' : 'inactive',
                }))
            );
        } catch (err) {
            console.error('Failed to set active version:', err);
        }
    };

    const handleDelete = async (version: Version) => {
        if (!confirm('Are you sure you want to delete this version?')) return;
        try {
            await deleteVersion(version.nanoid, projectId);
            setVersions((prev) => prev.filter((v) => v.id !== version.id));
            if (currentActiveId === version.nanoid) {
                setCurrentActiveId(null);
            }
        } catch (err) {
            console.error('Failed to delete version:', err);
        }
    };

    const handleUpdateVersion = async (version: Version, updates: Partial<Version>) => {
        const updatedVersion = await updateVersion(version.nanoid, projectId, updates);
        setVersions((prev) => prev.map((v) => (v.id === updatedVersion.id ? updatedVersion : v)));
    };

    const handleMoveVersion = async (version: Version, direction: 'up' | 'down') => {
        try {
            const reorderedVersions = await moveVersion(version.nanoid, projectId, direction);
            setVersions(reorderedVersions);
        } catch (err) {
            console.error('Failed to reorder version:', err);
        }
    };

    return (
        <div className="space-y-4">
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

                {canEdit && (
                    <AlertDialog open={isDialogOpen} onOpenChange={(open) => {
                        if (!open) { setStep(1); setError(null); }
                        setIsDialogOpen(open);
                    }}>
                        <AlertDialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />New Version</Button>} />
                        <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Create New Version</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Step {step} of 2 {step === 1 ? "- Basic Info" : "- Details"}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                {step === 1 ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="version-name">Version Name</Label>
                                            <Input
                                                id="version-name"
                                                placeholder="e.g., v1 MVP"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                disabled={isCreating}
                                                autoFocus
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
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="version-prd">PRD (Markdown)</Label>
                                            <Textarea
                                                id="version-prd"
                                                placeholder="Product Requirements Document..."
                                                value={newPrd}
                                                onChange={(e) => setNewPrd(e.target.value)}
                                                disabled={isCreating}
                                                rows={4}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="version-goals">Goals</Label>
                                            <Input
                                                id="version-goals"
                                                placeholder="e.g., Launch beta, Reach 100 MRR"
                                                value={newGoals}
                                                onChange={(e) => setNewGoals(e.target.value)}
                                                disabled={isCreating}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="version-deadline">Deadline</Label>
                                            <Input
                                                id="version-deadline"
                                                type="date"
                                                value={newDeadline}
                                                onChange={(e) => setNewDeadline(e.target.value)}
                                                disabled={isCreating}
                                            />
                                        </div>
                                    </>
                                )}
                                {error && <p className="text-sm text-destructive">{error}</p>}
                            </div>
                            <AlertDialogFooter className="flex items-center justify-between sm:justify-between w-full">
                                {step === 1 ? (
                                    <AlertDialogCancel disabled={isCreating}>Cancel</AlertDialogCancel>
                                ) : (
                                    <Button variant="outline" onClick={handlePrevStep} disabled={isCreating}>Back</Button>
                                )}

                                {step === 1 ? (
                                    <Button onClick={handleNextStep}>Next</Button>
                                ) : (
                                    <Button onClick={handleCreate} disabled={isCreating}>
                                        {isCreating ? 'Creating...' : 'Create Version'}
                                    </Button>
                                )}
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            <VersionView
                versions={versions}
                currentActiveId={currentActiveId}
                tasks={tasks}
                collaborators={collaborators}
                currentUserId={currentUserId}
                canEdit={canEdit}
                onSetActive={handleSetActive}
                onDelete={handleDelete}
                onUpdateVersion={handleUpdateVersion}
                onMoveVersion={handleMoveVersion}
            />
        </div>
    );
}
