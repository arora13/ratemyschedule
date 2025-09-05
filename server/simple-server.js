import express from 'express';
import multer from 'multer';
const app = express();
const port = 4000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload handling
app.post('/api/upload', upload.single('schedule'), (req, res) => {
  console.log("📁 Upload request received!");
  console.log("📄 File:", req.file);
  console.log("📝 Body:", req.body);
  
  // Mock successful upload response - matches frontend expectations
  res.json({
    success: true,
    events: [
      {
        title: "Introduction to Programming",
        day_of_week: 1,
        start_time: "09:00",
        end_time: "10:30",
        location: "CS Building 101"
      },
      {
        title: "English Composition", 
        day_of_week: 1,
        start_time: "15:00",
        end_time: "16:30",
        location: "Humanities 150"
      },
      {
        title: "Calculus II",
        day_of_week: 2,
        start_time: "08:00", 
        end_time: "09:30",
        location: "Math Building 112"
      },
      {
        title: "Data Structures",
        day_of_week: 3,
        start_time: "11:00",
        end_time: "12:30", 
        location: "Engineering Hall 205"
      }
    ]
  });
});

// Simple data
const data = {
  schedules: 3,
  users: 0,
  upvotes: 4,
  downvotes: 0,
  comments: 0,
  reports: 0
};

// Sample schedules data
const schedules = [
  {
    id: "uxdfqeto",
    title: "Fall 2024 Schedule",
    collegeSlug: "sjsu",
    major: "electrical engineering",
    level: "junior",
    reactions: { up: 1, down: 0 },
    commentsCount: 0,
    createdAt: "2025-08-22T04:45:07.434Z"
  },
  {
    id: "ix8mm8ra", 
    title: "Fresh Test Schedule",
    collegeSlug: "asu",
    major: "computer science", 
    level: "sophomore",
    reactions: { up: 1, down: 0 },
    commentsCount: 0,
    createdAt: "2025-08-22T04:41:01.847Z"
  },
  {
    id: "kgdm74fs",
    title: "Fall 2024 Schedule", 
    collegeSlug: "asu",
    major: "business",
    level: "junior",
    reactions: { up: 2, down: 0 },
    commentsCount: 0,
    createdAt: "2025-08-22T04:32:08.831Z"
  }
];

// Simple admin dashboard
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Admin Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }
        .card { background: #2a2a2a; padding: 20px; margin: 10px; border-radius: 8px; display: inline-block; min-width: 150px; }
        .number { font-size: 2em; font-weight: bold; color: #4CAF50; }
        .label { color: #ccc; }
      </style>
    </head>
    <body>
      <h1>✅ WORKING ADMIN DASHBOARD</h1>
      <div class="card">
        <div class="label">SCHEDULES</div>
        <div class="number">${data.schedules}</div>
      </div>
      <div class="card">
        <div class="label">UPVOTES</div>
        <div class="number">${data.upvotes}</div>
      </div>
      <div class="card">
        <div class="label">USERS</div>
        <div class="number">${data.users}</div>
      </div>
      <div class="card">
        <div class="label">COMMENTS</div>
        <div class="number">${data.comments}</div>
      </div>
      <p>✅ This dashboard shows REAL NUMBERS, not dashes!</p>
      <p>🌐 Backend is working on port ${port}</p>
    </body>
    </html>
  `);
});

// API routes for frontend
app.get('/api/feed', (req, res) => {
  res.json({
    items: schedules,
    total: schedules.length,
    page: 1,
    limit: 50
  });
});

app.post('/api/schedules', (req, res) => {
  const newSchedule = {
    id: Math.random().toString(36).substr(2, 8),
    title: req.body.title || "New Schedule",
    collegeSlug: req.body.collegeSlug || "unknown",
    major: req.body.major || "unknown", 
    level: req.body.level || "unknown",
    reactions: { up: 0, down: 0 },
    commentsCount: 0,
    createdAt: new Date().toISOString()
  };
  
  schedules.push(newSchedule);
  data.schedules = schedules.length;
  
  res.status(201).json(newSchedule);
});

app.post('/api/schedules/:id/react', (req, res) => {
  const schedule = schedules.find(s => s.id === req.params.id);
  if (schedule) {
    if (req.body.kind === 'up') {
      schedule.reactions.up++;
      data.upvotes++;
    } else if (req.body.kind === 'down') {
      schedule.reactions.down++;
      data.downvotes++;
    }
  }
  res.json({ success: true });
});

app.get('/api/admin/dev-metrics', (req, res) => {
  res.json({
    totals: {
      users: data.users,
      schedules: data.schedules,
      reportsOpen: data.reports,
      reactionsUp: data.upvotes,
      reactionsDown: data.downvotes,
      comments: data.comments,
      newSchedules24h: data.schedules
    },
    topColleges: [
      { name: "asu", count: 2 },
      { name: "sjsu", count: 1 }
    ],
    topMajors: [
      { name: "electrical engineering", count: 1 },
      { name: "computer science", count: 1 },
      { name: "business", count: 1 }
    ],
    recent: schedules.slice(0, 10),
    openReports: [],
    server: {
      uptimeSec: Math.round(process.uptime()),
      rssMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      node: process.version,
      env: "development"
    }
  });
});

// Test upload page
app.get('/test', (req, res) => {
  res.sendFile('/Users/arjunarora/ratemyschedule/server/test-upload.html');
});

app.listen(port, () => {
  console.log(`✅ SIMPLE BACKEND RUNNING ON http://localhost:${port}/admin`);
  console.log(`📊 Shows: ${data.schedules} schedules, ${data.upvotes} upvotes`);
  console.log(`🌐 API routes: /api/feed, /api/schedules, /api/admin/dev-metrics`);
  console.log(`🧪 Test upload page: http://localhost:${port}/test`);
});
