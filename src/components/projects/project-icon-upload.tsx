'use client';

import { useState, useRef } from 'react';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadProjectIcon, deleteProjectIcon } from '@/lib/actions/projects';
import type { Project } from '@/lib/types/database';

interface ProjectIconUploadProps {
    project: Project;
}

export function ProjectIconUpload({ project }: ProjectIconUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentIconUrl, setCurrentIconUrl] = useState<string | null>(project.icon_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('icon', file);

            const updatedProject = await uploadProjectIcon(project.nanoid, formData);
            setCurrentIconUrl(updatedProject.icon_url);
        } catch (err) {
            console.error('Failed to upload icon:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload icon');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to remove the project icon?')) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            await deleteProjectIcon(project.nanoid);
            setCurrentIconUrl(null);
        } catch (err) {
            console.error('Failed to delete icon:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete icon');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only PNG, JPEG, GIF, SVG, and WebP are allowed.');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('icon', file);

            const updatedProject = await uploadProjectIcon(project.nanoid, formData);
            setCurrentIconUrl(updatedProject.icon_url);
        } catch (err) {
            console.error('Failed to upload icon:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload icon');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const isLoading = isUploading || isDeleting;

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-6">
                {/* Icon Preview */}
                <div
                    className="relative w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden transition-colors hover:border-primary/50 cursor-pointer"
                    onClick={() => !isLoading && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : currentIconUrl ? (
                        <img
                            src={currentIconUrl}
                            alt="Project icon"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <Upload className="h-6 w-6 mb-1" />
                            <span className="text-xs">Upload</span>
                        </div>
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-3">
                    <div className="text-sm text-muted-foreground">
                        Click or drag and drop an image to upload your project icon.
                        <br />
                        <span className="text-xs">Recommended: 256x256px. Max 2MB. PNG, JPEG, GIF, SVG, or WebP.</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {currentIconUrl ? 'Change Icon' : 'Upload Icon'}
                        </Button>

                        {currentIconUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="text-destructive hover:text-destructive"
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Remove
                            </Button>
                        )}
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
