import { Router } from "express";
import rateLimit from "express-rate-limit";
import { reportCreateSchema, reportResolveSchema } from "../validation";
import { requireAdmin } from "../auth";
import { store } from "../store";

type Report = {
  id: string;
  targetType: "schedule" | "comment";
  targetId: string;
  reason: string;
  status: "open" | "closed";
  createdAt: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const r = Router();

/**
 * POST /api/reports
 * body: { targetType, targetId, reason }
 */
r.post("/", limiter, (req, res) => {
  const parsed = reportCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const rep: Report = {
    id: uid(),
    ...parsed.data,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  store.addReport({
    id: rep.id,
    scheduleId: rep.targetType === "schedule" ? rep.targetId : "",
    reason: rep.reason,
    status: "open",
    createdAt: Date.now()
  });
  res.status(201).json({ ok: true, report: rep });
});

/**
 * GET /api/reports  (admin)
 */
r.get("/", requireAdmin, (_req, res) => {
  res.json({ items: store.reports });
});

/**
 * POST /api/reports/:id/resolve  (admin)
 * body: { action: "close" | "delete-target" }
 */
r.post("/:id/resolve", requireAdmin, (req, res) => {
  const parsed = reportResolveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const rep = store.reports.find((x) => x.id === req.params.id);
  if (!rep) return res.status(404).json({ error: "not found" });

  if (parsed.data.action === "delete-target") {
    const s = store.schedules.find((x) => x.id === rep.scheduleId);
    if (s && !s.deletedAt) {
      s.deletedAt = new Date().toISOString();
      store.updateSchedule(rep.scheduleId, s);
    }
  }

  store.updateReport(req.params.id, { status: "resolved" });
  res.json({ ok: true, report: rep });
});

export default r;
