# 📕 Implementation Guide

## Alur Implementasi Per-Module

Dokumentasi ini menjelaskan urutan dan langkah-langkah implementasi setiap module secara independen namun terstruktur. Setiap module dapat dikerjakan dalam sprint terpisah.

---

# 1. Prerequisites & Project Setup

**Durasi**: 2-3 hari  
**Priority**: CRITICAL — harus selesai duluan

Sebelum mulai implementasi module apapun, pastikan setup dasar terselesaikan:

## 1.1 Backend Setup

- [ ] Initialize NestJS project
- [ ] Setup Prisma + PostgreSQL
- [ ] Configure JWT strategy & Passport
- [ ] Setup exception filters & interceptors
- [ ] Setup environment variables
- [ ] Configure module imports & global middlewares

## 1.2 Frontend Setup

- [ ] Initialize Nuxt 3 project
- [ ] Setup TailwindCSS
- [ ] Setup Pinia store
- [ ] Configure API client (`$fetch` wrapper dengan auth header)
- [ ] Setup auth middleware
- [ ] Configure environment variables

## 1.3 Monorepo Setup

- [ ] Root `package.json` dengan workspaces
- [ ] Shared `.env` structure
- [ ] Development scripts (`npm run dev`)

---

# 2. Module Implementation Sequence

Urutan rekomendasi berdasarkan dependency & user flow:

```
1. Auth Module          (independen)
   ↓
2. User Module          (bergantung Auth)
   ↓
3. Team Module          (bergantung Auth, User)
   ↓
4. Invitation Module    (bergantung Auth, User, Team)
   ├─→ Announcement Module (independen, bergantung Team)
   ├─→ Task Module       (independen, bergantung Team, User)
   ├─→ Event Module      (independen, bergantung Team)
   └─→ Chat Module       (independen, bergantung Team, User) — WebSocket
   ↓
5. Notification Module  (bergantung semua modul lain)
   ↓
6. Admin Module         (independen, but hanya diakses System Admin)
```

---

# 3. Module 1: Auth

**Durasi**: 3-4 hari  
**Priority**: CRITICAL  
**Backend**: Auth service + Guards + Strategies  
**Frontend**: Login, Register, Onboarding pages

## 3.1 Database Schema

```prisma
model User {
  id             String    @id @default(cuid())
  name           String
  email          String    @unique
  password       String    // bcrypt hash
  avatar         String?
  bio            String?
  isSystemAdmin  Boolean   @default(false)
  refreshToken   String?   // bcrypt hash
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // relations...
}
```

## 3.2 Backend Tasks

### 3.2.1 Auth Module Setup
- [ ] Create `auth.module.ts`
- [ ] Setup Passport JWT & Refresh strategies
- [ ] Create JWT constants & config

### 3.2.2 Authentication DTOs & Validations
```
CreateUserDto              (email, password, name)
LoginDto                   (email, password)
ResetPasswordDto           (token, newPassword)
ForgotPasswordDto          (email)
AuthResponseDto            (accessToken, refreshToken, user)
```

- [ ] Create all DTOs with class-validator
- [ ] Password validation: min 8 chars, strength check

### 3.2.3 Auth Service
```typescript
auth.service.ts
├─ register(dto)           → hash password, create user, return tokens
├─ login(email, password)  → validate, return tokens, save refresh
├─ refreshToken(userId)    → validate & rotate refresh token
├─ logout(userId)          → clear refresh token
├─ validateJwt(token)      → validate access token
├─ validateRefreshToken()  → validate & hash compare
├─ validateUser()          → used by Passport local strategy
├─ forgotPassword(email)   → generate reset token, send email
└─ resetPassword(token, newPassword) → validate token, update password
```

- [ ] Implement bcrypt for password hashing (salt rounds: 10+)
- [ ] Implement refresh token rotation
- [ ] Setup email service untuk forgot password flow

### 3.2.4 Guards & Strategies
- [ ] `jwt.strategy.ts` — validate access token
- [ ] `jwt-refresh.strategy.ts` — validate refresh token
- [ ] `jwt-auth.guard.ts` — @UseGuards() untuk protected endpoints
- [ ] `optional-jwt.guard.ts` — untuk endpoint yang bisa login/tidak login

### 3.2.5 Auth Controller
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout         (protected)
POST   /auth/refresh        (dengan refresh token)
POST   /auth/forgot-password
POST   /auth/reset-password
```

- [ ] Validasi input
- [ ] Return proper response format
- [ ] Set HTTP-only cookies untuk refresh token (opsional) atau return di response

### 3.2.6 Current User Decorator
- [ ] `@CurrentUser()` decorator — extract user dari JWT payload

## 3.3 Frontend Tasks

### 3.3.1 Pages
- [ ] `login.vue` — form email + password, link ke register & forgot password
- [ ] `register.vue` — form name + email + password, validation
- [ ] `forgot-password.vue` — form email, pilih "Buat team baru" atau "Terima undangan"
- [ ] `reset-password.vue` — form new password, validate token dari URL query

### 3.3.2 Composables & Utils
- [ ] `useAuth.ts` — composable untuk auth logic
- [ ] `api.ts` — wrapper $fetch dengan auto-attach Authorization header
- [ ] `useLocalStorage.ts` — simpan tokens (atau bisa gunakan cookie)

### 3.3.3 Store (Pinia)
```typescript
auth-store.ts
├─ state
│  ├─ user       (User | null)
│  ├─ accessToken
│  ├─ refreshToken
│  └─ isLoading
├─ getters
│  ├─ isLoggedIn
│  └─ currentUser
└─ actions
   ├─ register(name, email, password)
   ├─ login(email, password)
   ├─ logout()
   ├─ refreshAccessToken()
   ├─ forgotPassword(email)
   ├─ resetPassword(token, newPassword)
   └─ hydrate() — untuk SSR & page refresh
```

### 3.3.4 Middleware
- [ ] `auth.ts` — redirect ke login jika belum authenticated
- [ ] Setup pada nuxt.config untuk otomatis apply ke protected routes

### 3.3.5 API Interceptor
- [ ] Auto-attach `Authorization: Bearer {accessToken}` ke setiap request
- [ ] Auto-refresh token jika 401 Unauthorized
- [ ] Return 401 & redirect ke login jika refresh token expired

### 3.3.6 Layouts
- [ ] `auth.vue` — layout untuk login/register (no sidebar)

## 3.4 Testing

- [ ] Register: create user dengan email unik
- [ ] Login: return tokens, user accessible di store
- [ ] Logout: clear tokens
- [ ] Refresh token: get new access token
- [ ] Expired token: auto-redirect ke login
- [ ] Forgot password: email dikirim (test dengan Mailtrap)
- [ ] Reset password: update password, force re-login

---

# 4. Module 2: User

**Durasi**: 2 hari  
**Priority**: HIGH  
**Backend**: User service, profile endpoints  
**Frontend**: Profile page, user search component

## 4.1 Database Schema

```prisma
// Sudah ada di Auth, tambahan diperlukan minimal dari sini
// User relations sudah ada untuk Teams, Tasks, etc.
```

## 4.2 Backend Tasks

### 4.2.1 User Service
```typescript
user.service.ts
├─ getProfile(userId)
├─ updateProfile(userId, dto)  // name, bio, avatar
├─ changePassword(userId, oldPassword, newPassword)
├─ searchUsers(query)          // by email or username for invite
└─ getUserTeams(userId)        // daftar team milik user
```

- [ ] Validasi input
- [ ] Hash password jika di-update via changePassword
- [ ] Search users tanpa password field di response

### 4.2.2 User Controller
```
GET    /users/me              (protected)
PATCH  /users/me              (protected) — update profile
PATCH  /users/me/password     (protected) — change password
GET    /users/search?q=       (protected) — search users
GET    /users/:id             (protected) — public profile
```

- [ ] Return proper response format

## 4.3 Frontend Tasks

### 4.3.1 Pages
- [ ] `profile.vue` — show & edit user profile (name, bio, avatar upload)
- [ ] Avatar upload feature (untuk saat ini bisa base64 atau external CDN)

### 4.3.2 Components
- [ ] `UserSearchInput.vue` — search user untuk invite
- [ ] `UserCard.vue` — display user info (name, avatar, bio)

### 4.3.3 Store Update
```typescript
// Extend user store dengan
├─ updateProfile(data)
├─ changePassword(oldPassword, newPassword)
├─ searchUsers(query)
└─ fetchUserTeams()
```

## 4.4 Testing

- [ ] Get profile: return user data
- [ ] Update profile: update & return updated data
- [ ] Change password: update password, force re-login
- [ ] Search users: return users by email/username
- [ ] Get user teams: return team list

---

# 5. Module 3: Team

**Durasi**: 3-4 hari  
**Priority**: CRITICAL  
**Backend**: Team service, membership management  
**Frontend**: Team creation, team list, team settings

## 5.1 Database Schema

```prisma
model Team {
  id          String    @id @default(cuid())
  name        String
  description String?
  avatar      String?
  createdById String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  createdBy User           @relation("TeamCreator", fields: [createdById], references: [id])
  members   TeamMember[]
  // other relations...
}

model TeamMember {
  id       String   @id @default(cuid())
  userId   String
  teamId   String
  role     TeamRole @default(MEMBER)  // MANAGER | MEMBER
  joinedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@unique([userId, teamId])
}
```

## 5.2 Backend Tasks

### 5.2.1 Team Service
```typescript
team.service.ts
├─ createTeam(userId, dto)          → create team, add creator as MANAGER
├─ getTeam(teamId, userId)          → verify membership, return team data
├─ updateTeam(teamId, userId, dto)  → only MANAGER
├─ deleteTeam(teamId, userId)       → only MANAGER
├─ getTeamMembers(teamId, userId)   → verify membership
├─ getTeamMemberRole(teamId, userId) → get user's role di team
├─ updateMemberRole(teamId, userId, targetUserId, newRole) → only MANAGER
├─ removeMember(teamId, userId, targetUserId) → only MANAGER
├─ transferOwnership(teamId, userId, newOwnerId) → only MANAGER
├─ leaveTeam(teamId, userId)        → leave team
└─ getUserTeams(userId)             → get all teams user belongs
```

- [ ] Validate user adalah anggota team sebelum returning data (isolasi data per-team)
- [ ] Validate role untuk setiap aksi (hanya MANAGER yang bisa manage)
- [ ] Prevent removing last MANAGER (must transfer ownership first)

### 5.2.2 Team Controller
```
GET    /teams                      (protected)
POST   /teams                      (protected)
GET    /teams/:teamId              (protected, verify member)
PATCH  /teams/:teamId              (protected, MANAGER only)
DELETE /teams/:teamId              (protected, MANAGER only)
GET    /teams/:teamId/members      (protected, verify member)
PATCH  /teams/:teamId/members/:userId  (protected, MANAGER only)
DELETE /teams/:teamId/members/:userId  (protected, MANAGER only)
POST   /teams/:teamId/leave        (protected)
POST   /teams/:teamId/transfer     (protected, MANAGER only)
```

### 5.2.3 Role Guard Update
- [ ] Create `@Roles('MANAGER')` decorator untuk automatic role checking
- [ ] `RolesGuard` extract teamId dari route param, verify user's role

### 5.2.4 DTOs
```
CreateTeamDto          (name, description?, avatar?)
UpdateTeamDto          (name?, description?, avatar?)
UpdateMemberRoleDto    (role: MANAGER | MEMBER)
TransferOwnershipDto   (newOwnerId)
```

## 5.3 Frontend Tasks

### 5.3.1 Pages
- [ ] `onboarding.vue` — setelah login, pilih "Buat team" atau "Terima undangan"
- [ ] `dashboard.vue` — list of user's teams, quick actions
- [ ] `teams/[teamId]/index.vue` — team overview
- [ ] `teams/[teamId]/settings.vue` — team settings (MANAGER only)

### 5.3.2 Components
- [ ] `TeamCard.vue` — display team info
- [ ] `CreateTeamModal.vue` — form create team
- [ ] `TeamSettingsForm.vue` — edit team info
- [ ] `TeamMembersList.vue` — list members dengan role badges
- [ ] `MemberRoleSelect.vue` — change member role (MANAGER only)

### 5.3.3 Store (Pinia)
```typescript
team-store.ts
├─ state
│  ├─ teams              (Team[])
│  ├─ currentTeam        (Team | null)
│  ├─ currentTeamMembers (TeamMember[])
│  └─ isLoading
├─ getters
│  ├─ isCurrentTeamManager
│  └─ currentUserRoleInTeam
└─ actions
   ├─ fetchTeams()
   ├─ fetchTeam(teamId)
   ├─ createTeam(data)
   ├─ updateTeam(teamId, data)
   ├─ deleteTeam(teamId)
   ├─ fetchTeamMembers(teamId)
   ├─ updateMemberRole(teamId, userId, role)
   ├─ removeMember(teamId, userId)
   ├─ leaveTeam(teamId)
   └─ transferOwnership(teamId, newOwnerId)
```

### 5.3.4 Layouts & Navigation
- [ ] `default.vue` — main layout dengan sidebar (list teams, user menu)
- [ ] Team switcher di sidebar

### 5.3.5 Middleware
- [ ] Verify user adalah member of team saat akses `/teams/:teamId/*`

## 5.4 Testing

- [ ] Create team: user becomes MANAGER
- [ ] Get teams: return only user's teams
- [ ] Get team detail: only members can access
- [ ] Update team: only MANAGER
- [ ] Delete team: only MANAGER
- [ ] Get members: only members can see
- [ ] Update member role: only MANAGER
- [ ] Remove member: only MANAGER
- [ ] Leave team: user removed from team
- [ ] Transfer ownership: ownership transferred, old owner becomes MANAGER

---

# 6. Module 4: Invitation

**Durasi**: 2-3 hari  
**Priority**: HIGH  
**Backend**: Invitation service, email integration  
**Frontend**: Invite members UI, pending invites page

## 6.1 Database Schema

```prisma
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
```

## 6.2 Backend Tasks

### 6.2.1 Invitation Service
```typescript
invitation.service.ts
├─ inviteUserToTeam(teamId, invitedUserId, role, senderId) → create invite, send email
├─ getPendingInvites(userId) → get invites user belum terima/tolak
├─ acceptInvite(inviteId, userId) → accept, add user to team
├─ decllineInvite(inviteId, userId) → decline, mark as declined
├─ cancelInvite(inviteId, teamId, senderId) → only sender/MANAGER can cancel
└─ sendInviteEmail(user, team, acceptLink, declineLink) → send email
```

- [ ] Check if user already in team sebelum invite
- [ ] Check if invite already pending
- [ ] Send email dengan link ke accept/decline (opsional: bisa in-app juga)

### 6.2.2 Invitation Controller
```
POST   /teams/:teamId/invites         (protected, MANAGER only)
GET    /invites                       (protected)
POST   /invites/:inviteId/accept      (protected)
POST   /invites/:inviteId/decline     (protected)
DELETE /teams/:teamId/invites/:inviteId  (protected, MANAGER only)
```

### 6.2.3 DTOs
```
CreateInviteDto        (email or userId, role?)
InviteResponseDto      (inviteId)
```

## 6.3 Frontend Tasks

### 6.3.1 Pages
- [ ] `teams/[teamId]/settings.vue` — tab "Members" dengan invite section
- [ ] `invitations.vue` — page untuk view pending invites (accept/decline)

### 6.3.2 Components
- [ ] `InviteMemberModal.vue` — form invite user (search + role select)
- [ ] `PendingInvites.vue` — list pending invites dengan accept/decline buttons

### 6.3.3 Store Update
```typescript
// Extend team-store atau create invitation-store
├─ inviteMember(teamId, userId/email, role)
├─ fetchPendingInvites()
├─ acceptInvite(inviteId)
├─ declineInvite(inviteId)
└─ cancelInvite(inviteId)
```

### 6.3.4 Notifications Integration
- [ ] Toast notification saat invite sent/accepted/declined
- [ ] Update team members list secara realtime setelah accept

## 6.4 Testing

- [ ] Invite user: create invite, send email
- [ ] Get pending invites: return user's pending invites
- [ ] Accept invite: add user to team, change TeamMember record
- [ ] Decline invite: mark accepted = false
- [ ] Cancel invite: only MANAGER/sender can cancel
- [ ] Prevent duplicate invites

---

# 7. Module 5: Announcement

**Durasi**: 2-3 hari  
**Priority**: MEDIUM  
**Backend**: Announcement service, read tracking  
**Frontend**: Announcement feed, create/edit form

## 7.1 Database Schema

```prisma
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
```

## 7.2 Backend Tasks

### 7.2.1 Announcement Service
```typescript
announcement.service.ts
├─ createAnnouncement(teamId, userId, dto) → only MANAGER
├─ getAnnouncements(teamId, userId)
├─ getAnnouncementDetail(announcementId, userId)
├─ updateAnnouncement(announcementId, userId, dto) → only author/MANAGER
├─ deleteAnnouncement(announcementId, userId) → soft delete, only author/MANAGER
├─ togglePin(announcementId, userId) → only MANAGER
├─ markAsRead(announcementId, userId) → record read status
├─ getReadStatus(announcementId) → check siapa aja yg baca
└─ getUnreadCount(teamId, userId) → for badge
```

- [ ] Implement soft delete dengan deletedAt
- [ ] Exclude deleted announcements dari list

### 7.2.2 Announcement Controller
```
GET    /teams/:teamId/announcements
POST   /teams/:teamId/announcements        (MANAGER only)
GET    /teams/:teamId/announcements/:id
PATCH  /teams/:teamId/announcements/:id    (MANAGER only, soft delete)
DELETE /teams/:teamId/announcements/:id    (MANAGER only, soft delete)
PATCH  /teams/:teamId/announcements/:id/pin  (MANAGER only)
POST   /teams/:teamId/announcements/:id/read
```

### 7.2.3 DTOs
```
CreateAnnouncementDto  (title, content)
UpdateAnnouncementDto  (title?, content?, pinned?)
AnnouncementResponseDto (id, title, content, author, pinned, createdAt, readBy)
```

## 7.3 Frontend Tasks

### 7.3.1 Pages
- [ ] `teams/[teamId]/announcements.vue` — feed of announcements

### 7.3.2 Components
- [ ] `AnnouncementCard.vue` — display announcement (pinned badge, unread indicator)
- [ ] `CreateAnnouncementModal.vue` — form (title, content) — MANAGER only
- [ ] `AnnouncementDetail.vue` — modal detail + read status
- [ ] `EditAnnouncementModal.vue` — edit form — MANAGER only

### 7.3.3 Store Update
```typescript
// Create announcement-store
├─ announcements (Announcement[])
├─ unreadCount
└─ actions
   ├─ fetchAnnouncements(teamId)
   ├─ createAnnouncement(teamId, data)
   ├─ updateAnnouncement(announcementId, data)
   ├─ deleteAnnouncement(announcementId)
   ├─ togglePin(announcementId)
   ├─ markAsRead(announcementId)
   └─ getUnreadCount(teamId)
```

## 7.4 Testing

- [ ] Create announcement: only MANAGER, stored with current user as author
- [ ] List announcements: exclude deleted
-  [ ] Update announcement: only author/MANAGER
- [ ] Delete announcement: soft delete (hide dari list)
- [ ] Toggle pin: pinned moved to top
- [ ] Mark as read: record read status, unread count decreases
- [ ] Get read status: show who read

---

# 8. Module 6: Task

**Durasi**: 4-5 hari  
**Priority**: CRITICAL  
**Backend**: Task service, status management, assignment  
**Frontend**: Task board (Kanban), task detail, task form

## 8.1 Database Schema

```prisma
model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  status      TaskStatus   @default(TODO)  // TODO | IN_PROGRESS | REVIEW | DONE
  priority    TaskPriority @default(MEDIUM) // LOW | MEDIUM | HIGH | URGENT
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
```

## 8.2 Backend Tasks

### 8.2.1 Task Service
```typescript
task.service.ts
├─ createTask(teamId, userId, dto) → only MANAGER
├─ getTeamTasks(teamId, userId, filters) → all team members, with filter options
├─ getTaskDetail(taskId, userId)
├─ updateTask(taskId, userId, dto) → MANAGER or assignee
├─ deleteTask(taskId, userId) → soft delete, only MANAGER
├─ assignTask(taskId, userId, assigneeId) → only MANAGER
├─ updateTaskStatus(taskId, userId, newStatus) → assignee or MANAGER
├─ getTasksByStatus(teamId, userId) → group tasks by status (board view)
└─ getMyTasks(userId) → across all teams, assigned to me
```

- [ ] Filter options: by assignee, status, priority, due date
- [ ] Support pagination & sorting

### 8.2.2 Task Controller
```
GET    /teams/:teamId/tasks
POST   /teams/:teamId/tasks                  (MANAGER only)
GET    /teams/:teamId/tasks/:id
PATCH  /teams/:teamId/tasks/:id              (MANAGER or assignee)
DELETE /teams/:teamId/tasks/:id              (MANAGER only)
PATCH  /teams/:teamId/tasks/:id/status       (assignee or MANAGER)
POST   /teams/:teamId/tasks/:id/assign       (MANAGER only)
GET    /tasks/my-tasks                       (all task assigned to me)
```

### 8.2.3 DTOs
```
CreateTaskDto      (title, description?, dueDate?, priority?, assigneeId?)
UpdateTaskDto      (title?, description?, priority?, dueDate?, assigneeId?)
UpdateTaskStatusDto (status: TODO | IN_PROGRESS | REVIEW | DONE)
AssignTaskDto      (assigneeId)
TaskResponseDto    (id, title, description, status, priority, dueDate, assignee, createdBy, ...)
```

## 8.3 Frontend Tasks

### 8.3.1 Pages
- [ ] `teams/[teamId]/tasks.vue` — task board (Kanban view, list view)

### 8.3.2 Components (Complex Kanban)
- [ ] `TaskBoard.vue` — main kanban container (4 columns: Todo, In Progress, Review, Done)
- [ ] `TaskColumn.vue` — single column (drag-drop enabled)
- [ ] `TaskCard.vue` — task item in column (title, priority badge, assignee avatar)
- [ ] `TaskDetail.vue` — modal with full details
- [ ] `CreateTaskModal.vue` — form (title, description, assignee, priority, dueDate)
- [ ] `EditTaskModal.vue` — edit form
- [ ] `AssignTaskSelect.vue` — dropdown untuk assign/change assignee

### 8.3.3 Kanban Drag & Drop
- [ ] Setup vue-draggable atau @dnd-kit
- [ ] Drag card antar columns → update status
- [ ] Drag card dalam column → update order (optional, simpan ke DB)

### 8.3.4 Store Update
```typescript
// Create task-store
├─ tasks              (Task[])
├─ tasksByStatus      (grouped by status)
├─ selectedTask       (Task | null)
└─ actions
   ├─ fetchTeamTasks(teamId, filters)
   ├─ createTask(teamId, data)
   ├─ updateTask(taskId, data)
   ├─ deleteTask(taskId)
   ├─ assignTask(taskId, userId)
   ├─ updateTaskStatus(taskId, status)
   ├─ getTasksByStatus(teamId)
   └─ fetchMyTasks()
```

## 8.4 Testing

- [ ] Create task: MANAGER only, create dengan status TODO
- [ ] Get tasks: list all team tasks
- [ ] Get tasks by status: grouped correctly
- [ ] Update task: MANAGER or assignee
- [ ] Delete task: soft delete
- [ ] Assign task: update assignee, trigger notification
- [ ] Update status: move between columns
- [ ] Get my tasks: all tasks assigned to me across teams

---

# 9. Module 7: Event

**Durasi**: 2-3 hari  
**Priority**: MEDIUM  
**Backend**: Event service, calendar queries  
**Frontend**: Calendar view, event form

## 9.1 Database Schema

```prisma
model Event {
  id          String    @id @default(cuid())
  title       String
  description String?
  type        EventType @default(INTERNAL)  // MEETING | TRAINING | DEADLINE | INTERNAL
  startDate   DateTime
  endDate     DateTime?
  teamId      String
  createdById String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  team      Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  createdBy User @relation(fields: [createdById], references: [id])
}
```

## 9.2 Backend Tasks

### 9.2.1 Event Service
```typescript
event.service.ts
├─ createEvent(teamId, userId, dto) → only MANAGER
├─ getEvents(teamId, userId)
├─ getEventsByMonth(teamId, userId, year, month)  // for calendar
├─ getEventDetail(eventId, userId)
├─ updateEvent(eventId, userId, dto) → only MANAGER
├─ deleteEvent(eventId, userId) → only MANAGER
├─ getTaskDeadlines(teamId) → deadlines muncul sebagai event juga
└─ getUpcomingEvents(teamId, userId, days) → next 7/14 days
```

- [ ] Integrate dengan Task deadlines (virtual events)

### 9.2.2 Event Controller
```
GET    /teams/:teamId/events
POST   /teams/:teamId/events              (MANAGER only)
GET    /teams/:teamId/events/:id
PATCH  /teams/:teamId/events/:id          (MANAGER only)
DELETE /teams/:teamId/events/:id          (MANAGER only)
GET    /teams/:teamId/events/month/:year/:month
GET    /teams/:teamId/events/upcoming?days=7
```

### 9.2.3 DTOs
```
CreateEventDto     (title, description?, type, startDate, endDate?)
UpdateEventDto     (title?, description?, type?, startDate?, endDate?)
EventResponseDto   (id, title, type, startDate, endDate, createdBy, ...)
```

## 9.3 Frontend Tasks

### 9.3.1 Pages
- [ ] `teams/[teamId]/calendar.vue` — calendar view (month/week/day)

### 9.3.2 Components
- [ ] `Calendar.vue` — main calendar component (Vue Calendar atau custom)
- [ ] `EventDay.vue` — events pada tanggal tertentu
- [ ] `EventCard.vue` — event item dengan type badge
- [ ] `CreateEventModal.vue` — form event
- [ ] `EditEventModal.vue` — edit form

### 9.3.3 Calendar Library
- [ ] Use library seperti `vue-calendar-pro` atau custom with date utilities

### 9.3.4 Store Update
```typescript
// Create event-store
├─ events       (Event[])
├─ selectedDate (Date)
└─ actions
   ├─ fetchEvents(teamId)
   ├─ fetchEventsByMonth(teamId, year, month)
   ├─ createEvent(teamId, data)
   ├─ updateEvent(eventId, data)
   ├─ deleteEvent(eventId)
   └─ fetchUpcomingEvents(teamId)
```

## 9.4 Testing

- [ ] Create event: only MANAGER
- [ ] Get events: list all team events
- [ ] Get events by month: filter correctly
- [ ] Update event: only MANAGER
- [ ] Delete event: only MANAGER
- [ ] Task deadlines: show in calendar as deadline type

---

# 10. Module 8: Chat (WebSocket)

**Durasi**: 4-5 hari  
**Priority**: MEDIUM  
**Backend**: Chat gateway, WebSocket, message persistence  
**Frontend**: Chat UI, real-time message handling

## 10.1 Database Schema

```prisma
model ChatMessage {
  id        String   @id @default(cuid())
  message   String
  senderId  String
  teamId    String
  createdAt DateTime @default(now())

  sender User @relation(fields: [senderId], references: [id])
  team   Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
}
```

## 10.2 Backend Tasks

### 10.2.1 Chat Gateway Setup
```typescript
chat.gateway.ts
├─ handleConnection() → validate JWT, join user socket
├─ handleDisconnect()
├─ @SubscribeMessage('join_team') → join room
├─ @SubscribeMessage('leave_team') → leave room
├─ @SubscribeMessage('send_message') → broadcast ke room, save DB
└─ @SubscribeMessage('typing') → broadcast typing indicator
```

- [ ] Setup Socket.IO adapter (jika multi-instance, gunakan Redis adapter)
- [ ] Implement namespaces atau rooms per team
- [ ] Validate membership before joining room

### 10.2.2 Chat Service
```typescript
chat.service.ts
├─ saveMessage(teamId, userId, message) → save to DB
├─ getMessageHistory(teamId, cursor?, limit) → cursor-based pagination
├─ deleteMessage(messageId, userId) → soft delete or hard delete (optional)
└─ searchMessages(teamId, query)
```

### 10.2.3 Chat Controller (REST, untuk history)
```
GET  /teams/:teamId/messages?cursor=&limit=
POST /teams/:teamId/messages/:id/delete   (optional)
```

### 10.2.4 DTOs
```
SendMessageDto     (message)
ChatMessageResponseDto (id, message, sender, createdAt, ...)
```

## 10.3 Frontend Tasks

### 10.3.1 Pages
- [ ] `teams/[teamId]/chat.vue` — chat interface

### 10.3.2 Components
- [ ] `ChatWindow.vue` — main chat container
- [ ] `MessageList.vue` — scrollable list of messages
- [ ] `MessageItem.vue` — single message (sender avatar, content, time)
- [ ] `MessageInput.vue` — input field + send button
- [ ] `TypingIndicator.vue` — "User is typing..."

### 10.3.3 Socket Integration
- [ ] `useSocket.ts` composable:
  ```typescript
  ├─ connect(token)
  ├─ disconnect()
  ├─ joinTeam(teamId)
  ├─ leaveTeam(teamId)
  ├─ sendMessage(teamId, message)
  ├─ onNewMessage(callback)
  ├─ onTyping(callback)
  └─ sendTyping(teamId)
  ```
- [ ] Setup in `plugins/socket.client.ts`

### 10.3.4 Store Update
```typescript
// Create chat-store
├─ messages         (ChatMessage[])
├─ typingUsers      (User[] yang sedang mengetik)
├─ isLoading
└─ actions
   ├─ fetchMessageHistory(teamId, cursor)
   ├─ addMessage(message)
   ├─ removeMessage(messageId)
   ├─ sendMessage(teamId, message)
   └─ updateTyping(teamId, users)
```

### 10.3.5 Real-time Features
- [ ] Auto-scroll ke message terbaru
- [ ] Unread indicator / badge
- [ ] Typing indicator
- [ ] Online/offline status (optional)
- [ ] Message timestamp relative time (e.g., "2 minutes ago")

## 10.4 Testing

- [ ] Connect ke WebSocket dengan valid token
- [ ] Join team room: can send/receive messages
- [ ] Send message: saved to DB, broadcast ke room
- [ ] Receive message: appear in chat in real-time
- [ ] Typing indicator: broadcast typing event
- [ ] Invalid token: disconnect
- [ ] Message history: fetch & paginate
- [ ] Leave room: unsubscribe dari team events

---

# 11. Module 9: Notification

**Durasi**: 3-4 hari  
**Priority**: HIGH  
**Backend**: Notification service, trigger listeners, email  
**Frontend**: Notification center, badge counters

## 11.1 Database Schema

```prisma
model Notification {
  id            String           @id @default(cuid())
  userId        String
  type          NotificationType
  referenceId   String?          // teamId, taskId, etc.
  referenceType String?          // "team" | "task" | "announcement" | "event"
  message       String
  isRead        Boolean          @default(false)
  createdAt     DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 11.2 Backend Tasks

### 11.2.1 Notification Service
```typescript
notification.service.ts
├─ createNotification(userId, type, message, referenceId, referenceType)
├─ getUserNotifications(userId, isRead?)
├─ markAsRead(notificationId, userId)
├─ markAllAsRead(userId)
├─ deleteNotification(notificationId, userId)
├─ getUnreadCount(userId)
└─ [Listeners]
   ├─ onTaskAssigned(task)
   ├─ onAnnouncementCreated(announcement)
   ├─ onEventCreated(event)
   ├─ onTeamInvited(invite)
   ├─ onMemberJoined(team)
   └─ onRoleChanged(teamMember)
```

- [ ] Use event emitter untuk trigger listeners
- [ ] Broadcast notifications via Socket.IO gateway

### 11.2.2 Notification Controller
```
GET    /notifications
POST   /notifications/:id/read
POST   /notifications/read-all
DELETE /notifications/:id
GET    /notifications/unread-count
```

### 11.2.3 DTOs & Events
```
NotificationResponseDto (id, type, message, isRead, createdAt, reference, ...)

// Events
TaskAssignedEvent     (taskId, assigneeId, createdById)
AnnouncementCreatedEvent (announcementId, teamId)
EventCreatedEvent     (eventId, teamId)
InviteEvent          (inviteId, teamId, receiverId)
```

## 11.3 Frontend Tasks

### 11.3.1 Pages
- [ ] `notifications.vue` — notification center

### 11.3.2 Components
- [ ] `NotificationBell.vue` — bell icon dengan unread count badge
- [ ] `NotificationDropdown.vue` — popup menu dengan recent notifications
- [ ] `NotificationCenter.vue` — full page dengan list all notifications
- [ ] `NotificationItem.vue` — single notification item

### 11.3.3 Store Update
```typescript
// Create notification-store
├─ notifications        (Notification[])
├─ unreadCount
└─ actions
   ├─ fetchNotifications(isRead?)
   ├─ markAsRead(notificationId)
   ├─ markAllAsRead()
   ├─ deleteNotification(notificationId)
   ├─ getUnreadCount()
   └─ handleNewNotification(notification)
```

### 11.3.4 Real-time Notifications
- [ ] Socket.IO listener untuk `new_notification` event
- [ ] Badge counter update otomatis
- [ ] Toast notification untuk important notifications
- [ ] Sound alert (optional)

## 11.4 Testing

- [ ] Task assigned: notification sent to assignee
- [ ] Announcement created: notification sent to all team members
- [ ] Event created: notification sent to team members
- [ ] Invite sent: notification sent to invitee
- [ ] Member joined: notification sent to team managers
- [ ] Role changed: notification sent to user
- [ ] Mark as read: isRead updated
- [ ] Unread count: correct count

---

# 12. Module 10: Admin Panel

**Durasi**: 2-3 hari  
**Priority**: LOW (bisa dikerjakan terakhir)  
**Backend**: Admin service, system-level operations  
**Frontend**: Admin dashboard, user/team management

## 12.1 Backend Tasks

### 12.1.1 Admin Service
```typescript
admin.service.ts
├─ getAllUsers(pagination, filters)
├─ deactivateUser(userId) → set isSystemAdmin to false (atau add status field)
├─ deleteUser(userId) → hard delete dengan cascade
├─ getAllTeams(pagination, filters)
├─ deleteTeam(teamId) → hard delete
├─ getSystemStats() → total users, teams, etc. (optional)
└─ [Middleware]
    └─ @IsSystemAdmin() → decorator check isSystemAdmin flag
```

- [ ] Create `admin.middleware.ts` atau decorator `@SystemAdminOnly()`
- [ ] Validate isSystemAdmin sebelum allow akses

### 12.1.2 Admin Controller
```
GET    /admin/users      (System Admin only)
PATCH  /admin/users/:id/deactivate
DELETE /admin/users/:id
GET    /admin/teams      (System Admin only)
DELETE /admin/teams/:id
GET    /admin/stats      (System Admin only)
```

## 12.2 Frontend Tasks

### 12.2.1 Pages
- [ ] `admin/index.vue` — admin dashboard
- [ ] `admin/users.vue` — user management
- [ ] `admin/teams.vue` — team management

### 12.2.2 Components
- [ ] `UsersTable.vue` — data table dengan deactivate/delete buttons
- [ ] `TeamsTable.vue` — data table dengan delete button
- [ ] `AdminStats.vue` — summary cards (optional)

### 12.2.3 Middleware
- [ ] `admin.ts` middleware — verify isSystemAdmin before access

### 12.2.4 Store Update
```typescript
// Create admin-store
├─ users        (User[])
├─ teams        (Team[])
├─ stats        (Stats | null)
└─ actions
   ├─ fetchAllUsers(pagination)
   ├─ deactivateUser(userId)
   ├─ deleteUser(userId)
   ├─ fetchAllTeams(pagination)
   └─ deleteTeam(teamId)
```

## 12.3 Testing

- [ ] Access admin panel: only System Admin
- [ ] Get all users: return paginated list
- [ ] Deactivate user: freeze account
- [ ] Delete user: cascade delete all related data
- [ ] Get all teams: return list
- [ ] Delete team: cascade delete all team data

---

# 13. Implementation Checklist Summary

### Phase 1: Foundation (Week 1-2)
- [ ] Prerequisites & Project Setup
- [ ] Auth Module
- [ ] User Module
- [ ] Team Module

### Phase 2: Core Modules (Week 3-5)
- [ ] Invitation Module
- [ ] Announcement Module
- [ ] Task Module
- [ ] Event Module

### Phase 3: Real-time & Extras (Week 6-7)
- [ ] Chat Module (WebSocket)
- [ ] Notification Module

### Phase 4: Polish & Admin (Week 8)
- [ ] Admin Module
- [ ] Testing & Bug Fixes
- [ ] Performance Optimization
- [ ] Deployment Preparation

---

# 14. Module Dependencies Graph

```
Auth ──────┐
           ├─→ User
           │    └─→ [All modules]
           │
           ├─→ Team ──┐
           │          ├─→ Invitation
           │          │
           │          ├─→ Announcement
           │          │
           │          ├─→ Task
           │          │
           │          ├─→ Event
           │          │
           │          └─→ Chat
           │
           └─→ Notification ← [all modules]
                
Admin ← [independent, but for System Admin]
```

---

# 15. Backend Feature Checklist Per Module

## Auth
- [ ] Register & validation
- [ ] Login & JWT generation
- [ ] Refresh token & rotation
- [ ] Logout
- [ ] Forgot password & email
- [ ] Reset password
- [ ] Password hashing (bcrypt)
- [ ] Auto-attach auth user via @CurrentUser()

## User
- [ ] Get profile
- [ ] Update profile
- [ ] Change password
- [ ] Search users
- [ ] Get user teams

## Team
- [ ] Create team (user = creator = MANAGER)
- [ ] Get team list
- [ ] Get team detail
- [ ] Update team
- [ ] Delete team
- [ ] Get team members
- [ ] Update member role
- [ ] Remove member
- [ ] Leave team
- [ ] Transfer ownership
- [ ] RolesGuard implementation

## Invitation
- [ ] Invite user to team
- [ ] Get pending invites
- [ ] Accept invite
- [ ] Decline invite
- [ ] Cancel invite
- [ ] Email integration

## Announcement
- [ ] Create announcement (MANAGER)
- [ ] Get announcements
- [ ] Get announcement detail
- [ ] Update announcement (MANAGER)
- [ ] Delete announcement - soft delete
- [ ] Pin announcement (MANAGER)
- [ ] Mark as read
- [ ] Get read status
- [ ] Unread count

## Task
- [ ] Create task (MANAGER)
- [ ] Get team tasks
- [ ] Get task detail
- [ ] Update task (MANAGER or assignee)
- [ ] Delete task - soft delete
- [ ] Assign task (MANAGER)
- [ ] Update status (assignee or MANAGER)
- [ ] Get tasks by status (board view)
- [ ] Get my tasks (across teams)
- [ ] Filtering & pagination

## Event
- [ ] Create event (MANAGER)
- [ ] Get events
- [ ] Get event detail
- [ ] Update event (MANAGER)
- [ ] Delete event
- [ ] Get events by month (calendar)
- [ ] Get upcoming events
- [ ] Task deadlines as events

## Chat
- [ ] WebSocket gateway setup
- [ ] Socket.IO authentication
- [ ] Join/leave team room
- [ ] Send message (broadcast)
- [ ] Save message to DB
- [ ] Get message history (cursor-based)
- [ ] Typing indicator
- [ ] Delete message (optional)

## Notification
- [ ] Create notification
- [ ] Get user notifications
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Unread count
- [ ] Event listeners (task assigned, announcement created, etc.)
- [ ] Broadcast via Socket.IO
- [ ] Email notification (optional phase 2)

## Admin
- [ ] Get all users
- [ ] Deactivate user
- [ ] Delete user
- [ ] Get all teams
- [ ] Delete team
- [ ] System stats (optional)

---

# 16. Frontend Feature Checklist Per Module

## Auth
- [ ] Login page
- [ ] Register page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Auth middleware
- [ ] Token storage & refresh
- [ ] Auto-logout on 401
- [ ] Error handling

## User
- [ ] Profile page
- [ ] Edit profile form
- [ ] Avatar upload
- [ ] Change password form
- [ ] User search component
- [ ] Read-only profile view

## Team
- [ ] Onboarding page
- [ ] Dashboard (team list)
- [ ] Create team modal
- [ ] Team detail page
- [ ] Team settings page (MANAGER only)
- [ ] Members list
- [ ] Member role management
- [ ] Team switcher (sidebar)
- [ ] Navigation & layouts

## Invitation
- [ ] Invite member modal
- [ ] Pending invites page
- [ ] Accept/decline buttons
- [ ] Notifications integration

## Announcement
- [ ] Announcements feed
- [ ] Create announcement modal
- [ ] Edit announcement modal
- [ ] Announcement detail popup
- [ ] Pin/unpin
- [ ] Read status indicator
- [ ] Unread count badge

## Task
- [ ] Task board (Kanban view)
- [ ] Task columns (4 columns)
- [ ] Drag & drop
- [ ] Task card component
- [ ] Task detail modal
- [ ] Create task modal
- [ ] Edit task modal
- [ ] Assign member select
- [ ] Priority & status badges
- [ ] Task list view (alternative)
- [ ] My tasks view

## Event
- [ ] Calendar page
- [ ] Month/week view
- [ ] Create event modal
- [ ] Edit event modal
- [ ] Event detail popup
- [ ] Upcoming events list

## Chat
- [ ] Chat page
- [ ] Message list
- [ ] Message input
- [ ] Send button
- [ ] Typing indicator
- [ ] Real-time updates
- [ ] Message timestamps
- [ ] User avatars in messages
- [ ] Auto-scroll

## Notification
- [ ] Notification bell icon
- [ ] Badge counter
- [ ] Notification dropdown
- [ ] Notification center page
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Delete notification

## Admin
- [ ] Admin panel access check
- [ ] Users management page
- [ ] Teams management page
- [ ] Data tables
- [ ] Deactivate/delete actions
- [ ] Confirmation dialogs

---

# 17. Testing Strategy

## Unit Tests
- [ ] Auth service (register, login, validate tokens)
- [ ] User service (profile, search)
- [ ] Team service (CRUD, membership)
- [ ] Guard & decorator validation

## Integration Tests
- [ ] Auth flow (register → login → refresh → logout)
- [ ] Team creation & member management
- [ ] Task assignment & status update
- [ ] Announcement creation & read tracking

## E2E Tests (optional)
- [ ] User registration & login
- [ ] Create team & invite member
- [ ] Assign & manage tasks
- [ ] Send messages (WebSocket)
- [ ] Access control (role-based)

---

# 18. Deployment Checklist

- [ ] Environment production `.env`
- [ ] Database migrations (Prisma)
- [ ] API documentation (Swagger / OpenAPI)
- [ ] Frontend build optimization
- [ ] CDN for static assets (avatars, etc.)
- [ ] Error tracking (Sentry, optional)
- [ ] Logging strategy
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Security headers
- [ ] SSL/HTTPS
- [ ] Database backups
- [ ] Monitoring & alerting
