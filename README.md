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

# Completed
### 1. `prisma/schema.prisma` —— **数据库 & 业务模型设计**

* 定义 **User / Session / Account / Verification**：

  * 满足 Better Auth 的结构要求（邮箱登录、密码、验证 token、session 记录等）
* 定义 **Local Guide 领域模型**：

  * `Place`：一个地点的所有信息（title, description, address, latitude, longitude, imageUri, ownerId, createdAt…）
  * `Favorite`：`userId + placeId` 组合，记录谁收藏了什么
  * `Category`、`Comment` 等
---

### 2. `src/lib/prisma.ts` —— **Prisma**

---

### 3. `src/lib/email.ts` —— **发邮箱验证邮件/通知的工具**

* 用 `nodemailer` 封装一个 `sendEmail({ to, subject, html })`：

  * 读 `.env` 的 `SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS`
  * 支撑 **邮箱验证功能**：Better Auth 产生验证 URL，这个模块负责真正发出邮件。

---

### 4. `src/lib/auth.ts` —— **Better Auth 后端配置**

* 使用 `betterAuth(...)` + `prismaAdapter(prisma, { provider: 'postgresql' })` 把认证系统挂到数据库。

* 开启 **email + password 登录**：

  ```ts
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  }
  ```

* 配置邮箱验证逻辑：

  ```ts
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: ({ user, url }) => sendEmail(...)
  }
  ```

* 使用 `nextCookies()` 插件管理 cookie；

* 使用 `admin({ adminRoles: ["admin", "superadmin"] })` 来区分管理员。
---

### 5. `src/app/api/auth/[...all]/route.ts` —— **认证 REST API **


```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

* **注意-----------------------把所有 Better Auth 自带的接口挂在 `/api/auth/*` 下面**：

  * `/api/auth/sign-up/email`
  * `/api/auth/sign-in/email`
  * `/api/auth/sign-out`
  * `/api/auth/email/verify`
  * ……

---

### 6. `src/lib/auth-client.ts` —— **前端用的认证客户端**
* 用 `createAuthClient` 生成一个 `authClient`，指向 `/api/auth/...`
* 导出 `signUp`, `signIn`, `signOut`, `verifyEmail`, `useSession` 等方法给前端。

---

### 7. `src/app/api/auth/actions.ts`—— **登录 / 注册 / 退出的 Server Actions**


* server action：

  ```ts
  export async function signUpWithEmail(formData: FormData) { ... }
  export async function signInWithEmail(formData: FormData) { ... }
  export async function logout() { ... }
  ```

* 内部调用 `auth.api.signUpEmail` / `auth.api.signInEmail` / `auth.api.signOut`，并且：

  * 根据返回状态码处理 “邮箱未验证” / “密码错误” / “成功”
  * 返回给前端一个统一的 `{ success, message, redirectTo }` 结构，方便在页面里显示 toast + 做跳转。










