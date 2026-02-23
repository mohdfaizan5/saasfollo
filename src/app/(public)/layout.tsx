import React from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { baseOptions, linkItems } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';



export default function BlogPageLayout({ children }: { children: React.ReactNode }) {
    return <RootProvider>

        <HomeLayout
            className=""
            {...baseOptions()}
            links={linkItems}
            searchToggle={{}}
            themeSwitch={{ enabled: false }}
        >{children}</HomeLayout></RootProvider>

}