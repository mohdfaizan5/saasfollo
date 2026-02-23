// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"ai-changing-operations.mdx": () => import("../content/docs/ai-changing-operations.mdx?collection=docs"), "best-saas-designs.mdx": () => import("../content/docs/best-saas-designs.mdx?collection=docs"), "execution-rhythm-for-solo-founders.mdx": () => import("../content/docs/execution-rhythm-for-solo-founders.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "public-launch.mdx": () => import("../content/docs/public-launch.mdx?collection=docs"), "resource-planning-for-service-scale.mdx": () => import("../content/docs/resource-planning-for-service-scale.mdx?collection=docs"), "sites-best-for.mdx": () => import("../content/docs/sites-best-for.mdx?collection=docs"), "small-hacks-to-increase-branding.mdx": () => import("../content/docs/small-hacks-to-increase-branding.mdx?collection=docs"), "top-resources-to-follow-for-solofounders.mdx": () => import("../content/docs/top-resources-to-follow-for-solofounders.mdx?collection=docs"), "weekly-processes-for-growth.mdx": () => import("../content/docs/weekly-processes-for-growth.mdx?collection=docs"), }),
};
export default browserCollections;