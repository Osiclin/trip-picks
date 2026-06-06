'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Heart, CalendarPlus } from 'lucide-react';
import { ActivityCard } from '@/components/ActivityCard';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  saveActivity,
  unsaveActivity,
  selectSavedActivities,
} from '@/store/savedActivitiesSlice';
import type { Activity } from '@/types';

export default function SavedPage() {
  const dispatch = useAppDispatch();
  const savedActivities = useAppSelector(selectSavedActivities);

  const handleToggleSave = (activity: Activity) => {
    const isSaved = savedActivities.some((a) => a.id === activity.id);
    if (isSaved) {
      dispatch(unsaveActivity(activity.id));
      toast.success(`Removed "${activity.title}" from saved`);
    } else {
      dispatch(saveActivity(activity));
      toast.success(`Saved "${activity.title}"!`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved Activities</h1>
          <p className="mt-1 text-gray-500">
            {savedActivities.length > 0
              ? `${savedActivities.length} saved activit${savedActivities.length === 1 ? 'y' : 'ies'}`
              : 'Activities you save will appear here.'}
          </p>
        </div>

        {savedActivities.length > 0 && (
          <Button asChild style={{ backgroundColor: '#97E565', color: '#111827' }} className="gap-2 font-semibold hidden sm:flex">
            <Link href="/plans/new">
              <CalendarPlus className="h-4 w-4" />
              Plan from saved
            </Link>
          </Button>
        )}
      </div>

      {/* Empty state */}
      {savedActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: '#97E565' + '33' }}
          >
            <Heart className="h-8 w-8" style={{ color: '#97E565' }} />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">No saved activities yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore Lagos and save activities you like.
            </p>
          </div>
          <Button asChild variant="default">
            <Link href="/">Explore activities</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isSaved={true}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-8 sm:hidden">
            <Button asChild className="w-full gap-2 font-semibold" style={{ backgroundColor: '#97E565', color: '#111827' }}>
              <Link href="/plans/new">
                <CalendarPlus className="h-4 w-4" />
                Create a plan from saved
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
