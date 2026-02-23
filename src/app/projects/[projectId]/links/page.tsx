import { getLinks } from '@/lib/actions/links';
import { LinksClient } from '@/components/links/links-client';

interface LinksPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function LinksPage({ params }: LinksPageProps) {
    const { projectId } = await params;

    // projectId is now the nanoid string
    const links = await getLinks(projectId);

    return <LinksClient initialLinks={links} projectId={projectId} />;
}
