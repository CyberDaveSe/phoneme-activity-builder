type UsageEventType =
  | "ACTIVITY_CREATED"
  | "GENERATION_SUCCESS"
  | "GENERATION_FAILED"
  | "PAGE_VIEW";

type ActivityType = "WORDLE" | "WORD_SEARCH";

type UsageEvent = {
  eventType: UsageEventType;
  activityType?: ActivityType;
  page?: string;
  durationMs?: number;
};

export async function recordUsageEvent(event: UsageEvent) {
  try {
    const response = await fetch("/api/usage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.warn("Unable to record usage event.");
    }
  } catch (error) {
    console.warn("Unable to record usage event:", error);
  }
}