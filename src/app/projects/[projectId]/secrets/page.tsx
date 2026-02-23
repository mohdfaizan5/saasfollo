import { getSecrets, hasPinSetup } from '@/lib/actions/secrets';
import { SecretsClient } from '@/components/secrets/secrets-client';

interface SecretsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function SecretsPage({ params }: SecretsPageProps) {
    const { projectId } = await params;

    // projectId is now the nanoid string
    const [secrets, hasPin] = await Promise.all([
        getSecrets(projectId),
        hasPinSetup(),
    ]);

    return (
        <SecretsClient
            initialSecrets={secrets}
            projectId={projectId}
            hasPinInitially={hasPin}
        />
    );
}
