import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { seedWords } from "./seedWords";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

function mapDifficulty(
  difficulty: "easy" | "medium" | "hard"
): "EASY" | "MEDIUM" | "HARD" {
  if (difficulty === "easy") return "EASY";
  if (difficulty === "medium") return "MEDIUM";

  return "HARD";
}

async function main() {
  console.log("Seeding word library...");

  for (const entry of seedWords) {
    const existingWord = await prisma.word.findFirst({
      where: {
        text: entry.word,
      },
    });

    if (existingWord) {
      console.log(`Skipping existing word: ${entry.word}`);
      continue;
    }

    await prisma.word.create({
      data: {
        text: entry.word,
        hint: null,
        difficulty: mapDifficulty(entry.difficulty),
        phonemes: {
          create: entry.phonemes.map((symbol, position) => ({
            symbol,
            position,
          })),
        },
      },
    });

    console.log(`Added: ${entry.word}`);
  }

  console.log("Word library seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });