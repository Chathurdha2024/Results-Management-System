# Project Progress — Result Management System (Ruhuna EngRMS)

Last updated: 2026-09-30

> **Addendum — 2026-10-08:** Phase 5 (mobile Profile section parity + standalone APK via EAS Build) has been recorded below. Everything written before this date is left untouched; new work is appended rather than rewritten, so the original sections still describe the state as of 2026-09-30.

---

## 1. Project Overview

The **Result Management System** is a full-stack application for the Faculty of Engineering, University of Ruhuna. It manages the full academic result lifecycle: batch/student registration, module management, CSV-based result uploads by examiners, automated GPA calculation, and result publishing with student notifications.

The system is served through **three client applications** backed by **one shared API**:

| Component | Folder | Audience | Status |
|---|---|---|---|
| Admin / Examiner Web Portal | `frontend/` | Admins & Examiners | ✅ Complete |
| Student Web Portal | `student-frontend/` | Students | ✅ Complete |
| Backend API | `backend/` | All portals | ✅ Complete |
| **Student Mobile App** | `student-mobile/` | Students | ✅ Complete (this milestone) |

---

## 2. Completed Milestones

### Phase 1 — Backend API (`backend/`)
- [x] Fastify 5 server with JWT authentication (`@fastify/jwt`) and bcrypt password hashing.
- [x] Role-based route protection for `ADMIN`, `EXAMINER`, and `STUDENT`.
- [x] Admin endpoints: batch creation with generated passwords, module management, examiner management, department allocation, CSV result upload (streaming `csv-parser`), result publishing, master result sheet.
- [x] Student endpoints: dashboard (results grouped by semester, SGPA/CGPA computation), notifications (list + mark-read), exam schedules.
- [x] Auth endpoints: admin login, student login, examiner login/register, student change-password with first-login enforcement.
- [x] Prisma ORM schema (PostgreSQL on Neon): `Department`, `Batch`, `Student`, `Module`, `Admin`, `Result`, `Notification`, `Examiner`, `ExamSchedule`, `ExaminerNotification`.

### Phase 2 — Admin / Examiner Web Portal (`frontend/`)
- [x] React 19 + Vite + Tailwind CSS v4 + shadcn/ui.
- [x] Login page, Admin dashboard, Examiner dashboard.
- [x] Global dashboard, department workspaces, module management, examiner management, department allocation, master result sheet, result upload modal.

### Phase 3 — Student Web Portal (`student-frontend/`)
- [x] React 19 + Vite + Tailwind CSS v4, brand theme (maroon `#611010` / gold `#f5bd1a` / off-white `#fefefe`), Geist font, Lucide icons.
- [x] **Login** — registration number + password, JWT stored in `localStorage`, first-login redirect.
- [x] **Change Password** — forced on first login, issues a fresh JWT.
- [x] **Student Dashboard** — fixed sidebar (Recent Updates, Exam Timetable, per-semester views), CGPA summary card, recently released results with "New"/"Repeat" badges, semester result tables, SGPA cards, exam timetable cards, notification bell with unread indicator and read marking, profile/logout footer.
- [x] Responsive layout with mobile drawer and overlay.

### Phase 4 — Student Mobile App (`student-mobile/`) ⭐ Current milestone
- [x] **Expo (React Native) app** created with SDK 57, React 19.2.3, React Native 0.86.3.
- [x] Pixel-parity port of the student web portal:
  - Same brand palette (`src/theme.js`) — maroon `#611010` / `#611110` / `#6b2020`, gold `#f5bd1a`, off-white `#fefefe`.
  - Same **Geist Variable** font, bundled locally (`assets/fonts/Geist-Variable.ttf`).
  - Same **Lucide icons** via `lucide-react-native`.
- [x] Screens mirroring the web pages 1:1:
  - `LoginScreen` — logo tile, gold-tinted inputs with `User`/`Lock` icons, info notice.
  - `ChangePasswordScreen` — `ShieldAlert` tile, new/confirm password form.
  - `DashboardScreen` — header with hamburger + `BookOpen` title + notification bell (`Bell` with unread dot), brand drawer sidebar (`SidebarDrawer`) replicating the web sidebar including profile footer with `Settings`/`LogOut`, CGPA gradient card, recent results cards with "New" pulse + "Repeat" badges and strikethrough previous grades, exam timetable cards, semester SGPA card + per-module result cards, notifications modal with mark-as-read.
- [x] Same API contract as the web portal (`src/api.js`): `/api/auth/student/login`, `/api/auth/student/change-password`, `/api/student/dashboard`, `/api/student/exam-schedules`, `/api/student/notifications`, `/api/student/notifications/read`.
- [x] Token persisted in `AsyncStorage` under the same key name (`studentToken`) as the web portal.
- [x] Automatic LAN IP detection: the API base URL is derived from Expo's Metro host so the app works on a physical phone without code changes (`src/config.js`).
- [x] Production bundle verified — `npx expo export --platform android` compiles cleanly (2841 modules, Geist font embedded).

### Phase 5 — Mobile Profile Parity + Standalone APK (`student-mobile/`) ⭐ Current milestone (2026-10-08)

**A. Feature parity with the student web portal** (mirrored from changes another team member landed in `student-frontend/`), shipped with **no change** to the previously configured backend connection (`src/config.js`, `.env`, and the axios `baseURL` were left exactly as they were):

- [x] New `src/components/ProfileView.js` — React Native port of `student-frontend/src/pages/student/ProfileView.jsx`, built from three `SectionCard` blocks (`Card` + a separate non-elevated clip layer, because combining `overflow: 'hidden'` with `elevation` hides children on some Android devices):
  - **Student Details** — registration number, department, batch, loaded from `GET /api/student/profile`.
  - **Change Password** — current / new / confirm fields, client-side validation ("New password and confirm password do not match!", "Password must be at least 6 characters long."), posts to `POST /api/auth/student/change-password` and re-saves the freshly issued JWT into `AsyncStorage` under `studentToken`.
  - **Notification Settings** — native `Switch` bound to `PUT /api/student/notification-settings`; enabling it re-fetches notifications, disabling clears the list.
- [x] Profile is reachable from the sidebar footer and renders inside `DashboardScreen` as the `activeSem === 'PROFILE'` view mode (no new navigation route was added). Header title, dashboard/exam-schedule refetches, and semester selection all keep working — an explicit selection is never reset by a refetch, including for students with zero published semesters.
- [x] `BrandInput` gained an optional `showSecureToggle` prop rendering an `Eye` / `EyeOff` pressable, wired up on the login password field and on all three Profile password fields.
- [x] `src/api.js` gained `studentApi.profile()`, `studentApi.updateNotificationSettings(enabled)`, an optional `currentPassword` argument on `authApi.changePassword(newPassword, currentPassword)`, and a shared `apiErrorMessage(err, fallback)` helper that surfaces the backend's `error` field, or a "Cannot reach the server at …" message when there is no HTTP response at all.

**B. Standalone APK build pipeline (EAS Build, cloud)**

- [x] `eas.json` — `preview` profile configured for a directly installable artefact: `{ "distribution": "internal", "android": { "buildType": "apk" } }`; plus `development` and `production` profiles. `cli.appVersionSource: "local"` so `app.json` stays the single source of truth for version/versionCode.
- [x] `app.json` — Android identity and native configuration (CNG: `android/` and `ios/` are generated by prebuild and stay gitignored):
  - `android.package = com.ruhuna.engrms.student`, `versionCode = 1`.
  - Branded **adaptive icon** (maroon `#611010` background + foreground/background/monochrome layers).
  - Branded **splash screen** via the `expo-splash-screen` plugin with `image`, `imageWidth: 200` and `resizeMode: "contain"` — supplying the image is what makes prebuild emit `splashscreen_logo` at all five densities.
  - `expo-build-properties` with `android.usesCleartextTraffic: true`, required because the backend is served over plain HTTP.
  - `extra.eas.projectId = f1631c3a-8b87-44ff-8510-0164d6205b9f` so non-interactive EAS CLI commands work.
- [x] `.env` — `EXPO_PUBLIC_API_URL=http://54.198.25.194:3000` (AWS EC2 backend). The value is inlined into the JS bundle at build time. **This file must stay tracked in git**: EAS honours `.gitignore` when archiving, so ignoring it would silently ship an APK pointing at `http://localhost:3000`. The IP is already public in the repo (`frontend/src/main.jsx`, `student-frontend/src/main.jsx`, `documents/COMPLETE_PROJECT_DOCUMENTATION.md`).
- [x] Dependency hygiene — `expo` aligned to `~57.0.27`, `expo-build-properties ~57.0.22` added. `npx expo-doctor` now passes **18/18** checks.
- [x] Verified locally before spending build credits: `expo export --platform android` bundles cleanly (**2845 modules**) and grepping the emitted `.hbc` confirms the EC2 URL is inlined; `expo prebuild --platform android --no-install` produces all five splash densities, `usesCleartextTraffic`, and the correct `applicationId`. (Side effect to watch: `expo prebuild` rewrites the `android`/`ios` npm scripts to `expo run:*` — they were restored to `expo start --android` / `expo start --ios` to keep the Expo Go workflow intact.)
- [x] **Cloud build succeeded** — EAS build `1472878e-2771-4e9e-beec-2fbcc72a7fd6`, profile `preview`, duration ~14 minutes (830,832 ms), no errors. Artefact: `https://expo.dev/artifacts/eas/tkzy1AEGLHdrFL8eOR1k11hVspw3T5q-JUrRy_wbI7s.apk` (EAS artefact links expire roughly two weeks after the build — around 2026-10-22 — so re-run the build or re-download for a permanent copy). Downloaded, installed and running on a physical Android phone.

---

## 3. How to Run the Mobile App on Your Phone

> Prereqs: the **backend must be running** (`cd backend && npm run dev` → listens on `0.0.0.0:3000`) and your phone must be on the **same Wi-Fi** as this PC.

1. **Start Metro** (in `student-mobile/`):
   ```bash
   cd student-mobile
   npx expo start
   ```
2. **Install Expo Go** on your phone (Play Store / App Store).
3. **Scan the QR code** shown in the terminal with Expo Go (Android: scan from inside the Expo Go app).
4. The app opens — sign in with a student registration number and password from `24th_Batch_Passwords.csv`.

**Troubleshooting**
- *"Network request failed"* → the phone cannot reach the PC. Set your PC's LAN IP explicitly in `student-mobile/src/config.js` (`OVERRIDE_API_URL = 'http://<PC-IP>:3000'`) and restart Metro. Windows Firewall must allow inbound port 3000.
- Backend not running → `cd backend && npm run dev`.
- To build a standalone APK later (requires Android SDK): `npx expo run:android` or EAS Build (`eas build --platform android`).

### Installing the Standalone APK (added 2026-10-08 — no Expo Go, no Metro, no local Android SDK)

The route above is now done and reproducible from any machine with the repo checked out. It uses **EAS cloud builds**, so nothing has to be installed locally beyond the Expo/EAS CLI, and the phone does not need to be on the same Wi-Fi as the PC because the APK talks to the EC2 backend directly.

1. Make sure `student-mobile/.env` contains the backend you want baked in:
   ```
   EXPO_PUBLIC_API_URL=http://54.198.25.194:3000
   ```
   This is inlined at build time — changing it afterwards requires a new build.
2. Log in once, interactively, in your own terminal (never scripted):
   ```bash
   cd student-mobile
   npx eas-cli@latest login
   ```
3. Kick off the APK build:
   ```bash
   npx eas-cli@latest build --platform android --profile preview
   ```
   `extra.eas.projectId` is already in `app.json`, so no `eas init` prompt appears. Answer "Yes" if asked to generate a new Android keystore the first time.
4. Watch progress, then download the `.apk` from the artefact URL printed at the end (or via `npx eas-cli@latest build:list`):
   ```bash
   npx eas-cli@latest build:view <build-id>
   ```
5. Copy the APK to the phone and open it. Android will warn about apps from unknown sources — allow installation for your file manager/browser once. The app icon is the branded EngRMS adaptive icon and the splash is the maroon logo screen.

> Each EAS build consumes one build credit on the free tier, so verify locally first (`expo export --platform android` and `npx expo-doctor`) before submitting.

---

## 4. Next Steps / Backlog

- [ ] On-device QA of the mobile app golden paths (login, first-login password change, semester views, notifications, logout).
- [ ] Optional: app icon & splash screen branded with the EngRMS logo (currently Expo defaults).
- [ ] Optional: push notifications (Expo Notifications) replacing polling for result releases.
- [ ] Optional: build a release APK via EAS Build for distribution without Expo Go.
- [ ] Recommended backend hardening: `@fastify/rate-limit` on auth endpoints, `@fastify/helmet`, move JWT secret to env (currently hardcoded in `server.js`).

**Status of the backlog above as of 2026-10-08** (the original list is intentionally left as written; this is the update):

- ✅ **Done** — *app icon & splash screen branded with the EngRMS logo.* The adaptive icon (maroon background + foreground/background/monochrome layers) and the `expo-splash-screen` plugin config (`image`, `imageWidth: 200`, `resizeMode: "contain"`, maroon background) are in `app.json`; Expo defaults are no longer used.
- ✅ **Done** — *build a release APK via EAS Build for distribution without Expo Go.* Build `1472878e-2771-4e9e-beec-2fbcc72a7fd6` (`preview` profile, `buildType: "apk"`) finished successfully and the APK is installed and running on a physical phone.
- 🔶 **Partly done** — *on-device QA of the golden paths.* Login, dashboard, semester views and the APK install path have been exercised on a real device; first-login password change, the new Profile section (password update + notification toggle) and logout still need a pass.
- ⬜ **Still open** — push notifications (Expo Notifications / FCM) to replace polling for result releases.
- ⬜ **Still open** — backend hardening (`@fastify/rate-limit`, `@fastify/helmet`, JWT secret to env).
- ⬜ **New** — move the JWT from `AsyncStorage` to `expo-secure-store`.
- ⬜ **New** — EAS artefact URLs expire (~2 weeks); set up `eas submit`/release storage or re-build when a durable APK link is needed.
- ⬜ **New** — serve the backend over HTTPS so `usesCleartextTraffic: true` can be dropped.

---

## 5. File Map — Mobile App

```
student-mobile/
├── App.js                      # Root: font loading + stack navigator
├── app.json                    # Expo config (name "Ruhuna EngRMS", brand colors, font plugin)
├── assets/fonts/Geist-Variable.ttf
└── src/
    ├── theme.js                # Brand colors + font family
    ├── config.js               # API base URL resolution (Metro host auto-detect)
    ├── api.js                  # axios instance + auth/student endpoints
    ├── toast.js                # Toast stand-in for react-hot-toast
    ├── utils.js                # timeAgo + grade helpers (same logic as web)
    ├── components/
    │   ├── BrandButton.js
    │   ├── BrandInput.js
    │   ├── Badge.js
    │   ├── Card.js
    │   └── SidebarDrawer.js    # Mobile equivalent of the web sidebar
    └── screens/
        ├── LoginScreen.js
        ├── ChangePasswordScreen.js
        └── DashboardScreen.js
```

### File Map — additions as of 2026-10-08

The tree above is kept as-is for reference. These are the files added or made significant since:

```
student-mobile/
├── .env                        # EXPO_PUBLIC_API_URL=http://54.198.25.194:3000
│                               #   ⚠ MUST stay tracked in git — EAS honours .gitignore
│                               #   when archiving, and an ignored .env silently ships
│                               #   an APK pointing at http://localhost:3000
├── eas.json                    # Build profiles: development / preview (APK) / production
├── app.json                    # + android.package & versionCode, adaptive icon,
│                               #   expo-splash-screen, expo-build-properties
│                               #   (usesCleartextTraffic), extra.eas.projectId
├── package.json                # expo ~57.0.27, expo-build-properties ~57.0.22
├── assets/
│   ├── icon.png                # App icon
│   ├── splash-icon.png         # Splash logo (maroon background)
│   ├── android-icon-foreground.png
│   ├── android-icon-background.png
│   ├── android-icon-monochrome.png
│   └── favicon.png
└── src/
    ├── api.js                  # + studentApi.profile(),
    │                           #   studentApi.updateNotificationSettings(enabled),
    │                           #   authApi.changePassword(newPassword, currentPassword),
    │                           #   apiErrorMessage(err, fallback)
    └── components/
        ├── BrandInput.js       # + showSecureToggle prop (Eye / EyeOff pressable)
        └── ProfileView.js      # NEW — Student Details / Change Password /
                                #       Notification Settings, rendered by
                                #       DashboardScreen when activeSem === 'PROFILE'
```

Not committed by design: `android/` and `ios/` (generated by `expo prebuild` under CNG), `node_modules/`, `.expo/`.
