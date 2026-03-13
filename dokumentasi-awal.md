# 📘 Internal Collaboration Platform

## Product Requirement Document (PRD)

---

# 1. Overview

## 1.1 Project Name

**Internal Collaboration Platform (ICP)**

## 1.2 Purpose

Internal Collaboration Platform adalah aplikasi berbasis web yang dirancang untuk membantu komunikasi, koordinasi, dan kolaborasi antar anggota tim di dalam perusahaan.

Sistem ini menyediakan workspace per tim yang berisi:

* Announcement internal
* Project management dengan task tracking
* Team calendar & events
* Live chat realtime

Tujuan utama sistem:

* meningkatkan koordinasi tim
* memusatkan informasi kerja
* mempercepat komunikasi internal
* mempermudah tracking pekerjaan

---

# 2. Goals & Objectives

## 2.1 Business Goals

* Mengurangi informasi yang tersebar di berbagai platform
* Meningkatkan transparansi aktivitas tim
* Mempermudah monitoring project, task dan event
* Tracking progress project secara realtime
* Menyediakan komunikasi realtime dalam satu workspace

## 2.2 Technical Goals

* Menggunakan stack perusahaan (Nuxt + NestJS)
* Menerapkan modular architecture
* Mendukung realtime communication
* Menyediakan sistem role-based access

---

# 3. Scope

## Included (MVP Scope)

* Registrasi & login user
* JWT authentication (access + refresh token)
* Forgot & reset password
* Team creation oleh user (creator = Manager)
* Sistem undangan anggota (invite by email / username)
* Manajemen role anggota per-team (Manager / Member)
* System Admin untuk manajemen platform
* Multi-team membership
* Announcement system
* Project management system
* Task collaboration board (dalam project)
* Team calendar & events
* Live team chat
* In-app notification
* Project progress tracking

## Excluded (Future Scope)

* Video call
* Company-wide analytics
* External integrations (Slack, Google Calendar, dll)
* Multi-company SaaS

---

# 4. User Roles

Terdapat dua lingkup role dalam sistem:
1. **System Admin** — role platform-level, tidak terikat team
2. **Manager & Member** — role per-team; satu user dapat memiliki role berbeda di setiap team

---

## 4.1 System Admin

Role tingkat platform, dikelola secara internal (bukan user biasa).

Hak akses:

* Melihat dan mengelola semua user terdaftar
* Menonaktifkan / menghapus akun user
* Melihat semua team yang ada di platform
* Menghapus team yang melanggar kebijakan
* Akses ke panel administrasi sistem

> System Admin tidak otomatis menjadi anggota team manapun dan tidak dapat mengakses konten team kecuali secara eksplisit bergabung.

---

## 4.2 Manager *(per-team)*

Diberikan kepada:
* User yang **membuat team** (otomatis)
* User yang **dipromosikan** oleh Manager lain dalam team

Hak akses:

* Invite user ke dalam team (by email / username)
* Mengatur role anggota (promote ke Manager / demote ke Member)
* Remove anggota dari team
* Edit & delete informasi team
* Delete team
* Create / edit / delete announcement
* Create / edit / delete project
* Assign PIC (Person In Charge) untuk project
* Create / manage semua task dalam project
* Create / edit / delete events
* Moderate chat (hapus pesan)
* Monitor progress project

---

## 4.3 Member *(per-team)*

Diberikan kepada:
* User yang baru bergabung via undangan (role default)

Hak akses:

* View semua announcement
* View semua project dalam team
* Create & update task yang di-assign ke dirinya (dalam project)
* Participate dalam team chat
* View calendar & events
* View project progress dan task status

---

# 5. Functional Requirements

---

## 5.1 Authentication & User Management

### Features

* Register akun baru
* Login / Logout
* JWT authentication (access token + refresh token)
* Forgot password
* Reset password via link email
* Edit user profile (nama, foto, bio)
* Ganti password

### Alur Registrasi

1. User mengisi form registrasi (nama, email, password)
2. Akun berhasil dibuat
3. Setelah login pertama kali, user diarahkan ke halaman onboarding:
   * Pilihan: **Buat team baru** atau **Masuk team via undangan**

### Rules

* Email harus unik di seluruh sistem
* Password minimal 8 karakter
* User hanya dapat mengakses team yang dimiliki / diundang
* Access token memiliki masa berlaku singkat; refresh token digunakan untuk memperbarui sesi
* Link reset password hanya berlaku selama 1 jam

---

## 5.2 Team Workspace

### Description

Setiap team memiliki workspace terpisah. User dapat membuat team sendiri dan tergabung dalam banyak team sekaligus.

### Pembuatan Team

* Setiap user yang sudah login dapat membuat team baru
* User yang membuat team otomatis menjadi **Manager** team tersebut
* Saat membuat team, user mengisi: nama team, deskripsi (opsional), dan foto team (opsional)

### Sistem Undangan (Invite)

* Manager dapat mengundang user lain melalui **email** atau **username**
* Undangan dikirim sebagai notifikasi in-app dan / atau email
* User yang diundang dapat **menerima** atau **menolak** undangan
* Setelah menerima, user bergabung sebagai **Member** (default)
* Manager dapat mengubah role anggota kapan saja:
  * Member → Manager
  * Manager → Member (selama masih ada Manager lain dalam team)

### Manajemen Keanggotaan

* User dapat **keluar dari team** (leave team) kapan saja
* Manager dapat **mengeluarkan anggota** dari team
* Jika Manager satu-satunya ingin keluar, harus **transfer kepemilikan** ke anggota lain terlebih dahulu

### Multi-Team

* User dapat berada di lebih dari satu team
* Setiap team tampil di sidebar sebagai daftar workspace
* User dapat berpindah antar team dari sidebar
* Data setiap team terisolasi — anggota satu team tidak dapat melihat data team lain

---

## 5.3 Announcement Module

### Features

* Create announcement
* Edit / delete announcement
* Pin announcement
* Read status tracking
* Attachment file (optional)

### Rules

* Hanya Manager yang dapat membuat announcement
* Semua member dapat membaca
* Announcement tersimpan dalam timeline

### Data Fields

* title
* content
* author
* team_id
* created_at
* pinned (boolean)

---

## 5.4 Project Management Module

### Features

* Create project
* Assign PIC (Person In Charge) untuk project
* Edit / delete project
* Set project deadline
* Automatic progress tracking
* Project status (Not Started, In Progress, On Hold, Completed)

### Progress Calculation

```
Progress % = (Completed Tasks + In Progress Tasks × 0.5) / Total Tasks × 100

Keterangan:
- Completed task = 100% progress
- In Progress task = 50% progress
- Review task = 75% progress
- Todo task = 0% progress
```

Alternatively simple calculation:
```
Progress % = (Completed Tasks / Total Tasks) × 100
```

### Rules

* Hanya Manager yang dapat membuat project
* Hanya Manager yang dapat menugaskan PIC
* PIC dapat edit project details
* Progress auto-update seiring task status berubah
* Project hanya terlihat dalam team

### Data Fields

* title
* description
* team_id
* pic_id (Person In Charge)
* status (Not Started, In Progress, On Hold, Completed)
* start_date
* due_date
* progress (%) [auto-calculated]
* created_by
* created_at
* updated_at

---

## 5.5 Task Collaboration Module

### Features

* Create task (dalam project)
* Assign member
* Update status
* Set due date
* Priority level
* Task board view (per project)

### Task Status

* Todo
* In Progress
* Review
* Done

### Rules

* Task hanya terlihat dalam project → team
* Task harus selalu dalam project (tidak ada task orphan)
* Assignee menerima notifikasi
* Task dapat dipindahkan antar status
* Status change otomatis update project progress

### Data Fields

* title
* description
* project_id (FK)
* assignee
* priority
* due_date
* status
* created_by
* created_at
* updated_at

---

## 5.6 Team Calendar & Events

### Features

* Create event
* View monthly calendar
* Deadline task muncul di calendar
* Event reminder

### Event Types

* Meeting
* Training
* Deadline
* Internal event

### Rules

* Hanya Manager yang dapat create event
* Member dapat view semua event team

### Data Fields

* title
* description
* start_date
* end_date
* team_id

---

## 5.7 Live Team Chat (Realtime)

### Features

* Realtime messaging
* Chat room per team
* Message history
* Typing indicator (optional)
* Unread counter

### Technical Requirements

* WebSocket communication
* Room-based broadcasting
* Message persistence di database

### Rules

* User hanya bisa chat dalam team-nya
* Semua message disimpan

### Data Fields

* sender_id
* team_id
* message
* created_at

---

## 5.8 Notification System

### Trigger Events

* Undangan bergabung ke team diterima / ditolak
* User baru bergabung ke team
* Role anggota diubah
* Project baru dibuat (notify team members)
* PIC ditetapkan untuk project (notify PIC)
* Task di-assign ke user
* Status task diperbarui
* Project progress berubah signifikan (misal >50%)
* Announcement baru dibuat
* Event baru dibuat
* Mention dalam chat (future)

### Type

* In-app notification
* Email notification (untuk undangan & reset password)

---

# 6. Non-Functional Requirements

## Performance

* Response API < 300ms (average)
* Chat latency minimal

## Security

* JWT authentication
* Role-based access control
* Team data isolation

## Scalability

* Modular backend architecture
* Service-based modules

## Reliability

* Message data tidak boleh hilang
* Task & announcement harus persist

---

# 7. System Architecture

## Frontend

* Nuxt 3
* SSR / SPA hybrid
* Component-based architecture
* State management (Pinia)
* Project & Task dashboard components

## Backend

* NestJS
* Modular architecture
* REST API
* WebSocket Gateway
* Project & Task service modules

## Database

Recommended:

* PostgreSQL / MySQL

## Architecture Diagram

```
Team Workspace
├── Announcement (timeline)
├── Project (list with progress bar)
│   ├── Tasks (kanban board)
│   │   ├── Todo
│   │   ├── In Progress
│   │   ├── Review
│   │   └── Done
│   ├── PIC (Person In Charge)
│   └── Progress % (auto-calculated)
├── Calendar & Events
└── Chat (realtime)
```

---

# 8. Backend Module Structure

```
modules/
  auth/
  user/
  team/
  announcement/
  project/        (NEW)
  task/           (modified - add project_id)
  event/
  chat/
  notification/
```

---

# 9. Core Entities

* User
* Team
* TeamMember
* Announcement
* Project (NEW)
* Task (modified - belongs to Project)
* Event
* ChatMessage
* Notification

---

# 10. Main User Flow

## 10.1 Registrasi & Onboarding

1. User membuka aplikasi → klik "Daftar"
2. Isi form: nama lengkap, email, password
3. Akun berhasil dibuat → otomatis login
4. Halaman onboarding muncul dengan dua pilihan:
   * **Buat team baru** → lanjut ke flow 10.2
   * **Masukkan kode / terima undangan** → lanjut ke flow 10.4

---

## 10.2 Membuat Team Baru

1. User memilih "Buat team baru"
2. Isi form: nama team, deskripsi (opsional)
3. Team berhasil dibuat → user otomatis menjadi **Manager**
4. Diarahkan ke workspace team yang baru dibuat
5. Muncul prompt: "Undang anggota sekarang?"

---

## 10.3 Mengundang Anggota

1. Manager membuka menu **Kelola Anggota** di pengaturan team
2. Masukkan email atau username user yang ingin diundang
3. Pilih role awal: Manager atau Member (default: Member)
4. Kirim undangan → user menerima notifikasi
5. User yang diundang menerima atau menolak undangan
6. Jika diterima → user langsung muncul di daftar anggota team

---

## 10.4 Bergabung ke Team via Undangan

1. User menerima notifikasi undangan (in-app atau email)
2. Klik link / tombol "Terima Undangan"
3. Jika belum punya akun → diarahkan ke halaman registrasi terlebih dahulu
4. Setelah login / register → otomatis bergabung ke team dengan role yang ditetapkan
5. Diarahkan ke workspace team tersebut

---

## 10.5 Alur Harian — Member

1. Login
2. Pilih team dari sidebar
3. Cek announcements terbaru
4. Lihat daftar project dan progress-nya
5. Buka project → lihat & update task yang di-assign
6. Buka team chat
7. Cek calendar untuk event & deadline project

---

## 10.6 Alur Harian — Manager

1. Login
2. Pilih team dari sidebar
3. Buat atau update announcement
4. Buat project baru atau monitor existing projects
5. Assign PIC untuk project
6. Buat / assign task dalam project
7. Monitor project progress dan task status
8. Tambah event di calendar

---

## 10.7 Membuat Project Baru

1. Manager buka Tab **Project** di team workspace
2. Klik tombol **"+ Buat Project"**
3. Isi form:
   * Nama project
   * Deskripsi (opsional)
   * PIC (Person In Charge) - pilih anggota team
   * Start date
   * Due date
4. Klik "Buat" → Project berhasil dibuat dengan status "Not Started"
5. Progress otomatis set ke 0%
6. Manager dapat langsung menambah task dalam project

---

## 10.8 Menambahkan Task dalam Project

1. Manager buka project yang sudah dibuat
2. Klik tombol **"+ Tambah Task"**
3. Isi form:
   * Judul task
   * Deskripsi
   * Prioritas (Low, Medium, High)
   * Assign ke anggota (atau PIC project)
   * Due date
4. Klik "Buat" → Task berhasil ditambahkan dengan status "Todo"
5. Assignee menerima notifikasi
6. Project progress otomatis terupdate berdasarkan jumlah task

---

## 10.9 Update Task Status & Project Progress

1. Member / Manager buka project
2. Lihat task board (kanban view) per project
3. Pindahkan task antar kolom status (Todo → In Progress → Review → Done)
4. Atau klik task → update status langsung
5. Saat status berubah → project progress otomatis terhitung ulang:
   ```
   Progress = (Completed Tasks / Total Tasks) × 100
   ```
6. PIC dan Manager menerima notifikasi status update
7. Saat semua task Done → Project status otomatis jadi "Completed"

---

## 10.10 Mengelola Role Anggota

1. Manager buka **Pengaturan Team → Anggota**
2. Pilih anggota yang ingin diubah rolenya
3. Pilih role baru: Manager / Member
4. Konfirmasi perubahan → role langsung berlaku
5. Anggota mendapat notifikasi perubahan role

---

## 10.11 Alur System Admin

1. Login dengan akun System Admin
2. Diarahkan ke panel administrasi (terpisah dari workspace biasa)
3. Dapat melihat daftar semua user terdaftar
4. Dapat menonaktifkan / menghapus akun user yang bermasalah
5. Dapat melihat daftar semua team di platform
6. Dapat menghapus team jika diperlukan

---

# 11. Entity Relationship & Database Schema

## Project Entity

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  team_id UUID NOT NULL (FK → teams),
  name VARCHAR NOT NULL,
  description TEXT,
  pic_id UUID (FK → users),  -- Person In Charge
  status ENUM ('Not Started', 'In Progress', 'On Hold', 'Completed'),
  progress DECIMAL(5,2) DEFAULT 0,  -- 0-100%
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  created_by UUID NOT NULL (FK → users),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

## Task Entity (Modified)

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL (FK → projects),  -- NEW
  title VARCHAR NOT NULL,
  description TEXT,
  assignee UUID (FK → users),
  priority ENUM ('Low', 'Medium', 'High'),
  status ENUM ('Todo', 'In Progress', 'Review', 'Done'),
  due_date TIMESTAMP,
  created_by UUID NOT NULL (FK → users),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
)
```

## Entity Relationships

```
Team (1) ──── (N) Project
       │
       └──── (N) Announcement
       └──── (N) Event
       └──── (N) ChatMessage

Project (1) ──── (N) Task
        │
        └──── (1) User [PIC]

Task (N) ──── (1) User [Assignee]

User (1) ──── (N) Project [Created By]
    │
    └──── (N) Task [Created By]
```

## Progress Calculation Logic

```
Setiap kali task status berubah:

1. Hitung total tasks dalam project
2. Hitung completed tasks (status = 'Done')
3. Progress = (Completed / Total) × 100
4. Update project.progress field
5. Trigger notification jika progress milestone tercapai (misal 25%, 50%, 75%, 100%)
```

---

# 12. Future Enhancements (Roadmap)

* Activity feed (project & task updates)
* File storage system per project
* Project templates
* Advanced search across projects & tasks
* Project analytics dashboard
* Gantt chart view untuk project timeline
* Subtask support
* Time tracking per task
* Project dependency management
* Mobile responsive optimization
* AI summary for announcements & project status
