'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogPopup,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { deleteProject } from '@/lib/actions/projects';
import type { Project } from '@/lib/types/database';

export function DeleteProjectSection({ project }: { project: Project }) {
    const [open, setOpen] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (confirmName !== project.name) return;

        startTransition(async () => {
            try {
                await deleteProject(project.nanoid);
                setOpen(false);
                router.push('/projects');
            } catch (error) {
                console.error("Failed to delete project", error);
                // Optionally show error to user
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-lg font-medium">Danger Zone</h3>
            </div>

            <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5 block sm:flex items-center justify-between gap-4">
                <div className="space-y-1 mb-4 sm:mb-0">
                    <h4 className="font-medium text-foreground">Delete Project</h4>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete this project and all its data. This action cannot be undone.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) setConfirmName('');
                }}>
                    <DialogTrigger render={<Button variant="destructive" className="w-full sm:w-auto" />}>
                        Delete Project
                    </DialogTrigger>
                    <DialogPopup>
                        <DialogHeader>
                            <DialogTitle>Delete Project</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete
                                <span className="font-semibold text-foreground"> {project.name} </span>
                                and remove all data associated with it.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 px-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Type the project name to confirm</Label>
                                <Input
                                    id="confirm"
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                    placeholder={project.name}
                                    className="font-mono"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={confirmName !== project.name || isPending}
                            >
                                {isPending && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                Delete Project
                            </Button>
                        </DialogFooter>
                    </DialogPopup>
                </Dialog>
            </div>
        </div>
    );
}
