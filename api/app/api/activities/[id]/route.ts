import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const validActivityTypes = ["WORDLE", "WORD_SEARCH"];
const validDifficulties = ["EASY", "MEDIUM", "HARD"];

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      include: {
        words: {
          include: {
            word: {
              include: {
                phonemes: {
                  orderBy: {
                    position: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch activity:", error);

    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const existingActivity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      name,
      type,
      difficulty,
      hintsEnabled,
      wordIds,
    } = body;

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "name must be a non-empty string" },
        { status: 400 }
      );
    }

    if (
      type !== undefined &&
      !validActivityTypes.includes(type)
    ) {
      return NextResponse.json(
        { error: "type must be WORDLE or WORD_SEARCH" },
        { status: 400 }
      );
    }

    if (
      difficulty !== undefined &&
      !validDifficulties.includes(difficulty)
    ) {
      return NextResponse.json(
        { error: "difficulty must be EASY, MEDIUM, or HARD" },
        { status: 400 }
      );
    }

    if (
      hintsEnabled !== undefined &&
      typeof hintsEnabled !== "boolean"
    ) {
      return NextResponse.json(
        { error: "hintsEnabled must be true or false" },
        { status: 400 }
      );
    }

    let uniqueWordIds: number[] | undefined;

    if (wordIds !== undefined) {
      if (!Array.isArray(wordIds) || wordIds.length === 0) {
        return NextResponse.json(
          { error: "wordIds must contain at least one word ID" },
          { status: 400 }
        );
      }

      if (
        wordIds.some(
          (wordId: unknown) =>
            typeof wordId !== "number" ||
            !Number.isInteger(wordId)
        )
      ) {
        return NextResponse.json(
          { error: "each word ID must be an integer" },
          { status: 400 }
        );
      }

      uniqueWordIds = [...new Set(wordIds as number[])];

      const existingWords = await prisma.word.findMany({
        where: {
          id: {
            in: uniqueWordIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingWords.length !== uniqueWordIds.length) {
        return NextResponse.json(
          { error: "one or more selected words do not exist" },
          { status: 400 }
        );
      }
    }

    const activity = await prisma.activity.update({
      where: {
        id: activityId,
      },
      data: {
        ...(name !== undefined && {
          name: name.trim(),
        }),
        ...(type !== undefined && {
          type,
        }),
        ...(difficulty !== undefined && {
          difficulty,
        }),
        ...(hintsEnabled !== undefined && {
          hintsEnabled,
        }),
        ...(uniqueWordIds !== undefined && {
          words: {
            deleteMany: {},
            create: uniqueWordIds.map((wordId) => ({
              wordId,
            })),
          },
        }),
      },
      include: {
        words: {
          include: {
            word: {
              include: {
                phonemes: {
                  orderBy: {
                    position: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error("Failed to update activity:", error);

    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      );
    }

    const existingActivity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    await prisma.activity.delete({
      where: {
        id: activityId,
      },
    });

    return NextResponse.json(
      { message: "Activity deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete activity:", error);

    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}