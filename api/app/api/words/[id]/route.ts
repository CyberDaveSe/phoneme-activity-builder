import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    const word = await prisma.word.findUnique({
      where: {
        id: wordId,
      },
      include: {
        phonemes: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!word) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(word, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch word:", error);

    return NextResponse.json(
      { error: "Failed to fetch word" },
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
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    const existingWord = await prisma.word.findUnique({
      where: {
        id: wordId,
      },
    });

    if (!existingWord) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { text, hint, difficulty, phonemes } = body;

    if (
      difficulty !== undefined &&
      !["EASY", "MEDIUM", "HARD"].includes(difficulty)
    ) {
      return NextResponse.json(
        { error: "difficulty must be EASY, MEDIUM, or HARD" },
        { status: 400 }
      );
    }

    if (phonemes !== undefined) {
      if (!Array.isArray(phonemes) || phonemes.length === 0) {
        return NextResponse.json(
          { error: "phonemes must contain at least one phoneme" },
          { status: 400 }
        );
      }

      if (
        phonemes.some(
          (phoneme: unknown) =>
            typeof phoneme !== "string" ||
            phoneme.trim().length === 0
        )
      ) {
        return NextResponse.json(
          { error: "each phoneme must be a non-empty string" },
          { status: 400 }
        );
      }
    }

    const word = await prisma.word.update({
      where: {
        id: wordId,
      },
      data: {
        ...(text !== undefined && {
          text: text.trim(),
        }),
        ...(hint !== undefined && {
          hint: hint?.trim() || null,
        }),
        ...(difficulty !== undefined && {
          difficulty,
        }),
        ...(phonemes !== undefined && {
          phonemes: {
            deleteMany: {},
            create: phonemes.map(
              (symbol: string, index: number) => ({
                symbol: symbol.trim(),
                position: index,
              })
            ),
          },
        }),
      },
      include: {
        phonemes: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return NextResponse.json(word, { status: 200 });
  } catch (error) {
    console.error("Failed to update word:", error);

    return NextResponse.json(
      { error: "Failed to update word" },
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
    const wordId = Number(id);

    if (!Number.isInteger(wordId)) {
      return NextResponse.json(
        { error: "Invalid word ID" },
        { status: 400 }
      );
    }

    const existingWord = await prisma.word.findUnique({
      where: {
        id: wordId,
      },
    });

    if (!existingWord) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    await prisma.word.delete({
      where: {
        id: wordId,
      },
    });

    return NextResponse.json(
      { message: "Word deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete word:", error);

    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 }
    );
  }
}