const { z } = require("zod");

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

// ─── Task Schemas ─────────────────────────────────────────────────────────────

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const VALID_TAGS = ["College", "Internship", "Coding", "Design", "Personal", "Meeting", "Other"];

const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must not exceed 200 characters"),
  description: z.string().trim().max(2000, "Description too long").optional(),
  status: z.enum(VALID_STATUSES).optional().default("PENDING"),
  priority: z.enum(VALID_PRIORITIES).optional().default("MEDIUM"),
  dueDate: z
    .string()
    .datetime({ message: "Due date must be a valid ISO 8601 date string" })
    .optional()
    .nullable(),
  tags: z
    .array(z.string().trim().min(1))
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .default([]),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(VALID_STATUSES).optional(),
  priority: z.enum(VALID_PRIORITIES).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string().trim().min(1)).max(10).optional(),
});

const aiSuggestSchema = z.object({
  input: z
    .string({ required_error: "Input is required" })
    .trim()
    .min(3, "Input must be at least 3 characters")
    .max(500, "Input too long"),
});

// ─── Time Log Schemas ─────────────────────────────────────────────────────────

const manualTimeLogSchema = z
  .object({
    taskId: z.string({ required_error: "Task ID is required" }).min(1),
    startTime: z
      .string({ required_error: "Start time is required" })
      .datetime({ message: "Start time must be a valid ISO 8601 datetime" }),
    endTime: z
      .string({ required_error: "End time is required" })
      .datetime({ message: "End time must be a valid ISO 8601 datetime" }),
  })
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    { message: "End time must be after start time", path: ["endTime"] }
  );

const updateTimeLogSchema = z
  .object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    { message: "End time must be after start time", path: ["endTime"] }
  );

module.exports = {
  signupSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
  aiSuggestSchema,
  manualTimeLogSchema,
  updateTimeLogSchema,
};
