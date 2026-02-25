import { SettingsNav } from '@/components/settings/settings-nav';

export const metadata = {
    title: {
        template: '%s | Settings',
        default: 'Settings',
    },
};

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground/80">
                    Project Settings
                </h1>
            </div>

            {/* Tab Navigation */}
            <SettingsNav />

            {/* Tab Content */}
            <div>
                {children}
            </div>
        </div>
    );
}
