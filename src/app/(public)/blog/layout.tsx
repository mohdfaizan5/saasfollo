import React from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from "@/lib/layout.shared";

export default function BlogPageLayout({ children }: { children: React.ReactNode }) {
    return <DocsLayout
        sidebar={{ enabled: false }}
        tree={{
            name: "Blogs",
            children: [],
        }}
        {...baseOptions}
    >
        {children}
    </DocsLayout>
}