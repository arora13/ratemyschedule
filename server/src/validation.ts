import { z } from "zod";

// common helpers
export const idSchema = z.string().min(1);

// events inside a schedule
export const eventSchema = z.object({
  title: z.string().min(1),
  day_of_week: z.union([
    z.literal(1), z.literal(2), z.literal(3), z.literal(4),
    z.literal(5), z.literal(6), z.literal(7),
  ]),
  start_time: z.string().regex(/^\d{2}:\d{2}$/), // "09:00"
  end_time: z.string().regex(/^\d{2}:\d{2}$/),   // "10:15"
  location: z.string().optional(),
  color: z.string().optional(),
});

// schedule create
export const scheduleCreateSchema = z.object({
  title: z.string().optional(),
  term: z.string().min(1),
  events: z.array(eventSchema).min(1),
  collegeSlug: z.string().min(1),
  major: z.string().min(1),
  level: z.enum(["freshman", "sophomore", "junior", "senior"]),
  authorHandle: z.string().min(1).optional(),
});

// reaction body
export const reactionSchema = z.object({
  kind: z.enum(["up", "down"]),
});

// reporting inappropriate stuff
export const reportCreateSchema = z.object({
  targetType: z.enum(["schedule", "comment"]),
  targetId: idSchema,
  reason: z.string().min(3).max(500),
});

// resolve/close a report
export const reportResolveSchema = z.object({
  action: z.enum(["close", "delete-target"]).default("close"),
});

// contact form
export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  topic: z.string().min(1),
  message: z.string().min(5).max(2000),
});
