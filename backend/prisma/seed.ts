import {
  EventType,
  NotificationType,
  PrismaClient,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  TeamRole,
} from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const daysFromNow = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

const avatar = (name: string, style = 'avataaars') => {
  const seed = name.replace(/\s+/g, '').toLowerCase()
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&scale=80`
}

async function main() {
  console.log('--- Task-Space seeding started (SSO-aligned users) ---')

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

  const passwordHash = await bcrypt.hash('password123', 10)

  // SSO identity must match Portal Hub, Asset-Space, and Worktime.
  const [alex, marcus, sarah, david, linda] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alex Rivera',
        email: 'alex@testmail.com',
        password: passwordHash,
        avatar: avatar('Alex Rivera', 'avataaars'),
        bio: 'Group IT Director and system owner.',
        isSystemAdmin: true,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Marcus Thorne',
        email: 'marcus@testmail.com',
        password: passwordHash,
        avatar: avatar('Marcus Thorne', 'bottts'),
        bio: 'Platform administrator and delivery lead.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Jenkins',
        email: 'sarah@testmail.com',
        password: passwordHash,
        avatar: avatar('Sarah Jenkins', 'personas'),
        bio: 'Operations manager for cross-team execution.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Chen',
        email: 'david@testmail.com',
        password: passwordHash,
        avatar: avatar('David Chen', 'lorelei'),
        bio: 'Backend engineer focused on API reliability.',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Linda Wu',
        email: 'linda@testmail.com',
        password: passwordHash,
        avatar: avatar('Linda Wu', 'miniavs'),
        bio: 'Product designer and UX collaborator.',
      },
    }),
  ])

  const [coreTeam, productTeam, mobileTeam] = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Core Engineering',
        description: 'Backend platform, infra, and security initiatives.',
        createdById: alex.id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Product Experience',
        description: 'Feature planning, UX, and delivery alignment.',
        createdById: sarah.id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Mobile Enablement',
        description: 'Mobile app execution and release quality.',
        createdById: marcus.id,
      },
    }),
  ])

  await prisma.teamMember.createMany({
    data: [
      { userId: alex.id, teamId: coreTeam.id, role: TeamRole.MANAGER },
      { userId: marcus.id, teamId: coreTeam.id, role: TeamRole.MEMBER },
      { userId: david.id, teamId: coreTeam.id, role: TeamRole.MEMBER },
      { userId: sarah.id, teamId: productTeam.id, role: TeamRole.MANAGER },
      { userId: linda.id, teamId: productTeam.id, role: TeamRole.MEMBER },
      { userId: david.id, teamId: productTeam.id, role: TeamRole.MEMBER },
      { userId: marcus.id, teamId: mobileTeam.id, role: TeamRole.MANAGER },
      { userId: linda.id, teamId: mobileTeam.id, role: TeamRole.MEMBER },
      { userId: sarah.id, teamId: mobileTeam.id, role: TeamRole.MEMBER },
    ],
  })

  await prisma.teamInvite.createMany({
    data: [
      {
        teamId: coreTeam.id,
        senderId: alex.id,
        receiverId: linda.id,
        role: TeamRole.MEMBER,
        accepted: true,
        respondedAt: daysFromNow(-18),
      },
      {
        teamId: productTeam.id,
        senderId: sarah.id,
        receiverId: marcus.id,
        role: TeamRole.MEMBER,
        accepted: false,
        respondedAt: daysFromNow(-5),
      },
      {
        teamId: mobileTeam.id,
        senderId: marcus.id,
        receiverId: david.id,
        role: TeamRole.MEMBER,
        accepted: null,
      },
    ],
  })

  const [coreProject, productProject, mobileProject, securityProject] = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Unified API Stabilization',
        description: 'Hardening API performance and endpoint consistency across products.',
        status: ProjectStatus.IN_PROGRESS,
        progress: 62,
        startDate: daysFromNow(-21),
        dueDate: daysFromNow(20),
        teamId: coreTeam.id,
        picId: david.id,
        createdById: alex.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Task Flow Redesign',
        description: 'Improve task lifecycle clarity from backlog to done.',
        status: ProjectStatus.IN_PROGRESS,
        progress: 48,
        startDate: daysFromNow(-14),
        dueDate: daysFromNow(26),
        teamId: productTeam.id,
        picId: linda.id,
        createdById: sarah.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile Quality Sprint',
        description: 'Crash reduction, notifications reliability, and release readiness.',
        status: ProjectStatus.NOT_STARTED,
        progress: 8,
        startDate: daysFromNow(3),
        dueDate: daysFromNow(33),
        teamId: mobileTeam.id,
        picId: marcus.id,
        createdById: marcus.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Security and Compliance Track',
        description: 'Session hardening and audit readiness for production workloads.',
        status: ProjectStatus.ON_HOLD,
        progress: 27,
        startDate: daysFromNow(-9),
        dueDate: daysFromNow(45),
        teamId: coreTeam.id,
        picId: marcus.id,
        createdById: alex.id,
      },
    }),
  ])

  await prisma.task.createMany({
    data: [
      {
        title: 'Add response time dashboard',
        description: 'Expose P95 API latency with daily comparison trends.',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(-2),
        teamId: coreTeam.id,
        projectId: coreProject.id,
        createdById: alex.id,
        assigneeId: david.id,
      },
      {
        title: 'Refactor auth error handling',
        description: 'Normalize 401 and 403 payloads for all auth paths.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(4),
        teamId: coreTeam.id,
        projectId: coreProject.id,
        createdById: marcus.id,
        assigneeId: david.id,
      },
      {
        title: 'Document team task conventions',
        description: 'Define standards for estimates, labels, and review flow.',
        status: TaskStatus.REVIEW,
        priority: TaskPriority.LOW,
        dueDate: daysFromNow(2),
        teamId: productTeam.id,
        projectId: productProject.id,
        createdById: sarah.id,
        assigneeId: linda.id,
      },
      {
        title: 'Prototype kanban filter states',
        description: 'Show filtered lanes by assignee, priority, and status.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(6),
        teamId: productTeam.id,
        projectId: productProject.id,
        createdById: linda.id,
        assigneeId: sarah.id,
      },
      {
        title: 'Prepare mobile regression checklist',
        description: 'Checklist for login, sync, notifications, and offline mode.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(9),
        teamId: mobileTeam.id,
        projectId: mobileProject.id,
        createdById: marcus.id,
        assigneeId: linda.id,
      },
      {
        title: 'Implement CSP headers rollout',
        description: 'Apply CSP in staging and track blocked script reports.',
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        dueDate: daysFromNow(11),
        teamId: coreTeam.id,
        projectId: securityProject.id,
        createdById: alex.id,
        assigneeId: marcus.id,
      },
      {
        title: 'Run access audit for admins',
        description: 'Review elevated permissions and remove stale access.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(8),
        teamId: coreTeam.id,
        projectId: securityProject.id,
        createdById: alex.id,
        assigneeId: sarah.id,
      },
      {
        title: 'Finalize release notes draft',
        description: 'Consolidate completed features and known limitations.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(12),
        teamId: mobileTeam.id,
        projectId: mobileProject.id,
        createdById: marcus.id,
        assigneeId: null,
      },
    ],
  })

  await prisma.event.createMany({
    data: [
      {
        title: 'Weekly Delivery Sync',
        description: 'Cross-team sync for blockers and progress updates.',
        type: EventType.MEETING,
        startDate: daysFromNow(1),
        endDate: daysFromNow(1),
        teamId: coreTeam.id,
        createdById: alex.id,
      },
      {
        title: 'Task Flow Usability Review',
        description: 'Review prototype feedback and next iteration decisions.',
        type: EventType.TRAINING,
        startDate: daysFromNow(4),
        endDate: daysFromNow(4),
        teamId: productTeam.id,
        createdById: linda.id,
      },
      {
        title: 'Mobile Sprint Deadline',
        description: 'Cutoff for QA-ready builds in this sprint.',
        type: EventType.DEADLINE,
        startDate: daysFromNow(14),
        endDate: daysFromNow(14),
        teamId: mobileTeam.id,
        createdById: marcus.id,
      },
      {
        title: 'Internal Security Workshop',
        description: 'Session on secure coding and incident escalation flow.',
        type: EventType.INTERNAL,
        startDate: daysFromNow(7),
        endDate: daysFromNow(7),
        teamId: coreTeam.id,
        createdById: sarah.id,
      },
    ],
  })

  const [ann1, ann2, ann3, ann4] = await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'SSO rollout is now mandatory',
        content: 'All app authentication now flows via Unified Portal. Local auth pages are retired.',
        pinned: true,
        authorId: alex.id,
        teamId: coreTeam.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Task template refresh',
        content: 'Please use new task templates for planning and acceptance criteria.',
        pinned: false,
        authorId: sarah.id,
        teamId: productTeam.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Release branch policy update',
        content: 'Hotfix branch naming and review rules are now documented in team handbook.',
        pinned: false,
        authorId: marcus.id,
        teamId: mobileTeam.id,
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Security checklist before deploy',
        content: 'Run dependency audit and verify CORS/cookie settings before each production release.',
        pinned: true,
        authorId: marcus.id,
        teamId: coreTeam.id,
      },
    }),
  ])

  await prisma.announcementRead.createMany({
    data: [
      { announcementId: ann1.id, userId: marcus.id },
      { announcementId: ann1.id, userId: david.id },
      { announcementId: ann2.id, userId: linda.id },
      { announcementId: ann2.id, userId: david.id },
      { announcementId: ann3.id, userId: sarah.id },
      { announcementId: ann4.id, userId: alex.id },
    ],
  })

  await prisma.chatMessage.createMany({
    data: [
      {
        message: 'SSO migration for Task-Space backend is completed and verified.',
        senderId: alex.id,
        teamId: coreTeam.id,
        createdAt: daysFromNow(-1),
      },
      {
        message: 'Please validate portal redirect from login and index routes.',
        senderId: marcus.id,
        teamId: coreTeam.id,
        createdAt: daysFromNow(-1),
      },
      {
        message: 'I have updated the task board labels to match the new flow.',
        senderId: linda.id,
        teamId: productTeam.id,
        createdAt: daysFromNow(-2),
      },
      {
        message: 'Release checklist draft is ready for review today.',
        senderId: sarah.id,
        teamId: mobileTeam.id,
        createdAt: daysFromNow(-1),
      },
      {
        message: 'I will monitor auth refresh endpoint after deployment.',
        senderId: david.id,
        teamId: coreTeam.id,
        createdAt: daysFromNow(0),
      },
    ],
  })

  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        type: NotificationType.PROJECT_PROGRESS_UPDATED,
        referenceType: 'project',
        message: 'Unified API Stabilization progress updated to 62%.',
      },
      {
        userId: marcus.id,
        type: NotificationType.TASK_ASSIGNED,
        referenceType: 'task',
        message: 'You were assigned: Implement CSP headers rollout.',
      },
      {
        userId: sarah.id,
        type: NotificationType.ANNOUNCEMENT_CREATED,
        referenceType: 'announcement',
        message: 'A new announcement was posted in Product Experience.',
      },
      {
        userId: david.id,
        type: NotificationType.TASK_STATUS_UPDATED,
        referenceType: 'task',
        message: 'Task status changed to In Progress.',
      },
      {
        userId: linda.id,
        type: NotificationType.EVENT_CREATED,
        referenceType: 'event',
        message: 'Task Flow Usability Review event has been scheduled.',
      },
      {
        userId: david.id,
        type: NotificationType.TEAM_INVITE,
        referenceType: 'invite',
        message: 'You received an invite to Mobile Enablement.',
      },
    ],
  })

  console.log('--- Task-Space seeding completed ---')
  console.log('Users seeded (password: password123):')
  console.log('- alex@testmail.com (SYSTEM ADMIN)')
  console.log('- marcus@testmail.com')
  console.log('- sarah@testmail.com')
  console.log('- david@testmail.com')
  console.log('- linda@testmail.com')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
