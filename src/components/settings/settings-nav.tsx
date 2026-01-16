'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

const settingsTabs = [
    { name: 'General', href: '' },
    { name: 'Teamspace', href: '/teamspace' },
    { name: 'Billing', href: '/billing' },
    { name: 'Security', href: '/security' },
];

export function SettingsNav() {
    const pathname = usePathname();
    const params = useParams();
    const projectId = params.projectId as string;
    const baseSettingsPath = `/projects/${projectId}/settings`;

    const isTabActive = (tabHref: string) => {
        const fullPath = `${baseSettingsPath}${tabHref}`;
        if (tabHref === '') {
            return pathname === baseSettingsPath || pathname === `${baseSettingsPath}/general`;
        }
        return pathname === fullPath;
    };

    return (
        <div className="border-b border-border mb-8">
            <nav className="flex gap-6" aria-label="Settings tabs">
                {settingsTabs.map((tab) => {
                    const isActive = isTabActive(tab.href);
                    const href = tab.href === '' ? baseSettingsPath : `${baseSettingsPath}${tab.href}`;

                    return (
                        <Link
                            key={tab.name}
                            href={href}
                            className={`
                                relative pb-3 text-sm font-medium transition-colors
                                ${isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground/80'
                                }
                            `}
                        >
                            {tab.name}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
