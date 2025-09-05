// server/src/routes/upload.ts
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Mock schedule parser with more realistic parsing
function parseScheduleImage(filename: string) {
  // This would be replaced with actual OCR + AI parsing
  // For now, return more varied realistic mock data
  
  const mockCourses = [
    // Computer Science courses
    {
      title: "Introduction to Programming",
      day_of_week: 1,
      start_time: "09:00",
      end_time: "10:30",
      location: "CS Building 101",
    },
    {
      title: "Data Structures & Algorithms",
      day_of_week: 3,
      start_time: "11:00",
      end_time: "12:30",
      location: "Engineering Hall 205",
    },
    {
      title: "Computer Systems",
      day_of_week: 5,
      start_time: "14:00",
      end_time: "15:30",
      location: "Tech Center 301",
    },
    // Math courses
    {
      title: "Calculus II",
      day_of_week: 2,
      start_time: "08:00",
      end_time: "09:30",
      location: "Math Building 112",
    },
    {
      title: "Linear Algebra",
      day_of_week: 4,
      start_time: "13:00",
      end_time: "14:30",
      location: "Science Hall 204",
    },
    // General education
    {
      title: "English Composition",
      day_of_week: 1,
      start_time: "15:00",
      end_time: "16:30",
      location: "Humanities 150",
    },
    {
      title: "Psychology 101",
      day_of_week: 3,
      start_time: "16:00",
      end_time: "17:30",
      location: "Social Sciences 220",
    }
  ];

  // Return 3-5 random courses to simulate realistic parsing
  const numCourses = Math.floor(Math.random() * 3) + 3; // 3-5 courses
  const selectedCourses = [];
  const usedCourses = new Set();
  
  while (selectedCourses.length < numCourses && selectedCourses.length < mockCourses.length) {
    const randomIndex = Math.floor(Math.random() * mockCourses.length);
    if (!usedCourses.has(randomIndex)) {
      usedCourses.add(randomIndex);
      selectedCourses.push(mockCourses[randomIndex]);
    }
  }

  // Sort by day of week for better UX
  selectedCourses.sort((a, b) => a.day_of_week - b.day_of_week);

  return {
    term: "Fall 2024",
    events: selectedCourses
  };
}

/**
 * POST /api/upload
 * Upload and parse a schedule image
 */
router.post("/", upload.single("schedule"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: "No file uploaded" 
      });
    }

    console.log(`📄 Processing uploaded file: ${req.file.filename}`);

    // Parse the schedule (mock implementation)
    const parsed = parseScheduleImage(req.file.filename);

    console.log(`✅ Parsed ${parsed.events.length} courses from ${req.file.filename}`);

    res.json({
      ok: true,
      saved_as: req.file.filename,
      parsed: parsed
    });

  } catch (error) {
    console.error("💥 Upload error:", error);
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed"
    });
  }
});

/**
 * GET /api/upload/health
 * Health check for upload service
 */
router.get("/health", (req, res) => {
  res.json({ 
    ok: true, 
    service: "upload",
    timestamp: new Date().toISOString()
  });
});

export default router;
