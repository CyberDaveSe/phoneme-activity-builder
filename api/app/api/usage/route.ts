import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

const validEventTypes = [
  "ACTIVITY_CREATED",
  "GENERATION_SUCCESS",
  "GENERATION_FAILED",
  "PAGE_VIEW",
];

const validActivityTypes = ["WORDLE", "WORD_SEARCH"];

export async function GET() {
  try {
    const events = await prisma.usageEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch usage events:", error);

    return NextResponse.json(
      { error: "Failed to fetch usage events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { eventType, activityType, page, durationMs } = body;

    if (!eventType || !validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: "A valid eventType is required" },
        { status: 400 }
      );
    }

    if (activityType && !validActivityTypes.includes(activityType)) {
      return NextResponse.json(
        { error: "activityType must be WORDLE or WORD_SEARCH" },
        { status: 400 }
      );
    }

    if (
      durationMs !== undefined &&
      (typeof durationMs !== "number" || durationMs < 0)
    ) {
      return NextResponse.json(
        { error: "durationMs must be a non-negative number" },
        { status: 400 }
      );
    }

    const event = await prisma.usageEvent.create({
      data: {
        eventType,
        activityType: activityType || null,
        page: page?.trim() || null,
        durationMs: durationMs ?? null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create usage event:", error);

    return NextResponse.json(
      { error: "Failed to create usage event" },
      { status: 500 }
    );
  }
}