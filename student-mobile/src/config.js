import Constants from 'expo-constants';

// How the app finds the Fastify backend (port 3000):
//
// 1. EXPO_PUBLIC_API_URL — create student-mobile/.env to force a URL, e.g.
//      EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
//      EXPO_PUBLIC_API_URL=https://your-tunnel.loca.lt
//    Use the tunnel form when the phone is NOT on the same Wi-Fi as this PC.
//    Restart Metro (npx expo start) after changing .env.
// 2. Otherwise the hostname Metro is served from is reused — with a plain
//    `npx expo start`, that is this PC's LAN IP, so the phone connects
//    automatically when both are on the same Wi-Fi.
// 3. Otherwise fall back to localhost (web browser / emulator).
//
// Tunnel hostnames (ngrok / exp.direct / loca.lt) are ignored in step 2:
// they only forward Metro's port 8081, never the backend's 3000.

const API_PORT = 3000;

function resolveBaseUrl() {
  const override = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (override) return override.replace(/\/+$/, '');

  const hostname = Constants.expoConfig?.hostUri?.split(':')[0];
  const isTunnelOrLocal =
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('ngrok') ||
    hostname.includes('exp.direct') ||
    hostname.includes('loca.lt');

  if (!isTunnelOrLocal) return `http://${hostname}:${API_PORT}`;
  return `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
