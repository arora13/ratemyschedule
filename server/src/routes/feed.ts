// server/src/routes/feed.ts
import { Router } from "express";
import { store } from "../store";

const router = Router();

// Define interfaces to match the actual schedule structure from schedules.ts
interface Schedule {
  id: string;
  title?: string;
  collegeSlug: string;
  major: string;
  level: "freshman" | "sophomore" | "junior" | "senior";
  term: string;
  events: any[]; // EventIn[] type from schedules.ts
  authorHandle?: string;
  reactions: { up: number; down: number };
  commentsCount: number;
  createdAt: string; // ISO string
  deletedAt?: string | null;
}

interface FeedResponse {
  items: Schedule[];
  total?: number;
  page?: number;
  limit?: number;
}

router.get("/", (req, res) => {
  try {
    console.log("🔍 Feed route called with query:", req.query);
    
    // Extract query parameters
    const { 
      college, 
      major, 
      level, 
      sort = "new",
      page = "1",
      limit = "50" 
    } = req.query as Record<string, string>;
    
    // Get schedules from store - handle both array and object formats
    let schedules: Schedule[] = [];
    
    if (Array.isArray(store.schedules)) {
      schedules = store.schedules as Schedule[];
    } else if (store.schedules && typeof store.schedules === 'object') {
      schedules = Object.values(store.schedules) as Schedule[];
    }
    
    console.log("📊 Total schedules in store:", schedules.length);
    
    // Apply filters
    let filteredSchedules = schedules.filter(s => !s.deletedAt); // Exclude deleted schedules

    if (college) {
      filteredSchedules = filteredSchedules.filter(s =>
        s.collegeSlug?.toLowerCase() === college.toLowerCase()
      );
      console.log("🏫 After college filter:", filteredSchedules.length);
    }

    if (major) {
      filteredSchedules = filteredSchedules.filter(s =>
        s.major?.toLowerCase() === major.toLowerCase()
      );
      console.log("📚 After major filter:", filteredSchedules.length);
    }

    if (level) {
      filteredSchedules = filteredSchedules.filter(s =>
        s.level === level
      );
      console.log("🎓 After level filter:", filteredSchedules.length);
    }
    
    // Apply sorting
    if (sort === "trending" || sort === "popular") {
      // Sort by reaction score (up votes - down votes), then by recency
      filteredSchedules.sort((a, b) => {
        const scoreA = (a.reactions?.up || 0) - (a.reactions?.down || 0);
        const scoreB = (b.reactions?.up || 0) - (b.reactions?.down || 0);
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher score first
        }
        
        // If scores are equal, sort by recency
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      // Default: sort by newest first
      filteredSchedules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    console.log("📈 After sorting:", filteredSchedules.length);
    
    // Apply pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10))); // Cap at 100
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);
    
    console.log("📄 After pagination:", paginatedSchedules.length, `(page ${pageNum}, limit ${limitNum})`);
    
    // Prepare response
    const response: FeedResponse = {
      items: paginatedSchedules,
      total: filteredSchedules.length,
      page: pageNum,
      limit: limitNum
    };
    
    // Set cache headers to prevent aggressive caching during development
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    console.log("✅ Sending response with", paginatedSchedules.length, "items");
    
    res.json(response);
    
  } catch (error) {
    console.error("💥 Error in feed route:", error);
    
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Something went wrong'
    });
  }
});

// Health check endpoint for debugging
router.get("/debug", (req, res) => {
  try {
    const storeInfo = {
      hasSchedules: !!store.schedules,
      schedulesType: typeof store.schedules,
      schedulesIsArray: Array.isArray(store.schedules),
      schedulesLength: Array.isArray(store.schedules) 
        ? store.schedules.length 
        : store.schedules && typeof store.schedules === 'object'
        ? Object.keys(store.schedules).length
        : 0,
      storeKeys: Object.keys(store),
      sampleSchedule: Array.isArray(store.schedules) && store.schedules.length > 0
        ? store.schedules[0]
        : store.schedules && typeof store.schedules === 'object'
        ? Object.values(store.schedules)[0]
        : null
    };
    
    res.json(storeInfo);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;