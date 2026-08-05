import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { ProjectsHeader } from '@/components/projects';
import { NewProjectRouteForm } from '@/components/projects/new-project-route-form';

export const metadata = {
    title: 'Create Project | SaaSFollo',
};

export default async function NewsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-background">
            <ProjectsHeader userEmail={user.email || ''} />

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-2">
                <div>
                    <h1 className="text-3xl font-me font-serif">Create New Project</h1>
                    {/* <p className="text-sm text-muted-foreground mt-1">
                        Set up your project and optional first version, then continue into onboarding or your dashboard.
                    </p> */}
                </div>

                <NewProjectRouteForm />
            </div>
        </div>
    );
}
