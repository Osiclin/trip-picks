'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceLevel } from '@/components/PriceLevel';
import { RatingBadge } from '@/components/RatingBadge';
import { formatDuration } from '@/lib/utils';
import type { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  isSaved: boolean;
  onToggleSave: (activity: Activity) => void;
}

export function ActivityCard({ activity, isSaved, onToggleSave }: ActivityCardProps) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/activities/${activity.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={activity.imageUrl}
            alt={activity.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Saved indicator */}
          {isSaved && (
            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand shadow">
              <Heart className="h-3.5 w-3.5 fill-gray-900 text-gray-900" />
            </span>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Category + Area */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {activity.category}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {activity.area}
          </span>
        </div>

        {/* Title */}
        <Link href={`/activities/${activity.id}`}>
          <h3 className="mb-2 font-semibold text-gray-900 hover:text-gray-700 line-clamp-2 leading-snug">
            {activity.title}
          </h3>
        </Link>

        {/* Meta */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <RatingBadge rating={activity.rating} />
          <PriceLevel level={activity.priceLevel} />
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="h-3 w-3" />
            {formatDuration(activity.durationMinutes)}
          </span>
        </div>

        {/* Save button */}
        <Button
          variant={isSaved ? 'brand' : 'outline'}
          size="sm"
          className="w-full gap-1.5"
          onClick={() => onToggleSave(activity)}
          aria-label={isSaved ? `Unsave ${activity.title}` : `Save ${activity.title}`}
          style={isSaved ? { backgroundColor: '#97E565', color: '#111827' } : {}}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-gray-900' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      </CardContent>
    </Card>
  );
}
