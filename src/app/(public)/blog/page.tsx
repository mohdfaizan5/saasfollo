import Link from 'next/link';
import { Search, Sparkles, ChevronRight, CircleArrowRight } from 'lucide-react';
import { source } from '@/lib/source';
import { DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { ReadCvLogoIcon } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
    title: 'Blog | SaaSFollo',
    description: 'Playbooks and field notes for solo founders shipping faster.',
};

export default async function BlogIndexPage() {
    const allPages = source.getPages();
    const sortedPages = [...allPages].sort((a, b) => {
        const left = new Date((b.data as { date?: string }).date || '').getTime();
        const right = new Date((a.data as { date?: string }).date || '').getTime();
        return left - right;
    });

    const featured = sortedPages[0];
    const highlights = sortedPages.slice(1, 5);
    const listPosts = sortedPages;

    return (
        <div className="min-h-screen bg-[#F6F1EA]2 text-[#0C1510] w-6xl mx-auto px-4 md:px-6 py-10 md:py-10 space-y-6">
            {/* <section className="rounded-2xl border border-[#A6AEA4]/30 bg-[#F6F1EA]">
                <div className="px-6 md:px-8 py-6 border-b border-[#A6AEA4]/30 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">SaaSFollo Blog</h1>
                        <p className="text-sm md:text-base text-[#2C4839]/80 mt-1">Real-world playbooks for shipping, growing, and scaling your SaaS.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="rounded-full px-3 py-1.5 text-xs bg-white border border-[#A6AEA4]/50 text-[#2C4839] hover:bg-[#F6F1EA] transition-colors">
                            All categories
                        </button>
                        <button className="h-8 w-8 rounded-full border border-[#A6AEA4]/50 bg-white flex items-center justify-center text-[#F97316]">
                            <Search className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 rounded-2xl bg-white/70 border border-[#A6AEA4]/20 p-5 md:p-6">
                        <div className="h-52 md:h-64 rounded-xl bg-linear-to-br from-[#F6F1EA] via-white to-[#F6F1EA] border border-[#A6AEA4]/20 mb-5 flex items-center justify-center">
                            <div className="h-36 w-48 rounded-xl bg-[#0C1510] shadow-xl" />
                        </div>

                        {featured ? (
                            <>
                                <p className="text-xs font-semibold tracking-wide uppercase text-[#F97316] mb-2">Featured story</p>
                                <Link href={`/blog/${featured.slugs?.join('/') || ''}`} className="group block">
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-[#2C4839] transition-colors">
                                        {featured.data.title || 'Untitled'}
                                    </h2>
                                </Link>
                                <p className="text-[#2C4839]/80 mt-3 line-clamp-3">{featured.data.description || 'No description available'}</p>
                            </>
                        ) : (
                            <p className="text-[#2C4839]/80">Add posts in content/docs to populate the blog.</p>
                        )}
                    </div>

                    <div className="lg:col-span-5 space-y-3">
                        {highlights.map((post, index) => {
                            const postSlug = post.slugs?.join('/') || '';
                            return (
                                <Link key={postSlug || index} href={`/blog/${postSlug}`} className="group block rounded-xl border border-[#A6AEA4]/25 bg-white px-4 py-3 hover:border-[#2C4839]/40 hover:shadow-sm transition-all">
                                    <div className="flex gap-3 items-start">
                                        <div className="h-10 w-10 rounded-lg bg-[#F6F1EA] border border-[#A6AEA4]/30 flex items-center justify-center text-[#2C4839]">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] uppercase font-semibold tracking-wide text-[#F97316] mb-1">{(post.data as { category?: string }).category || 'Growth'}</p>
                                            <h3 className="text-sm font-semibold leading-snug group-hover:text-[#2C4839] transition-colors line-clamp-2">{post.data.title || 'Untitled'}</h3>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section> */}

            <div className="">
                <h2 className="text-3xl font-bold inline-flex space-x-1"><ReadCvLogoIcon size={32} weight="duotone" />Blog</h2>
                <p className="text-sm text-[#2C4839]/70 mt-1">Actionable essays and shipping notes.</p>
            </div>
            <section className="rounded-2xl border border-[#A6AEA4]/30 bg-white">

                <div className="divide-y divide-[#A6AEA4]/30">
                    {listPosts.filter((post) => !post.data.isUnlisted).map((post) => {
                        const postSlug = post.slugs?.join('/') || '';
                        const postData = post.data as { date?: string; readTime?: string };
                        return (
                            <Link key={postSlug} href={`/blog/${postSlug}`} className="group px-6 md:px-8 py-4 flex items-center justify-between gap-4 hover:bg-[#F6F1EA]/60 transition-colors">
                                <div className="flex items-center gap-6 min-w-0">
                                    <span className="hidden md:block w-28 text-xs text-[#2C4839]/65 shrink-0">{postData.date || 'Recent'}</span>
                                    <h3 className="font-semibold text-sm md:text-base line-clamp-1">{post.data.title || 'Untitled'}</h3>
                                </div>
                                <span className="text-xs text-[#2C4839]/70 group-hover:text-[#F97316] inline-flex items-center gap-1 shrink-0">
                                    Read more <ChevronRight className="h-3.5 w-3.5" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* <section className="rounded-2xl border border-[#A6AEA4]/30 bg-white p-6 md:p-8 flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
                <div>
                    <h3 className="text-2xl font-bold">Get updates in your inbox</h3>
                    <p className="text-sm text-[#2C4839]/70 mt-1">One practical growth + product note each week.</p>
                </div>
                <div className="w-full md:w-auto flex gap-2">
                    <input
                        type="email"
                        placeholder="Email"
                        className="h-10 w-full md:w-72 rounded-lg border border-[#A6AEA4]/50 bg-[#F6F1EA] px-3 text-sm outline-none focus:border-[#2C4839]"
                    />
                    <button className="h-10 rounded-lg bg-[#F97316] hover:bg-[#ea6a12] text-white px-4 text-sm font-medium transition-colors">
                        Subscribe
                    </button>
                </div>
            </section> */}

            <section className="rounded-2xl border border-[#A6AEA4]/30 bg-[#0C1510] text-white px-6 md:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <p className="text-2xl font-bold">Start tracking your SaaS execution today</p>
                    <p className="text-[#A6AEA4] mt-1">Join teams using SaaSFollo to ship faster with clarity.</p>
                </div>
                <Link href="/projects" className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] hover:bg-[#ea6a12] px-4 py-2.5 text-sm font-semibold transition-colors">
                    Try SaaSFollo
                    <CircleArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
