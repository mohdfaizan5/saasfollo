import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Clock, BookOpen, Search, Sparkles, ChevronRight, CircleArrowRight } from 'lucide-react';
import { source } from '@/lib/source';
import type { Metadata } from 'next';
import { getMDXComponents } from '@/mdx-components';
import { DocsPage, DocsDescription, DocsTitle, DocsBody } from 'fumadocs-ui/layouts/docs/page';

interface BlogPostProps {
    params: Promise<{ slug?: string | string[] }>;
}

export default async function BlogPost({ params }: BlogPostProps) {
    const { slug } = await params;
    const slugPath = Array.isArray(slug) ? slug : slug ? [slug] : undefined;
    console.log('Fetched page for slug:', slugPath);

    const allPages = source.getPages();
    const sortedPages = [...allPages].sort((a, b) => {
        const left = new Date((b.data as { date?: string }).date || '').getTime();
        const right = new Date((a.data as { date?: string }).date || '').getTime();
        return left - right;
    });

    // If no slug is provided, show the blog index page with featured and highlighted posts
    // if (!slug || slug.length === 0) {
    //     const featured = sortedPages[0];
    //     const highlights = sortedPages.slice(1, 5);
    //     const listPosts = sortedPages;

    //     return (

    //         <DocsPage className="min-h-screen bg-[#F6F1EA] text-[#0C1510] w-6xl mx-auto   px-4 md:px-6 py-10 md:py-12 space-y-12">
    //             {/* <DocsPage>
    //                 <DocsTitle>title</DocsTitle>
    //                 <DocsDescription>description</DocsDescription>
    //                 <DocsBody>
    //                     <h2>This heading looks good!</h2>
    //                     It applies the Typography styles, wrap your content here.
    //                 </DocsBody>
    //             </DocsPage>; */}
    //             <section className="rounded-2xl border border-[#A6AEA4]/30 bg-[#F6F1EA]">
    //                 <div className="px-6 md:px-8 py-6 border-b border-[#A6AEA4]/30 flex items-center justify-between gap-4 flex-wrap">
    //                     <div>
    //                         <h1 className="text-3xl md:text-4xl font-bold tracking-tight">SaaSFollo Blog</h1>
    //                         <p className="text-sm md:text-base text-[#2C4839]/80 mt-1">Real-world playbooks for shipping, growing, and scaling your SaaS.</p>
    //                     </div>
    //                     <div className="flex items-center gap-2">
    //                         <button className="rounded-full px-3 py-1.5 text-xs bg-white border border-[#A6AEA4]/50 text-[#2C4839] hover:bg-[#F6F1EA] transition-colors">
    //                             All categories
    //                         </button>
    //                         <button className="h-8 w-8 rounded-full border border-[#A6AEA4]/50 bg-white flex items-center justify-center text-[#F97316]">
    //                             <Search className="h-3.5 w-3.5" />
    //                         </button>
    //                     </div>
    //                 </div>

    //                 <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
    //                     <div className="lg:col-span-7 rounded-2xl bg-white/70 border border-[#A6AEA4]/20 p-5 md:p-6">
    //                         <div className="h-52 md:h-64 rounded-xl bg-linear-to-br from-[#F6F1EA] via-white to-[#F6F1EA] border border-[#A6AEA4]/20 mb-5 flex items-center justify-center">
    //                             <div className="h-36 w-48 rounded-xl bg-[#0C1510] shadow-xl" />
    //                         </div>

    //                         {featured ? (
    //                             <>
    //                                 <p className="text-xs font-semibold tracking-wide uppercase text-[#F97316] mb-2">Featured story</p>
    //                                 <Link href={`/blog/${featured.slugs?.join('/') || ''}`} className="group block">
    //                                     <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-[#2C4839] transition-colors">
    //                                         {featured.data.title || 'Untitled'}
    //                                     </h2>
    //                                 </Link>
    //                                 <p className="text-[#2C4839]/80 mt-3 line-clamp-3">{featured.data.description || 'No description available'}</p>
    //                             </>
    //                         ) : (
    //                             <p className="text-[#2C4839]/80">Add posts in content/docs to populate the blog.</p>
    //                         )}
    //                     </div>

    //                     <div className="lg:col-span-5 space-y-3">
    //                         {highlights.map((post, index) => {
    //                             const postSlug = post.slugs?.join('/') || '';
    //                             return (
    //                                 <Link key={postSlug || index} href={`/blog/${postSlug}`} className="group block rounded-xl border border-[#A6AEA4]/25 bg-white px-4 py-3 hover:border-[#2C4839]/40 hover:shadow-sm transition-all">
    //                                     <div className="flex gap-3 items-start">
    //                                         <div className="h-10 w-10 rounded-lg bg-[#F6F1EA] border border-[#A6AEA4]/30 flex items-center justify-center text-[#2C4839]">
    //                                             <Sparkles className="h-4 w-4" />
    //                                         </div>
    //                                         <div className="min-w-0">
    //                                             <p className="text-[11px] uppercase font-semibold tracking-wide text-[#F97316] mb-1">{(post.data as { category?: string }).category || 'Growth'}</p>
    //                                             <h3 className="text-sm font-semibold leading-snug group-hover:text-[#2C4839] transition-colors line-clamp-2">{post.data.title || 'Untitled'}</h3>
    //                                         </div>
    //                                     </div>
    //                                 </Link>
    //                             );
    //                         })}
    //                     </div>
    //                 </div>
    //             </section>

    //             <section className="rounded-2xl border border-[#A6AEA4]/30 bg-white">
    //                 <div className="px-6 md:px-8 py-7 border-b border-[#A6AEA4]/30">
    //                     <h2 className="text-3xl font-bold">Blog</h2>
    //                     <p className="text-sm text-[#2C4839]/70 mt-1">Actionable essays and shipping notes.</p>
    //                 </div>

    //                 <div className="divide-y divide-[#A6AEA4]/30">
    //                     {listPosts.map((post) => {
    //                         const postSlug = post.slugs?.join('/') || '';
    //                         const postData = post.data as { date?: string; readTime?: string };
    //                         return (
    //                             <Link key={postSlug} href={`/blog/${postSlug}`} className="group px-6 md:px-8 py-4 flex items-center justify-between gap-4 hover:bg-[#F6F1EA]/60 transition-colors">
    //                                 <div className="flex items-center gap-6 min-w-0">
    //                                     <span className="hidden md:block w-28 text-xs text-[#2C4839]/65 shrink-0">{postData.date || 'Recent'}</span>
    //                                     <h3 className="font-semibold text-sm md:text-base line-clamp-1">{post.data.title || 'Untitled'}</h3>
    //                                 </div>
    //                                 <span className="text-xs text-[#2C4839]/70 group-hover:text-[#F97316] inline-flex items-center gap-1 shrink-0">
    //                                     Read more <ChevronRight className="h-3.5 w-3.5" />
    //                                 </span>
    //                             </Link>
    //                         );
    //                     })}
    //                 </div>
    //             </section>

    //             <section className="rounded-2xl border border-[#A6AEA4]/30 bg-white p-6 md:p-8 flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
    //                 <div>
    //                     <h3 className="text-2xl font-bold">Get updates in your inbox</h3>
    //                     <p className="text-sm text-[#2C4839]/70 mt-1">One practical growth + product note each week.</p>
    //                 </div>
    //                 <div className="w-full md:w-auto flex gap-2">
    //                     <input
    //                         type="email"
    //                         placeholder="Email"
    //                         className="h-10 w-full md:w-72 rounded-lg border border-[#A6AEA4]/50 bg-[#F6F1EA] px-3 text-sm outline-none focus:border-[#2C4839]"
    //                     />
    //                     <button className="h-10 rounded-lg bg-[#F97316] hover:bg-[#ea6a12] text-white px-4 text-sm font-medium transition-colors">
    //                         Subscribe
    //                     </button>
    //                 </div>
    //             </section>

    //             <section className="rounded-2xl border border-[#A6AEA4]/30 bg-[#0C1510] text-white px-6 md:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
    //                 <div>
    //                     <p className="text-2xl font-bold">Start tracking your SaaS execution today</p>
    //                     <p className="text-[#A6AEA4] mt-1">Join teams using SaaSFollo to ship faster with clarity.</p>
    //                 </div>
    //                 <Link href="/projects" className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] hover:bg-[#ea6a12] px-4 py-2.5 text-sm font-semibold transition-colors">
    //                     Try SaaSFollo
    //                     <CircleArrowRight className="h-4 w-4" />
    //                 </Link>
    //             </section>
    //         </DocsPage>

    //     );
    // }

    const page = source.getPage(slugPath);
    console.log('Fetched page for slug:', slugPath, page);
    if (!page) notFound();
    
    const MDXContent = page.data.body as React.ComponentType<any>;

    return (
        <DocsPage className="min-h-screen mx-auto bg-[#F6F1EA]- ">
            {/* Header */}
            <div className="bg-[#2C4839] text-white py-10 md:py-16 px-4 border-b border-[#A6AEA4]/20">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[#A6AEA4] hover:text-white transition-colors mb-6 md:mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to all posts
                    </Link>

                    <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4">
                        {page.data.title || 'Untitled'}
                    </h1>

                    {page.data.description && (
                        <p className="text-base md:text-xl text-[#A6AEA4] mb-4 md:mb-6">
                            {page.data.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-[#A6AEA4]">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{(page.data as { author?: string }).author || 'SaaSFollo Team'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{(page.data as { date?: string }).date || 'Recently'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{(page.data as { readTime?: string }).readTime || '5 min read'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <article className="bg-white rounded-xl p-4 md:p-8 shadow-sm border border-[#A6AEA4]/30 prose prose-slate max-w-none prose-headings:text-[#0C1510] prose-p:text-[#2C4839] prose-li:text-[#2C4839] prose-a:text-[#F97316]">
                    <MDXContent components={getMDXComponents() as any} />
                </article>

                {/* Read More Section */}
                {allPages.length > 1 && (
                    <div className="mt-10 md:mt-16">
                        <h2 className="text-xl md:text-2xl font-bold text-[#0C1510] mb-4 md:mb-6 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
                            More Posts
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            {allPages
                                .filter((p) => {
                                    const pageSlug = p.slugs?.join('/') || '';
                                    const currentSlug = Array.isArray(slugPath) ? slugPath.join('/') : '';
                                    return pageSlug !== currentSlug;
                                })
                                .slice(0, 4)
                                .map((post) => {
                                    const postSlug = post.slugs?.join('/') || '';
                                    return (
                                        <Link
                                            key={postSlug}
                                            href={`/blog/${postSlug}`}
                                            className="group"
                                        >
                                            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border-2 border-transparent hover:border-[#2C4839] transition-all duration-300 hover:shadow-lg">
                                                <h3 className="font-bold text-sm md:text-base text-[#0C1510] group-hover:text-[#2C4839] transition-colors mb-2">
                                                    {post.data.title || 'Untitled'}
                                                </h3>
                                                <p className="text-xs md:text-sm text-[#A6AEA4] line-clamp-2">
                                                    {post.data.description || 'No description available'}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </div>
                )}

                <section className="mt-12 rounded-2xl border border-[#A6AEA4]/30 bg-[#0C1510] text-white px-5 md:px-7 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-xl font-bold">Want more practical SaaS breakdowns?</p>
                        <p className="text-[#A6AEA4] text-sm mt-1">Browse all posts and keep shipping momentum.</p>
                    </div>
                    <Link href="/blog" className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] hover:bg-[#ea6a12] px-4 py-2 text-sm font-semibold transition-colors">
                        Explore Blog
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-[#0C1510] text-white py-6 md:py-8 px-4 mt-8 md:mt-12 border-t border-[#2C4839]">
                <div className="max-w-4xl mx-auto text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[#A6AEA4] hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to all posts
                    </Link>
                </div>
            </footer>
        </DocsPage>
    );
}

export async function generateStaticParams() {
    return source.generateParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
        return {
            title: 'SaaSFollo Blog',
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
    const title = seo.seoTitle || `${page.data.title} | SaaSFollo Blog`;
    const description = seo.seoDescription || page.data.description || 'Playbooks and field notes for solo founders shipping faster.';

    return {
        title,
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
