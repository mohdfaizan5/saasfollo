import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import BlogPost from '@/components/blog/BlogPost';
import type { Metadata } from 'next';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = await params;

    if (slug && slug.length > 0) {
        const page = source.getPage(slug);
        if (!page) notFound();
    }

    return <BlogPost params={params} />;
}

export async function generateStaticParams() {
    return source.generateParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
        return {
            title: 'Blog | SaaSFollo',
            description: 'Playbooks and field notes for solo founders shipping faster.',
        };
    }

    const page = source.getPage(slug);
    if (!page) notFound();

    const seo = page.data as {
        seoTitle?: string;
        seoDescription?: string;
        keywords?: string[];
        ogImage?: string;
    };
    const title = seo.seoTitle || page.data.title || 'Untitled';
    const description = seo.seoDescription || page.data.description || 'No description available';

    return {
        title: `${title} | SaaSFollo`,
        description,
        keywords: seo.keywords,
        openGraph: {
            title,
            description,
            images: seo.ogImage ? [seo.ogImage] : undefined,
            type: 'article',
        },
        twitter: {
            card: seo.ogImage ? 'summary_large_image' : 'summary',
            title,
            description,
            images: seo.ogImage ? [seo.ogImage] : undefined,
        },
    };
}