import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
    dir: 'content/docs',
    docs: {
        schema: frontmatterSchema.extend({
            description: z.string().min(20),
            date: z.string(),
            category: z.string(),
            author: z.string(),
            readTime: z.string(),
            seoTitle: z.string().optional(),
            seoDescription: z.string().optional(),
            keywords: z.array(z.string()).optional(),
            ogImage: z.string().url().optional(),
        }),
    },
});

export default defineConfig();