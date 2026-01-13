import { getLinks } from '@/lib/actions/links';
import { LinksClient } from '@/components/links/links-client';

interface LinksPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function LinksPage({ params }: LinksPageProps) {
    const { projectId } = await params;
    const projectIdNum = parseInt(projectId, 10);

    const links = await getLinks(projectIdNum);

    return <LinksClient initialLinks={links} projectId={projectIdNum} />;
}
