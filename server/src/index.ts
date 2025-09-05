// server/src/index.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import adminRouter from "./routes/admin";
import schedulesRouter from "./routes/schedules";
import reportsRouter from "./routes/reports";
import contactRouter from "./routes/contact";
import feedRouter from "./routes/feed";
import usersRouter from "./routes/users";
import uploadRouter from "./routes/upload";
import { signToken } from "./auth";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/auth/dev-admin-token", (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "disabled in production" });
  }
  const token = signToken({ uid: "dev-admin", role: "ADMIN" });
  res.json({ token });
});

app.use("/api/schedules", schedulesRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRouter);
app.use("/api/feed", feedRouter);
app.use("/api/users", usersRouter);
app.use("/api/upload", uploadRouter);

// ----------- prettier admin dashboard -----------
app.get("/admin", (_req, res) => {
  const endpoint =
    process.env.NODE_ENV === "production"
      ? "/api/admin/metrics"
      : "/api/admin/dev-metrics";

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>admin dashboard</title>
<style>
  :root { --bg:#0b0c10; --card:#111318; --muted:#969fb3; --fg:#e6e9ef; --accent:#6ea8fe; --bad:#ff6b6b; --good:#52d273; }
  html,body{margin:0;padding:0;background:var(--bg);color:var(--fg);font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto;}
  .wrap{max-width:1100px;margin:32px auto;padding:0 16px;}
  h1{margin:0 0 16px;font-size:28px}
  .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
  .card{background:var(--card);border:1px solid #21232d;border-radius:10px;padding:14px}
  .k{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
  .v{font-size:24px;font-weight:700;margin-top:4px}
  .ok{color:var(--good)} .bad{color:var(--bad)}
  table{width:100%;border-collapse:collapse}
  th,td{padding:8px;border-bottom:1px solid #222735;color:#cdd3e0}
  th{color:#8d95a8;text-align:left;font-weight:600;font-size:12px;text-transform:uppercase}
  section{margin-top:16px}
  a{color:var(--accent);text-decoration:none}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}
</style>
</head>
<body>
<div class="wrap">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h1>admin dashboard</h1>
    <div>
      <button id="refreshBtn" style="padding: 8px 16px; background: #6ea8fe; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px;">🔄 Refresh</button>
      <span id="lastUpdate" style="font-size: 12px; color: #969fb3;">Loading...</span>
    </div>
  </div>
  <div id="error"></div>

  <div class="grid" id="cards">
    <div class="card"><div class="k">users</div><div class="v" id="users">—</div></div>
    <div class="card"><div class="k">schedules</div><div class="v" id="schedules">—</div></div>
    <div class="card"><div class="k">open reports</div><div class="v bad" id="reportsOpen">—</div></div>
    <div class="card"><div class="k">24h new schedules</div><div class="v ok" id="new24h">—</div></div>
  </div>

  <div class="grid" style="margin-top:12px">
    <div class="card"><div class="k">reactions (up)</div><div class="v" id="up">—</div></div>
    <div class="card"><div class="k">reactions (down)</div><div class="v" id="down">—</div></div>
    <div class="card"><div class="k">comments</div><div class="v" id="comments">—</div></div>
    <div class="card"><div class="k">server</div>
      <div class="mono" id="server">—</div>
    </div>
  </div>

  <section class="two">
    <div class="card">
      <div class="k">top colleges</div>
      <table id="topColleges"><thead><tr><th>college</th><th>posts</th></tr></thead><tbody></tbody></table>
    </div>
    <div class="card">
      <div class="k">top majors</div>
      <table id="topMajors"><thead><tr><th>major</th><th>posts</th></tr></thead><tbody></tbody></table>
    </div>
  </section>

  <section class="two">
    <div class="card">
      <div class="k">recent schedules</div>
      <table id="recent"><thead><tr><th>id</th><th>college</th><th>major</th><th>level</th><th>👍</th><th>👎</th><th>💬</th><th>when</th></tr></thead><tbody></tbody></table>
    </div>
    <div class="card">
      <div class="k">open reports</div>
      <table id="reports"><thead><tr><th>id</th><th>schedule</th><th>reason</th><th>age</th></tr></thead><tbody></tbody></table>
    </div>
  </section>
</div>

<script>
(async function(){
  const fmtAgo = (ms) => {
    const s = Math.floor((Date.now()-ms)/1000);
    if (s < 60) return s+"s";
    const m = Math.floor(s/60); if (m < 60) return m+"m";
    const h = Math.floor(m/60); if (h < 24) return h+"h";
    const d = Math.floor(h/24); return d+"d";
  };

  const updateDashboard = async () => {
    try {
      console.log("🔄 Refreshing dashboard data...");
      
      // Use absolute URL to avoid any path issues
      const url = window.location.origin + "/api/admin/dev-metrics?" + Date.now();
      console.log("Fetching from:", url);
      
      const r = await fetch(url);
      console.log("Response status:", r.status);
      
      if (!r.ok) {
        throw new Error("HTTP " + r.status + ": " + r.statusText);
      }
      
      const j = await r.json();
      console.log("📊 Dashboard data:", j);

      // Update cards with fallbacks
      document.getElementById("users").textContent = j.totals?.users || "0";
      document.getElementById("schedules").textContent = j.totals?.schedules || "0";
      document.getElementById("reportsOpen").textContent = j.totals?.reportsOpen || "0";
      document.getElementById("new24h").textContent = j.totals?.newSchedules24h || "0";
      document.getElementById("up").textContent = (j.totals?.reactionsUp || 0).toLocaleString();
      document.getElementById("down").textContent = (j.totals?.reactionsDown || 0).toLocaleString();
      document.getElementById("comments").textContent = (j.totals?.comments || 0).toLocaleString();
      document.getElementById("server").textContent = j.server ? 
        "node " + j.server.node + " | " + j.server.env + " | " + j.server.rssMB + " MB rss | " + j.server.uptimeSec + "s uptime" :
        "No server info";

      // Top tables with error handling
      const fill = (id, rows, label="name") => {
        const tb = document.querySelector("#"+id+" tbody");
        if (tb) {
          if (rows && rows.length > 0) {
            tb.innerHTML = rows.map(r => "<tr><td>"+r[label]+"</td><td>"+r.count+"</td></tr>").join("");
          } else {
            tb.innerHTML = "<tr><td colspan='2'>No data</td></tr>";
          }
        }
      };
      fill("topColleges", j.topColleges);
      fill("topMajors", j.topMajors);

      // Recent schedules
      const recentTbody = document.querySelector("#recent tbody");
      if (recentTbody) {
        if (j.recent && j.recent.length > 0) {
          recentTbody.innerHTML = j.recent.map(r => (
            "<tr>"+
            "<td>"+r.id+"</td>"+
            "<td>"+r.college+"</td>"+
            "<td>"+r.major+"</td>"+
            "<td>"+r.level+"</td>"+
            "<td>"+r.up+"</td>"+
            "<td>"+r.down+"</td>"+
            "<td>"+r.comments+"</td>"+
            "<td>"+fmtAgo(r.createdAt)+"</td>"+
            "</tr>"
          )).join("");
        } else {
          recentTbody.innerHTML = "<tr><td colspan='8'>No recent schedules</td></tr>";
        }
      }

      // Reports
      const reportsTbody = document.querySelector("#reports tbody");
      if (reportsTbody) {
        if (j.openReports && j.openReports.length > 0) {
          reportsTbody.innerHTML = j.openReports.map(r => (
            "<tr>"+
            "<td>"+r.id+"</td>"+
            "<td>"+r.scheduleId+"</td>"+
            "<td>"+r.reason+"</td>"+
            "<td>"+fmtAgo(r.createdAt)+"</td>"+
            "</tr>"
          )).join("");
        } else {
          reportsTbody.innerHTML = "<tr><td colspan='4'>No open reports</td></tr>";
        }
      }
      
      // Update timestamp
      const lastUpdate = document.querySelector("#lastUpdate");
      if (lastUpdate) {
        lastUpdate.textContent = "Last updated: " + new Date().toLocaleTimeString();
      }

    } catch (e) {
      console.error("Dashboard update error:", e);
      const errorDiv = document.getElementById("error");
      if (errorDiv) {
        errorDiv.innerHTML = "<div style='color: red; margin: 10px; padding: 10px; border: 1px solid red; border-radius: 4px;'>Error: " + String(e) + "</div>";
      }
      
      // Show error in timestamp too
      const lastUpdate = document.querySelector("#lastUpdate");
      if (lastUpdate) {
        lastUpdate.textContent = "Error: " + String(e);
      }
    }
  };
  
  // Initial load
  updateDashboard();
  
  // Auto-refresh every 3 seconds
  setInterval(updateDashboard, 3000);
  
  // Add manual refresh button
  document.querySelector("#refreshBtn").addEventListener("click", updateDashboard);
})();
</script>
</body>
</html>`);
});

// catch-all non-/api GET
app.get(/^\/(?!api\/).*$/, (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><html><body style="font-family:system-ui">
    <h1>RateMySchedule API</h1>
    <p>✅ server is running.</p>
    <ul>
      <li><a href="/health">/health</a></li>
      <li><a href="/admin">/admin</a></li>
      <li><a href="/api/admin/dev-metrics">/api/admin/dev-metrics</a> (dev)</li>
    </ul>
  </body></html>`);
});

// /api 404
app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));

// boot
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`api running  ➜  http://localhost:${port}`);
  console.log(`dashboard    ➜  http://localhost:${port}/admin`);
});
