// server/src/routes/admin.ts
import { Router } from "express";
import { store } from "../store";

const router = Router();

function buildMetrics() {
  console.log("📊 Building admin metrics...");
  
  const schedules = store.schedules || [];
  const users = store.users || [];
  const reports = store.reports || [];
  
  console.log(`📊 Current counts: ${schedules.length} schedules, ${users.length} users, ${reports.length} reports`);
  
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  
  // Calculate totals
  const totals = {
    users: users.length,
    schedules: schedules.length,
    reportsOpen: reports.filter((r) => r.status === "open").length,
    reactionsUp: schedules.reduce((sum, s) => sum + (s.reactions?.up || 0), 0),
    reactionsDown: schedules.reduce((sum, s) => sum + (s.reactions?.down || 0), 0),
    comments: schedules.reduce((sum, s) => sum + (s.commentsCount || 0), 0),
    newSchedules24h: schedules.filter((s) => {
      const createdTime = new Date(s.createdAt).getTime();
      return createdTime >= dayAgo;
    }).length,
  };
  
  // Top colleges and majors
  const collegeCount: Record<string, number> = {};
  const majorCount: Record<string, number> = {};
  
  schedules.forEach(s => {
    if (s.collegeSlug) {
      collegeCount[s.collegeSlug] = (collegeCount[s.collegeSlug] || 0) + 1;
    }
    if (s.major) {
      majorCount[s.major] = (majorCount[s.major] || 0) + 1;
    }
  });
  
  const topColleges = Object.entries(collegeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  const topMajors = Object.entries(majorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  // Recent schedules
  const recent = schedules
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((s) => ({
      id: s.id,
      title: s.title || "Untitled",
      college: s.collegeSlug || "Unknown",
      major: s.major || "Unknown",
      level: s.level || "Unknown",
      up: s.reactions?.up || 0,
      down: s.reactions?.down || 0,
      comments: s.commentsCount || 0,
      createdAt: new Date(s.createdAt).getTime(),
    }));
  
  // Open reports
  const openReports = reports
    .filter((r) => r.status === "open")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10)
    .map(r => ({
      id: r.id,
      scheduleId: r.scheduleId,
      reason: r.reason,
      createdAt: r.createdAt
    }));
  
  const server = {
    uptimeSec: Math.round(process.uptime()),
    rssMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    node: process.version,
    env: process.env.NODE_ENV || "development",
  };
  
  const result = { totals, topColleges, topMajors, recent, openReports, server };
  console.log("📊 Metrics result:", JSON.stringify(result, null, 2));
  
  return result;
}

router.get("/dev-metrics", (_req, res) => {
  console.log("📊 Dev metrics requested");
  try {
    const metrics = buildMetrics();
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    console.log("📊 Sending metrics response");
    res.json(metrics);
  } catch (error) {
    console.error("❌ Error in dev-metrics:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

router.get("/metrics", (_req, res) => {
  console.log("📊 Metrics requested");
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.json(buildMetrics());
});

export default router;