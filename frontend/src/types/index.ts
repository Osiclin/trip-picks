// ── Activity ──────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  title: string;
  category: string;
  area: string;
  durationMinutes: number;
  priceLevel: number; // 1–4
  rating: number;
  imageUrl: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityListResponse {
  data: Activity[];
  meta: ActivityListMeta;
}

export interface ActivityQueryParams {
  q?: string;
  category?: string;
  area?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

// ── Plan ──────────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  date: string;
  notes: string | null;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanData {
  name: string;
  date: string;
  notes?: string;
  activityIds: string[];
}

export interface UpdatePlanData {
  name?: string;
  date?: string;
  notes?: string | null;
  activityIds?: string[];
}

// ── API Error ─────────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
