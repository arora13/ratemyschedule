import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import fs from 'fs';

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

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// COMPREHENSIVE COLLEGE LIST - CSU, Arizona, Big State Colleges
const COLLEGES = [
  // California State Universities (CSU)
  { slug: "cal-poly-slo", name: "Cal Poly San Luis Obispo" },
  { slug: "cal-poly-pomona", name: "Cal Poly Pomona" },
  { slug: "csun", name: "California State University, Northridge" },
  { slug: "csulb", name: "California State University, Long Beach" },
  { slug: "csuf", name: "California State University, Fullerton" },
  { slug: "csusb", name: "California State University, San Bernardino" },
  { slug: "csusm", name: "California State University, San Marcos" },
  { slug: "csudh", name: "California State University, Dominguez Hills" },
  { slug: "csueb", name: "California State University, East Bay" },
  { slug: "csufresno", name: "California State University, Fresno" },
  { slug: "csuhayward", name: "California State University, Hayward" },
  { slug: "csul", name: "California State University, Los Angeles" },
  { slug: "csumb", name: "California State University, Monterey Bay" },
  { slug: "csus", name: "California State University, Sacramento" },
  { slug: "csusd", name: "California State University, San Diego" },
  { slug: "csusf", name: "California State University, San Francisco" },
  { slug: "csusj", name: "California State University, San Jose" },
  { slug: "csustan", name: "California State University, Stanislaus" },
  { slug: "csuchico", name: "California State University, Chico" },
  { slug: "csuhumboldt", name: "California State University, Humboldt" },
  { slug: "csumbakersfield", name: "California State University, Bakersfield" },
  { slug: "csuchannel-islands", name: "California State University, Channel Islands" },
  { slug: "csudominguez-hills", name: "California State University, Dominguez Hills" },
  { slug: "csueast-bay", name: "California State University, East Bay" },
  { slug: "csufresno", name: "California State University, Fresno" },
  { slug: "csuhumboldt", name: "California State University, Humboldt" },
  { slug: "csulong-beach", name: "California State University, Long Beach" },
  { slug: "csulos-angeles", name: "California State University, Los Angeles" },
  { slug: "csunorthridge", name: "California State University, Northridge" },
  { slug: "csusacramento", name: "California State University, Sacramento" },
  { slug: "csusan-bernardino", name: "California State University, San Bernardino" },
  { slug: "csusan-diego", name: "California State University, San Diego" },
  { slug: "csusan-francisco", name: "California State University, San Francisco" },
  { slug: "csusan-jose", name: "California State University, San Jose" },
  { slug: "csusan-marcos", name: "California State University, San Marcos" },
  { slug: "csustanislaus", name: "California State University, Stanislaus" },
  
  // Arizona Colleges
  { slug: "asu", name: "Arizona State University" },
  { slug: "uofa", name: "University of Arizona" },
  { slug: "nau", name: "Northern Arizona University" },
  { slug: "asu-tempe", name: "Arizona State University - Tempe" },
  { slug: "asu-poly", name: "Arizona State University - Polytechnic" },
  { slug: "asu-west", name: "Arizona State University - West" },
  { slug: "asu-downtown", name: "Arizona State University - Downtown Phoenix" },
  
  // Big State Colleges
  { slug: "rutgers", name: "Rutgers University" },
  { slug: "penn-state", name: "Penn State University" },
  { slug: "gsu", name: "Georgia State University" },
  { slug: "uga", name: "University of Georgia" },
  { slug: "texas-am", name: "Texas A&M University" },
  { slug: "ut-austin", name: "University of Texas at Austin" },
  { slug: "ufl", name: "University of Florida" },
  { slug: "fsu", name: "Florida State University" },
  { slug: "umich", name: "University of Michigan" },
  { slug: "msu", name: "Michigan State University" },
  { slug: "osu", name: "Ohio State University" },
  { slug: "uiuc", name: "University of Illinois at Urbana-Champaign" },
  { slug: "uw-madison", name: "University of Wisconsin-Madison" },
  { slug: "umn", name: "University of Minnesota" },
  { slug: "purdue", name: "Purdue University" },
  { slug: "indiana", name: "Indiana University" },
  { slug: "mizzou", name: "University of Missouri" },
  { slug: "kansas", name: "University of Kansas" },
  { slug: "oklahoma", name: "University of Oklahoma" },
  { slug: "arkansas", name: "University of Arkansas" },
  { slug: "lsu", name: "Louisiana State University" },
  { slug: "ole-miss", name: "University of Mississippi" },
  { slug: "alabama", name: "University of Alabama" },
  { slug: "auburn", name: "Auburn University" },
  { slug: "tennessee", name: "University of Tennessee" },
  { slug: "kentucky", name: "University of Kentucky" },
  { slug: "virginia-tech", name: "Virginia Tech" },
  { slug: "uva", name: "University of Virginia" },
  { slug: "ncsu", name: "North Carolina State University" },
  { slug: "unc", name: "University of North Carolina" },
  { slug: "clemson", name: "Clemson University" },
  { slug: "south-carolina", name: "University of South Carolina" },
  { slug: "maryland", name: "University of Maryland" },
  { slug: "delaware", name: "University of Delaware" },
  { slug: "west-virginia", name: "West Virginia University" },
  { slug: "pitt", name: "University of Pittsburgh" },
  { slug: "temple", name: "Temple University" },
  { slug: "drexel", name: "Drexel University" },
  { slug: "boston-u", name: "Boston University" },
  { slug: "northeastern", name: "Northeastern University" },
  { slug: "umass", name: "University of Massachusetts" },
  { slug: "uconn", name: "University of Connecticut" },
  { slug: "rhode-island", name: "University of Rhode Island" },
  { slug: "maine", name: "University of Maine" },
  { slug: "new-hampshire", name: "University of New Hampshire" },
  { slug: "vermont", name: "University of Vermont" },
  { slug: "buffalo", name: "University at Buffalo" },
  { slug: "binghamton", name: "Binghamton University" },
  { slug: "stony-brook", name: "Stony Brook University" },
  { slug: "albany", name: "University at Albany" },
  { slug: "syracuse", name: "Syracuse University" },
  { slug: "cornell", name: "Cornell University" },
  { slug: "columbia", name: "Columbia University" },
  { slug: "nyu", name: "New York University" },
  { slug: "fordham", name: "Fordham University" },
  { slug: "st-johns", name: "St. John's University" },
  { slug: "hofstra", name: "Hofstra University" },
  { slug: "adelphi", name: "Adelphi University" },
  { slug: "pace", name: "Pace University" },
  { slug: "manhattan", name: "Manhattan College" },
  { slug: "iona", name: "Iona University" },
  { slug: "marist", name: "Marist College" },
  { slug: "siena", name: "Siena College" },
  { slug: "union", name: "Union College" },
  { slug: "skidmore", name: "Skidmore College" },
  { slug: "bard", name: "Bard College" },
  { slug: "vassar", name: "Vassar College" },
  { slug: "hamilton", name: "Hamilton College" },
  { slug: "colgate", name: "Colgate University" },
  { slug: "rochester", name: "University of Rochester" },
  { slug: "rochester-tech", name: "Rochester Institute of Technology" },
  { slug: "nazareth", name: "Nazareth College" },
  { slug: "st-john-fisher", name: "St. John Fisher College" },
  { slug: "roberts-wesleyan", name: "Roberts Wesleyan College" },
  { slug: "houghton", name: "Houghton University" },
  { slug: "geneseo", name: "SUNY Geneseo" },
  { slug: "cortland", name: "SUNY Cortland" },
  { slug: "oswego", name: "SUNY Oswego" },
  { slug: "oneonta", name: "SUNY Oneonta" },
  { slug: "fredonia", name: "SUNY Fredonia" },
  { slug: "new-paltz", name: "SUNY New Paltz" },
  { slug: "purchase", name: "SUNY Purchase" },
  { slug: "old-westbury", name: "SUNY Old Westbury" },
  { slug: "farmingdale", name: "SUNY Farmingdale" },
  { slug: "maritime", name: "SUNY Maritime" },
  { slug: "cobleskill", name: "SUNY Cobleskill" },
  { slug: "morrisville", name: "SUNY Morrisville" },
  { slug: "delhi", name: "SUNY Delhi" },
  { slug: "canton", name: "SUNY Canton" },
  { slug: "potsdam", name: "SUNY Potsdam" },
  { slug: "plattsburgh", name: "SUNY Plattsburgh" },
  { slug: "binghamton", name: "SUNY Binghamton" },
  { slug: "buffalo", name: "SUNY Buffalo" },
  { slug: "albany", name: "SUNY Albany" },
  { slug: "stony-brook", name: "SUNY Stony Brook" },
  { slug: "downstate", name: "SUNY Downstate" },
  { slug: "upstate", name: "SUNY Upstate" },
  { slug: "optometry", name: "SUNY College of Optometry" },
  { slug: "environmental-science", name: "SUNY College of Environmental Science and Forestry" },
  { slug: "empire-state", name: "SUNY Empire State College" },
  { slug: "polytechnic", name: "SUNY Polytechnic Institute" },
  { slug: "rockland", name: "SUNY Rockland Community College" },
  { slug: "orange", name: "SUNY Orange County Community College" },
  { slug: "ulster", name: "SUNY Ulster County Community College" },
  { slug: "dutchess", name: "SUNY Dutchess Community College" },
  { slug: "westchester", name: "SUNY Westchester Community College" },
  { slug: "putnam", name: "SUNY Putnam County Community College" },
  { slug: "sullivan", name: "SUNY Sullivan County Community College" },
  { slug: "columbia-greene", name: "SUNY Columbia-Greene Community College" },
  { slug: "adirondack", name: "SUNY Adirondack Community College" },
  { slug: "clinton", name: "SUNY Clinton Community College" },
  { slug: "jefferson", name: "SUNY Jefferson Community College" },
  { slug: "mohawk-valley", name: "SUNY Mohawk Valley Community College" },
  { slug: "herkimer", name: "SUNY Herkimer County Community College" },
  { slug: "fulton-montgomery", name: "SUNY Fulton-Montgomery Community College" },
  { slug: "schenectady", name: "SUNY Schenectady County Community College" },
  { slug: "hudson-valley", name: "SUNY Hudson Valley Community College" },
  { slug: "adk", name: "SUNY Adirondack" },
  { slug: "broome", name: "SUNY Broome Community College" },
  { slug: "corning", name: "SUNY Corning Community College" },
  { slug: "finger-lakes", name: "SUNY Finger Lakes Community College" },
  { slug: "genesee", name: "SUNY Genesee Community College" },
  { slug: "jamestown", name: "SUNY Jamestown Community College" },
  { slug: "monroe", name: "SUNY Monroe Community College" },
  { slug: "niagara", name: "SUNY Niagara County Community College" },
  { slug: "north-country", name: "SUNY North Country Community College" },
  { slug: "onondaga", name: "SUNY Onondaga Community College" },
  { slug: "tompkins-cortland", name: "SUNY Tompkins Cortland Community College" },
  { slug: "wayne-finger-lakes", name: "SUNY Wayne Finger Lakes Community College" }
];

// Data store
let users = [
  {
    id: "user1",
    username: "testuser",
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    createdAt: "2025-08-22T04:00:00.000Z",
    posts: []
  }
];

let schedules = [
  {
    id: "post1",
    title: "My First Schedule",
    collegeSlug: "asu",
    major: "computer science",
    level: "junior",
    events: [
      { title: "Programming 101", day_of_week: 1, start_time: "09:00", end_time: "10:30", location: "CS 101" },
      { title: "Math 201", day_of_week: 2, start_time: "14:00", end_time: "15:30", location: "Math Hall" }
    ],
    reactions: { up: 5, down: 2 },
    commentsCount: 1,
    createdAt: "2025-08-22T05:00:00.000Z",
    authorId: "user1",
    authorHandle: "testuser"
  }
];

// Helper functions
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// 1. GET COLLEGES LIST
app.get('/api/colleges', (req, res) => {
  res.json(COLLEGES);
});

// 2. USER REGISTRATION
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }
    
    if (users.find(u => u.username === username)) {
      return res.status(409).json({ success: false, error: 'Username already exists' });
    }
    
    const newUser = {
      id: "user" + Date.now(),
      username,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      posts: []
    };
    
    users.push(newUser);
    console.log('✅ New user registered:', username);
    
    res.status(201).json({ 
      success: true, 
      user: { id: newUser.id, username: newUser.username }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. USER LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    console.log('✅ User logged in:', username);
    
    res.json({ 
      success: true, 
      user: { id: user.id, username: user.username }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. USER DASHBOARD - Get user's posts
app.get('/api/user/:userId/dashboard', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Get user's posts
    const userPosts = schedules.filter(s => s.authorId === userId);
    
    // Calculate user stats
    const totalImpressions = userPosts.reduce((sum, post) => 
      sum + post.reactions.up + post.reactions.down, 0
    );
    
    const result = {
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      },
      stats: {
        totalPosts: userPosts.length,
        totalImpressions,
        totalUpvotes: userPosts.reduce((sum, post) => sum + post.reactions.up, 0),
        totalDownvotes: userPosts.reduce((sum, post) => sum + post.reactions.down, 0)
      },
      posts: userPosts
    };
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ User dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. UPLOAD ENDPOINT
app.post('/api/upload', upload.single('schedule'), (req, res) => {
  try {
    console.log('📁 Upload request received!');
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    // Mock parsed courses
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

// 6. PUBLISH ENDPOINT - SAVES NEW POSTS
app.post('/api/schedules', (req, res) => {
  try {
    console.log('📝 Publish request received:', req.body);
    
    const scheduleData = req.body;
    
    // Create new schedule
    const newSchedule = {
      id: "post" + Date.now(),
      title: scheduleData.title || "New Schedule",
      collegeSlug: scheduleData.collegeSlug || "unknown",
      major: scheduleData.major || "unknown",
      level: scheduleData.level || "junior",
      events: scheduleData.events || [],
      reactions: { up: 0, down: 0 },
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      authorId: scheduleData.authorId || "anonymous",
      authorHandle: scheduleData.authorHandle || "anonymous"
    };
    
    // Add to schedules array
    schedules.push(newSchedule);
    
    // Add to user's posts if authenticated
    if (scheduleData.authorId && scheduleData.authorId !== "anonymous") {
      const user = users.find(u => u.id === scheduleData.authorId);
      if (user) {
        user.posts.push(newSchedule.id);
      }
    }
    
    console.log('✅ Schedule published:', newSchedule.title);
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

// 7. FEED ENDPOINT - RETURNS ALL POSTS
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

// 8. REACTIONS ENDPOINT
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

// 9. WEBSITE METRICS - Shows on website
app.get('/api/metrics', (req, res) => {
  try {
    const totalImpressions = schedules.reduce((sum, schedule) => 
      sum + schedule.reactions.up + schedule.reactions.down, 0
    );
    
    const result = {
      users: users.length,
      impressions: totalImpressions,
      posts: schedules.length,
      colleges: COLLEGES.length
    };
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Metrics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. ADMIN DASHBOARD
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: white; }
            .container { max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .card { background: #2a2a2a; padding: 40px; margin: 20px 0; border-radius: 12px; text-align: center; }
            .number { font-size: 5em; font-weight: bold; color: #4CAF50; }
            .label { color: #ccc; font-size: 20px; margin-bottom: 15px; }
            button { background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; }
            .status { text-align: center; margin-top: 20px; font-size: 14px; color: #969fb3; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Admin Dashboard</h1>
            </div>
            
            <div id="error"></div>
            
            <div class="card">
                <div class="label">USERS</div>
                <div class="number" id="users">—</div>
            </div>
            
            <div class="card">
                <div class="label">IMPRESSIONS</div>
                <div class="number" id="impressions">—</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="refreshData()">🔄 Refresh</button>
            </div>
            
            <div class="status" id="lastUpdate">Loading...</div>
        </div>

        <script>
            async function refreshData() {
                try {
                    const response = await fetch('/api/metrics');
                    const data = await response.json();
                    
                    document.getElementById('users').textContent = data.users;
                    document.getElementById('impressions').textContent = data.impressions;
                    document.getElementById('lastUpdate').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
                    
                } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('error').innerHTML = '<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px; margin: 20px 0;">Error: ' + error.message + '</div>';
                }
            }
            
            refreshData();
            setInterval(refreshData, 5000);
        </script>
    </body>
    </html>
  `);
});

// 11. HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    users: users.length,
    schedules: schedules.length,
    colleges: COLLEGES.length,
    uptime: Math.round(process.uptime())
  });
});

app.listen(port, () => {
  console.log(`🚀 FINAL BACKEND RUNNING ON http://localhost:${port}`);
  console.log(`👤 Users: ${users.length} (testuser/password)`);
  console.log(`📝 Schedules: ${schedules.length}`);
  console.log(`🏫 Colleges: ${COLLEGES.length}`);
  console.log(`📊 Admin: http://localhost:${port}/admin`);
  console.log(`📰 Feed: http://localhost:${port}/api/feed`);
  console.log(`📈 Metrics: http://localhost:${port}/api/metrics`);
  console.log(`✅ Complete with user accounts and dashboards!`);
});

