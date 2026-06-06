import request from 'supertest';
import app from './index';
import { prisma } from './lib/prisma';

beforeAll(async () => {
  // Ensure seed data exists for testing
  const count = await prisma.activity.count();
  if (count === 0) {
    throw new Error('Run `npm run prisma:seed` before running tests');
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /plans — validation', () => {
  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/plans').send({
      date: '2025-07-15',
      activityIds: ['act_001'],
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.name).toBeDefined();
  });

  it('returns 400 when date is missing', async () => {
    const res = await request(app).post('/plans').send({
      name: 'Test Plan',
      activityIds: ['act_001'],
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.date).toBeDefined();
  });

  it('returns 400 when activityIds is empty', async () => {
    const res = await request(app).post('/plans').send({
      name: 'Test Plan',
      date: '2025-07-15',
      activityIds: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when activityIds contains non-existent IDs', async () => {
    const res = await request(app).post('/plans').send({
      name: 'Test Plan',
      date: '2025-07-15',
      activityIds: ['act_999_does_not_exist'],
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.details.invalidActivityIds).toContain('act_999_does_not_exist');
  });

  it('creates a plan and returns 201 with activities', async () => {
    const res = await request(app).post('/plans').send({
      name: 'My Lagos Day',
      date: '2025-08-01',
      notes: 'Start early',
      activityIds: ['act_001', 'act_002'],
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My Lagos Day');
    expect(res.body.activities).toHaveLength(2);
    expect(res.body.id).toMatch(/^plan_/);

    // Clean up
    await prisma.plan.delete({ where: { id: res.body.id } }).catch(() => {});
  });
});
