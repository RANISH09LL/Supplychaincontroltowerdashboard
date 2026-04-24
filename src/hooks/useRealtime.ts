// src/hooks/useRealtime.ts
// ============================================================
// REALTIME HOOK — live shipment + alert + recommendation updates
// ============================================================

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  onShipmentChange?: () => void;
  onAlertChange?:    () => void;
  onRecChange?:      () => void;
}

/**
 * Subscribe to realtime changes on shipments, alerts, and recommendations.
 * Each callback is a simple "something changed, please refetch" signal.
 *
 * Usage:
 *   useRealtime({
 *     onShipmentChange: fetchShipments,
 *     onAlertChange:    fetchAlerts,
 *   });
 */
export function useRealtime({
  onShipmentChange,
  onAlertChange,
  onRecChange,
}: UseRealtimeOptions): void {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('supply-chain-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        () => onShipmentChange?.()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => onAlertChange?.()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recommendations' },
        () => onRecChange?.()
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onShipmentChange, onAlertChange, onRecChange]);
}
