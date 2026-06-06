'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store, loadSavedActivitiesFromStorage } from '@/store';
import { rehydrate } from '@/store/savedActivitiesSlice';

function StoreRehydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = loadSavedActivitiesFromStorage();
    if (saved.length > 0) {
      store.dispatch(rehydrate(saved));
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StoreRehydrator>
        {children}
        <Toaster position="bottom-right" richColors />
      </StoreRehydrator>
    </Provider>
  );
}
