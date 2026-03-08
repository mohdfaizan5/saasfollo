'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ProfilePicUploader from '@/components/profile-pic-uploader';
import { createProject, uploadProjectIcon } from '@/lib/actions/projects';
import { createVersion } from '@/lib/actions/versions';
import { hasCompletedOnboarding } from '@/lib/actions/onboarding';

type VersionTiming = 'previous' | 'after';
type CreateVersionChoice = 'yes' | 'no';

export function NewProjectRouteForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [iconFile, setIconFile] = useState<File | null>(null);

    const [currentVersionContext, setCurrentVersionContext] = useState('');
    const [versionTiming, setVersionTiming] = useState<VersionTiming>('after');
    const [createVersionNow, setCreateVersionNow] = useState<CreateVersionChoice>('yes');

    const [versionName, setVersionName] = useState('');
    const [versionDescription, setVersionDescription] = useState('');
    const [versionGoals, setVersionGoals] = useState('');
    const [versionDeadline, setVersionDeadline] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canContinue = () => {
        if (step === 1) {
            return !!projectName.trim();
        }
        if (step === 4 && createVersionNow === 'yes') {
            return !!versionName.trim();
        }
        return true;
    };

    const goNext = () => {
        if (!canContinue()) {
            if (step === 1) setError('Project name is required');
            if (step === 4 && createVersionNow === 'yes') setError('Version name is required when creating a version now');
            return;
        }

        setError(null);
        setStep((currentStep) => Math.min(currentStep + 1, 4));
    };

    const goBack = () => {
        setError(null);
        setStep((currentStep) => Math.max(currentStep - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!projectName.trim()) {
            setError('Project name is required');
            return;
        }

        if (createVersionNow === 'yes' && !versionName.trim()) {
            setError('Version name is required when creating a version now');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const project = await createProject({
                name: projectName.trim(),
                description: projectDescription.trim() || null,
            });

            if (iconFile) {
                const iconData = new FormData();
                iconData.append('icon', iconFile);
                await uploadProjectIcon(project.nanoid, iconData);
            }

            if (createVersionNow === 'yes') {
                const relationSummary = [
                    currentVersionContext.trim() ? `Current version context: ${currentVersionContext.trim()}` : null,
                    `Requested relation: create ${versionTiming === 'previous' ? 'before the current version' : 'after the current version'}`,
                ].filter(Boolean).join('\n');

                const mergedDescription = [versionDescription.trim(), relationSummary]
                    .filter(Boolean)
                    .join('\n\n') || null;

                await createVersion(project.nanoid, {
                    name: versionName.trim(),
                    description: mergedDescription,
                    goals: versionGoals.trim() || null,
                    deadline: versionDeadline || null,
                    status: 'active',
                });
            }

            const completedOnboarding = await hasCompletedOnboarding();
            const redirectTarget = `/projects/${project.nanoid}/dashboard`;

            toast.success("Project created successfully", { 
                description: "You are being redirected to your dashboard..." 
            });

            if (!completedOnboarding) {
                const params = new URLSearchParams({ redirectTo: redirectTarget });
                router.push(`/onboarding?${params.toString()}`);
                return;
            }

            router.push(redirectTarget);
        } catch (submitError) {
            console.error('Failed to create project from /projects/new route:', submitError);
            setError(submitError instanceof Error ? submitError.message : 'Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-sm text-muted-foreground">Step {step} of 4</div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && 'Project name'}
                        {step === 2 && 'Project context and image'}
                        {step === 3 && 'Version planning direction'}
                        {step === 4 && 'Version details'}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && 'Start with the project name.'}
                        {step === 2 && 'Add detailed context and optionally a profile image.'}
                        {step === 3 && 'Tell us your current version and what you want to create next.'}
                        {step === 4 && 'Finish version details including goals and deadline.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === 1 && (
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project name</Label>
                            <Input
                                id="project-name"
                                placeholder="My SaaS Product"
                                value={projectName}
                                onChange={(event) => setProjectName(event.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="project-description">Project description</Label>
                                <Textarea
                                    id="project-description"
                                    placeholder="Describe your product, users, positioning, pain points, roadmap context, and launch goals..."
                                    value={projectDescription}
                                    onChange={(event) => setProjectDescription(event.target.value)}
                                    disabled={isSubmitting}
                                    rows={6}
                                />
                                <p className="text-xs text-muted-foreground">More detail here gives better onboarding context.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Project profile image (optional)</Label>
                                <ProfilePicUploader
                                    disabled={isSubmitting}
                                    helperText="Upload or drop a project image (PNG/JPG/WebP/GIF/SVG, max 2MB)."
                                    label="Upload project image"
                                    onFileChange={setIconFile}
                                />
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="current-version">Which current version are you in?</Label>
                                <Input
                                    id="current-version"
                                    placeholder="e.g., v0, pre-product, MVP draft"
                                    value={currentVersionContext}
                                    onChange={(event) => setCurrentVersionContext(event.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>What do you want to create?</Label>
                                <RadioGroup
                                    value={versionTiming}
                                    onValueChange={(value) => setVersionTiming(value as VersionTiming)}
                                    className="gap-2"
                                >
                                    <label className="flex items-center gap-2 rounded-md border p-3">
                                        <RadioGroupItem value="previous" id="timing-previous" />
                                        <span>Create a previous version</span>
                                    </label>
                                    <label className="flex items-center gap-2 rounded-md border p-3">
                                        <RadioGroupItem value="after" id="timing-after" />
                                        <span>Create an after/next version</span>
                                    </label>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label>Do you want to create the version now?</Label>
                                <RadioGroup
                                    value={createVersionNow}
                                    onValueChange={(value) => setCreateVersionNow(value as CreateVersionChoice)}
                                    className="gap-2"
                                >
                                    <label className="flex items-center gap-2 rounded-md border p-3">
                                        <RadioGroupItem value="yes" id="create-version-yes" />
                                        <span>Yes, create now</span>
                                    </label>
                                    <label className="flex items-center gap-2 rounded-md border p-3">
                                        <RadioGroupItem value="no" id="create-version-no" />
                                        <span>No, create later</span>
                                    </label>
                                </RadioGroup>
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            {createVersionNow === 'yes' ? (
                                <div className="space-y-4 rounded-lg border p-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="version-name">Version name</Label>
                                        <Input
                                            id="version-name"
                                            placeholder="v1, Version One, v1.0 MVP"
                                            value={versionName}
                                            onChange={(event) => setVersionName(event.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* <div className="space-y-2">
                                        <Label htmlFor="version-description">Version details (optional)</Label>
                                        <Textarea
                                            id="version-description"
                                            placeholder="Write a one"
                                            value={versionDescription}
                                            onChange={(event) => setVersionDescription(event.target.value)}
                                            disabled={isSubmitting}
                                            rows={3}
                                        />
                                    </div> */}

                                    <div className="space-y-2">
                                        <Label htmlFor="version-goals">Key goals or suggestions</Label>
                                        <Textarea
                                            id="version-goals"
                                            placeholder="List goals, constraints, must-have features, and delivery notes."
                                            value={versionGoals}
                                            onChange={(event) => setVersionGoals(event.target.value)}
                                            disabled={isSubmitting}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="version-deadline">Version deadline</Label>
                                        <Input
                                            id="version-deadline"
                                            type="date"
                                            value={versionDeadline}
                                            onChange={(event) => setVersionDeadline(event.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    You chose to create the version later. We&apos;ll create the project now and take you directly to onboarding/project.
                                </p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/projects')} disabled={isSubmitting}>
                    Cancel
                </Button>
                {step > 1 && (
                    <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                )}

                {step < 4 ? (
                    <Button type="button" onClick={goNext} disabled={isSubmitting || !canContinue()}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Create project
                            </>
                        )}
                    </Button>
                )}
            </div>
        </form>
    );
}
