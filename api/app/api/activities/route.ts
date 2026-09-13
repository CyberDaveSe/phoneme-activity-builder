import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

const validActivityTypes = ["WORDLE", "WORD_SEARCH"];
const validDifficulties = ["EASY", "MEDIUM", "HARD"];

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(activities, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch activities:", error);

    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      type,
      difficulty,
      hintsEnabled = false,
      wordIds,
    } = body;

    if (
      !name ||
      !type ||
      !difficulty ||
      !Array.isArray(wordIds) ||
      wordIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "name, type, difficulty, and at least one word are required",
        },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!validActivityTypes.includes(type)) {
      return NextResponse.json(
        { error: "type must be WORDLE or WORD_SEARCH" },
        { status: 400 }
      );
    }

    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "difficulty must be EASY, MEDIUM, or HARD" },
        { status: 400 }
      );
    }

    if (typeof hintsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "hintsEnabled must be true or false" },
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

    const uniqueWordIds = [...new Set(wordIds as number[])];

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

    const activity = await prisma.activity.create({
      data: {
        name: name.trim(),
        type,
        difficulty,
        hintsEnabled,
        words: {
          create: uniqueWordIds.map((wordId) => ({
            wordId,
          })),
        },
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

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);

    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}