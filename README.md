# Local Guide

> A modern travel companion built with **Next.js 16**, **Better Auth**, **Prisma/PostgreSQL**, and a **React-Native (Expo)** client. Discover curated Google Places recommendations, save favorites, and manage your own spots across devices.

---

## Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Environment Variables](#environment-variables)
5. [Backend Setup (`/src`)](#backend-setup-src)
6. [Frontend Setup (`/frontend`)](#frontend-setup-frontend)
7. [Running the Full Stack](#running-the-full-stack)
8. [Development Tips](#development-tips)
9. [Troubleshooting](#troubleshooting)
10. [License](#license)

---

## Features
- **Authentication & Roles**  
  Email/password auth with verification, sessions, and admin roles powered by Better Auth.

- **Smart Discovery**  
  Google Places nearby + text search with throttling, caching, and graceful fallbacks when quota limits are hit.

- **Interactive Map**  
  Tap anywhere to drop a pin, auto-resolve the address, preview nearby spots, or add the location to your list.

- **Favorites that stay in sync**  
  Starring a place updates the shared context instantly; the favorites screen simply reads from `getFavorites()`.

- **Weather context**  
  Live OpenWeather data (temperature, condition, icon) on every place detail.

- **Offline-friendly**  
  Custom places and favorites persist locally via AsyncStorage.

---

## Architecture
```
.
├── README.md
├── src/                 # Next.js backend
│   ├── app/api/...      # Better Auth + Local Guide endpoints
│   ├── lib/             # Auth config, Prisma client, email helpers
│   ├── prisma/          # Schema & migrations
│   └── next.config.ts
└── frontend/            # React Native (Expo) client
    ├── app/             # Screens (home, map, add, favorites, auth)
    ├── components/
    ├── context/         # PlacesProvider (discovery, favorites, caching)
    ├── hooks/
    ├── services/        # Google Places, categories, weather helpers
    └── utils/
```

---

## Prerequisites
- Node.js 18+
- npm / pnpm / yarn
- PostgreSQL 16 (running locally or remote)
- Expo CLI (`npx expo`)
- Google Cloud project with **Places API** enabled
- **OpenWeather** API key

---

## Environment Variables

### `src/.env` (or `.env.local`)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/local_guide?schema=public"

BETTER_AUTH_SECRET=0fa8b7c38d47e6250c4d1dd2e8045afbbf5901c1c0e06f8e870fe5b029d7a3cc


GMAIL_USER="localxiaoyang@gmail.com"
GMAIL_APP_PASSWORD="qomdywkvbpacxjzh"
```

### `frontend/.env`
```env
EXPO_PUBLIC_API_BASE_URL="http://192.168.2.11:3000"   # use backend address as shown in the actual command line

# Google Places API Key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyAU6vsj5SAkxy1or3rjq66VoMSnshNTl5s
EXPO_PUBLIC_OPENWEATHER_API_KEY="your_openweather_key"
```

> **Tip:** When testing on a physical device, replace `127.0.0.1` with your computer’s LAN IP and keep `EXPO_DEV_ORIGIN` in sync. Otherwise Better Auth will reject requests because of mismatched origins.

---

## Backend Setup (`/src`)
```bash
cd src
npm install
npx prisma migrate dev      # apply migrations
npx prisma generate         # create Prisma client
```

Run the dev server:
```bash
npm run dev                 # http://127.0.0.1:3000
```

Useful scripts:
```bash
npm run build               # production build
npm run start               # serve production build
npm run lint                # lint backend code
npx prisma studio           # inspect DB tables
```

---

## Frontend Setup (`/frontend`)
```bash
cd frontend
npm install
npx expo start              # choose iOS / Android / Web
```
The Expo server prints a QR code or you can press `i`/`a` to launch an emulator. Ensure `EXPO_PUBLIC_API_BASE_URL` points to your backend (LAN IP for real devices).

---

## Running the Full Stack
1. **Start PostgreSQL** (if local)  
   - Windows: `net start postgresql-x64-16`  
   - macOS (Homebrew): `brew services start postgresql@16`

2. **Backend**  
   ```bash
   cd src
   npm run dev
   ```

3. **Frontend**  
   ```bash
   cd frontend
   npx expo start
   ```

4. **Sign up → verify email → sign in**  
   - `/signup` uses Better Auth to create the account and sends a Gmail-based verification link.  
   - `/signin` logs in and routes back to `/`.



5. **APK**
  - First install your JAVA 17
  ```bash
  conda install -c conda-forge openjdk=17 
  ```
  - get your java path
  ```bash
  /usr/libexec/java_home -v 17
  ```
  - copy your java path ,and put that command in the frontend/android/gradle.properties
  ```bash
  org.gradle.java.home=your java path
  ```
  - run
  ```bash
  cd android && ./gradlew --stop && cd ..
  rm -rf android/.gradle
  eas build -p android --profile preview --local
  ```
6. **src/.env**
```bash
# Database
DATABASE_URL="postgresql://shiyaosun:12345@localhost:5432/local_guide?schema=public"

#NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:3000"

BETTER_AUTH_URL="http://192.168.0.10:3000"

# 你的 Next.js API 地址
NEXT_PUBLIC_API_BASE_URL="http://192.168.0.10:3000"

GMAIL_USER="localxiaoyang@gmail.com"
GMAIL_APP_PASSWORD="qomdywkvbpacxjzh" 
BETTER_AUTH_SECRET=KWbps5LBO9ZSihHVSR+RUTOjQMmDFC3s+4G0imT4JzE=

#EXPO_DEV_ORIGIN="exp://192.168.0.10:8081"

# DigitalOcean Spaces Config
USE_CDN=true
DO_SPACES_KEY=DO801NQ7TPZ2MN8DK46L
DO_SPACES_SECRET=VXYs+VmHMCkl6p47WFNExhagrOqLiaXjlMfaODGNnEk
DO_SPACES_BUCKET=movies-images
DO_SPACES_REGION=tor1
DO_SPACES_ENDPOINT=https://tor1.digitaloceanspaces.com
CDN_URL=https://movies-images.tor1.cdn.digitaloceanspaces.com
```


---

## Development Tips
- **Favorites**: The favorites screen reads from the shared context (`usePlaces().getFavorites()`), so starring/unstarring instantly updates every UI.
- **Map view**:  
  - Tap anywhere to drop a pin.  
  - The modal shows the resolved address (via Places) and offers **Add to My Places** and **Search Nearby** actions.  
  - “Search Nearby” fetches curated Google Places recommendations around the pin.
- **Weather widget**: Uses OpenWeather’s `/weather` endpoint. Provide your API key in `frontend/.env`.
- **Places quotas**: We cache nearby (5 min) and search (2 min) responses and cap list lengths (6 & 10) to avoid quota exhaustion and UI flashing.
- **Testing on device**: Keep `EXPO_PUBLIC_API_BASE_URL` and `EXPO_DEV_ORIGIN` aligned with your LAN IP; Better Auth validates origins.

---

## Troubleshooting
| Issue | Fix |
| --- | --- |
| `Invalid origin` from Better Auth | Ensure `EXPO_PUBLIC_API_BASE_URL`, `EXPO_DEV_ORIGIN`, and backend `trustedOrigins` all reference the same protocol/host/port. |
| Favorites screen empty | Favorites now load from local context; ensure you star places in the app (or seed data) and that `usePlaces()` is available above the screen. |
| Google Places quota exceeded | Wait for quota reset or request higher limits. We already cache responses and display fallbacks, but heavy testing can still hit limits. |
| Weather shows “unavailable” | Confirm `EXPO_PUBLIC_OPENWEATHER_API_KEY` is set and the device has network access. |

---

## License
MIT License © Local Guide team.  
Feel free to fork, extend, or integrate into your own projects. Pull requests and bug reports are always welcome!

