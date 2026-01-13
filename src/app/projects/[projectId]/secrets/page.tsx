import { getSecrets, hasPinSetup } from '@/lib/actions/secrets';
import { SecretsClient } from '@/components/secrets/secrets-client';

interface SecretsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function SecretsPage({ params }: SecretsPageProps) {
    const { projectId } = await params;
    const projectIdNum = parseInt(projectId, 10);

    const [secrets, hasPin] = await Promise.all([
        getSecrets(projectIdNum),
        hasPinSetup(),
    ]);

    return (
        <SecretsClient
            initialSecrets={secrets}
            projectId={projectIdNum}
            hasPinInitially={hasPin}
        />
    );
}
