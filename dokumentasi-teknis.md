# 📗 Internal Collaboration Platform

## Technical Documentation

---

# 1. Overview Teknis

Proyek ini adalah aplikasi fullstack monorepo dengan:

- **Frontend**: Nuxt
- **Backend**: NestJS + Prisma ORM
- **Database**: PostgreSQL
- **Realtime**: WebSocket (Socket.IO via NestJS Gateway)
- **Auth**: JWT (access token + refresh token)

---

# 2. Struktur Monorepo

```
team-flow/
├── app/                      # Nuxt 3 frontend
├── backend/                  # NestJS backend
├── package.json              # root workspace (npm workspaces)
└── .env                      # environment variables shared (opsional)
```

### Root `package.json`

```json
{
  "name": "team-flow",
  "private": true,
  "workspaces": [
    "app",
    "backend"
  ],
  "scripts": {
    "dev:app": "npm run dev --workspace=app",
    "dev:backend": "npm run dev --workspace=backend",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:app\"",
    "build": "npm run build --workspace=app && npm run build --workspace=backend"
  },
  "devDependencies": {
    "concurrently": "^9.x"
  }
}
```

---

# 3. Tech Stack

## 3.1 Frontend — `app/`

| Teknologi | Versi | Kegunaan |
|---|---|---|
| Nuxt | ^4.x | Framework utama (SSR/SPA hybrid) |
| Vue | ^3.4.x | UI layer |
| Pinia | ^2.2.x | State management |
| TailwindCSS | ^4.x | Styling (JIT compiler) |
| Socket.IO Client | ^4.8.x | Realtime chat & notifikasi |
| @vueuse/core | ^11.x | Composable utilities |

## 3.2 Backend — `backend/`

| Teknologi | Versi | Kegunaan |
|---|---|---|
| NestJS | ^11.x | Framework backend |
| Prisma ORM | ^6.x | Database access layer (dengan AI features) |
| PostgreSQL | ^16.x | Database utama |
| Passport.js | ^0.7.x | Auth strategy |
| passport-jwt | ^4.0.x | JWT strategy |
| @nestjs/jwt | ^12.x | JWT module |
| @nestjs/passport | ^10.x | Passport integration |
| Socket.IO | ^4.8.x | WebSocket server |
| bcrypt | ^5.1.x | Password hashing |
| class-validator | ^0.15.x | Request validation |
| class-transformer | ^0.5.x | DTO transformation |
| @nestjs/config | ^3.x | Environment config |
| @nestjs/common | ^11.x | Common utilities |

---

# 4. Struktur Proyek

## 4.1 Frontend — `app/`

```
app/
├── assets/
├── components/
│   ├── ui/                   # komponen generik (Button, Input, Modal, dll)
│   ├── layout/               # Sidebar, Navbar, dll
│   ├── announcement/
│   ├── task/
│   ├── calendar/
│   ├── chat/
│   └── notification/
├── composables/
│   ├── useAuth.ts
│   ├── useTeam.ts
│   ├── useSocket.ts
│   └── useNotification.ts
├── layouts/
│   ├── default.vue           # layout workspace (sidebar + header)
│   ├── auth.vue              # layout login/register
│   └── admin.vue             # layout panel system admin
├── pages/
│   ├── index.vue             # redirect ke /login atau /dashboard
│   ├── login.vue
│   ├── register.vue
│   ├── forgot-password.vue
│   ├── reset-password.vue
│   ├── onboarding.vue
│   ├── dashboard.vue
│   ├── teams/
│   │   └── [teamId]/
│   │       ├── index.vue          # overview workspace team
│   │       ├── announcements.vue
│   │       ├── tasks.vue
│   │       ├── calendar.vue
│   │       ├── chat.vue
│   │       └── settings.vue       # pengaturan team (hanya Manager)
│   ├── profile.vue
│   └── admin/
│       ├── index.vue
│       ├── users.vue
│       └── teams.vue
├── stores/
│   ├── auth.ts
│   ├── team.ts
│   ├── notification.ts
│   └── chat.ts
├── middleware/
│   ├── auth.ts               # redirect jika belum login
│   └── admin.ts              # guard halaman admin
├── plugins/
│   └── socket.client.ts      # inisialisasi Socket.IO
├── utils/
│   └── api.ts                # wrapper fetch / $fetch
├── nuxt.config.ts
└── package.json
```

## 4.2 Backend — `backend/`

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   ├── jwt.strategy.ts
│       │   │   └── jwt-refresh.strategy.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── roles.guard.ts
│       │   └── dto/
│       │       ├── register.dto.ts
│       │       ├── login.dto.ts
│       │       └── reset-password.dto.ts
│       ├── user/
│       │   ├── user.module.ts
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   └── dto/
│       ├── team/
│       │   ├── team.module.ts
│       │   ├── team.controller.ts
│       │   ├── team.service.ts
│       │   └── dto/
│       ├── announcement/
│       ├── task/
│       ├── event/
│       ├── chat/
│       │   ├── chat.module.ts
│       │   ├── chat.gateway.ts       # WebSocket gateway
│       │   ├── chat.service.ts
│       │   └── dto/
│       ├── notification/
│       └── admin/
│           ├── admin.module.ts
│           ├── admin.controller.ts
│           └── admin.service.ts
├── src/
│   └── common/
│       ├── decorators/
│       │   ├── current-user.decorator.ts
│       │   └── roles.decorator.ts
│       ├── filters/
│       │   └── http-exception.filter.ts
│       └── interceptors/
│           └── response.interceptor.ts
├── .env
└── package.json
```

---

# 5. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum TeamRole {
  MANAGER
  MEMBER
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum EventType {
  MEETING
  TRAINING
  DEADLINE
  INTERNAL
}

enum NotificationType {
  TEAM_INVITE
  INVITE_ACCEPTED
  INVITE_DECLINED
  MEMBER_JOINED
  ROLE_CHANGED
  TASK_ASSIGNED
  TASK_STATUS_UPDATED
  ANNOUNCEMENT_CREATED
  EVENT_CREATED
}

// ─────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────

model User {
  id             String    @id @default(cuid())
  name           String
  email          String    @unique
  password       String
  avatar         String?
  bio            String?
  isSystemAdmin  Boolean   @default(false)
  refreshToken   String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  teamMembers         TeamMember[]
  createdTeams        Team[]            @relation("TeamCreator")
  announcements       Announcement[]
  tasksCreated        Task[]            @relation("TaskCreator")
  tasksAssigned       Task[]            @relation("TaskAssignee")
  eventsCreated       Event[]
  chatMessages        ChatMessage[]
  notifications       Notification[]
  sentInvites         TeamInvite[]      @relation("InviteSender")
  receivedInvites     TeamInvite[]      @relation("InviteReceiver")
}

model Team {
  id          String    @id @default(cuid())
  name        String
  description String?
  avatar      String?
  createdById String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  createdBy    User           @relation("TeamCreator", fields: [createdById], references: [id])
  members      TeamMember[]
  announcements Announcement[]
  tasks        Task[]
  events       Event[]
  chatMessages ChatMessage[]
  invites      TeamInvite[]
}

model TeamMember {
  id        String    @id @default(cuid())
  userId    String
  teamId    String
  role      TeamRole  @default(MEMBER)
  joinedAt  DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@unique([userId, teamId])
}

model TeamInvite {
  id          String    @id @default(cuid())
  teamId      String
  senderId    String
  receiverId  String
  role        TeamRole  @default(MEMBER)
  accepted    Boolean?  // null = pending, true = accepted, false = declined
  createdAt   DateTime  @default(now())
  respondedAt DateTime?

  team     Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  sender   User @relation("InviteSender", fields: [senderId], references: [id])
  receiver User @relation("InviteReceiver", fields: [receiverId], references: [id])

  @@unique([teamId, receiverId])
}

model Announcement {
  id        String    @id @default(cuid())
  title     String
  content   String
  pinned    Boolean   @default(false)
  authorId  String
  teamId    String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  author   User                @relation(fields: [authorId], references: [id])
  team     Team                @relation(fields: [teamId], references: [id], onDelete: Cascade)
  readBy   AnnouncementRead[]
}

model AnnouncementRead {
  id             String   @id @default(cuid())
  announcementId String
  userId         String
  readAt         DateTime @default(now())

  announcement Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)

  @@unique([announcementId, userId])
}

model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  teamId      String
  createdById String
  assigneeId  String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?

  team      Team  @relation(fields: [teamId], references: [id], onDelete: Cascade)
  createdBy User  @relation("TaskCreator", fields: [createdById], references: [id])
  assignee  User? @relation("TaskAssignee", fields: [assigneeId], references: [id])
}

model Event {
  id          String    @id @default(cuid())
  title       String
  description String?
  type        EventType @default(INTERNAL)
  startDate   DateTime
  endDate     DateTime?
  teamId      String
  createdById String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  team      Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  createdBy User @relation(fields: [createdById], references: [id])
}

model ChatMessage {
  id        String   @id @default(cuid())
  message   String
  senderId  String
  teamId    String
  createdAt DateTime @default(now())

  sender User @relation(fields: [senderId], references: [id])
  team   Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
}

model Notification {
  id            String           @id @default(cuid())
  userId        String
  type          NotificationType
  referenceId   String?          // id entitas terkait (teamId, taskId, dll)
  referenceType String?          // "team" | "task" | "announcement" | "event"
  message       String
  isRead        Boolean          @default(false)
  createdAt     DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

# 6. API Design

## Konvensi

- Base URL: `/api/v1`
- Auth header: `Authorization: Bearer <access_token>`
- Response format:

```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

Error format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [ ... ]
}
```

---

## 6.1 Auth Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/register` | - | Registrasi user baru |
| POST | `/auth/login` | - | Login, kembalikan access + refresh token |
| POST | `/auth/refresh` | Refresh Token | Dapatkan access token baru |
| POST | `/auth/logout` | JWT | Invalidate refresh token |
| POST | `/auth/forgot-password` | - | Kirim link reset ke email |
| POST | `/auth/reset-password` | - | Reset password via token dari email |

## 6.2 User Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/users/me` | JWT | Profil user yang sedang login |
| PATCH | `/users/me` | JWT | Update profil (nama, bio, avatar) |
| PATCH | `/users/me/password` | JWT | Ganti password |
| GET | `/users/search?q=` | JWT | Cari user by email / username untuk invite |

## 6.3 Team Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/teams` | JWT | - | Daftar team milik user |
| POST | `/teams` | JWT | - | Buat team baru |
| GET | `/teams/:teamId` | JWT | Member+ | Detail team |
| PATCH | `/teams/:teamId` | JWT | Manager | Update info team |
| DELETE | `/teams/:teamId` | JWT | Manager | Hapus team |
| GET | `/teams/:teamId/members` | JWT | Member+ | Daftar anggota |
| PATCH | `/teams/:teamId/members/:userId` | JWT | Manager | Ubah role anggota |
| DELETE | `/teams/:teamId/members/:userId` | JWT | Manager | Keluarkan anggota |
| POST | `/teams/:teamId/leave` | JWT | Member+ | Keluar dari team |
| POST | `/teams/:teamId/transfer` | JWT | Manager | Transfer kepemilikan |

## 6.4 Invite Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/teams/:teamId/invites` | JWT | Manager | Kirim undangan |
| GET | `/invites` | JWT | - | Daftar undangan masuk user |
| POST | `/invites/:inviteId/accept` | JWT | - | Terima undangan |
| POST | `/invites/:inviteId/decline` | JWT | - | Tolak undangan |

## 6.5 Announcement Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/teams/:teamId/announcements` | JWT | Member+ | Daftar announcement |
| POST | `/teams/:teamId/announcements` | JWT | Manager | Buat announcement |
| PATCH | `/teams/:teamId/announcements/:id` | JWT | Manager | Edit announcement |
| DELETE | `/teams/:teamId/announcements/:id` | JWT | Manager | Hapus announcement |
| PATCH | `/teams/:teamId/announcements/:id/pin` | JWT | Manager | Toggle pin |
| POST | `/teams/:teamId/announcements/:id/read` | JWT | Member+ | Mark as read |

## 6.6 Task Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/teams/:teamId/tasks` | JWT | Member+ | Daftar task (board) |
| POST | `/teams/:teamId/tasks` | JWT | Manager | Buat task |
| GET | `/teams/:teamId/tasks/:id` | JWT | Member+ | Detail task |
| PATCH | `/teams/:teamId/tasks/:id` | JWT | Manager/Assignee | Update task |
| DELETE | `/teams/:teamId/tasks/:id` | JWT | Manager | Hapus task |
| PATCH | `/teams/:teamId/tasks/:id/status` | JWT | Assignee+ | Update status |

## 6.7 Event Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/teams/:teamId/events` | JWT | Member+ | Daftar event |
| POST | `/teams/:teamId/events` | JWT | Manager | Buat event |
| PATCH | `/teams/:teamId/events/:id` | JWT | Manager | Edit event |
| DELETE | `/teams/:teamId/events/:id` | JWT | Manager | Hapus event |

## 6.8 Chat Endpoints (REST — history)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/teams/:teamId/messages?cursor=&limit=` | JWT | Ambil history chat (cursor-based pagination) |

## 6.9 Notification Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/notifications` | JWT | Daftar notifikasi user |
| POST | `/notifications/:id/read` | JWT | Mark satu notifikasi sebagai dibaca |
| POST | `/notifications/read-all` | JWT | Mark semua sebagai dibaca |

## 6.10 Admin Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/admin/users` | System Admin | Daftar semua user |
| PATCH | `/admin/users/:id/deactivate` | System Admin | Nonaktifkan user |
| DELETE | `/admin/users/:id` | System Admin | Hapus user |
| GET | `/admin/teams` | System Admin | Daftar semua team |
| DELETE | `/admin/teams/:id` | System Admin | Hapus team |

---

# 7. Authentication Flow

## 7.1 Register & Login

```
POST /auth/register
→ simpan user, hash password dengan bcrypt
→ return access_token (15m) + refresh_token (7d)
→ refresh_token disimpan (hashed) di kolom User.refreshToken

POST /auth/login
→ validasi email + password
→ return access_token + refresh_token
```

## 7.2 Refresh Token

```
POST /auth/refresh
Header: Authorization: Bearer <refresh_token>
→ validasi refresh_token dengan JwtRefreshStrategy
→ cocokkan hash refresh_token di database
→ return access_token baru + refresh_token baru (rotation)
→ update User.refreshToken di database
```

## 7.3 Logout

```
POST /auth/logout
→ set User.refreshToken = null
→ access_token tetap valid sampai expired (stateless)
```

## 7.4 Reset Password

```
POST /auth/forgot-password  { email }
→ generate reset token (UUID / signed JWT 1 jam)
→ kirim email berisi link: /reset-password?token=...

POST /auth/reset-password  { token, newPassword }
→ validasi token
→ update password user
→ invalidate refresh_token (paksa login ulang)
```

---

# 8. WebSocket (Chat & Notifikasi Realtime)

## Gateway: `chat.gateway.ts`

Menggunakan `@WebSocketGateway` dari NestJS dengan Socket.IO adapter.

### Autentikasi WebSocket

```
Client mengirim access_token saat handshake:
socket = io(url, { auth: { token: access_token } })

Server memvalidasi token di handleConnection()
Jika tidak valid → disconnect()
```

### Events — Client → Server

| Event | Payload | Deskripsi |
|---|---|---|
| `join_team` | `{ teamId }` | Masuk ke room team |
| `leave_team` | `{ teamId }` | Keluar dari room |
| `send_message` | `{ teamId, message }` | Kirim pesan |
| `typing` | `{ teamId }` | Indikator sedang mengetik |

### Events — Server → Client

| Event | Payload | Deskripsi |
|---|---|---|
| `new_message` | `ChatMessage` | Pesan baru di room |
| `user_typing` | `{ userId, teamId }` | User sedang mengetik |
| `notification` | `Notification` | Push notifikasi realtime |

### Alur Pesan

```
1. Client emit send_message
2. Gateway validasi user adalah anggota team
3. Simpan pesan ke database via ChatService
4. Broadcast ke seluruh anggota room team via new_message
```

---

# 9. Role Guard

## Dua Jenis Guard

1. **JwtAuthGuard** — memastikan user sudah login (semua endpoint protected)
2. **RolesGuard** — memastikan user memiliki role yang diperlukan di team tersebut

## Implementasi

```typescript
// Contoh penggunaan pada controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER')                      // role di dalam team
@Post(':teamId/announcements')
create(@Param('teamId') teamId: string, @Body() dto: CreateAnnouncementDto) {}
```

`RolesGuard` mengambil `teamId` dari route param, lalu query `TeamMember` untuk memverifikasi role user di team tersebut.

---

# 10. Environment Variables

## `backend/.env`

```env
# App
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/teamflow"

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Email (untuk forgot password & invite)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_pass
MAIL_FROM="Team Flow <no-reply@teamflow.app>"

# Frontend URL (untuk link reset password)
FRONTEND_URL=http://localhost:3000
```

## `app/.env`

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
NUXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

# 11. Development Setup

## Prasyarat

- Node.js >= 22 (LTS)
- PostgreSQL >= 16
- npm >= 10 atau pnpm >= 9

## Langkah Setup

```bash
# 1. Clone & install dependencies
git clone <repo-url>
cd team-flow
npm install

# 2. Setup database (backend)
cd backend
cp .env.example .env
# isi DATABASE_URL dan variabel lainnya di .env

# 3. Jalankan migrasi Prisma
npx prisma migrate dev --name init
npx prisma generate

# 4. Jalankan development server (dari root)
cd ..
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Nuxt) | http://localhost:3000 |
| Backend (NestJS) | http://localhost:3001 |
| Prisma Studio | http://localhost:5555 (via `npx prisma studio`) |

---

# 12. Naming Conventions

| Hal | Konvensi |
|---|---|
| File NestJS | `kebab-case.type.ts` (contoh: `auth.service.ts`) |
| File Nuxt | `kebab-case.vue` / `camelCase.ts` |
| Database table | `snake_case` (dikelola Prisma) |
| API endpoint | `kebab-case` (contoh: `/read-all`) |
| DTO class | `PascalCase` + suffix `Dto` (contoh: `CreateTaskDto`) |
| Enum value | `UPPER_SNAKE_CASE` |
| Pinia store | `use[Name]Store` |
