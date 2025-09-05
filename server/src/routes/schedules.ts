// server/src/routes/schedules.ts
import { Router } from "express";
import { scheduleCreateSchema, reactionSchema } from "../validation";
import { requireAdmin } from "../auth";
import { store } from "../store"; // <-- single source of truth

// ----- Types this route uses -----
export type EventIn = {
  title: string;
  day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
  location?: string;
  color?: string;
};

export type Schedule = {
  id: string;
  title?: string;
  term: string;
  events: EventIn[];
  collegeSlug: string;
  major: string;
  level: "freshman" | "sophomore" | "junior" | "senior";
  authorHandle?: string;
  reactions: { up: number; down: number };
  commentsCount: number;
  createdAt: string; // ISO string
  deletedAt?: string | null;
};

// Tiny uid
const uid = () => Math.random().toString(36).slice(2, 10);

const r = Router();

/**
 * GET /api/schedules
 * Filters: ?college=<slug>&major=...&level=...&sort=new|trending
 */
r.get("/", (req, res) => {
  const college = (req.query.college as string) || (req.query.school as string) || "";
  const major = (req.query.major as string) || "";
  const level = (req.query.level as string) || "";
  const sort = ((req.query.sort as string) || "new").toLowerCase();

  let items = store.schedules.filter((s) => !s.deletedAt);

  if (college) items = items.filter((s) => s.collegeSlug === college);
  if (major) items = items.filter((s) => s.major.toLowerCase() === major.toLowerCase());
  if (level) items = items.filter((s) => s.level === level);

  if (sort === "trending") {
    items.sort(
      (a, b) => (b.reactions.up - b.reactions.down) - (a.reactions.up - a.reactions.down)
    );
  } else {
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  res.json({ items });
});

/**
 * GET /api/schedules/:id
 */
r.get("/:id", (req, res) => {
  const s = store.schedules.find((x) => x.id === req.params.id && !x.deletedAt);
  if (!s) return res.status(404).json({ error: "not found" });
  res.json(s);
});

/**
 * POST /api/schedules
 * Body must satisfy scheduleCreateSchema
 */
r.post("/", (req, res) => {
  const parsed = scheduleCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data;

  // Extract user info from token if available
  let userId = undefined;
  let authorHandle = data.authorHandle || "anonymous";
  
  try {
    const header = req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (token) {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me") as any;
      userId = decoded.uid;
      
      // Get user's handle if authenticated
      const user = store.users.find(u => u.id === userId);
      if (user) {
        authorHandle = user.handle;
      }
    }
  } catch (e) {
    // Token invalid or missing - continue as anonymous
  }

  const schedule: Schedule = {
    id: uid(),
    title: data.title,
    term: data.term,
    events: data.events as EventIn[],
    collegeSlug: data.collegeSlug,
    major: data.major,
    level: data.level,
    authorHandle,
    userId,
    reactions: { up: 0, down: 0 },
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    deletedAt: null,
  };

  store.addSchedule(schedule);
  return res.status(201).json({ ok: true, schedule });
});

/**
 * POST /api/schedules/:id/react
 * Body: { kind: "up" | "down" }
 */
r.post("/:id/react", (req, res) => {
  const parsed = reactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const s = store.schedules.find((x) => x.id === req.params.id && !x.deletedAt);
  if (!s) return res.status(404).json({ error: "not found" });

  if (parsed.data.kind === "up") s.reactions.up += 1;
  else s.reactions.down += 1;

  store.updateSchedule(req.params.id, s);
  res.json({ ok: true, reactions: s.reactions });
});

/**
 * DELETE /api/schedules/:id  (admin only)
 */
r.delete("/:id", requireAdmin, (req, res) => {
  const s = store.schedules.find((x) => x.id === req.params.id && !x.deletedAt);
  if (!s) return res.status(404).json({ error: "not found" });
  s.deletedAt = new Date().toISOString();
  store.updateSchedule(req.params.id, s);
  res.json({ ok: true });
});

export default r;
