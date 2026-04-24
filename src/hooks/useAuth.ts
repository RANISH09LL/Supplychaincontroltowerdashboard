// src/hooks/useAuth.ts
// ============================================================
// AUTH HOOK — session + user state
// ============================================================

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user:    User | null;
  loading: boolean;
}

/**
 * Tracks the Supabase auth session reactively.
 *
 * Usage:
 *   const { user, loading } = useAuth();
 *   if (loading) return <Spinner />;
 *   if (!user)   return <Navigate to="/login" />;
 */
export function useAuth(): AuthState {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
