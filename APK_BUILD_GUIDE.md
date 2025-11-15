## WeddingWeb APK Wrapper Guide

This project now includes Capacitor so you can ship the existing website as an Android APK (WebView-style). Follow the steps below to generate an installable build.

### 1. Prerequisites

1. Install Android Studio (includes Android SDK + Platform Tools).
2. Ensure Java 17+ is available in your `PATH`.
3. From the project root, install frontend dependencies (already done if you ran `npm install` earlier):
   ```bash
   cd frontend
   npm install
   ```

### 2. Add/Update the Android Project

Inside `frontend/`:

```bash
npx cap add android        # only the first time; re-run if Android folder is missing
npm run cap:sync           # rebuild web assets + sync to native platforms
```

This generates/updates `frontend/android/`, which you can open in Android Studio.

### 3. Build & Run from Android Studio

1. `npm run build` (already part of `npm run cap:android`).
2. In Android Studio, choose **Build > Make Project** or use the play button to run on a device/emulator.
3. To create a signed release APK:
   - `Build > Generate Signed Bundle / APK`.
   - Choose **APK**, create or reuse a keystore, and finish the wizard.

### 4. CLI Shortcut

Use the helper script:

```bash
cd frontend
npm run cap:android
```

This will:
1. Build the Vite app.
2. Sync the `dist/` output into the Android WebView bundle.
3. Open Android Studio so you can press “Run” or “Build APK”.

### 5. Updating Web Content

Whenever you change the web app:

```bash
cd frontend
npm run build
npx cap sync android
```

### 6. Notes & Troubleshooting

- The WebView loads the local `dist/` bundle; no internet is required for static content, but API calls still go to the backend configured in your `.env`.
- If Android Studio complains about SDK versions, open `frontend/android/build.gradle` and install the suggested SDK/platform.
- To view native logs while running, use `adb logcat` or Android Studio’s **Logcat** tab.

This wrapper lets you maintain a single web codebase while distributing an APK for demos, sideloading, or Play Store submissions.

