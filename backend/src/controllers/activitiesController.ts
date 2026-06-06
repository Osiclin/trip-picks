import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';

// GET /activities/filters
export async function getActivityFilters(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [categoryRows, areaRows, activities] = await Promise.all([
      prisma.activity.findMany({ distinct: ['category'], select: { category: true }, orderBy: { category: 'asc' } }),
      prisma.activity.findMany({ distinct: ['area'], select: { area: true }, orderBy: { area: 'asc' } }),
      prisma.activity.findMany({ select: { tags: true } }),
    ]);

    const tagSet = new Set<string>();
    for (const { tags } of activities) {
      for (const t of tags) tagSet.add(t);
    }

    res.json({
      categories: categoryRows.map((r) => r.category),
      areas: areaRows.map((r) => r.area),
      tags: [...tagSet].sort(),
    });
  } catch (err) {
    next(err);
  }
}

// GET /activities
export async function listActivities(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { q, category, area, tag } = req.query as Record<string, string | undefined>;
    const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit as string) ?? '10', 10) || 10),
    );

    const where = {
      ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
      ...(category ? { category } : {}),
      ...(area ? { area } : {}),
      // Postgres array contains — case-insensitive via mode
      ...(tag ? { tags: { has: tag } } : {}),
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { title: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    res.json({
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /activities/:id
export async function getActivity(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
    });

    if (!activity) {
      throw notFound(`Activity '${req.params.id}'`);
    }

    res.json(activity);
  } catch (err) {
    next(err);
  }
}
