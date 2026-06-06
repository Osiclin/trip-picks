'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CalendarPlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getActivities } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { createPlan } from '@/store/plansSlice';
import { selectSavedActivities } from '@/store/savedActivitiesSlice';
import type { Activity } from '@/types';

// ── Schema ────────────────────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Enter a valid date'),
  notes: z.string().max(1000).optional(),
  activityIds: z
    .array(z.string())
    .min(1, 'Select at least one activity'),
});

type PlanFormValues = z.infer<typeof planSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewPlanPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const savedActivities = useAppSelector(selectSavedActivities);

  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      date: '',
      notes: '',
      activityIds: savedActivities.map((a) => a.id),
    },
  });

  const selectedIds = watch('activityIds');

  // Fetch all activities for selection
  useEffect(() => {
    getActivities({ limit: 100 })
      .then((res) => setAllActivities(res.data))
      .catch(() => toast.error('Failed to load activities'))
      .finally(() => setLoadingActivities(false));
  }, []);

  const toggleActivity = (id: string) => {
    const current = selectedIds ?? [];
    if (current.includes(id)) {
      setValue('activityIds', current.filter((i) => i !== id), { shouldValidate: true });
    } else {
      setValue('activityIds', [...current, id], { shouldValidate: true });
    }
  };

  const onSubmit = async (values: PlanFormValues) => {
    const result = await dispatch(
      createPlan({
        name: values.name,
        date: values.date,
        notes: values.notes || undefined,
        activityIds: values.activityIds,
      }),
    );

    if (createPlan.fulfilled.match(result)) {
      toast.success('Plan created!');
      router.push(`/plans/${result.payload.id}`);
    } else {
      const errMsg =
        typeof result.payload === 'string'
          ? result.payload
          : 'Failed to create plan. Please try again.';
      toast.error(errMsg);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
          <CalendarPlus className="h-7 w-7" style={{ color: '#97E565' }} />
          Create a Plan
        </h1>
        <p className="mt-1 text-gray-500">Organise your Lagos activities into a day plan.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Plan name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Lagos Culture Day"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            aria-invalid={!!errors.date}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special notes for this day…"
            rows={3}
            {...register('notes')}
          />
        </div>

        {/* Activities */}
        <div className="space-y-2">
          <Label>
            Activities <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Your saved activities are pre-selected. Toggle to customise.
          </p>

          {loadingActivities ? (
            <p className="text-sm text-muted-foreground">Loading activities…</p>
          ) : (
            <Controller
              name="activityIds"
              control={control}
              render={() => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {allActivities.map((activity) => {
                    const isSelected = (selectedIds ?? []).includes(activity.id);
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
                        aria-pressed={isSelected}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? 'bg-brand border-brand'
                              : 'border-gray-300'
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
                          <span className="block text-sm font-medium text-gray-800">
                            {activity.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {activity.category} · {activity.area}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          )}

          {errors.activityIds && (
            <p className="text-sm text-destructive">{errors.activityIds.message}</p>
          )}

          {/* Selected summary */}
          {(selectedIds ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(selectedIds ?? []).map((id) => {
                const act = allActivities.find((a) => a.id === id);
                return act ? (
                  <Badge key={id} variant="secondary" className="gap-1 pr-1">
                    {act.title}
                    <button
                      type="button"
                      onClick={() => toggleActivity(id)}
                      className="ml-0.5 rounded-full hover:bg-gray-200 p-0.5"
                      aria-label={`Remove ${act.title}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 font-semibold"
          style={{ backgroundColor: '#97E565', color: '#111827' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <CalendarPlus className="h-4 w-4" />
              Create plan
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
