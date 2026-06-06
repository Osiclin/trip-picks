import {
  Activity,
  ActivityListResponse,
  ActivityQueryParams,
  ApiErrorBody,
  CreatePlanData,
  Plan,
  UpdatePlanData,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.error.code;
    this.details = body.error.details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    let body: ApiErrorBody;
    try {
      body = await res.json();
    } catch {
      body = { error: { code: 'UNKNOWN', message: res.statusText } };
    }
    throw new ApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

// ── Activities ────────────────────────────────────────────────────────────────

export interface ActivityFilters {
  categories: string[];
  areas: string[];
  tags: string[];
}

export function getActivityFilters(): Promise<ActivityFilters> {
  return request<ActivityFilters>('/activities/filters');
}

export function getActivities(params: ActivityQueryParams = {}): Promise<ActivityListResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.category) qs.set('category', params.category);
  if (params.area) qs.set('area', params.area);
  if (params.tag) qs.set('tag', params.tag);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return request<ActivityListResponse>(`/activities${query ? `?${query}` : ''}`);
}

export function getActivity(id: string): Promise<Activity> {
  return request<Activity>(`/activities/${encodeURIComponent(id)}`);
}

// ── Plans ─────────────────────────────────────────────────────────────────────

export function createPlan(data: CreatePlanData): Promise<Plan> {
  return request<Plan>('/plans', { method: 'POST', body: JSON.stringify(data) });
}

export function getPlans(): Promise<Plan[]> {
  return request<Plan[]>('/plans');
}

export function getPlan(id: string): Promise<Plan> {
  return request<Plan>(`/plans/${encodeURIComponent(id)}`);
}

export function updatePlan(id: string, data: UpdatePlanData): Promise<Plan> {
  return request<Plan>(`/plans/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export { ApiError };
