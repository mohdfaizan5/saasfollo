import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { ProjectsHeader } from '@/components/projects/projects-header';

export default async function ProjectsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* <ProjectsHeader userEmail={user.email || ''} /> */}
            <div className="bg-[#F6F6F6] dark:bg-background">
                {children}
            </div>
        </div>
    );
}
