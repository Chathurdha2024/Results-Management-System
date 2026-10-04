# Project Progress — Result Management System (Ruhuna EngRMS)

Last updated: 2026-09-30

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

---

## 4. Next Steps / Backlog

- [ ] On-device QA of the mobile app golden paths (login, first-login password change, semester views, notifications, logout).
- [ ] Optional: app icon & splash screen branded with the EngRMS logo (currently Expo defaults).
- [ ] Optional: push notifications (Expo Notifications) replacing polling for result releases.
- [ ] Optional: build a release APK via EAS Build for distribution without Expo Go.
- [ ] Recommended backend hardening: `@fastify/rate-limit` on auth endpoints, `@fastify/helmet`, move JWT secret to env (currently hardcoded in `server.js`).

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
