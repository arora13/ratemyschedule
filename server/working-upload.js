import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

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
    // Accept images only
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

// Simple HTML upload page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Working Upload</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }
            .container { max-width: 600px; margin: 0 auto; }
            .upload-area { border: 2px dashed #666; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .result { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 5px; }
            button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background: #45a049; }
            input[type="file"] { margin: 10px 0; }
            .success { color: #4CAF50; }
            .error { color: #f44336; }
            .loading { color: #ff9800; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>✅ Working Image Upload</h1>
            
            <div class="upload-area">
                <h3>Upload Your Schedule Image</h3>
                <input type="file" id="fileInput" accept="image/*">
                <br><br>
                <button onclick="uploadFile()">Upload & Parse Schedule</button>
            </div>
            
            <div id="result" class="result" style="display: none;">
                <h3>Result:</h3>
                <div id="resultText"></div>
            </div>
        </div>

        <script>
            async function uploadFile() {
                const fileInput = document.getElementById('fileInput');
                const file = fileInput.files[0];
                const resultDiv = document.getElementById('result');
                const resultText = document.getElementById('resultText');
                
                if (!file) {
                    resultText.innerHTML = '<span class="error">❌ Please select a file first!</span>';
                    resultDiv.style.display = 'block';
                    return;
                }
                
                resultText.innerHTML = '<span class="loading">⏳ Uploading...</span>';
                resultDiv.style.display = 'block';
                
                console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
                
                const formData = new FormData();
                formData.append('schedule', file);
                
                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    console.log('Response status:', response.status);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(\`HTTP \${response.status}: \${errorText}\`);
                    }
                    
                    const result = await response.json();
                    console.log('Response data:', result);
                    
                    if (result.success) {
                        resultText.innerHTML = '<span class="success">✅ Upload successful!</span><br><br>';
                        resultText.innerHTML += '<strong>Parsed Courses:</strong><br>';
                        result.events.forEach((course, index) => {
                            resultText.innerHTML += \`\${index + 1}. \${course.title} - \${course.location}<br>\`;
                        });
                    } else {
                        resultText.innerHTML = '<span class="error">❌ Upload failed: ' + (result.error || 'Unknown error') + '</span>';
                    }
                    
                } catch (error) {
                    console.error('Upload error:', error);
                    resultText.innerHTML = '<span class="error">❌ Error: ' + error.message + '</span>';
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Upload endpoint
app.post('/upload', upload.single('schedule'), (req, res) => {
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

// Publish schedule endpoint
app.post('/api/schedules', (req, res) => {
  try {
    console.log('📝 Publish request received:', req.body);
    
    const scheduleData = req.body;
    
    // Mock successful publish
    const newSchedule = {
      id: Math.random().toString(36).substr(2, 8),
      title: scheduleData.title || "New Schedule",
      collegeSlug: scheduleData.collegeSlug || "unknown",
      major: scheduleData.major || "unknown",
      level: scheduleData.level || "unknown",
      events: scheduleData.events || [],
      reactions: { up: 0, down: 0 },
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      authorHandle: scheduleData.authorHandle || "anonymous"
    };
    
    console.log('✅ Schedule published:', newSchedule);
    
    res.status(201).json(newSchedule);
    
  } catch (error) {
    console.error('❌ Publish error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(port, () => {
  console.log(`🚀 WORKING UPLOAD SERVER RUNNING ON http://localhost:${port}`);
  console.log(`📁 Uploads directory: ${__dirname}/uploads`);
  console.log(`✅ Ready to accept image uploads!`);
});
