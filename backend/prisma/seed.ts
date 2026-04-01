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
  console.log('--- Task-Space seeding started (Heavy dataset for 15 users) ---')

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

  // 15 Users synced with SSO
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Alex Rivera', email: 'alex@testmail.com', password: passwordHash, avatar: avatar('Alex Rivera'), bio: 'Group IT Director', isSystemAdmin: true } }),
    prisma.user.create({ data: { name: 'Marcus Thorne', email: 'marcus@testmail.com', password: passwordHash, avatar: avatar('Marcus Thorne'), bio: 'Platform Admin' } }),
    prisma.user.create({ data: { name: 'Sarah Jenkins', email: 'sarah@testmail.com', password: passwordHash, avatar: avatar('Sarah Jenkins'), bio: 'Ops Manager' } }),
    prisma.user.create({ data: { name: 'David Chen', email: 'david@testmail.com', password: passwordHash, avatar: avatar('David Chen'), bio: 'Backend Lead' } }),
    prisma.user.create({ data: { name: 'Linda Wu', email: 'linda@testmail.com', password: passwordHash, avatar: avatar('Linda Wu'), bio: 'Product Designer' } }),
    prisma.user.create({ data: { name: 'Elena Rodriguez', email: 'elena@testmail.com', password: passwordHash, avatar: avatar('Elena Rodriguez'), bio: 'QA Automation Lead' } }),
    prisma.user.create({ data: { name: 'Julian Vane', email: 'julian@testmail.com', password: passwordHash, avatar: avatar('Julian Vane'), bio: 'Infrastructure Engineer' } }),
    prisma.user.create({ data: { name: 'Sophia Loren', email: 'sophia@testmail.com', password: passwordHash, avatar: avatar('Sophia Loren'), bio: 'Frontend Dev' } }),
    prisma.user.create({ data: { name: 'Viktor Krum', email: 'viktor@testmail.com', password: passwordHash, avatar: avatar('Viktor Krum'), bio: 'Security Speciality' } }),
    prisma.user.create({ data: { name: 'Nadia Petrova', email: 'nadia@testmail.com', password: passwordHash, avatar: avatar('Nadia Petrova'), bio: 'Systems Analyst' } }),
    prisma.user.create({ data: { name: 'Omar Sy', email: 'omar@testmail.com', password: passwordHash, avatar: avatar('Omar Sy'), bio: 'Architetto Solutions' } }),
    prisma.user.create({ data: { name: 'Xavier Woods', email: 'xavier@testmail.com', password: passwordHash, avatar: avatar('Xavier Woods'), bio: 'SecOps Lead' } }),
    prisma.user.create({ data: { name: 'Yara Grey', email: 'yara@testmail.com', password: passwordHash, avatar: avatar('Yara Grey'), bio: 'Technical Writer' } }),
    prisma.user.create({ data: { name: 'Zane Smith', email: 'zane@testmail.com', password: passwordHash, avatar: avatar('Zane Smith'), bio: 'Customer Engineer' } }),
    prisma.user.create({ data: { name: 'Fiona Gallagher', email: 'fiona@testmail.com', password: passwordHash, avatar: avatar('Fiona Gallagher'), bio: 'Agile Coach' } }),
  ])

  const [alex, marcus, sarah, david, linda, elena, julian, sophia, viktor, nadia, omar, xavier, yara, zane, fiona] = users

  // Teams based on IT Divisions
  const divisions = [
    { name: 'Infrastructure & DevOps', desc: 'Managing servers, cloud, and CI/CD pipelines.', lead: julian },
    { name: 'Software Development', desc: 'Core product engineering and API services.', lead: david },
    { name: 'Cyber Security', desc: 'Threat detection, compliance, and hardening.', lead: xavier },
    { name: 'Data & Analytics', desc: 'Data warehousing, BI, and machine learning.', lead: omar },
    { name: 'QA & Testing', desc: 'Functional, automation, and performance testing.', lead: elena },
    { name: 'Product & UX Design', desc: 'User experience research and interface design.', lead: linda },
    { name: 'IT Support & Operations', desc: 'Internal helpdesk and system maintenance.', lead: sarah },
  ]

  const teams = await Promise.all(divisions.map(d => 
    prisma.team.create({
      data: { name: d.name, description: d.desc, createdById: d.lead.id }
    })
  ))

  const [infraTeam, devTeam, secTeam, dataTeam, qaTeam, designTeam, opsTeam] = teams

  // Team Assignments (Each user in 2-3 teams)
  const membershipData = [
    // Alex (Director) in almost all teams for massive data visibility
    { userId: alex.id, teamId: infraTeam.id, role: TeamRole.MANAGER },
    { userId: alex.id, teamId: secTeam.id, role: TeamRole.MANAGER },
    { userId: alex.id, teamId: dataTeam.id, role: TeamRole.MEMBER },
    { userId: alex.id, teamId: devTeam.id, role: TeamRole.MANAGER },
    { userId: alex.id, teamId: qaTeam.id, role: TeamRole.MEMBER },
    { userId: alex.id, teamId: designTeam.id, role: TeamRole.MEMBER },
    { userId: alex.id, teamId: opsTeam.id, role: TeamRole.MANAGER },

    // Julian (Lead Infra)
    { userId: julian.id, teamId: infraTeam.id, role: TeamRole.MANAGER },
    { userId: julian.id, teamId: secTeam.id, role: TeamRole.MEMBER },
    { userId: julian.id, teamId: devTeam.id, role: TeamRole.MEMBER },

    // David (Lead Dev)
    { userId: david.id, teamId: devTeam.id, role: TeamRole.MANAGER },
    { userId: david.id, teamId: qaTeam.id, role: TeamRole.MEMBER },
    { userId: david.id, teamId: designTeam.id, role: TeamRole.MEMBER },

    // Marcus (Platform Admin)
    { userId: marcus.id, teamId: infraTeam.id, role: TeamRole.MEMBER },
    { userId: marcus.id, teamId: opsTeam.id, role: TeamRole.MANAGER },

    // Sarah (Ops Manager) in massive roles
    { userId: sarah.id, teamId: opsTeam.id, role: TeamRole.MANAGER },
    { userId: sarah.id, teamId: qaTeam.id, role: TeamRole.MEMBER },
    { userId: sarah.id, teamId: devTeam.id, role: TeamRole.MEMBER },
    { userId: sarah.id, teamId: designTeam.id, role: TeamRole.MEMBER },
    { userId: sarah.id, teamId: infraTeam.id, role: TeamRole.MEMBER },
    { userId: sarah.id, teamId: dataTeam.id, role: TeamRole.MEMBER },

    // Elena (QA Lead)
    { userId: elena.id, teamId: qaTeam.id, role: TeamRole.MANAGER },
    { userId: elena.id, teamId: devTeam.id, role: TeamRole.MEMBER },
    { userId: elena.id, teamId: designTeam.id, role: TeamRole.MEMBER },

    // Sophia (Frontend)
    { userId: sophia.id, teamId: devTeam.id, role: TeamRole.MEMBER },
    { userId: sophia.id, teamId: designTeam.id, role: TeamRole.MEMBER },

    // Viktor (Security)
    { userId: viktor.id, teamId: secTeam.id, role: TeamRole.MEMBER },
    { userId: viktor.id, teamId: infraTeam.id, role: TeamRole.MEMBER },

    // Xavier (Sec Lead)
    { userId: xavier.id, teamId: secTeam.id, role: TeamRole.MANAGER },
    { userId: xavier.id, teamId: opsTeam.id, role: TeamRole.MEMBER },

    // Omar (Lead Data)
    { userId: omar.id, teamId: dataTeam.id, role: TeamRole.MANAGER },
    { userId: omar.id, teamId: infraTeam.id, role: TeamRole.MEMBER },

    // Nadia (Analyst)
    { userId: nadia.id, teamId: dataTeam.id, role: TeamRole.MEMBER },
    { userId: nadia.id, teamId: devTeam.id, role: TeamRole.MEMBER },

    // Linda (Design Lead)
    { userId: linda.id, teamId: designTeam.id, role: TeamRole.MANAGER },
    { userId: linda.id, teamId: devTeam.id, role: TeamRole.MEMBER },

    // Yara (Writer)
    { userId: yara.id, teamId: opsTeam.id, role: TeamRole.MEMBER },
    { userId: yara.id, teamId: qaTeam.id, role: TeamRole.MEMBER },

    // Zane (Customer)
    { userId: zane.id, teamId: opsTeam.id, role: TeamRole.MEMBER },
    { userId: zane.id, teamId: dataTeam.id, role: TeamRole.MEMBER },

    // Fiona (Agile)
    { userId: fiona.id, teamId: devTeam.id, role: TeamRole.MEMBER },
    { userId: fiona.id, teamId: qaTeam.id, role: TeamRole.MEMBER },
    { userId: fiona.id, teamId: designTeam.id, role: TeamRole.MEMBER },
  ]

  await prisma.teamMember.createMany({ data: membershipData })

  // Projects per Team (2-3 each)
  const projectsData = [
    // Infra Projects
    { name: 'Kubernetes Migration', teamId: infraTeam.id, picId: julian.id, status: ProjectStatus.IN_PROGRESS, progress: 45 },
    { name: 'Cloud Cost Optimization', teamId: infraTeam.id, picId: marcus.id, status: ProjectStatus.NOT_STARTED, progress: 0 },
    
    // Dev Projects
    { name: 'v2 Core API Engine', teamId: devTeam.id, picId: david.id, status: ProjectStatus.IN_PROGRESS, progress: 78 },
    { name: 'Microservices Refactor', teamId: devTeam.id, picId: sophia.id, status: ProjectStatus.ON_HOLD, progress: 20 },
    { name: 'Internal Tooling SDK', teamId: devTeam.id, picId: fiona.id, status: ProjectStatus.IN_PROGRESS, progress: 35 },

    // Security Projects
    { name: 'Zero Trust Rollout', teamId: secTeam.id, picId: xavier.id, status: ProjectStatus.IN_PROGRESS, progress: 15 },
    { name: 'Compliance Audit 2026', teamId: secTeam.id, picId: viktor.id, status: ProjectStatus.COMPLETED, progress: 100 },

    // Data Projects
    { name: 'Customer Data Lake', teamId: dataTeam.id, picId: omar.id, status: ProjectStatus.IN_PROGRESS, progress: 60 },
    { name: 'Real-time Analytics Dashboard', teamId: dataTeam.id, picId: nadia.id, status: ProjectStatus.NOT_STARTED, progress: 0 },

    // QA Projects
    { name: 'E2E Testing Pipeline', teamId: qaTeam.id, picId: elena.id, status: ProjectStatus.IN_PROGRESS, progress: 90 },
    { name: 'Performance Benchmarking', teamId: qaTeam.id, picId: julian.id, status: ProjectStatus.NOT_STARTED, progress: 0 },

    // Design Projects
    { name: 'Design System Redesign', teamId: designTeam.id, picId: linda.id, status: ProjectStatus.IN_PROGRESS, progress: 55 },
    { name: 'Mobile App Wireframes', teamId: designTeam.id, picId: sophia.id, status: ProjectStatus.IN_PROGRESS, progress: 30 },

    // Ops Projects
    { name: 'Hardware Refresh Plan', teamId: opsTeam.id, picId: sarah.id, status: ProjectStatus.IN_PROGRESS, progress: 80 },
    { name: 'Unified SSO Patching', teamId: opsTeam.id, picId: marcus.id, status: ProjectStatus.COMPLETED, progress: 100 },
    
    // 🔥 Additional Projects for Alex & Sarah 🔥
    { name: 'Global Tech Strategy 2027', teamId: infraTeam.id, picId: alex.id, status: ProjectStatus.NOT_STARTED, progress: 0 },
    { name: 'Cross-functional IT Audit', teamId: secTeam.id, picId: alex.id, status: ProjectStatus.IN_PROGRESS, progress: 40 },
    { name: 'Enterprise API Gateway', teamId: devTeam.id, picId: alex.id, status: ProjectStatus.ON_HOLD, progress: 15 },
    { name: 'System Consolidation Phase 1', teamId: opsTeam.id, picId: sarah.id, status: ProjectStatus.IN_PROGRESS, progress: 25 },
    { name: 'Vendor Contract Renewals', teamId: opsTeam.id, picId: sarah.id, status: ProjectStatus.COMPLETED, progress: 100 },
    { name: 'Staff Training Q4', teamId: qaTeam.id, picId: sarah.id, status: ProjectStatus.IN_PROGRESS, progress: 60 },
  ]

  const projects = await Promise.all(projectsData.map(p => 
    prisma.project.create({
      data: { ...p, description: `High priority task for ${p.name}`, createdById: alex.id, startDate: daysFromNow(-30), dueDate: daysFromNow(60) }
    })
  ))

  // Tasks (Hundreds of tasks, assigned broadly but heavy on Alex & Sarah)
  const taskBatch: any[] = []
  projects.forEach((proj, idx) => {
    // 15-25 tasks per project
    const numTasks = 15 + (idx % 10)
    for (let i = 1; i <= numTasks; i++) {
      let assignee = users[Math.floor(Math.random() * users.length)]
      // Bias assignment 40% Alex, 30% Sarah, 30% Random
      if (Math.random() < 0.4) assignee = alex
      else if (Math.random() < 0.5) assignee = sarah

      taskBatch.push({
        title: `${proj.name} - Action Item ${i}: ${['Implementation', 'Planning', 'Review', 'Testing', 'Documentation', 'Bug Fixing', 'Deployment'][i % 7]}`,
        description: `Detailed sub-task tracking for ${proj.name}. Cross-team sync might be required. Item ${i}.`,
        status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE][Math.floor(Math.random() * 4)],
        priority: [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT][Math.floor(Math.random() * 4)],
        teamId: proj.teamId,
        projectId: proj.id,
        createdById: i % 2 === 0 ? alex.id : sarah.id,
        assigneeId: assignee.id,
        dueDate: daysFromNow((i % 15) - 5) // Spread due dates from past to future
      })
    }
  })

  await prisma.task.createMany({ data: taskBatch })

  // Events, Announcements, etc.
  const eventsBatch: any[] = []
  const announcementsBatch: any[] = []

  teams.forEach(t => {
    // 4 Events per team
    eventsBatch.push({ title: `${t.name} Weekly Sync`, description: `Coordination meeting.`, type: EventType.MEETING, startDate: daysFromNow(2), teamId: t.id, createdById: alex.id })
    eventsBatch.push({ title: `${t.name} Retrospective`, description: `Monthly retro.`, type: EventType.INTERNAL, startDate: daysFromNow(-2), teamId: t.id, createdById: sarah.id })
    eventsBatch.push({ title: `${t.name} Training Q3`, description: `Upskilling session.`, type: EventType.TRAINING, startDate: daysFromNow(10), teamId: t.id, createdById: sarah.id })
    eventsBatch.push({ title: `${t.name} Milestone Deadline`, description: `Final submission.`, type: EventType.DEADLINE, startDate: daysFromNow(15), teamId: t.id, createdById: alex.id })

    // 3 Announcements per team
    announcementsBatch.push({ title: `Quarterly Goals for ${t.name}`, content: `Please review the updated roadmap in the shared drive.`, authorId: alex.id, teamId: t.id, pinned: true })
    announcementsBatch.push({ title: `Welcome New Members!`, content: `Glad to have more people joining the ${t.name} division.`, authorId: sarah.id, teamId: t.id, pinned: false })
    announcementsBatch.push({ title: `Urgent: Security Patch`, content: `Ensure all your systems are updated by EOD.`, authorId: alex.id, teamId: t.id, pinned: false })
  })
  await prisma.event.createMany({ data: eventsBatch })
  await prisma.announcement.createMany({ data: announcementsBatch })

  // ── Notifications ─────────────────────────────────────────────────────────
  const notifications: any[] = []
  const notificationTypes = [
    NotificationType.TASK_ASSIGNED, NotificationType.PROJECT_CREATED, 
    NotificationType.ANNOUNCEMENT_CREATED, NotificationType.EVENT_CREATED,
    NotificationType.TASK_STATUS_UPDATED, NotificationType.TEAM_INVITE
  ]

  // Add 40+ notifications for Alex
  for (let i = 0; i < 45; i++) {
    notifications.push({
      userId: alex.id,
      type: notificationTypes[i % notificationTypes.length],
      message: `System notification ${i} regarding your recent activity.`,
      isRead: i < 15,
      createdAt: new Date(Date.now() - i * 86400000)
    })
  }

  // Add 40+ notifications for Sarah
  for (let i = 0; i < 45; i++) {
    notifications.push({
      userId: sarah.id,
      type: notificationTypes[i % notificationTypes.length],
      message: `Ops notification ${i}: Action required on pending operational task.`,
      isRead: i < 10,
      createdAt: new Date(Date.now() - i * 43200000)
    })
  }

  await prisma.notification.createMany({ data: notifications })

  // ── Chat Messages ──────────────────────────────────────────────────────
  const chatMessages: any[] = []
  const chatContexts = [
    "Anyone seen the latest PR?",
    "Reviewing the logs now, looks stable.",
    "Meeting starts in 10 minutes, room 402.",
    "Can someone help with the Kubernetes logs?",
    "Great work everyone on the v2 sprint release!",
    "Happy Friday team! 🚀",
    "Does anyone have the link to the design system Figma?",
    "Cloud deployment successful! 🍾",
    "Need feedback on the new API endpoints documentation.",
    "Updating the technical docs for the next audit.",
    "Just pushed a hotfix for the auth issue.",
    "Welcome to the team! Glad to have you here.",
    "Let's sync up after lunch regarding the cost optimization."
  ]

  for (const team of teams) {
    // Get members of this team from local data
    const teamMembers = membershipData.filter(m => m.teamId === team.id)
    if (teamMembers.length > 0) {
      // 30-45 messages per team (Heavy dataset)
      const numMsgs = 30 + (Math.floor(Math.random() * 15))
      for (let i = 0; i < numMsgs; i++) {
        let randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)]
        
        // Force Alex and Sarah to talk a lot if they are in the team
        const alexInTeam = teamMembers.find(m => m.userId === alex.id)
        const sarahInTeam = teamMembers.find(m => m.userId === sarah.id)
        
        if (Math.random() < 0.3 && alexInTeam) randomMember = alexInTeam
        else if (Math.random() < 0.3 && sarahInTeam) randomMember = sarahInTeam

        chatMessages.push({
          message: chatContexts[Math.floor(Math.random() * chatContexts.length)],
          senderId: randomMember.userId,
          teamId: team.id,
          createdAt: new Date(Date.now() - (numMsgs - i) * 3600000) // Spread out over several hours
        })
      }
    }
  }

  await prisma.chatMessage.createMany({ data: chatMessages })

  console.log('--- Task-Space seeding completed successfully ---')
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
