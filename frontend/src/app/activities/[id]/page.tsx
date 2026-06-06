'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Heart,
  Tag,
  RefreshCw,
  CalendarPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PriceLevel } from '@/components/PriceLevel';
import { RatingBadge } from '@/components/RatingBadge';
import { getActivity } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  saveActivity,
  unsaveActivity,
  selectIsSaved,
} from '@/store/savedActivitiesSlice';
import { formatDuration } from '@/lib/utils';
import type { Activity } from '@/types';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSaved = useAppSelector(selectIsSaved(id));

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getActivity(id);
      setActivity(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load activity';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Optimistic save / unsave ─────────────────────────────────────────────────

  const handleToggleSave = () => {
    if (!activity) return;

    // Optimistic update — dispatches synchronously before any async side-effect
    if (isSaved) {
      dispatch(unsaveActivity(activity.id));
      toast.success(`Removed "${activity.title}" from saved`);
    } else {
      dispatch(saveActivity(activity));
      toast.success(`Saved "${activity.title}"!`);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-6 h-6 w-24" />
        <Skeleton className="mb-6 h-72 w-full rounded-2xl" />
        <Skeleton className="mb-3 h-8 w-2/3" />
        <Skeleton className="mb-2 h-5 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────

  if (error || !activity) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg text-gray-600">{error ?? 'Activity not found'}</p>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button onClick={() => router.back()} variant="ghost">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </Link>

      {/* Hero image */}
      <div className="relative mb-6 h-72 w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-96">
        <Image
          src={activity.imageUrl}
          alt={activity.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{activity.category}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {activity.area}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{activity.title}</h1>
        </div>

        {/* Save / Unsave */}
        <Button
          onClick={handleToggleSave}
          size="default"
          className="flex-shrink-0 gap-2"
          style={
            isSaved
              ? { backgroundColor: '#97E565', color: '#111827' }
              : undefined
          }
          variant={isSaved ? 'brand' : 'outline'}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-gray-900' : ''}`} />
          {isSaved ? 'Saved' : 'Save activity'}
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <RatingBadge rating={activity.rating} className="text-base" />
        <PriceLevel level={activity.priceLevel} />
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatDuration(activity.durationMinutes)}
        </span>
      </div>

      {/* Description */}
      <p className="mb-6 leading-relaxed text-gray-700">{activity.description}</p>

      {/* Tags */}
      {activity.tags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {activity.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Plan CTA */}
      <div className="rounded-xl border bg-white p-5">
        <p className="mb-3 text-sm font-medium text-gray-700">
          Ready to add this to a plan?
        </p>
        <div className="flex flex-wrap gap-2">
          {!isSaved && (
            <Button
              onClick={handleToggleSave}
              style={{ backgroundColor: '#97E565', color: '#111827' }}
              className="gap-2 font-semibold"
            >
              <Heart className="h-4 w-4" />
              Save first
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <Link href="/plans/new">
              <CalendarPlus className="h-4 w-4" />
              Create a plan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
