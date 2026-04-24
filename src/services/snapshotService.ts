// src/services/snapshotService.ts
// ============================================================
// SNAPSHOT SERVICE
// ============================================================

import { supabase } from '../lib/supabase';
import { getDashboardData } from './dashboardService';
import type { Snapshot, ServiceResult } from '../types';

// ─── createSnapshot ──────────────────────────────────────────

export async function createSnapshot(
  userId: string,
  name: string
): Promise<ServiceResult<Snapshot>> {
  const { data: dashboardData, error: dataErr } = await getDashboardData(userId);
  if (dataErr || !dashboardData) return { data: null, error: dataErr ?? 'No data to snapshot' };

  const { data, error } = await supabase
    .from('snapshots')
    .insert({ user_id: userId, name, state_json: dashboardData })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── listSnapshots ───────────────────────────────────────────

export async function listSnapshots(
  userId: string
): Promise<ServiceResult<Omit<Snapshot, 'state_json'>[]>> {
  const { data, error } = await supabase
    .from('snapshots')
    .select('id, user_id, name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

// ─── getSnapshot ─────────────────────────────────────────────

export async function getSnapshot(
  snapshot_id: string
): Promise<ServiceResult<Snapshot>> {
  const { data, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('id', snapshot_id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
