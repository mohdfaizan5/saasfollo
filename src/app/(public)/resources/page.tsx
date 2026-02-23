import React from 'react';
import Link from 'next/link';
import { PenTool, Search, FileText, Sparkles } from 'lucide-react';

const resources = [
    {
        title: "Copywriting",
        description: "Create compelling content that converts. Learn techniques for headlines, CTAs, and product descriptions.",
        href: "/resources/copywriting",
        icon: PenTool,
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        title: "SEO",
        description: "Optimize your content for search engines. Improve rankings and drive organic traffic to your site.",
        href: "/resources/seo",
        icon: Search,
        color: "bg-green-500/10 text-green-500",
    },
];

const Page = () => {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Resources</h1>
                    <p className="text-lg text-muted-foreground">
                        Curated guides and tools to help you build better products
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {resources.map((resource) => (
                        <Link
                            key={resource.href}
                            href={resource.href}
                            className="group block p-6 rounded-xl border bg-card hover:bg-accent transition-colors"
                        >
                            <div className={`inline-flex p-3 rounded-lg ${resource.color} mb-4`}>
                                <resource.icon className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                {resource.title}
                            </h2>
                            <p className="text-muted-foreground">
                                {resource.description}
                            </p>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 p-6 rounded-xl bg-muted/50 border">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">More coming soon</h3>
                            <p className="text-sm text-muted-foreground">
                                We're working on more resources to help you succeed. 
                                Check back soon for new guides and tools.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
