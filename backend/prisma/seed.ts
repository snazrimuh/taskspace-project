import {
  PrismaClient,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  EventType,
  NotificationType,
  TeamRole,
} from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const days = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

const hours = (base: Date, h: number) => {
  const d = new Date(base)
  d.setHours(d.getHours() + h)
  return d
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed...\n')

  // ── Cleanup (order matters due to FK constraints) ───────────────
  await prisma.notification.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.event.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.announcementRead.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.teamInvite.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
  console.log('🗑️   Cleaned existing data')

  const PASS = await bcrypt.hash('password123', 10)

  // ─────────────────────────────────────────────────────────────────
  // USERS
  // Credentials: email / password123
  // ─────────────────────────────────────────────────────────────────
  const [ahmad, siti, budi, dewi, rizky, nur, fajar, maya] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alex Carter',
        email: 'alex@taskspace.app',
        password: PASS,
        bio: 'Platform engineer passionate about distributed systems.',
        isSystemAdmin: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Mitchell',
        email: 'sarah@taskspace.app',
        password: PASS,
        bio: 'Mobile lead with 5 years experience in Flutter & React Native.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ben Harper',
        email: 'ben@taskspace.app',
        password: PASS,
        bio: 'Backend developer, NestJS & PostgreSQL enthusiast.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Diana Walsh',
        email: 'diana@taskspace.app',
        password: PASS,
        bio: 'Full-stack developer. Loves clean code and TypeScript.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ryan Brooks',
        email: 'ryan@taskspace.app',
        password: PASS,
        bio: 'DevOps & infrastructure engineer. Docker and Kubernetes addict.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Natalie Ford',
        email: 'natalie@taskspace.app',
        password: PASS,
        bio: 'UI/UX designer who codes. Figma power user.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jake Turner',
        email: 'jake@taskspace.app',
        password: PASS,
        bio: 'Junior developer, eager learner. React & Vue.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Maya Collins',
        email: 'maya@taskspace.app',
        password: PASS,
        bio: 'Product manager with engineering background.',
      },
    }),
  ])
  console.log('👥  Users created: 8')

  // ─────────────────────────────────────────────────────────────────
  // TEAMS
  // ─────────────────────────────────────────────────────────────────
  const [platformTeam, mobileTeam, productTeam] = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Platform Engineering',
        description: 'Handles all backend services, databases, DevOps and infrastructure.',
        createdById: ahmad.id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Mobile Squad',
        description: 'Develops and maintains iOS and Android applications.',
        createdById: siti.id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Product & Design',
        description: 'Product planning, UX research and interface design.',
        createdById: maya.id,
      },
    }),
  ])
  console.log('🏢  Teams created: 3')

  // ─────────────────────────────────────────────────────────────────
  // TEAM MEMBERS
  // Platform: Ahmad(MGR), Budi, Rizky, Fajar, Dewi
  // Mobile:   Siti(MGR), Dewi, Nur, Ahmad, Fajar
  // Product:  Maya(MGR), Nur, Siti, Rizky
  // ─────────────────────────────────────────────────────────────────
  await prisma.teamMember.createMany({
    data: [
      // Platform Engineering
      { userId: ahmad.id, teamId: platformTeam.id, role: TeamRole.MANAGER },
      { userId: budi.id,  teamId: platformTeam.id, role: TeamRole.MEMBER },
      { userId: rizky.id, teamId: platformTeam.id, role: TeamRole.MEMBER },
      { userId: fajar.id, teamId: platformTeam.id, role: TeamRole.MEMBER },
      { userId: dewi.id,  teamId: platformTeam.id, role: TeamRole.MEMBER },
      // Mobile Squad
      { userId: siti.id,  teamId: mobileTeam.id, role: TeamRole.MANAGER },
      { userId: dewi.id,  teamId: mobileTeam.id, role: TeamRole.MEMBER },
      { userId: nur.id,   teamId: mobileTeam.id, role: TeamRole.MEMBER },
      { userId: ahmad.id, teamId: mobileTeam.id, role: TeamRole.MEMBER },
      { userId: fajar.id, teamId: mobileTeam.id, role: TeamRole.MEMBER },
      // Product & Design
      { userId: maya.id,  teamId: productTeam.id, role: TeamRole.MANAGER },
      { userId: nur.id,   teamId: productTeam.id, role: TeamRole.MEMBER },
      { userId: siti.id,  teamId: productTeam.id, role: TeamRole.MEMBER },
      { userId: rizky.id, teamId: productTeam.id, role: TeamRole.MEMBER },
    ],
  })
  console.log('🤝  Team members assigned')

  // ─────────────────────────────────────────────────────────────────
  // PROJECTS
  // ─────────────────────────────────────────────────────────────────
  const [
    platformCoreProject,
    mobileReleaseProject,
    productResearchProject,
  ] = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Platform Reliability Initiative',
        description: 'Improve reliability, security, and deployment maturity for platform services.',
        status: ProjectStatus.IN_PROGRESS,
        teamId: platformTeam.id,
        picId: budi.id,
        createdById: ahmad.id,
        startDate: days(-10),
        dueDate: days(20),
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile v3.3 Release',
        description: 'Deliver v3.3.0 features and quality fixes before feature freeze.',
        status: ProjectStatus.IN_PROGRESS,
        teamId: mobileTeam.id,
        picId: dewi.id,
        createdById: siti.id,
        startDate: days(-7),
        dueDate: days(14),
      },
    }),
    prisma.project.create({
      data: {
        name: 'Q2 Product Discovery',
        description: 'Discovery, validation, and roadmap definition for Q2 priorities.',
        status: ProjectStatus.IN_PROGRESS,
        teamId: productTeam.id,
        picId: nur.id,
        createdById: maya.id,
        startDate: days(-5),
        dueDate: days(21),
      },
    }),
  ])
  console.log('📁  Projects created: 3')

  // ─────────────────────────────────────────────────────────────────
  // ANNOUNCEMENTS
  // ─────────────────────────────────────────────────────────────────

  // Platform Engineering announcements
  const [ann1, ann2, ann3] = await Promise.all([
    prisma.announcement.create({
      data: {
        title: '🚀 API v2 Migration — Action Required',
        content:
          'All services must migrate to the new API v2 endpoints by EOD Friday. See the migration guide in Confluence. Auth headers have changed — use Bearer token instead of Basic auth. Reach out to Alex or Ben if you need help.',
        pinned: true,
        authorId: ahmad.id,
        teamId: platformTeam.id,
        createdAt: days(-5),
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'PostgreSQL maintenance window — Saturday 02:00–04:00',
        content:
          'We will be applying patches and vacuuming the production database. Expect up to 2 minutes of downtime. All write operations will be queued. Read replicas stay available. RDS snapshot will be taken before maintenance begins.',
        pinned: false,
        authorId: budi.id,
        teamId: platformTeam.id,
        createdAt: days(-3),
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'New on-call rotation starts Monday',
        content:
          'Starting next Monday, we rotate on-call every week. Week 1: Ryan, Week 2: Jake, Week 3: Diana, Week 4: Ben. PagerDuty has been updated. Please make sure your phone notifications are on during your week.',
        pinned: false,
        authorId: ahmad.id,
        teamId: platformTeam.id,
        createdAt: days(-1),
      },
    }),
  ])

  // Mobile Squad announcements
  const [ann4, ann5] = await Promise.all([
    prisma.announcement.create({
      data: {
        title: '📱 App Store submission — v3.2.0 approved!',
        content:
          'Great news! v3.2.0 has been approved by both App Store and Google Play. It will roll out to 100% of users over the next 48 hours. Thanks to everyone who contributed to this release!',
        pinned: true,
        authorId: siti.id,
        teamId: mobileTeam.id,
        createdAt: days(-2),
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Flutter upgrade to 3.29 — testing needed',
        content:
          'We have upgraded the Flutter SDK to 3.29. Please pull the latest main branch and run the full test suite. There are a few breaking changes in the navigation package — see CHANGELOG.md for details.',
        pinned: false,
        authorId: dewi.id,
        teamId: mobileTeam.id,
        createdAt: days(-1),
      },
    }),
  ])

  // Product & Design announcements
  const [ann6, ann7] = await Promise.all([
    prisma.announcement.create({
      data: {
        title: '🎨 Design system v2 is live',
        content:
          'The new design system library has been published to npm. Components are now fully tokenized and support dark mode out of the box. Figma file has been updated too. Please start migrating old components team by team.',
        pinned: true,
        authorId: nur.id,
        teamId: productTeam.id,
        createdAt: days(-4),
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Q2 roadmap review — Thursday 10:00 WIB',
        content:
          'We will review and finalize the Q2 roadmap on Thursday. Please come prepared with your team\'s capacity and any blockers. Bring data on current OKR progress. Meeting link in calendar.',
        pinned: false,
        authorId: maya.id,
        teamId: productTeam.id,
        createdAt: days(-2),
      },
    }),
  ])
  console.log('📢  Announcements created: 7')

  // ── Announcement reads ────────────────────────────────────────
  await prisma.announcementRead.createMany({
    data: [
      { announcementId: ann1.id, userId: budi.id },
      { announcementId: ann1.id, userId: rizky.id },
      { announcementId: ann1.id, userId: dewi.id },
      { announcementId: ann2.id, userId: ahmad.id },
      { announcementId: ann2.id, userId: rizky.id },
      { announcementId: ann4.id, userId: dewi.id },
      { announcementId: ann4.id, userId: nur.id },
      { announcementId: ann4.id, userId: ahmad.id },
      { announcementId: ann6.id, userId: maya.id },
      { announcementId: ann6.id, userId: siti.id },
    ],
  })

  // ─────────────────────────────────────────────────────────────────
  // TASKS
  // ─────────────────────────────────────────────────────────────────

  // Platform Engineering tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Implement JWT refresh token rotation',
        description: 'When a refresh token is used, issue a new one and invalidate the old one to prevent token reuse attacks.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        teamId: platformTeam.id,
        projectId: platformCoreProject.id,
        createdById: ahmad.id,
        assigneeId: budi.id,
        dueDate: days(-2),
      },
      {
        title: 'Set up Redis caching layer for session store',
        description: 'Migrate session storage from PostgreSQL to Redis. Use ioredis. TTL = refresh token lifetime.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        teamId: platformTeam.id,
        projectId: platformCoreProject.id,
        createdById: ahmad.id,
        assigneeId: rizky.id,
        dueDate: days(3),
      },
      {
        title: 'Add rate limiting to all public API endpoints',
        description: 'Use @nestjs/throttler. 100 req/min per IP on public routes, 300 req/min for authenticated routes.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        teamId: platformTeam.id,
        projectId: platformCoreProject.id,
        createdById: ahmad.id,
        assigneeId: budi.id,
        dueDate: days(7),
      },
      {
        title: 'Write migration script for legacy user data',
        description: 'Migrate ~12k users from the old MySQL database to PostgreSQL. Map old IDs to new CUIDs.',
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        teamId: platformTeam.id,
        projectId: platformCoreProject.id,
        createdById: budi.id,
        assigneeId: fajar.id,
        dueDate: days(5),
      },
      {
        title: 'Dockerize all microservices',
        description: 'Each service needs a production-ready Dockerfile. Multi-stage builds. Non-root user. Health check endpoint.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        teamId: platformTeam.id,
        projectId: platformCoreProject.id,
        createdById: rizky.id,
        assigneeId: rizky.id,
        dueDate: days(10),
      },
      {
        title: 'Set up GitHub Actions CI/CD pipeline',
        description: 'Automate lint → test → build → deploy on push to main. Separate staging and production workflows.',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.HIGH,
        teamId: platformTeam.id,
        projectId: platformCoreProject.id,
        createdById: ahmad.id,
        assigneeId: rizky.id,
        dueDate: days(2),
      },
      {
        title: 'API documentation with Swagger',
        description: 'Add @ApiProperty decorators to all DTOs and set up SwaggerModule in main.ts. Host at /api/docs.',
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        teamId: platformTeam.id,
        projectId: platformCoreProject.id,
        createdById: ahmad.id,
        assigneeId: dewi.id,
        dueDate: days(-5),
      },
      {
        title: 'Optimize slow DB queries (N+1 issues)',
        description: 'Profiling found N+1 queries in /teams/:id/members and /tasks endpoints. Fix with select/include optimization.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        teamId: platformTeam.id,
        projectId: platformCoreProject.id,
        createdById: budi.id,
        assigneeId: budi.id,
        dueDate: days(4),
      },
    ],
  })

  // Mobile Squad tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Implement biometric login (Face ID / Fingerprint)',
        description: 'Use local_auth Flutter package. Store encrypted token in secure storage on device.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        teamId: mobileTeam.id,
        projectId: mobileReleaseProject.id,
        createdById: siti.id,
        assigneeId: dewi.id,
        dueDate: days(5),
      },
      {
        title: 'Fix push notification not showing on Android 14',
        description: 'POST_NOTIFICATIONS permission must be requested at runtime on Android 13+. Regression introduced in 3.1.9.',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.URGENT,
        teamId: mobileTeam.id,
        projectId: mobileReleaseProject.id,
        createdById: nur.id,
        assigneeId: fajar.id,
        dueDate: days(1),
      },
      {
        title: 'Migrate from GetX to Riverpod state management',
        description: 'Two screens remaining: ProfileScreen and SettingsScreen. See migration guide in /docs/riverpod-migration.md.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        teamId: mobileTeam.id,
        projectId: mobileReleaseProject.id,
        createdById: siti.id,
        assigneeId: dewi.id,
        dueDate: days(14),
      },
      {
        title: 'Offline mode — cache last 7 days of tasks',
        description: 'Use drift (SQLite) to cache tasks. Sync on reconnect. Show banner when offline.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        teamId: mobileTeam.id,
        projectId: mobileReleaseProject.id,
        createdById: siti.id,
        assigneeId: null,
        dueDate: days(21),
      },
      {
        title: 'Dark mode polish pass',
        description: 'Go through all screens with design team. Check contrast ratios. Update color tokens to match Figma v2.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        teamId: mobileTeam.id,
        projectId: mobileReleaseProject.id,
        createdById: nur.id,
        assigneeId: fajar.id,
        dueDate: days(9),
      },
      {
        title: 'App icon and splash screen update',
        description: 'New brand assets from design team are ready. Update flutter_native_splash and app icon configs.',
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        teamId: mobileTeam.id,
        projectId: mobileReleaseProject.id,
        createdById: siti.id,
        assigneeId: fajar.id,
        dueDate: days(-7),
      },
    ],
  })

  // Product & Design tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'User research — onboarding flow',
        description:
          '5 user interviews planned. Focus on first-time setup friction. Record with consent. Synthesize findings into FigJam.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        teamId: productTeam.id,
        projectId: productResearchProject.id,
        createdById: maya.id,
        assigneeId: nur.id,
        dueDate: days(6),
      },
      {
        title: 'Define OKRs for Q2 2026',
        description:
          'Draft 3 objectives with 2–3 key results each. Align with engineering capacity. Review with CTO before all-hands.',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.URGENT,
        teamId: productTeam.id,
        projectId: productResearchProject.id,
        createdById: maya.id,
        assigneeId: maya.id,
        dueDate: days(2),
      },
      {
        title: 'Redesign task card component',
        description:
          'Current card is too information-dense. New design should surface priority and due date more clearly. Deliver in Figma.',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        teamId: productTeam.id,
        projectId: productResearchProject.id,
        createdById: nur.id,
        assigneeId: nur.id,
        dueDate: days(-3),
      },
      {
        title: 'Competitor analysis — Notion, Linear, Asana',
        description:
          'Compare feature parity, pricing, onboarding UX. 2-page summary deck for stakeholder review.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        teamId: productTeam.id,
        projectId: productResearchProject.id,
        createdById: maya.id,
        assigneeId: rizky.id,
        dueDate: days(12),
      },
      {
        title: 'Create component library documentation site',
        description:
          'Use Storybook. Document all tokens, components and usage guidelines. Auto-deploy from GitHub Actions.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        teamId: productTeam.id,
        projectId: productResearchProject.id,
        createdById: nur.id,
        assigneeId: siti.id,
        dueDate: days(8),
      },
    ],
  })
  console.log('✅  Tasks created: 19')

  // ─────────────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────────────

  const tomorrow = days(1)
  const nextWeek = days(7)

  await prisma.event.createMany({
    data: [
      // Platform Engineering
      {
        title: 'Sprint 22 Planning',
        description: 'Plan tasks for the next 2-week sprint. Capacity check and story point estimation.',
        type: EventType.MEETING,
        startDate: days(1),
        endDate: hours(days(1), 2),
        teamId: platformTeam.id,
        createdById: ahmad.id,
      },
      {
        title: 'PostgreSQL Maintenance Window',
        description: 'Scheduled DB maintenance. Expect brief downtime on writes.',
        type: EventType.DEADLINE,
        startDate: days(4),
        endDate: hours(days(4), 2),
        teamId: platformTeam.id,
        createdById: budi.id,
      },
      {
        title: 'Redis & Caching Workshop',
        description: 'Internal training on Redis data structures, pub/sub, and caching patterns.',
        type: EventType.TRAINING,
        startDate: days(10),
        endDate: hours(days(10), 3),
        teamId: platformTeam.id,
        createdById: rizky.id,
      },
      {
        title: 'Q1 Retrospective',
        description: 'Review what went well and what to improve. Bring your top 3 items.',
        type: EventType.INTERNAL,
        startDate: days(-2),
        endDate: hours(days(-2), 1),
        teamId: platformTeam.id,
        createdById: ahmad.id,
      },
      // Mobile Squad
      {
        title: 'v3.3.0 Feature Freeze',
        description: 'No new features merged after this date. Only bug fixes allowed until release.',
        type: EventType.DEADLINE,
        startDate: days(5),
        endDate: days(5),
        teamId: mobileTeam.id,
        createdById: siti.id,
      },
      {
        title: 'Flutter 3.29 Migration Workshop',
        description: 'Live walkthrough of breaking changes and migration steps.',
        type: EventType.TRAINING,
        startDate: days(3),
        endDate: hours(days(3), 2),
        teamId: mobileTeam.id,
        createdById: siti.id,
      },
      {
        title: 'Weekly Team Standup',
        description: 'Async notes + 15-min sync. Each person: done, doing, blockers.',
        type: EventType.MEETING,
        startDate: days(2),
        endDate: hours(days(2), 1),
        teamId: mobileTeam.id,
        createdById: siti.id,
      },
      // Product & Design
      {
        title: 'Q2 Roadmap Review',
        description: 'Finalize Q2 roadmap with all stakeholders. Bring capacity data.',
        type: EventType.MEETING,
        startDate: days(2),
        endDate: hours(days(2), 2),
        teamId: productTeam.id,
        createdById: maya.id,
      },
      {
        title: 'Design System v2 — Handoff Session',
        description: 'Walk engineering teams through the new design tokens and component APIs.',
        type: EventType.TRAINING,
        startDate: days(6),
        endDate: hours(days(6), 2),
        teamId: productTeam.id,
        createdById: nur.id,
      },
      {
        title: 'User Interview Session #1',
        description: 'First batch of onboarding flow research interviews. 3 participants.',
        type: EventType.INTERNAL,
        startDate: days(4),
        endDate: hours(days(4), 3),
        teamId: productTeam.id,
        createdById: nur.id,
      },
    ],
  })
  console.log('📅  Events created: 10')

  // ─────────────────────────────────────────────────────────────────
  // CHAT MESSAGES
  // ─────────────────────────────────────────────────────────────────

  const msg = (message: string, senderId: string, teamId: string, minutesAgo: number) => ({
    message,
    senderId,
    teamId,
    createdAt: (() => {
      const d = new Date()
      d.setMinutes(d.getMinutes() - minutesAgo)
      return d
    })(),
  })

  await prisma.chatMessage.createMany({
    data: [
      // Platform Engineering chat
      msg('Good morning team! Sprint 22 planning starts at 10:00 today. Please review the backlog beforehand 🚀', ahmad.id, platformTeam.id, 120),
      msg('On it! Just finished the JWT rotation PR, will be ready to review before planning.', budi.id, platformTeam.id, 115),
      msg('Redis branch is almost ready too. Just need to write a few more integration tests.', rizky.id, platformTeam.id, 112),
      msg('Can someone help me understand the N+1 issue in the tasks endpoint? I see multiple DB calls in the profiler.', fajar.id, platformTeam.id, 100),
      msg('Jake, the issue is in the getMembers call inside the loop. Use Prisma `include` instead. I\'ll drop a code snippet in the PR review.', budi.id, platformTeam.id, 97),
      msg('Thanks Ben! That makes sense. Looking at it now.', fajar.id, platformTeam.id, 95),
      msg('Swagger docs are deployed! Check them out at http://localhost:3001/api/docs 📚', dewi.id, platformTeam.id, 80),
      msg('Nice work Diana! Very clean.', ahmad.id, platformTeam.id, 75),
      msg('CI/CD pipeline PR is up for review. @Alex please take a look when you get a chance.', rizky.id, platformTeam.id, 60),
      msg('Reviewed! Left a few minor comments. Overall looks great Ryan 👍', ahmad.id, platformTeam.id, 50),
      msg('Maintenance window reminder: this Saturday 02:00-04:00. I\'ll be monitoring.', budi.id, platformTeam.id, 30),
      msg('I\'ll be on standby too just in case. Set your alarms everyone haha', rizky.id, platformTeam.id, 25),

      // Mobile Squad chat
      msg('Team! App Store approval just came in 🎉🎉 v3.2.0 is live on both platforms!', siti.id, mobileTeam.id, 200),
      msg('Yesss!! Congrats everyone, we worked hard for this one 🙌', dewi.id, mobileTeam.id, 198),
      msg('Great work team! Now let\'s not break anything before v3.3 😄', nur.id, mobileTeam.id, 195),
      msg('Jake, can you take a look at the Android 14 notification bug? It\'s blocking some users on the latest OS.', siti.id, mobileTeam.id, 150),
      msg('On it Sarah. I think I found it — POST_NOTIFICATIONS wasn\'t being requested at runtime. Fix incoming.', fajar.id, mobileTeam.id, 145),
      msg('Biometric login progress: Face ID works on iOS. Fingerprint on Android tested on 3 devices ✅ Still testing Android 13.', dewi.id, mobileTeam.id, 100),
      msg('Awesome Diana! That feature is gonna be a big hit with users.', siti.id, mobileTeam.id, 95),
      msg('Flutter 3.29 upgrade is on main. Please pull and run `flutter pub get` + full test run.', siti.id, mobileTeam.id, 60),
      msg('Tests are green on my end ✅', dewi.id, mobileTeam.id, 55),
      msg('Same here. One deprecation warning in navigation but no breaking change for us.', fajar.id, mobileTeam.id, 50),
      msg('Great! Feature freeze for 3.3.0 is in 5 days. Let\'s keep the momentum.', siti.id, mobileTeam.id, 10),

      // Product & Design chat
      msg('Design System v2 is published to npm! Package name: @taskspace/ui — check the README for migration guide 🎨', nur.id, productTeam.id, 300),
      msg('This is huge! The dark mode support alone is going to save us so much time.', maya.id, productTeam.id, 295),
      msg('Agreed. Natalie you did an amazing job on the token architecture 🔥', siti.id, productTeam.id, 290),
      msg('Thanks team! Credit to everyone who gave feedback during the review sessions.', nur.id, productTeam.id, 285),
      msg('Q2 roadmap doc is in Notion. Please add your team\'s capacity and any blockers before Thursday\'s meeting.', maya.id, productTeam.id, 200),
      msg('Ryan — I\'ve assigned you the competitor analysis task. LMK if the timeline works for you.', maya.id, productTeam.id, 150),
      msg('Got it Maya. Two weeks should be enough for a solid analysis.', rizky.id, productTeam.id, 145),
      msg('User interview session #1 scheduled for Thursday afternoon. Natalie, can you prep the script by Wednesday EOD?', maya.id, productTeam.id, 80),
      msg('Sure! Draft will be ready by Tuesday evening. Will share for feedback before finalizing.', nur.id, productTeam.id, 75),
      msg('Task card redesign Figma file is updated. The new layout is much cleaner 👌', nur.id, productTeam.id, 30),
      msg('Love it! Engineering can start implementation next sprint.', maya.id, productTeam.id, 20),
    ],
  })
  console.log('💬  Chat messages created: 33')

  // ─────────────────────────────────────────────────────────────────
  // TEAM INVITES (pending — not yet accepted)
  // ─────────────────────────────────────────────────────────────────
  await prisma.teamInvite.createMany({
    data: [
      // Invite Maya to Platform Engineering
      {
        teamId: platformTeam.id,
        senderId: ahmad.id,
        receiverId: maya.id,
        role: TeamRole.MEMBER,
      },
      // Invite Budi to Product & Design
      {
        teamId: productTeam.id,
        senderId: maya.id,
        receiverId: budi.id,
        role: TeamRole.MEMBER,
      },
    ],
  })
  console.log('📨  Pending invites created: 2')

  // ─────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      // Budi: task assigned
      {
        userId: budi.id,
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Add rate limiting to all public API endpoints"',
        referenceType: 'task',
        isRead: false,
        createdAt: days(-1),
      },
      // Rizky: task status
      {
        userId: rizky.id,
        type: NotificationType.TASK_STATUS_UPDATED,
        message: '"Set up GitHub Actions CI/CD pipeline" moved to REVIEW',
        referenceType: 'task',
        isRead: false,
        createdAt: days(-1),
      },
      // Fajar: task assigned
      {
        userId: fajar.id,
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Write migration script for legacy user data"',
        referenceType: 'task',
        isRead: false,
        createdAt: days(-2),
      },
      // Dewi: announcement
      {
        userId: dewi.id,
        type: NotificationType.ANNOUNCEMENT_CREATED,
        message: 'New announcement in Platform Engineering: "API v2 Migration — Action Required"',
        referenceType: 'announcement',
        isRead: true,
        createdAt: days(-5),
      },
      // Fajar: fix push notification task assigned
      {
        userId: fajar.id,
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Fix push notification not showing on Android 14"',
        referenceType: 'task',
        isRead: false,
        createdAt: days(-1),
      },
      // Dewi: biometric task assigned
      {
        userId: dewi.id,
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Implement biometric login (Face ID / Fingerprint)"',
        referenceType: 'task',
        isRead: false,
        createdAt: days(-2),
      },
      // Nur: announcement
      {
        userId: nur.id,
        type: NotificationType.ANNOUNCEMENT_CREATED,
        message: 'New announcement in Mobile Squad: "App Store submission — v3.2.0 approved!"',
        referenceType: 'announcement',
        isRead: true,
        createdAt: days(-2),
      },
      // Sarah: member joined
      {
        userId: siti.id,
        type: NotificationType.MEMBER_JOINED,
        message: 'Alex Carter joined Mobile Squad',
        referenceType: 'team',
        isRead: true,
        createdAt: days(-10),
      },
      // Nur: task assigned
      {
        userId: nur.id,
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "User research — onboarding flow"',
        referenceType: 'task',
        isRead: false,
        createdAt: days(-1),
      },
      // Maya: OKR task status
      {
        userId: maya.id,
        type: NotificationType.TASK_STATUS_UPDATED,
        message: '"Define OKRs for Q2 2026" moved to REVIEW',
        referenceType: 'task',
        isRead: false,
        createdAt: days(-1),
      },
      // Rizky: invite to Product & Design
      {
        userId: rizky.id,
        type: NotificationType.TASK_ASSIGNED,
        message: 'You have been assigned to "Competitor analysis — Notion, Linear, Asana"',
        referenceType: 'task',
        isRead: false,
        createdAt: days(-1),
      },
      // Maya: pending invite sent
      {
        userId: maya.id,
        type: NotificationType.TEAM_INVITE,
        message: 'Alex Carter invited you to join Platform Engineering',
        referenceType: 'invite',
        isRead: false,
        createdAt: days(-1),
      },
      // Ben: pending invite
      {
        userId: budi.id,
        type: NotificationType.TEAM_INVITE,
        message: 'Maya Collins invited you to join Product & Design',
        referenceType: 'invite',
        isRead: false,
        createdAt: days(-1),
      },
      // Announcement created notifications for new ann
      {
        userId: ahmad.id,
        type: NotificationType.ANNOUNCEMENT_CREATED,
        message: 'New announcement in Platform Engineering: "New on-call rotation starts Monday"',
        referenceType: 'announcement',
        isRead: false,
        createdAt: days(-1),
      },
      {
        userId: siti.id,
        type: NotificationType.ANNOUNCEMENT_CREATED,
        message: 'New announcement in Product & Design: "Design system v2 is live"',
        referenceType: 'announcement',
        isRead: false,
        createdAt: days(-4),
      },
    ],
  })
  console.log('🔔  Notifications created: 15')

  // ─────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────
  console.log('\n✅  Seed complete!\n')
  console.log('─────────────────────────────────────────')
  console.log('  🔑  All passwords: password123')
  console.log('─────────────────────────────────────────')
  console.log('  👤  alex@taskspace.app    (System Admin, Platform Engineering Manager)')
  console.log('  👤  sarah@taskspace.app   (Mobile Squad Manager)')
  console.log('  👤  maya@taskspace.app    (Product & Design Manager)')
  console.log('  👤  ben@taskspace.app     (Backend Developer)')
  console.log('  👤  ryan@taskspace.app    (DevOps Engineer)')
  console.log('  👤  diana@taskspace.app   (Full-stack Developer)')
  console.log('  👤  jake@taskspace.app    (Junior Developer)')
  console.log('  👤  natalie@taskspace.app (UI/UX Designer)')
  console.log('─────────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
