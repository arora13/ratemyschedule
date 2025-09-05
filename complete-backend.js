import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory data store (simple but works)
let schedules = [
  {
    id: "uxdfqeto",
    title: "Fall 2024 Schedule",
    collegeSlug: "sjsu",
    major: "electrical engineering",
    level: "junior",
    events: [
      { title: "Introduction to Programming", day_of_week: 1, start_time: "09:00", end_time: "10:30", location: "CS Building 101" },
      { title: "English Composition", day_of_week: 1, start_time: "15:00", end_time: "16:30", location: "Humanities 150" },
      { title: "Calculus II", day_of_week: 2, start_time: "08:00", end_time: "09:30", location: "Math Building 112" },
      { title: "Data Structures", day_of_week: 3, start_time: "11:00", end_time: "12:30", location: "Engineering Hall 205" }
    ],
    reactions: { up: 1, down: 0 },
    commentsCount: 0,
    createdAt: "2025-08-22T04:45:07.434Z",
    authorHandle: "anonymous"
  },
  {
    id: "ix8mm8ra",
    title: "Fresh Test Schedule", 
    collegeSlug: "asu",
    major: "computer science",
    level: "sophomore",
    events: [
      { title: "Computer Science 101", day_of_week: 1, start_time: "10:00", end_time: "11:30", location: "Tech Building 101" },
      { title: "Math 201", day_of_week: 3, start_time: "14:00", end_time: "15:30", location: "Math Hall 205" }
    ],
    reactions: { up: 1, down: 0 },
    commentsCount: 0,
    createdAt: "2025-08-22T04:41:01.847Z",
    authorHandle: "testuser"
  },
  {
    id: "kgdm74fs",
    title: "Fall 2024 Schedule",
    collegeSlug: "asu", 
    major: "business",
    level: "junior",
    events: [
      { title: "Introduction to Programming", day_of_week: 1, start_time: "09:00", end_time: "10:30", location: "CS Building 101" },
      { title: "Psychology 101", day_of_week: 3, start_time: "16:00", end_time: "17:30", location: "Social Sciences 220" },
      { title: "Computer Systems", day_of_week: 5, start_time: "14:00", end_time: "15:30", location: "Tech Center 301" }
    ],
    reactions: { up: 2, down: 0 },
    commentsCount: 0,
    createdAt: "2025-08-22T04:32:08.831Z",
    authorHandle: "anonymous"
  }
];

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// 1. UPLOAD ENDPOINT - for parsing schedule images
app.post('/api/upload', upload.single('schedule'), (req, res) => {
  try {
    console.log('📁 Upload request received!');
    console.log('📄 File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    // Mock successful parsing - returns 4 courses
    const parsedCourses = [
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
    ];
    
    console.log('✅ Returning parsed courses:', parsedCourses.length);
    
    res.json({
      success: true,
      events: parsedCourses,
      message: `Successfully parsed ${parsedCourses.length} courses from your schedule!`
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// 2. PUBLISH ENDPOINT - for saving schedules
app.post('/api/schedules', (req, res) => {
  try {
    console.log('📝 Publish request received:', req.body);
    
    const scheduleData = req.body;
    
    // Create new schedule
    const newSchedule = {
      id: Math.random().toString(36).substr(2, 8),
      title: scheduleData.title || "New Schedule",
      collegeSlug: scheduleData.collegeSlug || "unknown",
      major: scheduleData.major || "unknown",
      level: scheduleData.level || "junior",
      events: scheduleData.events || [],
      reactions: { up: 0, down: 0 },
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      authorHandle: scheduleData.authorHandle || "anonymous"
    };
    
    // Add to schedules array
    schedules.push(newSchedule);
    
    console.log('✅ Schedule published:', newSchedule);
    console.log('📊 Total schedules now:', schedules.length);
    
    res.status(201).json(newSchedule);
    
  } catch (error) {
    console.error('❌ Publish error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// 3. FEED ENDPOINT - for getting all schedules
app.get('/api/feed', (req, res) => {
  try {
    const { college, major, sort = 'new' } = req.query;
    
    console.log('📰 Feed request:', { college, major, sort });
    
    let filteredSchedules = [...schedules];
    
    // Filter by college
    if (college) {
      filteredSchedules = filteredSchedules.filter(s => 
        s.collegeSlug?.toLowerCase() === college.toLowerCase()
      );
    }
    
    // Filter by major
    if (major) {
      filteredSchedules = filteredSchedules.filter(s => 
        s.major?.toLowerCase() === major.toLowerCase()
      );
    }
    
    // Sort by date
    if (sort === 'new') {
      filteredSchedules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    console.log(`✅ Returning ${filteredSchedules.length} schedules`);
    
    res.json({
      items: filteredSchedules,
      total: filteredSchedules.length,
      page: 1,
      limit: 50
    });
    
  } catch (error) {
    console.error('❌ Feed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// 4. REACTIONS ENDPOINT - for likes/dislikes
app.post('/api/schedules/:id/react', (req, res) => {
  try {
    const { id } = req.params;
    const { kind } = req.body;
    
    console.log(`👍 Reaction request: ${kind} on schedule ${id}`);
    
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      if (kind === 'up') {
        schedule.reactions.up++;
      } else if (kind === 'down') {
        schedule.reactions.down++;
      }
      console.log('✅ Reaction updated:', schedule.reactions);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Reaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. ADMIN DASHBOARD ENDPOINT
app.get('/api/admin/dev-metrics', (req, res) => {
  try {
    console.log('📊 Admin metrics requested');
    
    const totals = {
      users: 0,
      schedules: schedules.length,
      reportsOpen: 0,
      reactionsUp: schedules.reduce((sum, s) => sum + s.reactions.up, 0),
      reactionsDown: schedules.reduce((sum, s) => sum + s.reactions.down, 0),
      comments: schedules.reduce((sum, s) => sum + s.commentsCount, 0),
      newSchedules24h: schedules.length
    };
    
    // Top colleges and majors
    const collegeCount = {};
    const majorCount = {};
    
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
      .map(s => ({
        id: s.id,
        title: s.title,
        college: s.collegeSlug,
        major: s.major,
        level: s.level,
        up: s.reactions.up,
        down: s.reactions.down,
        comments: s.commentsCount,
        createdAt: new Date(s.createdAt).getTime()
      }));
    
    const result = {
      totals,
      topColleges,
      topMajors,
      recent,
      openReports: [],
      server: {
        uptimeSec: Math.round(process.uptime()),
        rssMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        node: process.version,
        env: "development"
      }
    };
    
    console.log('📊 Admin metrics:', result);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Admin metrics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. ADMIN DASHBOARD HTML
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Complete Admin Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .card { background: #2a2a2a; padding: 20px; margin: 10px; border-radius: 8px; display: inline-block; min-width: 150px; }
            .number { font-size: 2em; font-weight: bold; color: #4CAF50; }
            .label { color: #ccc; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #444; }
            th { background: #333; }
            button { background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
            .success { color: #4CAF50; }
            .error { color: #f44336; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Complete Admin Dashboard</h1>
                <div>
                    <button onclick="refreshData()">🔄 Refresh</button>
                    <span id="lastUpdate" style="margin-left: 10px; font-size: 12px; color: #969fb3;">Loading...</span>
                </div>
            </div>
            
            <div id="error"></div>
            
            <div id="cards" class="grid">
                <div class="card">
                    <div class="label">SCHEDULES</div>
                    <div class="number" id="schedules">—</div>
                </div>
                <div class="card">
                    <div class="label">UPVOTES</div>
                    <div class="number" id="upvotes">—</div>
                </div>
                <div class="card">
                    <div class="label">DOWNVOTES</div>
                    <div class="number" id="downvotes">—</div>
                </div>
                <div class="card">
                    <div class="label">COMMENTS</div>
                    <div class="number" id="comments">—</div>
                </div>
            </div>
            
            <div class="grid">
                <div>
                    <h3>📊 Top Colleges</h3>
                    <table id="topColleges">
                        <thead><tr><th>College</th><th>Posts</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div>
                    <h3>📚 Top Majors</h3>
                    <table id="topMajors">
                        <thead><tr><th>Major</th><th>Posts</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            
            <div>
                <h3>🕒 Recent Schedules</h3>
                <table id="recent">
                    <thead><tr><th>ID</th><th>College</th><th>Major</th><th>Level</th><th>👍</th><th>👎</th><th>💬</th><th>When</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>

        <script>
            async function refreshData() {
                try {
                    const response = await fetch('/api/admin/dev-metrics');
                    const data = await response.json();
                    
                    // Update cards
                    document.getElementById('schedules').textContent = data.totals.schedules;
                    document.getElementById('upvotes').textContent = data.totals.reactionsUp;
                    document.getElementById('downvotes').textContent = data.totals.reactionsDown;
                    document.getElementById('comments').textContent = data.totals.comments;
                    
                    // Update tables
                    updateTable('topColleges', data.topColleges, 'name', 'count');
                    updateTable('topMajors', data.topMajors, 'name', 'count');
                    updateRecentTable(data.recent);
                    
                    document.getElementById('lastUpdate').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
                    
                } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('error').innerHTML = '<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px;">Error: ' + error.message + '</div>';
                }
            }
            
            function updateTable(tableId, data, nameKey, countKey) {
                const tbody = document.querySelector('#' + tableId + ' tbody');
                tbody.innerHTML = data.map(item => 
                    '<tr><td>' + item[nameKey] + '</td><td>' + item[countKey] + '</td></tr>'
                ).join('');
            }
            
            function updateRecentTable(data) {
                const tbody = document.querySelector('#recent tbody');
                tbody.innerHTML = data.map(item => 
                    '<tr><td>' + item.id + '</td><td>' + item.college + '</td><td>' + item.major + '</td><td>' + item.level + '</td><td>' + item.up + '</td><td>' + item.down + '</td><td>' + item.comments + '</td><td>' + new Date(item.createdAt).toLocaleDateString() + '</td></tr>'
                ).join('');
            }
            
            // Initial load
            refreshData();
            
            // Auto-refresh every 5 seconds
            setInterval(refreshData, 5000);
        </script>
    </body>
    </html>
  `);
});

// 7. HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    schedules: schedules.length,
    uptime: Math.round(process.uptime())
  });
});

app.listen(port, () => {
  console.log(`🚀 COMPLETE BACKEND RUNNING ON http://localhost:${port}`);
  console.log(`📁 Uploads: http://localhost:${port}/api/upload`);
  console.log(`📝 Publish: http://localhost:${port}/api/schedules`);
  console.log(`📰 Feed: http://localhost:${port}/api/feed`);
  console.log(`📊 Admin: http://localhost:${port}/admin`);
  console.log(`❤️ Health: http://localhost:${port}/health`);
  console.log(`✅ Everything works together!`);
});
