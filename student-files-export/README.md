# Student Module Files

This package contains all student-related files from the CodeTrack platform.

## Directory Structure

```
student-files-export/
├── app/
│   ├── student/              # Student pages (dashboard, analytics, jobs, platforms, profile)
│   └── api/
│       ├── student/          # Student API routes
│       ├── platforms/        # Platform integration APIs
│       └── auth/             # Authentication APIs
├── components/
│   ├── student/              # Student-specific components
│   ├── ui/                   # UI components
│   └── dashboard/            # Dashboard components
└── lib/
    ├── platforms/            # Platform integrations (LeetCode, Codeforces, etc.)
    ├── services/             # Platform services
    ├── models/               # Database models
    ├── auth.ts               # Authentication logic
    ├── database.ts           # Database connection
    └── types.ts              # TypeScript types
```

## Student Features Included

### Pages
- **Dashboard** (`/student/dashboard`) - Main student dashboard
- **Analytics** (`/student/analytics`) - Coding statistics and insights
- **Jobs** (`/student/jobs`) - Job listings and applications
- **Platforms** (`/student/platforms`) - Manage coding platform connections
- **Profile** (`/student/profile`) - Student profile management

### Components
- `dashboard-client.tsx` - Main dashboard component
- `analytics-dashboard.tsx` - Analytics visualization
- `platforms-manager.tsx` - Platform management
- `add-platform-dialog.tsx` - Add new platform dialog
- `platform-cards.tsx` - Platform connection cards
- `stats-overview.tsx` - Statistics overview
- `skills-chart.tsx` - Skills visualization
- `job-matches.tsx` - Job matching component
- `profile-form.tsx` - Profile editing form
- `resume-builder.tsx` - Resume builder
- `recent-activity.tsx` - Recent activity feed

### API Routes
- `/api/student/analytics` - Get student analytics
- `/api/student/sync-stats` - Sync platform statistics
- `/api/student/link-platform` - Link coding platform
- `/api/platforms/*` - Platform integration endpoints

### Platform Integrations
- LeetCode
- Codeforces
- CodeChef
- GitHub
- HackerRank
- HackerEarth
- AtCoder
- GeeksforGeeks
- And 10+ more platforms

## How to Use

1. **Copy files to your project**:
   - Copy the `app/` folder contents to your Next.js `app/` directory
   - Copy the `components/` folder contents to your `components/` directory
   - Copy the `lib/` folder contents to your `lib/` directory

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Set up environment variables** in `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your-secret-key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access student pages**:
   - Sign up as a student at `/signup`
   - Login at `/login`
   - Access dashboard at `/student/dashboard`

## Notes

- All files are from the main CodeTrack repository
- Authentication and database logic are included
- Platform integrations are fully functional
- UI components from shadcn/ui are included

## Dependencies

Make sure your `package.json` includes:
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui components
- MongoDB driver
- bcryptjs
- Recharts (for analytics)

## Tips for Your Colleague

1. Start by reviewing the `app/student/dashboard/page.tsx` file
2. Check `components/student/dashboard-client.tsx` for the main logic
3. Platform integrations are in `lib/platforms/`
4. API routes are in `app/api/student/` and `app/api/platforms/`

## Questions?

If you have any questions about these files, feel free to ask!

---

**Exported on**: February 24, 2026  
**From**: CodeTrack Platform
