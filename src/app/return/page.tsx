import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata = {
    title: 'Return To Checkout',
};

export default function ReturnPage() {
    return (
        <main className="min-h-screen bg-background px-4 py-12">
            <div className="mx-auto max-w-xl">
                <Card className="rounded-3xl border p-8 shadow-sm">
                    <div className="space-y-4">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Polar Checkout
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">Checkout was paused</h1>
                        <p className="text-sm text-muted-foreground">
                            Polar sent the customer back here from the checkout back button. You can send them to pricing,
                            your app, or a custom upgrade flow from this page.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link href="/">
                                <Button>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to site
                                </Button>
                            </Link>
                            <Link href="/projects">
                                <Button variant="outline">Open app</Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </main>
    );
}
