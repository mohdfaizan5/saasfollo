'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProfilePicUploader from '@/components/profile-pic-uploader';
import { Button } from '@/components/ui/button';
import { deleteProjectIcon, uploadProjectIcon } from '@/lib/actions/projects';

interface ProjectSettingsImageUploaderProps {
    projectNanoid: string;
    initialImageUrl: string | null;
}

export function ProjectSettingsImageUploader({ projectNanoid, initialImageUrl }: ProjectSettingsImageUploaderProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (file: File | null) => {
        setError(null);

        if (!file && !imageUrl) {
            return;
        }

        setIsLoading(true);

        try {
            if (!file) {
                await deleteProjectIcon(projectNanoid);
                setImageUrl(null);
                return;
            }

            const formData = new FormData();
            formData.append('icon', file);
            const updatedProject = await uploadProjectIcon(projectNanoid, formData);
            setImageUrl(updatedProject.icon_url);
        } catch (uploadError) {
            console.error('Failed to update project image:', uploadError);
            setError(uploadError instanceof Error ? uploadError.message : 'Failed to update project image');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 rounded-lg border p-6 bg-card">
            <div>
                <h3 className="text-sm font-medium mb-2">Project Image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Add or change your project image. Changes are saved immediately.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <ProfilePicUploader
                    initialImageUrl={imageUrl}
                    disabled={isLoading}
                    helperText="Upload or drag an image to update your project profile."
                    label="Upload project image"
                    onFileChange={handleFileChange}
                />

                {isLoading && (
                    <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving image...
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {imageUrl && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFileChange(null)}
                    disabled={isLoading}
                >
                    Remove image
                </Button>
            )}
        </div>
    );
}
