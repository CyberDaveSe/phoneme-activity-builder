"use client";

import { useEffect } from "react";
import { recordUsageEvent } from "@/utils/recordUsageEvent";

type PageTimeTrackerProps = {
  page: string;
};

export default function PageTimeTracker({ page }: PageTimeTrackerProps) {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const durationMs = Date.now() - startTime;

      if (durationMs > 0) {
        void recordUsageEvent({
          eventType: "PAGE_VIEW",
          page,
          durationMs,
        });
      }
    };
  }, [page]);

  return null;
}