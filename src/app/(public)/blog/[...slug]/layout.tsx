import React from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
    return (
        <DocsLayout
            // tree={source.pageTree}
            sidebar={{ enabled: false }}
            tree={{
                name: "Blogs",
                children: [],
            }}
            {...baseOptions}
            {...baseOptions()}
        >
            {children}
        </DocsLayout>
    );
}
