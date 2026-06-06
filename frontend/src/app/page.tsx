import { Suspense } from 'react';
import { ActivityListPage } from '@/components/ActivityListPage';
import { ActivitySkeletonGrid } from '@/components/ActivitySkeleton';

export default function Page() {
  return (
    <Suspense fallback={<ActivitySkeletonGrid count={9} />}>
      <ActivityListPage />
    </Suspense>
  );
}
