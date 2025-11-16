### Environment Setup and Configuration
- Ensure **PostgreSQL v16** is installed and running locally.
    - Start the database service:
        - `net start postgresql-x64-16`(Windows)
        - `brew services start postgresql@16`(Mac OS)
- Navigate to the project root and install all dependencies:
    - `cd backend`
    - `npm install`
- Ensure the following environment variables are set up:

**In `backend/.env`:**

```
DATABASE_URL="postgresql://username:password@localhost:5432/paper_management?schema=public"
```
### Database Initialization

Use the following Prisma commands in the `backend` directory:

- `npx prisma format`
- `npx prisma migrate reset`
- `npx prisma generate`
- `npx prisma migrate dev`

If issues arise, try:

- `npx @better-auth/cli migrate`

# TODO
To seed initial data (requires dev server to be running):

- All at once:
    - `./src/scripts/seed-all.bat`
- Or individually:
    
    ```
    node src/scripts/seed-admin.cjs
    node src/scripts/seed-movie.cjs
    node src/scripts/seed-show.mjs
    node src/scripts/seed-user.cjs
    node src/scripts/seed-ticket.mjs
    node src/scripts/seed-transaction.cjs
    ```
    

Default admin account:

- **Email**: `admin@example.com`
- **Password**: `admin123`
