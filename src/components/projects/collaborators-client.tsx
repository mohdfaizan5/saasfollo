'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserPlus, Trash2, Loader2 } from 'lucide-react';
import type { ProjectCollaborator, CollaboratorRole } from '@/lib/types/database';
import { addCollaborator, removeCollaborator, updateCollaboratorRole } from '@/lib/actions/collaborators';
import { useProjectRole } from '@/hooks/use-project-role';

interface CollaboratorsClientProps {
    projectId: string;
    collaborators: ProjectCollaborator[];
    currentUserEmail: string;
}

export function CollaboratorsClient({ projectId, collaborators, currentUserEmail }: CollaboratorsClientProps) {
    const { canManage } = useProjectRole();
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<CollaboratorRole>('reader');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        startTransition(async () => {
            try {
                await addCollaborator(projectId, email, role);
                setEmail('');
                setMessage('Collaborator added successfully');
            } catch (err: any) {
                setError(err.message);
            }
        });
    };

    const handleRemove = (collaboratorNanoid: string) => {
        if (!confirm('Are you sure you want to remove this collaborator?')) return;
        setError('');
        setMessage('');
        startTransition(async () => {
            try {
                await removeCollaborator(collaboratorNanoid, projectId);
                setMessage('Collaborator removed');
            } catch (err: any) {
                setError(err.message);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Collaborators</h3>
                    <p className="text-sm text-muted-foreground">Invite team members to work on this project.</p>
                </div>
            </div>

            {/* Add Form - only visible to owners */}
            {canManage && (
                <form onSubmit={handleAdd} className="flex items-end gap-3 p-4 border justify-between rounded-lg bg-card -mb-1">
                    <div className="grid w-full  max-w-sm items-center gap-1.5">
                        <Label htmlFor="email">Email address</Label>
                        <Input className='bg-input'
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="collaborator@example.com"
                            required
                        />
                    </div>
                    <div className='flex items-center'>
                        <div className="grid w-40 items-center gap-1.5">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(r) => setRole(r as CollaboratorRole)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reader">Reader</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <UserPlus className="h-4 w-4 mr-2" />}
                            Add
                        </Button>
                    </div>

                </form>
            )}

            {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            {message && <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md">{message}</div>}

            {/* List */}
            <div className="rounded-md border bg-card">
                <div className="p-1">
                    {/* Current User */}
                    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                                {currentUserEmail.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-medium text-sm flex items-center gap-2">
                                    {currentUserEmail}
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-medium">You</span>
                                </div>
                                <div className="text-xs text-muted-foreground">Current user</div>
                            </div>
                        </div>
                    </div>

                    {collaborators.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">No other collaborators yet.</div>
                    ) : (
                        <div className="grid divide-y">
                            {collaborators.map((c) => (
                                <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                            {c.email.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{c.email}</div>
                                            <div className="text-xs text-muted-foreground">Joined {new Date(c.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canManage ? (
                                            <>
                                                <Select
                                                    defaultValue={c.role}
                                                    onValueChange={(val) => {
                                                        startTransition(() => updateCollaboratorRole(c.nanoid, val as CollaboratorRole, projectId));
                                                    }}
                                                    disabled={isPending}
                                                >
                                                    <SelectTrigger className="w-[100px] h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="reader">Reader</SelectItem>
                                                        <SelectItem value="editor">Editor</SelectItem>
                                                        <SelectItem value="owner">Owner</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleRemove(c.nanoid)}
                                                    disabled={isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground capitalize">{c.role}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground border">
                <p className="font-medium text-foreground mb-2">Role Permissions</p>
                <div className="grid gap-2 text-xs">
                    <div className="grid grid-cols-[80px_1fr]">
                        <span className="font-medium">Reader</span>
                        <span>Can view all project content (tasks, notes, versions, links).</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr]">
                        <span className="font-medium">Editor</span>
                        <span>Can create and edit content. Cannot delete the project or manage collaborators.</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr]">
                        <span className="font-medium">Owner</span>
                        <span>Full access including deleting the project and managing access.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
