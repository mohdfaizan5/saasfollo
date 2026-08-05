"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImageUp,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import ProfilePicUploader from "@/components/profile-pic-uploader";
import {
  createProject,
  deletePendingProjectIcon,
  uploadPendingProjectIcon,
} from "@/lib/actions/projects";
import { createVersion } from "@/lib/actions/versions";
import { hasCompletedOnboarding } from "@/lib/actions/onboarding";

type VersionTiming = "previous" | "after";
type CreateVersionChoice = "yes" | "no";

type PendingIconState = {
  publicUrl: string;
  storagePath: string;
} | null;

const stepVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const STEP_COPY = {
  1: {
    eyebrow: "Foundation",
    title: "Name the project",
    description:
      "Start with the core identity. We will build the rest around it.",
  },
  2: {
    eyebrow: "Context",
    title: "Add context and image",
    description:
      "Describe the project and upload the image right away so it is ready before creation.",
  },
  3: {
    eyebrow: "Direction",
    title: "Choose the version path",
    description:
      "Tell us how this project fits into your current version plan.",
  },
  4: {
    eyebrow: "Launch",
    title: "Finish setup",
    description:
      "Create the first version now or skip it and head straight into the workspace.",
  },
} as const;

export function NewProjectRouteForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [uploaderKey, setUploaderKey] = useState(0);

  const [currentVersionContext, setCurrentVersionContext] = useState("");
  const [versionTiming, setVersionTiming] = useState<VersionTiming>("after");
  const [createVersionNow, setCreateVersionNow] =
    useState<CreateVersionChoice>("yes");

  const [versionName, setVersionName] = useState("");
  const [versionGoals, setVersionGoals] = useState("");
  const [versionDeadline, setVersionDeadline] = useState("");

  const [pendingIcon, setPendingIcon] = useState<PendingIconState>(null);
  const [iconUploadError, setIconUploadError] = useState<string | null>(null);
  const [isIconUploading, setIsIconUploading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLockRef = useRef(false);
  const uploadRequestRef = useRef(0);

  const stepMeta = useMemo(
    () => STEP_COPY[step as keyof typeof STEP_COPY],
    [step],
  );

  const canContinue = () => {
    if (step === 1) {
      return !!projectName.trim();
    }
    if (step === 4 && createVersionNow === "yes") {
      return !!versionName.trim();
    }
    return true;
  };

  const canSubmit = !isSubmitting && !isIconUploading && canContinue();

  const goNext = () => {
    if (!canContinue()) {
      if (step === 1) {
        setError("Project name is required");
      }
      if (step === 4 && createVersionNow === "yes") {
        setError("Version name is required when creating a version now");
      }
      return;
    }

    setError(null);
    setStep((currentStep) => Math.min(currentStep + 1, 4));
  };

  const goBack = () => {
    setError(null);
    setStep((currentStep) => Math.max(currentStep - 1, 1));
  };

  const safelyDeletePendingIcon = async (storagePath: string) => {
    try {
      await deletePendingProjectIcon(storagePath);
    } catch (deleteError) {
      console.warn("Failed to delete temporary project icon:", deleteError);
    }
  };

  const handleIconFileChange = async (file: File | null) => {
    const currentUploadRequest = ++uploadRequestRef.current;
    setIconUploadError(null);

    if (!file) {
      const previous = pendingIcon;
      setPendingIcon(null);
      if (previous) {
        await safelyDeletePendingIcon(previous.storagePath);
      }
      setUploaderKey((currentKey) => currentKey + 1);
      return;
    }

    setIsIconUploading(true);
    const previousIcon = pendingIcon;
    setPendingIcon(null);

    if (previousIcon) {
      await safelyDeletePendingIcon(previousIcon.storagePath);
    }

    try {
      const iconData = new FormData();
      iconData.append("icon", file);

      const uploadedIcon = await uploadPendingProjectIcon(iconData);
      if (uploadRequestRef.current !== currentUploadRequest) {
        await safelyDeletePendingIcon(uploadedIcon.storagePath);
        return;
      }

      setPendingIcon(uploadedIcon);
      toast.success("Project image uploaded", {
        description:
          "Your image is ready and will be attached when the project is created.",
      });
    } catch (uploadError) {
      if (uploadRequestRef.current === currentUploadRequest) {
        setPendingIcon(null);
        setUploaderKey((currentKey) => currentKey + 1);
        setIconUploadError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload project image",
        );
      }
    } finally {
      if (uploadRequestRef.current === currentUploadRequest) {
        setIsIconUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    if (createVersionNow === "yes" && !versionName.trim()) {
      setError("Version name is required when creating a version now");
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const project = await createProject({
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        icon_url: pendingIcon?.publicUrl ?? null,
      });

      if (createVersionNow === "yes") {
        const relationSummary = [
          currentVersionContext.trim()
            ? `Current version context: ${currentVersionContext.trim()}`
            : null,
          `Requested relation: create ${versionTiming === "previous" ? "before the current version" : "after the current version"}`,
        ]
          .filter(Boolean)
          .join("\n");

        await createVersion(project.nanoid, {
          name: versionName.trim(),
          description: relationSummary || null,
          goals: versionGoals.trim() || null,
          deadline: versionDeadline || null,
          status: "active",
        });
      }

      const completedOnboarding = await hasCompletedOnboarding();
      const redirectTarget = `/projects/${project.nanoid}/dashboard`;

      toast.success("Project created successfully", {
        description: pendingIcon
          ? "Taking you into your workspace now."
          : "Your project is ready. You can add an image later if needed.",
      });

      if (!completedOnboarding) {
        const params = new URLSearchParams({ redirectTo: redirectTarget });
        router.push(`/onboarding?${params.toString()}`);
        return;
      }

      router.push(redirectTarget);
    } catch (submitError) {
      console.error(
        "Failed to create project from /projects/new route:",
        submitError,
      );
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create project",
      );
      submitLockRef.current = false;
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="My SaaS Product"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              disabled={isSubmitting}
              className="h-11"
            />
          </motion.div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.25 }}
            className="space-y-2 "
          >
            {/* <div className="space-y-1">
              <p className="text-sm font-medium">Project profile image</p>
              <p className="text-xs text-muted-foreground">
                Upload happens immediately here, not during the final create step.
              </p>
            </div> */}

            <ProfilePicUploader
              key={uploaderKey}
              disabled={isSubmitting || isIconUploading}
              helperText="Upload or drop a project image (PNG/JPG/WebP/GIF/SVG, max 2MB)."
              label="Upload project image"
              onFileChange={handleIconFileChange}
            />

            {iconUploadError && (
              <div className="rounded-xl border border-dashed bg-background/80 p-3">
                {/* <div className="flex items-center gap-2 text-sm">
                {isIconUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Uploading project image...</span>
                  </>
                ) : pendingIcon ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Project image uploaded and ready.</span>
                  </>
                ) : (
                  <>
                    <ImageUp className="h-4 w-4 text-muted-foreground" />
                    <span>No project image saved yet.</span>
                  </>
                )}
              </div> */}
                <p className="mt-2 text-xs text-destructive">
                  {iconUploadError} You can still create the project and upload
                  the image later.
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <Label htmlFor="project-description">Project description</Label>
            <Textarea
              id="project-description"
              placeholder="Describe your product, users, positioning, pain points, roadmap context, and launch goals..."
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
              disabled={isSubmitting}
              rows={6}
              className="bg-input border border-input"
            />
            {/* <p className="text-xs text-muted-foreground">
              More context here gives onboarding and your workspace better
              starting material.
            </p> */}
          </motion.div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-2"
          >
            <Label htmlFor="current-version">
              Which current version are you in?
            </Label>
            <Input
              id="current-version"
              placeholder="e.g., v0, pre-product, MVP draft"
              value={currentVersionContext}
              onChange={(event) => setCurrentVersionContext(event.target.value)}
              disabled={isSubmitting}
            />
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.25 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium">What do you want to create?</p>
            <RadioGroup
              value={versionTiming}
              onValueChange={(value) =>
                setVersionTiming(value as VersionTiming)
              }
              className="gap-2"
            >
              <label
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-4 transition-colors",
                  versionTiming === "previous" && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem value="previous" id="timing-previous" />
                <span>Create a previous version</span>
              </label>
              <label
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-4 transition-colors",
                  versionTiming === "after" && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem value="after" id="timing-after" />
                <span>Create an after/next version</span>
              </label>
            </RadioGroup>
          </motion.div> */}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.25 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium">
              Do you want to create the version now?
            </p>
            <RadioGroup
              value={createVersionNow}
              onValueChange={(value) =>
                setCreateVersionNow(value as CreateVersionChoice)
              }
              className="gap-2"
            >
              <label
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-4 transition-colors",
                  createVersionNow === "yes" && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem value="yes" id="create-version-yes" />
                <span>Yes, create now</span>
              </label>
              <label
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-4 transition-colors",
                  createVersionNow === "no" && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem value="no" id="create-version-no" />
                <span>No, create later</span>
              </label>
            </RadioGroup>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {createVersionNow === "yes" ? (
          <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/15 p-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <Label htmlFor="version-name">Version name</Label>
              <Input
                id="version-name"
                placeholder="v1, Version One, v1.0 MVP"
                value={versionName}
                onChange={(event) => setVersionName(event.target.value)}
                disabled={isSubmitting}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.25 }}
              className="space-y-2"
            >
              <Label htmlFor="version-goals">Key goals or suggestions</Label>
              <Textarea
                id="version-goals"
                placeholder="List goals, constraints, must-have features, and delivery notes."
                value={versionGoals}
                onChange={(event) => setVersionGoals(event.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.25 }}
              className="space-y-2"
            >
              <Label htmlFor="version-deadline">Version deadline</Label>
              <Input
                id="version-deadline"
                type="date"
                value={versionDeadline}
                onChange={(event) => setVersionDeadline(event.target.value)}
                disabled={isSubmitting}
              />
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-dashed bg-muted/15 p-5 text-sm text-muted-foreground"
          >
            You chose to create the version later. We will create the project
            now and take you directly into onboarding or the project dashboard.
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-b-6">
      <div className="grid gap-3 rounded-2xl py-4 backdrop-blur">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>{stepMeta.eyebrow}</span>
          <span>Step {step} of 4</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={cn(
                "h-2 rounded-full transition-colors",
                stepNumber <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-br from-primary/5 via-background to-background">
          {/* <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Guided setup
          </div> */}
          <CardTitle className="text-2xl">{stepMeta.title}</CardTitle>
          <CardDescription className="max-w-xl">
            {stepMeta.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: "easeInOut" }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {(error || iconUploadError) && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
          {error && <p className="text-destructive">{error}</p>}
          {!error && iconUploadError && (
            <p className="text-muted-foreground">
              The project image failed earlier, but project creation is still
              available.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/projects")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {step < 4 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={isSubmitting || !canContinue()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : isIconUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Waiting for image...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create project
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
