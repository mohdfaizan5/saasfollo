// source.config.ts
import { defineDocs, defineConfig, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      description: z.string().min(10),
      date: z.string().optional(),
      author: z.string().optional(),
      isContentReady: z.boolean().default(false),
      isPublished: z.boolean().default(false),
      isUnlisted: z.boolean().default(false),
      category: z.string(),
      readTime: z.string(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().url().optional()
    })
  }
});
var source_config_default = defineConfig();
export {
  source_config_default as default,
  docs
};
