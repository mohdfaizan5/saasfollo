/**
 * UploadThing (SDK v7) Next.js App Router handler.
 * Exposes GET/POST at /api/uploadthing for the file router in ./core.
 */

import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
});
