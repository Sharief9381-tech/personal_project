# Fix for "Missing script: dev" Error

## Problem
After cloning the repository, you're getting:
```
npm error Missing script: "dev"
```

This means the `package.json` file is missing or wasn't cloned properly.

## Solution

### Option 1: Re-clone the Repository (Recommended)

1. **Delete the cloned folder**
2. **Clone again**:
   ```bash
   git clone https://github.com/Sharief9381-tech/personal_project.git
   cd personal_project
   ```

3. **Verify package.json exists**:
   ```bash
   # Windows CMD
   dir package.json
   
   # Windows PowerShell
   Test-Path package.json
   
   # Should return True or show the file
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Run the dev server**:
   ```bash
   npm run dev
   ```

### Option 2: Pull Latest Changes

If you already cloned, try pulling the latest:

```bash
cd personal_project
git pull origin main
npm install
npm run dev
```

### Option 3: Manual Fix (If package.json is missing)

If package.json is still missing after re-cloning, you can create it manually:

1. **Create package.json** in the root of your project with this content:

```json
{
  "name": "codetrack-platform",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "eslint .",
    "start": "next start",
    "setup": "node scripts/setup.js",
    "verify": "node scripts/verify-setup.js"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-tooltip": "1.1.6",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "mongodb": "7.0.0",
    "next": "^16.1.6",
    "next-themes": "^0.4.6",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-hook-form": "^7.60.0",
    "recharts": "2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "3.25.76"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.9",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8.5",
    "tailwindcss": "^4.1.9",
    "typescript": "^5"
  }
}
```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run dev server**:
   ```bash
   npm run dev
   ```

## Verify the Repository Contents

After cloning, you should have these files/folders:

```
personal_project/
├── package.json          ✅ MUST EXIST
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .gitignore
├── app/                  (Next.js app directory)
├── components/           (React components)
├── lib/                  (Utilities)
├── scripts/              (Setup scripts)
└── README.md
```

## Check What's in the Repository

You can verify the repository contents on GitHub:
https://github.com/Sharief9381-tech/personal_project

Click on the files to see if package.json is there.

## Still Having Issues?

If you're still having problems:

1. **Check if you're in the right directory**:
   ```bash
   pwd  # or cd on Windows
   # Should show: .../personal_project
   ```

2. **List all files**:
   ```bash
   # Windows PowerShell
   Get-ChildItem -Force
   
   # Windows CMD
   dir /a
   ```

3. **Check git status**:
   ```bash
   git status
   git log --oneline -5
   ```

4. **Contact me** with the output of these commands

## Quick Start After Fix

Once package.json is there:

```bash
# Install dependencies
npm install

# Create .env.local
# Add:
# MONGODB_URI=your_mongodb_uri (optional)
# SESSION_SECRET=your-secret-key

# Run development server
npm run dev

# Open browser
# http://localhost:3000
```

## Admin Login

- Email: sharief9381@gmail.com
- Password: 12341234
- Will auto-create on first login

---

**Note**: The repository was just updated. Make sure you're cloning the latest version!
