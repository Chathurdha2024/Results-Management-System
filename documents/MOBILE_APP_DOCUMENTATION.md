# 🎓 Results Management System - Mobile App Architecture & Documentation

This document provides a comprehensive overview of the Student Mobile Application architecture for the Results Management System (RMS). It covers the technologies used, architectural decisions, routing, state management, and API integrations.

---

## 1. Overview
The RMS Mobile Application is a companion app designed exclusively for Students. It allows them to view their dashboard, check exam schedules, monitor their results/GPA, and receive real-time notifications directly from their mobile devices. It is built as a cross-platform application (iOS & Android) to ensure maximum accessibility.

## 2. Technology Stack

### Core Frameworks & Tooling
*   **React Native (0.86):** The core framework for building native cross-platform mobile apps using React principles.
*   **Expo (~57):** The framework and platform built around React Native. Chosen for its streamlined development experience, managed build process (EAS), and built-in modules (Splash Screen, Fonts, Status Bar).
*   **React Navigation v7:** Used for native app routing. Specifically, `@react-navigation/native` and `@react-navigation/native-stack` are utilized to manage the screen stack and transitions seamlessly.

### Styling & UI Design System
*   **Custom Theme (`src/theme.js`):** A centralized styling theme reflecting the brand's colors (`brand900`, `brandGold`, `brandWhite`).
*   **Safe Area Context:** `react-native-safe-area-context` ensures the UI avoids notches, status bars, and home indicators on modern edge-to-edge screens.
*   **Fonts:** The same `Geist-Variable` font used in the web portal is loaded via `expo-font` to ensure a consistent, premium brand identity across all platforms.
*   **Icons:** `lucide-react-native` provides clean, modern SVG icons that match the Shadcn/ui icons used on the web.

### Network & State
*   **Axios:** Handles all HTTP communication with the Fastify backend API.
*   **AsyncStorage:** `@react-native-async-storage/async-storage` securely stores the JWT (JSON Web Token) persistently across app restarts.

---

## 3. Architecture & Request Flow

The mobile app follows a Component-Based Architecture tailored for native environments.

```mermaid
graph TD
    subgraph Mobile App (Expo / React Native)
        NAV[React Navigation Stack]
        
        subgraph Screens
            A[LoginScreen]
            B[ChangePasswordScreen]
            C[DashboardScreen]
        end
        
        subgraph Storage & Security
            STORAGE[(AsyncStorage)]
        end
        
        subgraph API Client
            AXIOS[Axios Instance + Interceptors]
        end
    end
    
    NAV --> Screens
    A --> |Save JWT| STORAGE
    C <--> |Read JWT| STORAGE
    Screens --> AXIOS
    AXIOS --> |HTTP Request| BACKEND((Fastify API Layer))
```

### Why This Architecture?
*   **Stateless Scaling:** By relying on JWTs stored locally rather than session cookies, the mobile app interacts with the exact same Fastify API as the Web Portals, ensuring DRY (Don't Repeat Yourself) backend logic.
*   **Native Feel:** Using `Native Stack` navigation means the app uses the underlying native navigation primitives (like UIViewController on iOS), making transitions feel hardware-accelerated and smooth.

---

## 4. Security & Data Flow

1.  **Authentication Flow:**
    *   Student submits `RegNo` and `Password` on the `LoginScreen`.
    *   Axios POSTs to `/api/auth/student/login`.
    *   Upon success, the Fastify backend returns a JWT.
    *   The JWT is immediately saved into `AsyncStorage` using the key `studentToken`.
    *   If it is the student's first login (indicated by the backend), they are routed to `ChangePasswordScreen`. Otherwise, they proceed to `DashboardScreen`.

2.  **API Interceptors (`src/api.js`):**
    *   Before any request leaves the phone, an Axios Request Interceptor asynchronously retrieves the token from `AsyncStorage`.
    *   It automatically attaches the `Authorization: Bearer <token>` header.
    *   A custom error handler gracefully manages network transport failures (e.g., when the phone drops Wi-Fi or cannot reach the backend IP) without faking bad credentials.

---

## 5. Key Screens & Features

*   **LoginScreen:** The entry point. Handles credentials and initial backend ping.
*   **ChangePasswordScreen:** A forced security flow for first-time logins to ensure students do not use the auto-generated batch passwords indefinitely.
*   **DashboardScreen:** The central hub pulling aggregated data from multiple endpoints:
    *   `studentApi.dashboard()`: Fetches GPA, module results, and profile info.
    *   `studentApi.examSchedules()`: Fetches upcoming exam dates and locations.
    *   `studentApi.notifications()`: Fetches system alerts and grade publish notices.

---

## 6. System Limits & Future Enhancements

### Current Limits
*   **Token Security:** `AsyncStorage` stores data in plain text on the device. While standard apps do this, it is technically accessible if a device is deeply compromised or jailbroken.
*   **Offline Mode:** Currently, the app requires an active network connection to display the dashboard. If the network drops, API calls fail.

### Future Enhancements
*   **Secure Storage:** Migrate from `AsyncStorage` to `expo-secure-store` to encrypt the JWT using the device's native Keystore (Android) or Keychain (iOS).
*   **Offline Caching:** Implement a local SQLite database or sophisticated caching layer so students can view their downloaded results and exam schedules even when offline.
*   **Push Notifications:** Integrate Expo Push Notifications or Firebase Cloud Messaging (FCM) to actively wake up the device when grades are published, rather than relying on the student opening the app to poll for notifications.
