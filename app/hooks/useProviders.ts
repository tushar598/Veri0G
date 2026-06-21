// example hook, e.g. src/hooks/useProviders.ts
"use client";
import { useEffect, useState } from "react";
import type { ServiceInfo } from "@/app/lib/zeroG";

export function useProviders() {
  const [providers, setProviders] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((data) => setProviders(data.services ?? []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, []);

  return { providers, loading };
}