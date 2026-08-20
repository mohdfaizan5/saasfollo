/**
 * Client-side UploadThing (SDK v6) helpers, typed against our file router.
 * Use `uploadFiles(endpoint, { files })` for imperative uploads and
 * `useUploadThing(endpoint)` when a hook fits better.
 */

import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
