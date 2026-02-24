import { getProjectWithActiveVersion } from '@/lib/actions/projects';
import { getGrowthPlan } from '@/lib/actions/growth';
import { notFound, redirect } from 'next/navigation';
import { GrowthOnboarding } from '@/components/growth/growth-onboarding';
import { GrowthDashboard } from '@/components/growth/growth-dashboard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CubeIcon } from '@phosphor-icons/react/dist/ssr';
import { PostHog } from 'posthog-node'

export default async function GrowthPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const project = await getProjectWithActiveVersion(projectId);

    if (!project) {
        notFound();
    }
    const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST
    })

    posthog.capture({
        distinctId: 'distinct_id_of_the_user',
        event: 'event_name'
    })

    await posthog.shutdown()

    if (!project.active_version_id || !project.active_version) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center max-w-sm text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <CubeIcon className="w-12 h-12 text-primary" weight="duotone" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">No Active Version</h2>
                    <p className="text-muted-foreground mb-6">You need an active version to create a Growth Plan. Please create or activate a version first.</p>
                    <Button>
                        <Link href={`/projects/${project.nanoid}/versions`}>
                            Go to Versions
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const growthPlan = await getGrowthPlan(project.active_version_id);

    if (!growthPlan) {
        return (
            <div className=" space-y-4 max-w-6xl">
                <Card className="border-border/70">
                    <CardContent className="p-6 flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">Growth</h1>
                        <p className="text-muted-foreground">Create a focused growth sprint for <span className="font-medium text-foreground">{project.active_version.name}</span>.</p>
                    </CardContent>
                </Card>

                <Card className="border-border/70">
                    <CardContent className="p-6 md:p-8">
                        <GrowthOnboarding
                            projectId={project.id}
                            versionId={project.active_version_id}
                            versionName={project.active_version.name}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl ">
            <GrowthDashboard
                plan={growthPlan}
                versionName={project.active_version.name}
            />
        </div>
    );
}
