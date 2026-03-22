import Link from 'next/link';
import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getPolarCheckoutSession } from '@/lib/polar';

export const metadata = {
    title: 'Payment Success',
};

interface SuccessPageProps {
    searchParams: Promise<{ checkout_id?: string }>;
}

function getStatusCopy(status?: string | null) {
    switch (status) {
        case 'succeeded':
            return {
                title: 'Payment confirmed',
                description: 'Your Polar checkout completed successfully. You can head back into the app now.',
                icon: CheckCircle2,
                tone: 'text-green-600',
            };
        case 'confirmed':
        case 'open':
            return {
                title: 'Payment is still processing',
                description: 'Polar received the checkout, but the final payment status is still updating. Refresh in a moment if needed.',
                icon: LoaderCircle,
                tone: 'text-amber-600',
            };
        case 'failed':
        case 'expired':
            return {
                title: 'Checkout was not completed',
                description: 'This checkout did not finish successfully. You can return and try again.',
                icon: CircleAlert,
                tone: 'text-destructive',
            };
        default:
            return {
                title: 'Thanks, we received your checkout return',
                description: 'If you connected Polar correctly, this page can verify the checkout automatically once the access token is set.',
                icon: CheckCircle2,
                tone: 'text-primary',
            };
    }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
    const { checkout_id: checkoutId } = await searchParams;
    let checkout = null;

    if (checkoutId) {
        try {
            checkout = await getPolarCheckoutSession(checkoutId);
        } catch (error) {
            console.error('Failed to verify Polar checkout on success page:', error);
        }
    }

    const statusCopy = getStatusCopy(checkout?.status);
    const StatusIcon = statusCopy.icon;

    return (
        <main className="min-h-screen bg-background px-4 py-12">
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
                <Card className="rounded-3xl border p-8 shadow-sm">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                            <div className={`rounded-2xl bg-muted p-3 ${statusCopy.tone}`}>
                                <StatusIcon className={`h-6 w-6 ${checkout?.status === 'confirmed' || checkout?.status === 'open' ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                    Polar Checkout
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight">{statusCopy.title}</h1>
                                <p className="text-sm text-muted-foreground">{statusCopy.description}</p>
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-2xl border bg-muted/30 p-4 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Checkout ID</span>
                                <code className="text-right text-xs">{checkoutId || 'Not provided'}</code>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Polar status</span>
                                <span className="font-medium capitalize">{checkout?.status || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Access token configured</span>
                                <span className="font-medium">{process.env.POLAR_ACCESS_TOKEN ? 'Yes' : 'No'}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/projects">
                                <Button>Go to app</Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline">Back to site</Button>
                            </Link>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-3xl border p-6 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">What to do next</p>
                    <p className="mt-2">
                        This page handles the redirect from Polar. The usual next step is to add a Polar webhook so your app can
                        persist subscription state when checkout succeeds.
                    </p>
                </Card>
            </div>
        </main>
    );
}
