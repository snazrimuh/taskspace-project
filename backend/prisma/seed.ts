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
    // Alex (Director) in all high-level teams
    { userId: alex.id, teamId: infraTeam.id, role: TeamRole.MANAGER },
    { userId: alex.id, teamId: secTeam.id, role: TeamRole.MANAGER },
    { userId: alex.id, teamId: dataTeam.id, role: TeamRole.MEMBER },

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

    // Sarah (Ops Manager)
    { userId: sarah.id, teamId: opsTeam.id, role: TeamRole.MANAGER },
    { userId: sarah.id, teamId: qaTeam.id, role: TeamRole.MEMBER },
    { userId: sarah.id, teamId: devTeam.id, role: TeamRole.MEMBER },

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
  ]

  const projects = await Promise.all(projectsData.map(p => 
    prisma.project.create({
      data: { ...p, description: `High priority task for ${p.name}`, createdById: alex.id, startDate: daysFromNow(-30), dueDate: daysFromNow(60) }
    })
  ))

  // Tasks (Dozens of tasks, assigned broadly)
  const taskBatch: any[] = []
  projects.forEach((proj, idx) => {
    // 5-8 tasks per project
    const numTasks = 5 + (idx % 4)
    for (let i = 1; i <= numTasks; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      taskBatch.push({
        title: `${proj.name} Phase ${i}: ${['Implementation', 'Planning', 'Review', 'Testing', 'Documentation'][i % 5]}`,
        description: `Detailed sub-task tracking for ${proj.name}. Requires cross-team sync.`,
        status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE][(i + idx) % 4],
        priority: [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT][i % 4],
        teamId: proj.teamId,
        projectId: proj.id,
        createdById: alex.id,
        assigneeId: randomUser.id,
        dueDate: daysFromNow(10 + i * 2)
      })
    }
  })

  await prisma.task.createMany({ data: taskBatch })

  // Events, Announcements, etc.
  await prisma.event.createMany({
    data: teams.map(t => ({
      title: `${t.name} Weekly Sync`,
      description: `Coordination meeting for ${t.name} division projects.`,
      type: EventType.MEETING,
      startDate: daysFromNow(2),
      teamId: t.id,
      createdById: alex.id
    }))
  })

  await prisma.announcement.createMany({
    data: teams.map(t => ({
      title: `Quarterly Goals for ${t.name}`,
      content: `Please review the updated roadmap for the ${t.name} division in the shared drive.`,
      authorId: alex.id,
      teamId: t.id
    }))
  })

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
      // 8-12 messages per team
      const numMsgs = 8 + (Math.floor(Math.random() * 5))
      for (let i = 0; i < numMsgs; i++) {
        const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)]
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
