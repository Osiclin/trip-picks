'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarDays, MapPin, CalendarPlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPlans } from '@/lib/api';
import type { Plan } from '@/types';

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPlans();
      setPlans(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plans';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Plans</h1>
          <p className="mt-1 text-gray-500">Your saved Lagos day plans.</p>
        </div>
        <Button
          asChild
          className="gap-2 font-semibold"
          style={{ backgroundColor: '#97E565', color: '#111827' }}
        >
          <Link href="/plans/new">
            <CalendarPlus className="h-4 w-4" />
            New plan
          </Link>
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg text-gray-600">{error}</p>
          <Button onClick={fetchPlans} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && plans.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-gray-200 py-24 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: '#97E565' + '33' }}
          >
            <CalendarDays className="h-8 w-8" style={{ color: '#97E565' }} />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800">No plans yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first Lagos day plan.
            </p>
          </div>
          <Button asChild style={{ backgroundColor: '#97E565', color: '#111827' }} className="font-semibold gap-2">
            <Link href="/plans/new">
              <CalendarPlus className="h-4 w-4" />
              Create a plan
            </Link>
          </Button>
        </div>
      )}

      {/* Plans grid */}
      {!isLoading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const formattedDate = new Date(plan.date).toLocaleDateString('en-GB', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Link
                key={plan.id}
                href={`/plans/${plan.id}`}
                className="flex flex-col gap-3 rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {plan.name}
                  </h2>
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {plan.activities.length} activit{plan.activities.length === 1 ? 'y' : 'ies'}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 flex-shrink-0" />
                  {formattedDate}
                </div>

                {plan.notes && (
                  <p className="text-sm text-gray-500 line-clamp-2">{plan.notes}</p>
                )}

                {plan.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-1">
                    {plan.activities.slice(0, 3).map((activity) => (
                      <span
                        key={activity.id}
                        className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        {activity.area}
                      </span>
                    ))}
                    {plan.activities.length > 3 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        +{plan.activities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
