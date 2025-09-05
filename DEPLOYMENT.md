# Deployment Guide for Vercel

## Quick Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? **No**
   - Project name: `ratemyschedule` (or your preferred name)
   - Directory: `.` (current directory)
   - Override settings? **No**

## What's Included

### Frontend (Vite + React)
- ✅ Static build in `dist/` directory
- ✅ All UI components and pages
- ✅ Responsive design with Tailwind CSS

### API Routes (Vercel Serverless Functions)
- ✅ `/api/colleges` - Returns comprehensive college list (172 colleges)
- ✅ `/api/metrics` - Returns user and impression metrics
- ✅ `/api/feed` - Returns schedule feed data
- ✅ `/api/upload` - Handles image uploads (mock parsing)
- ✅ `/api/schedules` - Handles schedule creation

### Features Working
- ✅ College dropdown with 172 colleges (CSU, Arizona, Big State)
- ✅ Schedule upload and parsing
- ✅ Feed display with filtering
- ✅ Metrics display showing users/impressions
- ✅ Responsive design

## Environment Variables

No environment variables are required for basic functionality. The API routes use mock data.

## Custom Domain (Optional)

After deployment, you can add a custom domain in the Vercel dashboard:
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that all dependencies are in `package.json`
2. **API routes not working**: Ensure files are in `/api` directory
3. **CORS errors**: API routes include CORS headers
4. **Static files not loading**: Check `vercel.json` configuration

### Local Testing:
```bash
# Test the build locally
npm run build
npm run preview

# Test API routes locally (requires Vercel CLI)
vercel dev
```

## Production vs Development

- **Development**: Uses local backend at `localhost:4000` via proxy
- **Production**: Uses Vercel serverless functions in `/api` directory

The app automatically detects the environment and uses the appropriate API endpoints.
