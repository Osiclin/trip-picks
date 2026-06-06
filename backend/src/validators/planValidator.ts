import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .min(1, 'name must not be empty')
    .max(100, 'name must be at most 100 characters'),
  date: z
    .string({ required_error: 'date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'date must be a valid ISO date string (e.g. 2025-07-15)',
    }),
  notes: z.string().max(1000, 'notes must be at most 1000 characters').optional(),
  activityIds: z
    .array(z.string(), { required_error: 'activityIds is required' })
    .min(1, 'activityIds must contain at least one activity ID'),
});

export const updatePlanSchema = z.object({
  name: z
    .string()
    .min(1, 'name must not be empty')
    .max(100, 'name must be at most 100 characters')
    .optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'date must be a valid ISO date string',
    })
    .optional(),
  notes: z.string().max(1000).nullable().optional(),
  activityIds: z
    .array(z.string())
    .min(1, 'activityIds must contain at least one activity ID')
    .optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
