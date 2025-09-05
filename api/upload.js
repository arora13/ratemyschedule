// Vercel serverless function for upload endpoint
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mock parsed courses response
  // In a real app, you'd process the uploaded image here
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

  const response = {
    success: true,
    events: parsedCourses,
    message: `Successfully parsed ${parsedCourses.length} courses from your schedule!`
  };

  res.status(200).json(response);
}
