// Vercel serverless function for feed endpoint
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mock feed data for now
  // In a real app, you'd fetch this from a database
  const mockSchedules = [
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
    },
    {
      id: "post2",
      title: "Spring Schedule",
      collegeSlug: "asu",
      major: "engineering",
      level: "sophomore",
      events: [
        { title: "Physics 101", day_of_week: 1, start_time: "10:00", end_time: "11:30", location: "Physics Lab" },
        { title: "Chemistry 201", day_of_week: 3, start_time: "13:00", end_time: "14:30", location: "Chem Hall" }
      ],
      reactions: { up: 3, down: 0 },
      commentsCount: 0,
      createdAt: "2025-08-22T06:00:00.000Z",
      authorId: "user1",
      authorHandle: "testuser"
    }
  ];

  const { college, major, sort = 'new' } = req.query;
  
  let filteredSchedules = [...mockSchedules];
  
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

  const response = {
    items: filteredSchedules,
    total: filteredSchedules.length,
    page: 1,
    limit: 50
  };

  res.status(200).json(response);
}
