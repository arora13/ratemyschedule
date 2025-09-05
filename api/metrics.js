// Vercel serverless function for metrics endpoint
module.exports = function handler(req, res) {
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

  // Mock metrics data for now
  // In a real app, you'd fetch this from a database
  const metrics = {
    users: 1,
    impressions: 7,
    posts: 2,
    colleges: 172
  };

  res.status(200).json(metrics);
}
