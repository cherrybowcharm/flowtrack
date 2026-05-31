/**
 * Seed file — creates a demo user and sample tasks for development testing.
 * Run with: npm run db:seed
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing seed data
  await prisma.auditLog.deleteMany({});
  await prisma.timeLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({ where: { email: "demo@example.com" } });

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      passwordHash,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        userId: user.id,
        title: "Set up project architecture",
        description: "Initialise the monorepo structure with separate frontend and backend packages.",
        status: "COMPLETED",
        priority: "HIGH",
        tags: ["Coding", "Internship"],
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: "Design database schema",
        description: "Create Prisma schema with User, Task, TimeLog, and AuditLog models.",
        status: "COMPLETED",
        priority: "HIGH",
        tags: ["Coding", "Design"],
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: "Build authentication API",
        description: "Implement JWT-based auth with HTTP-only cookies and bcrypt hashing.",
        status: "IN_PROGRESS",
        priority: "URGENT",
        tags: ["Coding"],
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: "Write API documentation",
        description: "Document all REST endpoints with request/response examples.",
        status: "PENDING",
        priority: "MEDIUM",
        tags: ["Internship"],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: "Prepare project presentation",
        description: "Create slides covering architecture, features, and live demo flow.",
        status: "PENDING",
        priority: "URGENT",
        tags: ["College", "Personal"],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);

  // Add some time logs for today (for summary testing)
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(9, 0, 0, 0);

  await prisma.timeLog.createMany({
    data: [
      {
        userId: user.id,
        taskId: tasks[0].id,
        startTime: new Date(todayStart.getTime()),
        endTime: new Date(todayStart.getTime() + 45 * 60 * 1000),
        durationSeconds: 45 * 60,
        source: "TIMER",
      },
      {
        userId: user.id,
        taskId: tasks[1].id,
        startTime: new Date(todayStart.getTime() + 60 * 60 * 1000),
        endTime: new Date(todayStart.getTime() + 2 * 60 * 60 * 1000),
        durationSeconds: 60 * 60,
        source: "TIMER",
      },
      {
        userId: user.id,
        taskId: tasks[2].id,
        startTime: new Date(todayStart.getTime() + 3 * 60 * 60 * 1000),
        endTime: new Date(todayStart.getTime() + 4.5 * 60 * 60 * 1000),
        durationSeconds: 1.5 * 60 * 60,
        source: "MANUAL",
      },
    ],
  });

  console.log("✅ Created time logs for today");
  console.log("\n📋 Demo credentials:");
  console.log("   Email:    demo@example.com");
  console.log("   Password: password123");
  console.log("\n✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
