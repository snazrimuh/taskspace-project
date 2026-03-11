import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { MessageSquare, Megaphone, CheckSquare, CalendarDays, Users, Plus, Send } from "lucide-react";

const menu = [
  { key: "announcement", label: "Announcement", icon: Megaphone },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "chat", label: "Team Chat", icon: MessageSquare },
  { key: "members", label: "Members", icon: Users },
];

function Sidebar({ active, setActive, teams, currentTeamId, setCurrentTeamId }) {
  return (
    <div className="w-64 border-r bg-white h-screen p-3 hidden md:block">
      <div className="text-xl font-semibold px-2 py-3">UnitFlow</div>
      <div className="text-xs text-slate-500 px-2 pb-2">Team Collaboration</div>

      <div className="px-2 pb-3">
        <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">My Teams</div>
        <div className="space-y-1">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTeamId(t.id)}
              className={`w-full text-left rounded-xl px-2 py-1.5 text-sm transition ${
                currentTeamId === t.id ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1 border-t pt-3">
        {menu.map((m) => {
          const Icon = m.icon;
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setActive(m.key)}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AnnouncementView({ teamName }) {
  const items = [
    { title: "Weekly sync moved to 10:00", tag: "Pinned", by: "Raka", time: "2h ago" },
    { title: "Deployment window Friday night", tag: "Info", by: "Nina", time: "1d ago" },
    { title: "New onboarding checklist", tag: "Update", by: "Admin", time: "3d ago" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Announcements · {teamName}</h2>
        <Button className="rounded-2xl"><Plus className="h-4 w-4 mr-2"/>New</Button>
      </div>
      <div className="grid gap-3">
        {items.map((a, i) => (
          <Card key={i} className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{a.title}</CardTitle>
                <Badge variant="secondary" className="rounded-xl">{a.tag}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 flex items-center justify-between">
              <span>by {a.by}</span>
              <span>{a.time}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TasksView({ teamName }) {
  const cols = [
    { name: "Todo", items: ["Setup auth guard", "Design chat schema"] },
    { name: "In Progress", items: ["Team invitation flow"] },
    { name: "Review", items: ["Announcement UI"] },
    { name: "Done", items: ["Project scaffold"] },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tasks · {teamName}</h2>
        <Button className="rounded-2xl"><Plus className="h-4 w-4 mr-2"/>New Task</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {cols.map((c) => (
          <Card key={c.name} className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">{c.name}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {c.items.map((t, i) => (
                <div key={i} className="rounded-xl border p-2 text-sm bg-white">{t}</div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CalendarView({ teamName }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Team Calendar · {teamName}</h2>
        <Button className="rounded-2xl"><Plus className="h-4 w-4 mr-2"/>Add Event</Button>
      </div>
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <Calendar mode="single" className="rounded-xl" />
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle className="text-base">Upcoming</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <div className="flex justify-between"><span>Weekly Sync</span><span>Mon 10:00</span></div>
          <div className="flex justify-between"><span>Sprint Review</span><span>Fri 15:00</span></div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChatView({ teamName }) {
  const msgs = [
    { name: "Raka", text: "Morning team, please update task status.", me: false },
    { name: "You", text: "Auth module done, pushing soon.", me: true },
    { name: "Nina", text: "Nice, I'll review after lunch.", me: false },
  ];
  return (
    <div className="space-y-3 h-[calc(100vh-120px)] flex flex-col">
      <h2 className="text-xl font-semibold">Team Chat · {teamName}</h2>
      <Card className="rounded-2xl shadow-sm flex-1 flex flex-col">
        <CardContent className="p-3 flex-1 overflow-auto space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${m.me ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}`}>
                {!m.me && <div className="text-xs text-slate-500 mb-1">{m.name}</div>}
                {m.text}
              </div>
            </div>
          ))}
        </CardContent>
        <div className="p-3 border-t flex gap-2">
          <Input placeholder="Type a message..." className="rounded-2xl" />
          <Button className="rounded-2xl"><Send className="h-4 w-4"/></Button>
        </div>
      </Card>
    </div>
  );
}

function MembersView({ teamName }) {
  const members = [
    { name: "Raka", role: "Admin" },
    { name: "Nina", role: "Member" },
    { name: "Budi", role: "Member" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Team Members · {teamName}</h2>
        <Button className="rounded-2xl"><Plus className="h-4 w-4 mr-2"/>Invite</Button>
      </div>
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-3 space-y-2">
          {members.map((m, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8"><AvatarFallback>{m.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="text-sm font-medium">{m.name}</div>
              </div>
              <Badge className="rounded-xl" variant={m.role === "Admin" ? "default" : "secondary"}>{m.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnitFlowPrototype() {
  const [active, setActive] = useState("announcement");
  const teams = [
    { id: "t1", name: "Platform Team", role: "Admin" },
    { id: "t2", name: "Ops Team", role: "Member" },
    { id: "t3", name: "Frontend Guild", role: "Admin" },
    { id: "t4", name: "QA Squad", role: "Member" },
  ];
  const [currentTeamId, setCurrentTeamId] = useState(teams[0].id);
  const currentTeam = teams.find((t) => t.id === currentTeamId) || teams[0];

  const render = () => {
    switch (active) {
      case "announcement": return <AnnouncementView teamName={currentTeam.name} />;
      case "tasks": return <TasksView teamName={currentTeam.name} />;
      case "calendar": return <CalendarView teamName={currentTeam.name} />;
      case "chat": return <ChatView teamName={currentTeam.name} />;
      case "members": return <MembersView teamName={currentTeam.name} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar active={active} setActive={setActive} teams={teams} currentTeamId={currentTeamId} setCurrentTeamId={setCurrentTeamId} />
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">{render()}</div>
      </main>
    </div>
  );
}
