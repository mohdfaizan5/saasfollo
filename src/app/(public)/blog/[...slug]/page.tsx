import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import BlogPost from '@/components/blog/BlogPost';

// Keep this dynamic while debugging route behavior after segment changes.
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const slugPath = (Array.isArray(slug) ? slug : [slug]).map((segment) => decodeURIComponent(segment));

    console.log('[blog:[...slug]] params:', slugPath);

    const page = source.getPage(slugPath);
    console.log('[blog:[...slug]] page found:', Boolean(page));
    if (!page) notFound();

    return <BlogPost params={params} />;
}

// export async function generateStaticParams() {
//     return source
//         .generateParams()
//         .map((entry) => ({
//             slug: Array.isArray(entry.slug) ? entry.slug : [entry.slug].filter(Boolean),
//         }))
//         .filter((entry): entry is { slug: string[] } => entry.slug.length > 0);
// }

// export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
//     const { slug } = await params;
//     const slugPath = Array.isArray(slug) ? slug : [slug];
//     console.log("Generating metadata for slug:", slugPath);

//     const page = source.getPage(slugPath);
//     if (!page) notFound();

//     const seo = page.data as {
//         seoTitle?: string;
//         seoDescription?: string;
//         keywords?: string[];
//         ogImage?: string;
//     };
//     const title = seo.seoTitle || page.data.title || 'Untitled';
//     const description = seo.seoDescription || page.data.description || 'No description available';

//     return {
//         title: `${title} | SaaSFollo`,
//         description,
//         keywords: seo.keywords,
//         openGraph: {
//             title,
//             description,
//             images: seo.ogImage ? [seo.ogImage] : undefined,
//             type: 'article',
//         },
//         twitter: {
//             card: seo.ogImage ? 'summary_large_image' : 'summary',
//             title,
//             description,
//             images: seo.ogImage ? [seo.ogImage] : undefined,
//         },
//     };
// }