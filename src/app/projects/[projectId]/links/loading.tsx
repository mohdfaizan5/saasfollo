import { LinksPageSkeleton } from '@/components/skeletons/project-page-skeletons';
import { LoadingTitle } from '@/components/seo/loading-title';

export default function Loading() {
    return (
        <>
            <LoadingTitle />
            <LinksPageSkeleton />
        </>
    );
}