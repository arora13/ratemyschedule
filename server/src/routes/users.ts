// server/src/routes/users.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { store } from "../store";
import { signToken, requireAuth } from "../auth";

const router = Router();

// Generate unique user ID
const generateUserId = () => Math.random().toString(36).slice(2, 10);

/**
 * POST /api/users/register
 * Body: { handle: string, password: string }
 */
router.post("/register", async (req, res) => {
  const { handle, password } = req.body;

  if (!handle || typeof handle !== 'string' || handle.trim().length === 0) {
    return res.status(400).json({ error: "Handle is required" });
  }

  if (!password || typeof password !== 'string' || password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  // Check if user already exists
  const existingUser = store.users.find(u => u.handle.toLowerCase() === handle.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ error: "User with this handle already exists" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: generateUserId(),
      handle: handle.trim(),
      password: hashedPassword,
      role: "USER" as const,
      createdAt: new Date().toISOString()
    };

    store.addUser(user);

    // Generate JWT token
    const token = signToken({ uid: user.id, role: user.role });

    console.log(`👤 New user registered: ${user.handle} (${user.id})`);

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      ok: true,
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

/**
 * POST /api/users/login
 * Body: { handle: string, password: string }
 */
router.post("/login", async (req, res) => {
  const { handle, password } = req.body;

  if (!handle || typeof handle !== 'string') {
    return res.status(400).json({ error: "Handle is required" });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: "Password is required" });
  }

  const user = store.users.find(u => u.handle.toLowerCase() === handle.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  try {
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = signToken({ uid: user.id, role: user.role });

    console.log(`🔑 User logged in: ${user.handle} (${user.id})`);

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      ok: true,
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * GET /api/users/me
 * Requires authentication
 */
router.get("/me", requireAuth, (req, res) => {
  const user = store.users.find(u => u.id === req.user!.uid);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Get user's schedules
  const userSchedules = store.schedules.filter(s => s.userId === user.id && !s.deletedAt);
  
  // Calculate metrics
  const totalReactions = userSchedules.reduce((sum, s) => sum + s.reactions.up + s.reactions.down, 0);
  const totalUpvotes = userSchedules.reduce((sum, s) => sum + s.reactions.up, 0);
  const totalComments = userSchedules.reduce((sum, s) => sum + s.commentsCount, 0);

  // Don't send password back
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    ok: true,
    user: userWithoutPassword,
    stats: {
      schedulesCount: userSchedules.length,
      totalReactions,
      totalUpvotes,
      totalComments
    },
    schedules: userSchedules
  });
});

/**
 * GET /api/users
 * Get all users (for development/debugging)
 */
router.get("/", (req, res) => {
  // In production, you might want to protect this or remove it
  res.json({
    users: store.users,
    total: store.users.length
  });
});

export default router;
