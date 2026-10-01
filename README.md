# Lakshmi Studio Management App

A premium studio management application for managing events, frame orders, customers, staff, expenses, and reports — with Supabase cloud database sync.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL database, Storage, Auth)
- **Mobile:** Capacitor (wraps the web app into a native Android APK)

## Prerequisites for APK Build

Before building the APK, you need these installed on your computer:

1. **Node.js** (v18 or newer) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio
   - This installs the Android SDK, Gradle, and Java automatically
3. **Java JDK 17** (included with Android Studio)

## How to Build the APK

### Option A: Using Android Studio (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Build the web app and sync to Android
npm run android:build

# 3. Open the project in Android Studio
npm run cap:open
```

In Android Studio:
1. Wait for Gradle sync to complete (bottom status bar)
2. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for the build to finish
4. Click **"locate"** in the notification to find your APK file
5. The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Using Command Line (Gradle)

```bash
# 1. Install dependencies
npm install

# 2. Build web assets and sync
npm run android:build

# 3. Build APK with Gradle
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Installing the APK on Your Phone

1. Transfer the `.apk` file to your Android phone (via USB, email, or cloud drive)
2. On your phone, open the file
3. If prompted, allow "Install from unknown sources" in Settings
4. Tap **Install**

## Database Synchronization

The app uses **Supabase** as its cloud database backend. This means:

- **All data syncs automatically** — every change (bills, events, frames, expenses, etc.) is saved to the cloud instantly
- **Works across devices** — if you install the app on another phone, all your data appears immediately
- **Real-time updates** — the database is always in sync
- **Photo uploads** — logos and staff photos are stored in Supabase Storage and synced across devices
- **No manual backup needed** — your data lives in the Supabase cloud

The Supabase credentials are built into the app, so it connects automatically — no setup required.

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build web assets |
| `npm run android:build` | Build web + sync to Android project |
| `npm run cap:sync` | Sync web assets to Android |
| `npm run cap:open` | Open Android project in Android Studio |
| `npm run cap:run` | Build and run on connected Android device |
| `npm run typecheck` | TypeScript type checking |

## Building a Release (Signed) APK for Distribution

For a production-ready signed APK:

1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Create a new keystore (save it safely — you need it for all future updates)
3. Choose **APK** → **release** → **Finish**
4. The signed APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
project/
├── src/                    # React source code
│   ├── components/         # Reusable UI components
│   ├── pages/              # App pages (Dashboard, Events, etc.)
│   └── lib/                # Supabase client, types, utils, i18n
├── android/                # Capacitor Android native project
├── supabase/migrations/    # Database schema migrations
├── capacitor.config.ts     # Capacitor configuration
└── vite.config.ts          # Vite build configuration
```

## Troubleshooting

**Gradle sync fails in Android Studio:**
- Make sure you have internet connection (Gradle downloads dependencies)
- Try: File → Sync Project with Gradle Files

**App shows blank screen on phone:**
- Run `npm run android:build` again to ensure latest web assets are synced
- Make sure `vite.config.ts` has `base: './'`

**Camera/photo upload not working:**
- The app requests camera and storage permissions on install
- Make sure you granted permissions in Android Settings → Apps → Lakshmi Studio

**Data not syncing:**
- Check your internet connection
- The Supabase backend is always online — if data isn't appearing, it's a connectivity issue
