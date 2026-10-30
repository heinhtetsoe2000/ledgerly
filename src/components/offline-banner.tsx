"use client";

import { useOffline } from "next/offline";

export function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="offline-banner" role="status">
      No internet connection. Waiting to reconnect.
    </div>
  );
}