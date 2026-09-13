import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const words = await prisma.word.findMany({
      include: {
        phonemes: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(words, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch words:", error);

    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { text, hint, difficulty, phonemes } = body;

    if (!text || !difficulty || !Array.isArray(phonemes) || phonemes.length === 0) {
      return NextResponse.json(
        {
          error:
            "text, difficulty, and at least one phoneme are required",
        },
        { status: 400 }
      );
    }

    const validDifficulties = ["EASY", "MEDIUM", "HARD"];

    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        {
          error: "difficulty must be EASY, MEDIUM, or HARD",
        },
        { status: 400 }
      );
    }

    if (
      phonemes.some(
        (phoneme: unknown) =>
          typeof phoneme !== "string" || phoneme.trim().length === 0
      )
    ) {
      return NextResponse.json(
        {
          error: "each phoneme must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const word = await prisma.word.create({
      data: {
        text: text.trim(),
        hint: hint?.trim() || null,
        difficulty,
        phonemes: {
          create: phonemes.map((symbol: string, index: number) => ({
            symbol: symbol.trim(),
            position: index,
          })),
        },
      },
      include: {
        phonemes: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    console.error("Failed to create word:", error);

    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 }
    );
  }
}