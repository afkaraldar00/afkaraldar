"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Subscribe to Supabase Realtime INSERT / UPDATE / DELETE events on a table.
 *
 * @param table        – Postgres table name (e.g. "Order")
 * @param onInsert     – called with the new row when an INSERT is broadcast
 * @param onUpdate     – called with the updated row when an UPDATE is broadcast
 * @param onDelete     – called with the old row when a DELETE is broadcast
 *
 * The hook manages its own channel lifecycle and cleans up on unmount.
 */
export function useRealtimeTable(
  table: string,
  callbacks: {
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
  }
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Stable ref so callers don't need to memoize
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  useEffect(() => {
    const channelName = `realtime-${table}-${Math.random().toString(36).slice(2, 8)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        (payload) => cbRef.current.onInsert?.(payload.new)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table },
        (payload) => cbRef.current.onUpdate?.(payload.new)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table },
        (payload) => cbRef.current.onDelete?.(payload.old)
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);
}
