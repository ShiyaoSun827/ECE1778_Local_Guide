### Environment Setup and Configuration
- Ensure **PostgreSQL v16** is installed and running locally.
    - Start the database service:
        - `net start postgresql-x64-16`(Windows)
        - `brew services start postgresql@16`(Mac OS)
- Navigate to the project root and install all dependencies:
    - `cd backend`
    - `npm install`
- Ensure the following environment variables are set up:

**In `src/.env`:**

```
DATABASE_URL="postgresql://username:password@localhost:5432/paper_management?schema=public"

GMAIL_USER="localxiaoyang@gmail.com"
GMAIL_APP_PASSWORD="qomdywkvbpacxjzh" 


```
**In `frontend/.env`:**

```
EXPO_PUBLIC_API_BASE_URL="use your own backend 'Network' IP "
```

### Database Initialization

Use the following Prisma commands in the `backend` directory:

- `npx prisma format`
- `npx prisma migrate reset`
- `npx prisma generate`
- `npx prisma migrate dev`

If issues arise, try:

- `npx @better-auth/cli migrate`


### Start the backend

From the repository root:

```bash
npm run dev
```

The backend listens by default at: `http://127.0.0.1:3000`

Provided endpoints:

- `/api/auth/...` — Better Auth: sign up / sign in / sign out / session / email verification
- `/api/places`, `/api/favorites`, etc. — Local Guide business APIs (used by the mobile app)

---

## Frontend (React Native + Expo)

The frontend is in the `frontend/` directory.

### Install dependencies

```bash
cd frontend
npm install
```

### Configure frontend → backend base URL

`authClient.ts` is configured to call the backend (e.g. `http://127.0.0.1:3000` or a LAN IP). To control this with an environment variable, add to `frontend/.env`:

```env
EXPO_PUBLIC_API_BASE_URL="Use yours"
```

and in `authClient.ts`:

```ts
const baseURL =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3000";
```

Notes:
- For a physical phone, set the value to your computer’s LAN IP, e.g. `http://192.168.0.10:3000`.
- The IP must match the IP in the backend `.env` value `EXPO_DEV_ORIGIN`; otherwise Better Auth may reject requests with "Invalid origin".

### Start Expo dev server

From `frontend/`:

```bash
npx expo start
```






### Account-related logic

1. Visitor opens the app
    - Sees the home page (`index.tsx`) with no Sign Out button at the bottom.
    - Top-right avatar is an outline; tapping it navigates to `/signin`.

2. Sign up
    - On `/signup` fill in details → `authClient.signUp.email(...)`.
    - Backend (Better Auth) creates the user and sends a verification email.
    - User clicks the verification link → `emailVerified = true`.
    - Return to the app and sign in from `/signin`.

3. Sign in
    - On `/signin` enter email and password → `authClient.signIn.email(...)`.
    - On success → `router.replace("/")` to return to the home page.
    - Home now shows the Sign Out button and the top-right avatar becomes filled.

4. Sign out

    - Top-right avatar → show an alert confirmation; on confirm call `authClient.signOut()` and show a "Signed out" message.

5. Next time the app opens
    - If the session is still valid, `useSession()` returns the user:
      - Sign Out remains visible on the home page.
      - Visiting `/signin` will `router.replace("/")` and redirect to home.
    - If signed out, `useSession()` is empty:
      - No Sign Out button is shown.
      - Clicking the top-right avatar navigates to `/signin` to sign in again.







