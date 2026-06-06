import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { Middleware } from '@reduxjs/toolkit';
import savedActivitiesReducer from './savedActivitiesSlice';
import plansReducer from './plansSlice';
import type { Activity } from '@/types';

// ── RootState (derived from reducers, defined before the store so the
//    localStorage middleware can reference the shape without circular issues)
export type RootState = {
  savedActivities: ReturnType<typeof savedActivitiesReducer>;
  plans: ReturnType<typeof plansReducer>;
};

// ── localStorage middleware ───────────────────────────────────────────────────

const localStorageMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  const result = next(action);
  if (typeof window !== 'undefined') {
    const state = storeAPI.getState() as RootState;
    try {
      localStorage.setItem(
        'savedActivities',
        JSON.stringify(state.savedActivities.activities),
      );
    } catch {
      // localStorage may be full or disabled — silently ignore
    }
  }
  return result;
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    savedActivities: savedActivitiesReducer,
    plans: plansReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});
export type AppDispatch = typeof store.dispatch;

// ── Typed hooks ───────────────────────────────────────────────────────────────

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── localStorage restore helper (called from Providers on mount) ──────────────

export function loadSavedActivitiesFromStorage(): Activity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('savedActivities');
    return raw ? (JSON.parse(raw) as Activity[]) : [];
  } catch {
    return [];
  }
}
