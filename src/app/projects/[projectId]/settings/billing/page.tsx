import { Button } from '@/components/ui/button';
import { getProject } from '@/lib/actions/projects';
import { notFound } from 'next/navigation';

interface BillingSettingsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function BillingSettingsPage({ params }: BillingSettingsPageProps) {
    const { projectId } = await params;
    const project = await getProject(projectId);

    if (!project) notFound();

    return (
        <div className="space-y-4 ">
            <div>
                <h2 className="text-lg font-semibold mb-1">Billing Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your subscription and payment methods.
                </p>
            </div>

            {/* Current Plan Section */}
            <div className="border rounded-lg px-6 py-4 bg-primary text-primary-foreground">
                <h3 className="text-sm font-medium mb-2">Current Plan</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-semibold">Free</p>
                        <p className="text-sm font-muted">
                            You&apos;re currently on the free plan
                        </p>
                    </div>
                    <Button className="" variant="secondary">
                        Upgrade Plan
                    </Button>
                </div>
            </div>

            {/* Usage Section */}
            <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-sm font-medium mb-4">Usage</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Projects</span>
                            <span className="text-muted-foreground">1 of 3</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '33%' }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Team Members</span>
                            <span className="text-muted-foreground">2 of 5</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Storage</span>
                            <span className="text-muted-foreground">500 MB of 1 GB</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '50%' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method Section */}
            <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    No payment method on file.
                </p>
                <button className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors">
                    Add Payment Method
                </button>
            </div>
        </div>
    );
}
