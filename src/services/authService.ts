// src/services/authService.ts
// ============================================================
// AUTH SERVICE — login / signup / logout / profile
// ============================================================

import { supabase } from '../lib/supabase';
import type { Profile, ServiceResult } from '../types';

// ─── Login ───────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string
): Promise<ServiceResult<{ userId: string }>> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { data: null, error: error.message };
  return { data: { userId: data.user.id }, error: null };
}

// ─── Signup ──────────────────────────────────────────────────

export async function signupUser(
  email: string,
  password: string
): Promise<ServiceResult<{ userId: string }>> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { data: null, error: error.message };
  if (!data.user) return { data: null, error: 'Signup failed — no user returned' };
  return { data: { userId: data.user.id }, error: null };
}

// ─── Logout ──────────────────────────────────────────────────

export async function logoutUser(): Promise<ServiceResult<true>> {
  const { error } = await supabase.auth.signOut();
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

// ─── Get current session user ────────────────────────────────

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── Get profile ─────────────────────────────────────────────

export async function getProfile(userId: string): Promise<ServiceResult<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Update plan ─────────────────────────────────────────────

export async function updatePlan(
  userId: string,
  plan_level: Profile['plan_level']
): Promise<ServiceResult<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ plan_level })
    .eq('id', userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Check plan access ───────────────────────────────────────

type Feature = 'basic' | 'simulation' | 'stress_test';

const PLAN_FEATURES: Record<Profile['plan_level'], Feature[]> = {
  free:  ['basic'],
  basic: ['basic', 'simulation'],
  pro:   ['basic', 'simulation', 'stress_test'],
};

export async function checkPlanAccess(
  userId: string,
  feature: Feature
): Promise<boolean> {
  const { data } = await getProfile(userId);
  if (!data) return false;
  return PLAN_FEATURES[data.plan_level].includes(feature);
}
