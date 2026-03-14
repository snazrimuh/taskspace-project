import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { MessageSquare, Megaphone, FolderKanban, CalendarDays, Users, Plus, Send, LayoutDashboard } from "lucide-react";

/**
 * TaskSpace Prototype
 * Theme: Minimalist Liquid Glass
 *
 * Visual style:
 * - Soft gradient background
 * - Glass cards (backdrop blur + transparency)
 * - Subtle borders
 * - Smooth shadows
 */

const menu = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "announcement", label: "Announcements", icon: Megaphone },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "chat", label: "Team Chat", icon: MessageSquare },
  { key: "members", label: "Members", icon: Users },
];

/* ---------------- GLASS CARD WRAPPER ---------------- */

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`
      backdrop-blur-xl
      bg-white/40
      border border-white/30
      shadow-lg
      rounded-2xl
      ${className}
      `}
    >
      {children}
    </div>
  );
}

/* ---------------- SIDEBAR ---------------- */

function Sidebar({ active, setActive, teams, currentTeamId, setCurrentTeamId, goDashboard }) {
  return (
    <div className="w-64 h-screen p-4 hidden md:block">

      <GlassCard className="h-full p-3">

        <button onClick={goDashboard} className="text-left w-full">
          <div className="text-xl font-semibold px-2 py-3">TaskSpace</div>
          <div className="text-xs text-slate-500 px-2 pb-2">Team Collaboration</div>
        </button>

        <div className="px-2 pb-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">My Teams</div>

          <div className="space-y-1">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setCurrentTeamId(t.id);
                  setActive("overview");
                }}
                className={`
                w-full text-left rounded-xl px-3 py-2 text-sm transition
                ${
                  currentTeamId === t.id
                    ? "bg-white/70"
                    : "hover:bg-white/40"
                }
                `}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 border-t border-white/20 pt-3">
          {menu.map((m) => {
            const Icon = m.icon;
            const isActive = active === m.key;

            return (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={`
                w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
                ${isActive ? "bg-white/70" : "hover:bg-white/40"}
                `}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>

      </GlassCard>

    </div>
  );
}

/* ---------------- GLOBAL DASHBOARD ---------------- */

function GlobalDashboard({ teams }) {
  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">

        <GlassCard className="p-4">
          <div className="text-sm text-slate-500">Teams</div>
          <div className="text-2xl font-semibold">{teams.length}</div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-sm text-slate-500">Active Projects</div>
          <div className="text-2xl font-semibold">5</div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-sm text-slate-500">Pending Tasks</div>
          <div className="text-2xl font-semibold">12</div>
        </GlassCard>

      </div>

      <GlassCard className="p-4">

        <h3 className="font-medium mb-3">Your Teams</h3>

        <div className="grid md:grid-cols-2 gap-3">
          {teams.map((t) => (
            <div key={t.id} className="bg-white/50 rounded-xl p-3">
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-slate-500">Team workspace</div>
            </div>
          ))}
        </div>

      </GlassCard>

    </div>
  );
}

/* ---------------- TEAM OVERVIEW ---------------- */

function TeamOverview({ teamName }) {
  return (
    <div className="space-y-6">

      <h2 className="text-xl font-semibold">Overview · {teamName}</h2>

      <div className="grid md:grid-cols-3 gap-4">

        <GlassCard className="p-4">
          <div className="text-sm text-slate-500">Projects</div>
          <div className="text-2xl font-semibold">3</div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-sm text-slate-500">Tasks</div>
          <div className="text-2xl font-semibold">24</div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-sm text-slate-500">Members</div>
          <div className="text-2xl font-semibold">6</div>
        </GlassCard>

      </div>

      <GlassCard className="p-4">
        <h3 className="font-medium mb-2">Recent Announcements</h3>
        <div className="text-sm text-slate-600">Sprint planning tomorrow</div>
        <div className="text-sm text-slate-600">New project assigned</div>
      </GlassCard>

      <GlassCard className="p-4">

        <h3 className="font-medium mb-3">Project Progress</h3>

        <div className="space-y-3">

          <div>
            <div className="text-sm">Website Redesign</div>
            <div className="h-2 bg-white/40 rounded">
              <div className="h-full w-2/3 bg-slate-800 rounded" />
            </div>
          </div>

          <div>
            <div className="text-sm">Mobile App</div>
            <div className="h-2 bg-white/40 rounded">
              <div className="h-full w-1/4 bg-slate-800 rounded" />
            </div>
          </div>

        </div>

      </GlassCard>

    </div>
  );
}

/* ---------------- ANNOUNCEMENTS ---------------- */

function AnnouncementView({ teamName }) {

  const items = [
    { title: "Sprint Planning Tomorrow", tag: "Pinned" },
    { title: "New Project Launch", tag: "Info" },
  ];

  return (
    <div className="space-y-4">

      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Announcements · {teamName}</h2>
        <Button className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> New
        </Button>
      </div>

      {items.map((a, i) => (
        <GlassCard key={i} className="p-4">
          <div className="flex justify-between">
            <div className="font-medium">{a.title}</div>
            <Badge>{a.tag}</Badge>
          </div>
        </GlassCard>
      ))}

    </div>
  );
}

/* ---------------- PROJECTS ---------------- */

function ProjectsView({ teamName, openProject }) {

  const projects = [
    { id: "p1", title: "Website Redesign", progress: 65 },
    { id: "p2", title: "Mobile App", progress: 20 },
  ];

  return (
    <div className="space-y-4">

      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Projects · {teamName}</h2>
        <Button className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      {projects.map((p) => (
        <GlassCard key={p.id} className="p-4 cursor-pointer" onClick={() => openProject(p)}>

          <div className="flex justify-between mb-2">
            <div className="font-medium">{p.title}</div>
            <div className="text-sm">{p.progress}%</div>
          </div>

          <div className="h-2 bg-white/40 rounded">
            <div className="h-full bg-slate-800 rounded" style={{ width: `${p.progress}%` }} />
          </div>

        </GlassCard>
      ))}

    </div>
  );
}

/* ---------------- TASK BOARD ---------------- */

function ProjectBoard({ project, back }) {

  const cols = [
    { name: "Todo", items: ["Setup DB"] },
    { name: "In Progress", items: ["Design UI"] },
    { name: "Review", items: [] },
    { name: "Done", items: ["Project setup"] },
  ];

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">

        <div className="flex gap-3 items-center">
          <Button variant="outline" onClick={back}>Back</Button>
          <h2 className="text-xl font-semibold">{project.title}</h2>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">

        {cols.map((c) => (

          <GlassCard key={c.name} className="p-3">

            <div className="font-medium mb-2 text-sm">{c.name}</div>

            <div className="space-y-2">
              {c.items.map((t, i) => (
                <div key={i} className="bg-white/50 rounded-lg p-2 text-sm">
                  {t}
                </div>
              ))}
            </div>

          </GlassCard>

        ))}

      </div>

    </div>
  );
}

/* ---------------- CALENDAR ---------------- */

function CalendarView({ teamName }) {
  return (
    <div className="space-y-4">

      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Calendar · {teamName}</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Event
        </Button>
      </div>

      <GlassCard className="p-4">
        <Calendar mode="single" />
      </GlassCard>

    </div>
  );
}

/* ---------------- CHAT ---------------- */

function ChatView({ teamName }) {

  const msgs = [
    { name: "Raka", text: "Project update?", me: false },
    { name: "You", text: "Working on UI", me: true },
  ];

  return (
    <div className="space-y-3 h-[calc(100vh-120px)] flex flex-col">

      <h2 className="text-xl font-semibold">Team Chat · {teamName}</h2>

      <GlassCard className="flex-1 flex flex-col p-3">

        <div className="flex-1 overflow-auto space-y-3">

          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>

              <div className={`px-3 py-2 rounded-xl text-sm ${m.me ? "bg-slate-900 text-white" : "bg-white/60"}`}>

                {!m.me && <div className="text-xs text-slate-500">{m.name}</div>}

                {m.text}

              </div>

            </div>
          ))}

        </div>

        <div className="border-t border-white/20 pt-3 flex gap-2 mt-2">
          <Input placeholder="Type message..." className="bg-white/60" />
          <Button>
            <Send className="h-4 w-4" />
          </Button>
        </div>

      </GlassCard>

    </div>
  );
}

/* ---------------- MEMBERS ---------------- */

function MembersView({ teamName }) {

  const members = [
    { name: "Raka", role: "Manager" },
    { name: "Nina", role: "Member" },
  ];

  return (
    <div className="space-y-4">

      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Members · {teamName}</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Invite
        </Button>
      </div>

      <GlassCard className="p-3 space-y-2">

        {members.map((m, i) => (

          <div key={i} className="flex justify-between items-center bg-white/50 rounded-xl p-2">

            <div className="flex items-center gap-2">

              <Avatar className="h-8 w-8">
                <AvatarFallback>{m.name.slice(0,2)}</AvatarFallback>
              </Avatar>

              <span className="text-sm font-medium">{m.name}</span>

            </div>

            <Badge>{m.role}</Badge>

          </div>

        ))}

      </GlassCard>

    </div>
  );
}

/* ---------------- MAIN APP ---------------- */

export default function TaskSpacePrototype() {

  const [page, setPage] = useState("dashboard");
  const [active, setActive] = useState("overview");
  const [selectedProject, setSelectedProject] = useState(null);

  const teams = [
    { id: "t1", name: "Platform Team" },
    { id: "t2", name: "Frontend Team" },
  ];

  const [currentTeamId, setCurrentTeamId] = useState(teams[0].id);
  const currentTeam = teams.find((t) => t.id === currentTeamId);

  const render = () => {

    if (page === "dashboard") {
      return <GlobalDashboard teams={teams} />;
    }

    if (selectedProject) {
      return (
        <ProjectBoard
          project={selectedProject}
          back={() => setSelectedProject(null)}
        />
      );
    }

    switch (active) {

      case "overview":
        return <TeamOverview teamName={currentTeam.name} />;

      case "announcement":
        return <AnnouncementView teamName={currentTeam.name} />;

      case "projects":
        return (
          <ProjectsView
            teamName={currentTeam.name}
            openProject={setSelectedProject}
          />
        );

      case "calendar":
        return <CalendarView teamName={currentTeam.name} />;

      case "chat":
        return <ChatView teamName={currentTeam.name} />;

      case "members":
        return <MembersView teamName={currentTeam.name} />;

      default:
        return null;
    }

  };

  return (

    <div
      className="
      min-h-screen
      text-slate-900
      flex
      bg-gradient-to-br
      from-slate-100
      via-blue-100
      to-indigo-100
      "
    >

      <Sidebar
        active={active}
        setActive={(k) => {
          setPage("team");
          setActive(k);
        }}
        teams={teams}
        currentTeamId={currentTeamId}
        setCurrentTeamId={(id) => {
          setPage("team");
          setCurrentTeamId(id);
        }}
        goDashboard={() => setPage("dashboard")}
      />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">{render()}</div>
      </main>

    </div>
  );
}
