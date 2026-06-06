'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  CalendarDays,
  StickyNote,
  Pencil,
  Check,
  X,
  MapPin,
  Clock,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PriceLevel } from '@/components/PriceLevel';
import { RatingBadge } from '@/components/RatingBadge';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchPlan, updatePlan, selectCurrentPlan, selectPlanLoading, selectPlanError } from '@/store/plansSlice';
import { formatDuration } from '@/lib/utils';
import type { Activity } from '@/types';
import { getActivities } from '@/lib/api';

// ── Schema ────────────────────────────────────────────────────────────────────

const editSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Enter a valid date'),
  notes: z.string().max(1000).optional().nullable(),
});

type EditFormValues = z.infer<typeof editSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const plan = useAppSelector(selectCurrentPlan);
  const isLoading = useAppSelector(selectPlanLoading);
  const error = useAppSelector(selectPlanError);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [editingActivities, setEditingActivities] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) });

  const loadPlan = () => {
    dispatch(fetchPlan(id));
  };

  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Sync form when plan loads
  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        date: plan.date.split('T')[0], // ISO date → "YYYY-MM-DD"
        notes: plan.notes ?? '',
      });
      setSelectedActivityIds(plan.activities.map((a) => a.id));
    }
  }, [plan, reset]);

  // Load all activities when editing activities
  useEffect(() => {
    if (editingActivities && allActivities.length === 0) {
      getActivities({ limit: 100 })
        .then((res) => setAllActivities(res.data))
        .catch(() => toast.error('Failed to load activities'));
    }
  }, [editingActivities, allActivities.length]);

  const onSave = handleSubmit(async (values) => {
    setIsSaving(true);
    const result = await dispatch(
      updatePlan({
        id,
        data: {
          name: values.name,
          date: values.date,
          notes: values.notes ?? null,
          ...(editingActivities ? { activityIds: selectedActivityIds } : {}),
        },
      }),
    );
    setIsSaving(false);

    if (updatePlan.fulfilled.match(result)) {
      toast.success('Plan updated!');
      setIsEditing(false);
      setEditingActivities(false);
    } else {
      toast.error(typeof result.payload === 'string' ? result.payload : 'Update failed');
    }
  });

  const toggleActivity = (actId: string) => {
    setSelectedActivityIds((prev) =>
      prev.includes(actId) ? prev.filter((i) => i !== actId) : [...prev, actId],
    );
  };

  const cancelEdit = () => {
    if (plan) {
      reset({
        name: plan.name,
        date: plan.date.split('T')[0],
        notes: plan.notes ?? '',
      });
      setSelectedActivityIds(plan.activities.map((a) => a.id));
    }
    setIsEditing(false);
    setEditingActivities(false);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg text-gray-600">{error ?? 'Plan not found'}</p>
        <div className="flex gap-2">
          <Button onClick={loadPlan} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(plan.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </Link>

      {/* Plan header */}
      <div className="mb-6 rounded-2xl border bg-white p-6">
        {isEditing ? (
          <form onSubmit={onSave} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Plan name</Label>
              <Input id="edit-name" {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" {...register('date')} aria-invalid={!!errors.date} />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" rows={3} {...register('notes')} />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="gap-2 font-semibold"
                style={{ backgroundColor: '#97E565', color: '#111827' }}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save changes
              </Button>
              <Button type="button" variant="ghost" onClick={cancelEdit} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{plan.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-700">
                      {plan.activities.length} activit{plan.activities.length === 1 ? 'y' : 'ies'}
                    </span>
                  </span>
                </div>
                {plan.notes && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                    <StickyNote className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <p>{plan.notes}</p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex-shrink-0 gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Activities */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Activities</h2>
        {!editingActivities && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingActivities(true)}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit activities
          </Button>
        )}
      </div>

      {editingActivities ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Select activities for this plan:</p>
          {allActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {allActivities.map((activity) => {
                const isSelected = selectedActivityIds.includes(activity.id);
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => toggleActivity(activity.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-transparent ring-2 ring-brand bg-brand/5'
                        : 'border-border hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                        isSelected ? 'bg-brand border-brand' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="#111827"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{activity.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {activity.category} · {activity.area}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={onSave}
              disabled={isSaving || selectedActivityIds.length === 0}
              className="gap-2 font-semibold"
              style={{ backgroundColor: '#97E565', color: '#111827' }}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save activities
            </Button>
            <Button variant="ghost" onClick={cancelEdit} className="gap-1.5">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : plan.activities.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-muted-foreground">No activities in this plan.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setEditingActivities(true)}
          >
            Add activities
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plan.activities.map((activity) => (
            <Link
              key={activity.id}
              href={`/activities/${activity.id}`}
              className="flex gap-4 rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={activity.imageUrl}
                  alt={activity.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 line-clamp-1">{activity.title}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {activity.category}
                  </Badge>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {activity.area}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <RatingBadge rating={activity.rating} />
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(activity.durationMinutes)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
