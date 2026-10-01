import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const [
      totalWords,
      totalActivities,
      wordleActivities,
      wordSearchActivities,
      successfulGenerations,
      failedGenerations,
      wordleGenerations,
      wordSearchGenerations,      
      pageViews,
    ] = await Promise.all([
      prisma.word.count(),
      prisma.activity.count(),
      prisma.activity.count({
        where: { type: "WORDLE" },
      }),
      prisma.activity.count({
        where: { type: "WORD_SEARCH" },
      }),
      prisma.usageEvent.count({
        where: { eventType: "GENERATION_SUCCESS" },
      }),
      prisma.usageEvent.count({
        where: { eventType: "GENERATION_FAILED" },
      }),
      prisma.usageEvent.count({
        where: {
            eventType: "GENERATION_SUCCESS",
            activityType: "WORDLE",
        },
        }),
        prisma.usageEvent.count({
        where: {
            eventType: "GENERATION_SUCCESS",
            activityType: "WORD_SEARCH",
        },
        }),
      prisma.usageEvent.findMany({
        where: {
          eventType: "PAGE_VIEW",
          durationMs: {
            not: null,
          },
        },
        select: {
          durationMs: true,
        },
      }),
    ]);

    const durations = pageViews
      .map((event) => event.durationMs)
      .filter((duration): duration is number => duration !== null);

    const averageTimeOnPageMs =
      durations.length > 0
        ? Math.round(
            durations.reduce((total, duration) => total + duration, 0) /
              durations.length
          )
        : 0;

    const generationTotal = successfulGenerations + failedGenerations;

    const generationSuccessRate =
      generationTotal > 0
        ? Math.round((successfulGenerations / generationTotal) * 1000) / 10
        : 0;

    let mostUsedActivityType: "WORDLE" | "WORD_SEARCH" | null = null;

    if (wordleGenerations > wordSearchGenerations) {
    mostUsedActivityType = "WORDLE";
    } else if (wordSearchGenerations > wordleGenerations) {
    mostUsedActivityType = "WORD_SEARCH";
    }

    if (wordleActivities > wordSearchActivities) {
      mostUsedActivityType = "WORDLE";
    } else if (wordSearchActivities > wordleActivities) {
      mostUsedActivityType = "WORD_SEARCH";
    } else if (wordleActivities > 0) {
      mostUsedActivityType = "WORDLE";
    }

    return NextResponse.json(
      {
        totalWords,
        totalActivities,
        activities: {
         wordle: wordleActivities,
         wordSearch: wordSearchActivities,
         wordleGenerations,
         wordSearchGenerations,
         mostUsedType: mostUsedActivityType,
        },
        generations: {
          successful: successfulGenerations,
          failed: failedGenerations,
          total: generationTotal,
          successRate: generationSuccessRate,
        },
        usage: {
          averageTimeOnPageMs,
          recordedPageViews: durations.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to calculate dashboard metrics:", error);

    return NextResponse.json(
      { error: "Failed to calculate dashboard metrics" },
      { status: 500 }
    );
  }
}