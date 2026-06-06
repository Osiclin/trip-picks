'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ReactPaginate from 'react-paginate';
import { toast } from 'sonner';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Tag } from 'lucide-react';
import { ActivityCard } from '@/components/ActivityCard';
import { ActivitySkeletonGrid } from '@/components/ActivitySkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getActivities, getActivityFilters } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { saveActivity, unsaveActivity, selectSavedActivities } from '@/store/savedActivitiesSlice';
import type { Activity, ActivityListMeta } from '@/types';

const LIMIT = 9;

export function ActivityListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const area = searchParams.get('area') ?? '';
  const tag = searchParams.get('tag') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const [searchInput, setSearchInput] = useState(q);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meta, setMeta] = useState<ActivityListMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const savedActivities = useAppSelector(selectSavedActivities);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '') {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      if (!('page' in updates)) params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getActivities({
        q: q || undefined,
        category: category || undefined,
        area: area || undefined,
        tag: tag || undefined,
        page,
        limit: LIMIT,
      });
      setActivities(result.data);
      setMeta(result.meta);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load activities';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [q, category, area, tag, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setSearchInput(q); }, [q]);

  // Fetch filter options once on mount
  useEffect(() => {
    getActivityFilters()
      .then((f) => {
        setCategories(f.categories);
        setAreas(f.areas);
        setAllTags(f.tags);
      })
      .catch(() => {}); // non-critical — dropdowns just stay empty
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput });
  };

  const handleToggleSave = (activity: Activity) => {
    const alreadySaved = savedActivities.some((a) => a.id === activity.id);
    if (alreadySaved) {
      dispatch(unsaveActivity(activity.id));
      toast.success(`Removed "${activity.title}" from saved`);
    } else {
      dispatch(saveActivity(activity));
      toast.success(`Saved "${activity.title}"!`);
    }
  };

  const hasFilters = !!(q || category || area || tag);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Lagos</h1>
        <p className="mt-1 text-gray-500">Discover the best activities the city has to offer.</p>
      </div>

      {/* Row 1: Search + dropdowns */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activities…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
              aria-label="Search activities"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <select
          value={category}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={area}
          onChange={(e) => updateParams({ area: e.target.value })}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Filter by area"
        >
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput('');
              router.push(pathname);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Row 2: Tag pills */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          {allTags.map((t) => {
            const isActive = tag === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => updateParams({ tag: isActive ? null : t })}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'border-transparent text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                )}
                style={isActive ? { backgroundColor: '#97E565' } : {}}
                aria-pressed={isActive}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <ActivitySkeletonGrid count={LIMIT} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg text-gray-600">{error}</p>
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-medium text-gray-700">No activities found</p>
          <p className="text-sm text-muted-foreground">Try a different search or clear your filters.</p>
          <Button variant="outline" onClick={() => { setSearchInput(''); router.push(pathname); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-2 text-sm text-muted-foreground">
            {meta?.total ?? 0} activit{(meta?.total ?? 0) === 1 ? 'y' : 'ies'} found
            {tag && <span> tagged <span className="font-medium text-gray-700">"{tag}"</span></span>}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isSaved={savedActivities.some((a) => a.id === activity.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>

          {meta && (
            <div className="mt-10 flex justify-center">
              <ReactPaginate
                breakLabel="…"
                nextLabel={<ChevronRight className="h-4 w-4" />}
                previousLabel={<ChevronLeft className="h-4 w-4" />}
                onPageChange={({ selected }) => updateParams({ page: String(selected + 1) })}
                pageCount={meta.totalPages}
                forcePage={page - 1}
                pageRangeDisplayed={5}
                marginPagesDisplayed={1}
                containerClassName="flex items-center gap-1"
                pageClassName="flex"
                pageLinkClassName="flex h-9 w-9 items-center justify-center rounded-md border border-input text-sm hover:bg-accent transition-colors"
                activeClassName="[&>a]:bg-primary [&>a]:text-primary-foreground [&>a]:border-primary"
                previousClassName="flex"
                previousLinkClassName="flex h-9 w-9 items-center justify-center rounded-md border border-input hover:bg-accent transition-colors"
                nextClassName="flex"
                nextLinkClassName="flex h-9 w-9 items-center justify-center rounded-md border border-input hover:bg-accent transition-colors"
                breakClassName="flex"
                breakLinkClassName="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
                disabledClassName="opacity-50 pointer-events-none"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
