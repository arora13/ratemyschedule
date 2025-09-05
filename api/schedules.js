// Vercel serverless function for schedules endpoint
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Handle schedule creation
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

    // In a real app, you'd save this to a database
    // For now, just return the created schedule
    res.status(201).json(newSchedule);
    return;
  }

  if (req.method === 'GET') {
    // Handle schedule retrieval
    // In a real app, you'd fetch from database
    res.status(200).json({ message: 'Use /api/feed for getting schedules' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
