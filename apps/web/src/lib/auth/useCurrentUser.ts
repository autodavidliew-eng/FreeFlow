'use client';

import { useEffect, useState } from 'react';

import type { CurrentUser } from './user';

type UseCurrentUserState = {
  user: CurrentUser | null;
  status: 'loading' | 'ready' | 'error';
};

export function useCurrentUser() {
  const [state, setState] = useState<UseCurrentUserState>({
    user: null,
    status: 'loading',
  });

  useEffect(() => {
    let active = true;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load current user.');
        }
        return response.json();
      })
      .then((payload) => {
        if (!active) {
          return;
        }
        setState({ user: payload.user ?? null, status: 'ready' });
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setState({ user: null, status: 'error' });
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    user: state.user,
    status: state.status,
    isLoading: state.status === 'loading',
    isError: state.status === 'error',
  };
}
