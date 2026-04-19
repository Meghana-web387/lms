import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demoPass = process.env.SEED_USER_PASSWORD ?? "password123";
  const hash = await bcrypt.hash(demoPass, 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    create: { email: "demo@example.com", passwordHash: hash, name: "Demo Learner" },
    update: { name: "Demo Learner" },
  });

  const subject = await prisma.subject.upsert({
    where: { slug: "intro-web" },
    create: {
      title: "Introduction to Web Development",
      slug: "intro-web",
      description: "HTML, CSS, and JavaScript fundamentals via curated YouTube lessons.",
      isPublished: true,
    },
    update: { isPublished: true },
  });

  await prisma.section.deleteMany({ where: { subjectId: subject.id } });

  await prisma.section.create({
    data: {
      subjectId: subject.id,
      title: "Getting started",
      orderIndex: 0,
      videos: {
        create: [
          {
            title: "What is the web?",
            description: "High-level overview.",
            youtubeUrl: "https://www.youtube.com/watch?v=DHv8lS8dbQE",
            orderIndex: 0,
            durationSeconds: 600,
          },
          {
            title: "How browsers work",
            description: "Rendering pipeline basics.",
            youtubeUrl: "https://www.youtube.com/watch?v=0IsGOhfCy0g",
            orderIndex: 1,
            durationSeconds: 900,
          },
        ],
      },
    },
  });

  await prisma.section.create({
    data: {
      subjectId: subject.id,
      title: "Next steps",
      orderIndex: 1,
      videos: {
        create: [
          {
            title: "Developer tools",
            description: "Using DevTools effectively.",
            youtubeUrl: "https://www.youtube.com/watch?v=wcFzf6nNWBA",
            orderIndex: 0,
            durationSeconds: 720,
          },
        ],
      },
    },
  });

  console.info("Seed OK:", { user: user.email, subject: subject.slug, demoPassword: demoPass });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
