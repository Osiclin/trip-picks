import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { notFound, badRequest } from '../lib/errors';
import { createPlanSchema, updatePlanSchema } from '../validators/planValidator';

/** Shape returned for a plan — includes full activity objects. */
async function getPlanWithActivities(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      activities: {
        orderBy: { order: 'asc' },
        include: { activity: true },
      },
    },
  });
}

function formatPlan(
  plan: NonNullable<Awaited<ReturnType<typeof getPlanWithActivities>>>,
) {
  const { activities, ...rest } = plan;
  return {
    ...rest,
    activities: activities.map((pa) => pa.activity),
  };
}

// GET /plans
export async function listPlans(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        activities: {
          orderBy: { order: 'asc' },
          include: { activity: true },
        },
      },
    });

    res.json(plans.map(formatPlan));
  } catch (err) {
    next(err);
  }
}

// POST /plans
export async function createPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const { name, date, notes, activityIds } = parsed.data;

    // Validate that all referenced activity IDs exist
    const foundActivities = await prisma.activity.findMany({
      where: { id: { in: activityIds } },
      select: { id: true },
    });

    if (foundActivities.length !== activityIds.length) {
      const foundIds = new Set(foundActivities.map((a) => a.id));
      const missing = activityIds.filter((id) => !foundIds.has(id));
      throw badRequest('Some activity IDs do not exist', {
        invalidActivityIds: missing,
      });
    }

    const id = `plan_${randomUUID().replace(/-/g, '').slice(0, 12)}`;

    const created = await prisma.plan.create({
      data: {
        id,
        name,
        date: new Date(date),
        notes: notes ?? null,
        activities: {
          create: activityIds.map((activityId, index) => ({
            activityId,
            order: index,
          })),
        },
      },
    });

    const plan = await getPlanWithActivities(created.id);
    res.status(201).json(formatPlan(plan!));
  } catch (err) {
    next(err);
  }
}

// GET /plans/:id
export async function getPlan(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const plan = await getPlanWithActivities(req.params.id);

    if (!plan) {
      throw notFound(`Plan '${req.params.id}'`);
    }

    res.json(formatPlan(plan));
  } catch (err) {
    next(err);
  }
}

// PATCH /plans/:id
export async function updatePlan(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const existing = await prisma.plan.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      throw notFound(`Plan '${req.params.id}'`);
    }

    const parsed = updatePlanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const { name, date, notes, activityIds } = parsed.data;

    // Validate incoming activityIds if provided
    if (activityIds) {
      const found = await prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { id: true },
      });
      if (found.length !== activityIds.length) {
        const foundIds = new Set(found.map((a) => a.id));
        const missing = activityIds.filter((id) => !foundIds.has(id));
        throw badRequest('Some activity IDs do not exist', {
          invalidActivityIds: missing,
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.plan.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(date !== undefined ? { date: new Date(date) } : {}),
          ...(notes !== undefined ? { notes } : {}),
        },
      });

      if (activityIds) {
        // Replace all activities
        await tx.planActivity.deleteMany({ where: { planId: req.params.id } });
        await tx.planActivity.createMany({
          data: activityIds.map((activityId, index) => ({
            planId: req.params.id,
            activityId,
            order: index,
          })),
        });
      }
    });

    const updated = await getPlanWithActivities(req.params.id);
    res.json(formatPlan(updated!));
  } catch (err) {
    next(err);
  }
}
