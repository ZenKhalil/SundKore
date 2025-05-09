// src/features/morgenrutine/data.ts

import type {
  RoutineStep,
  Alert,
  SystemStatusItem,
  Task,
  StatusSummary,
} from "./types";

// ------------------------------------
// Morning-routine steps data
// ------------------------------------
export const routineSteps: RoutineStep[] = [
  {
    id: "step-1",
    name: "Log ind",
    description: "Log ind i brugerstyringssystemet",
    completed: false,
    time: "08:00",
    duration: 2,
    guidance:
      "Gå til brugerstyringssystemet og log ind med dit personlige login.",
    links: [
      { title: "Brugerstyringssystem", url: "#" },
      { title: "Dokumentation", url: "#" },
    ],
    automatable: true,
  },
  {
    id: "step-2",
    name: "Email tjek",
    description: "Kontroller for kritiske emails fra natten",
    completed: false,
    time: "08:02",
    duration: 5,
    guidance:
      "Tjek indbakke for automatiske advarselsmeddelelser fra overvågningssystemer.",
    links: [
      { title: "Email system", url: "#" },
      { title: "Support kontakter", url: "#" },
    ],
    automatable: true,
  },
  {
    id: "step-3",
    name: "Systemstatus",
    description: "Verificer alle systemstatusser",
    completed: false,
    time: "08:07",
    duration: 8,
    guidance:
      "Gennemgå alle systemstatusser i overvågningssystemet. Kontroller at alle systemer er markeret 'online'.",
    links: [
      { title: "Systemovervågning", url: "#" },
      { title: "Fejlsøgningsguide", url: "#" },
    ],
    automatable: true,
  },
  {
    id: "step-4",
    name: "Database tjek",
    description: "Kontroller database tilgængelighed",
    completed: false,
    time: "08:15",
    duration: 5,
    guidance:
      "Verificer at alle primære og sekundære databaser er online og synkroniserede.",
    links: [
      { title: "Database dashboard", url: "#" },
      { title: "DB fejlfinding", url: "#" },
    ],
    automatable: true,
  },
  {
    id: "step-5",
    name: "Backup validering",
    description: "Bekræft at natlige backups kørte succesfuldt",
    completed: false,
    time: "08:20",
    duration: 4,
    guidance:
      "Tjek backup-logs for at sikre at alle natlige backups er blevet gennemført korrekt.",
    links: [
      { title: "Backup oversigt", url: "#" },
      { title: "Backup procedurer", url: "#" },
    ],
    automatable: true,
  },
  {
    id: "step-6",
    name: "Batch jobs",
    description: "Verificer at natlige batch jobs er gennemført",
    completed: false,
    time: "08:24",
    duration: 6,
    guidance:
      "Kontroller alle natlige batch jobs i job scheduler systemet. Tjek for fejl eller timeouts.",
    links: [
      { title: "Job scheduler", url: "#" },
      { title: "Batch job oversigt", url: "#" },
    ],
    automatable: true,
  },
  {
    id: "step-7",
    name: "Log gennemgang",
    description: "Gennemgå logfiler for fejl",
    completed: false,
    time: "08:30",
    duration: 10,
    guidance:
      "Gennemgå systemlogfiler for kritiske fejl. Fokuser særligt på sikkerhedsrelaterede hændelser.",
    links: [
      { title: "Log viewer", url: "#" },
      { title: "Fejlkoder", url: "#" },
    ],
    automatable: false,
  },
  {
    id: "step-8",
    name: "Opsummering",
    description: "Forbered morgenrapport",
    completed: false,
    time: "08:40",
    duration: 5,
    guidance:
      "Opret en kortfattet rapport med status for alle systemer og eventuelle problemer der kræver opmærksomhed.",
    links: [
      { title: "Rapportskabelon", url: "#" },
      { title: "Tidligere rapporter", url: "#" },
    ],
    automatable: false,
  },
];

// ------------------------------------
// Daily success-rate history
// ------------------------------------
export const dailySuccessRates = [
  { day: "Man", successRate: 95 },
  { day: "Tir", successRate: 98 },
  { day: "Ons", successRate: 100 },
  { day: "Tor", successRate: 90 },
  { day: "Fre", successRate: 97 },
  { day: "Lør", successRate: 100 },
  { day: "Søn", successRate: 99 },
];

// ------------------------------------
// System uptime data
// ------------------------------------
export const systemStatus: SystemStatusItem[] = [
  {
    name: "Brugerstyring",
    status: "active",
    lastChecked: "08:02",
    responseTime: 0.3,
    uptime: 99.8,
    details: "Alle tjenester kører normalt",
    url: "#",
  },
  {
    name: "Primær database",
    status: "active",
    lastChecked: "08:15",
    responseTime: 0.8,
    uptime: 99.9,
    details: "Ingen aktive alarmer",
    url: "#",
  },
  {
    name: "Backup server",
    status: "warning",
    lastChecked: "08:20",
    responseTime: 1.7,
    uptime: 97.2,
    details: "Høj disk anvendelse (92%)",
    url: "#",
  },
  {
    name: "Web API",
    status: "active",
    lastChecked: "08:10",
    responseTime: 0.5,
    uptime: 99.5,
    details: "Alle endpoints responderer",
    url: "#",
  },
  {
    name: "Overvågningssystem",
    status: "active",
    lastChecked: "08:05",
    responseTime: 0.4,
    uptime: 99.7,
    details: "System fungerer normalt",
    url: "#",
  },
  {
    name: "Batch server",
    status: "error",
    lastChecked: "08:25",
    responseTime: 0,
    uptime: 94.3,
    details: "Intet svar fra server, restart påkrævet",
    url: "#",
  },
];

// ------------------------------------
// Alerts from overnight
// ------------------------------------
export const overnightAlerts: Alert[] = [
  {
    id: "alert-1",
    time: "02:36",
    system: "Batch server",
    level: "error",
    message: "Fejl i nightly-process 'dataindeks' - timeout efter 30 min",
    details:
      "Job ID: NIGHTLY-342, fejlkode: ERR-2451. Processen har muligvis hængt sig og kræver en genstart.",
    resolved: false,
  },
  {
    id: "alert-2",
    time: "03:42",
    system: "Backup server",
    level: "warning",
    message:
      "Backup fuldført, men tog længere tid end normalt (42 min vs. normalt 28 min)",
    details:
      "Årsag til forsinkelse: Højere datamængde end normalt i hovedtabellerne. Disk plads bør overvåges.",
    resolved: true,
  },
  {
    id: "alert-3",
    time: "04:52",
    system: "Web API",
    level: "warning",
    message: "Høj CPU belastning (82%) i 15 minutter - undersøg mulige årsager",
    details:
      "Servernavn: API-PROD-3, Observerede processer: api_worker.exe (65% CPU), db_connector.exe (15% CPU)",
    resolved: false,
  },
  {
    id: "alert-4",
    time: "01:15",
    system: "Primær database",
    level: "info",
    message: "Planlagt vedligehold gennemført succesfuldt",
    details:
      "Index rebuilding og statistikopdatering gennemført på alle kernetabeller. Varighed: 52 minutter.",
    resolved: true,
  },
];

// ------------------------------------
// Tasks for today
// ------------------------------------
export const tasksForToday: Task[] = [
  {
    id: "task-1",
    title: "Undersøg batch server fejl",
    priority: "high",
    assignee: "Mig",
    estimation: "1 time",
    details: "Server skal genstartes og dataindeks jobbet skal køres manuelt.",
  },
  {
    id: "task-2",
    title: "Optimér backup proces",
    priority: "medium",
    assignee: "Mig",
    estimation: "2 timer",
    details:
      "Analysér backup data og identificer muligheder for at reducere kørselstid.",
  },
  {
    id: "task-3",
    title: "Dagligt møde",
    priority: "medium",
    assignee: "Team",
    estimation: "30 min",
    details:
      "Kort standup møde med driftsteamet for at gennemgå dagens prioriteter.",
  },
  {
    id: "task-4",
    title: "Opdatér systemdokumentation",
    priority: "low",
    assignee: "Mig",
    estimation: "1 time",
    details: "Dokumentér de seneste ændringer i servermiljøet.",
  },
];

// ------------------------------------
// Completion time history
// ------------------------------------
export const completionHistory = [
  // Last 14 days
  { date: "2025-04-25", time: 42 },
  { date: "2025-04-26", time: 39 },
  { date: "2025-04-27", time: 45 },
  { date: "2025-04-28", time: 38 },
  { date: "2025-04-29", time: 41 },
  { date: "2025-04-30", time: 40 },
  { date: "2025-05-01", time: 43 },
  { date: "2025-05-02", time: 39 },
  { date: "2025-05-03", time: 44 },
  { date: "2025-05-04", time: 37 },
  { date: "2025-05-05", time: 42 },
  { date: "2025-05-06", time: 40 },
  { date: "2025-05-07", time: 43 },
  { date: "2025-05-08", time: 41 },

  // Previous 16 days (to have 30 days total)
  { date: "2025-04-09", time: 44 },
  { date: "2025-04-10", time: 47 },
  { date: "2025-04-11", time: 43 },
  { date: "2025-04-12", time: 39 },
  { date: "2025-04-13", time: 41 },
  { date: "2025-04-14", time: 45 },
  { date: "2025-04-15", time: 42 },
  { date: "2025-04-16", time: 40 },
  { date: "2025-04-17", time: 38 },
  { date: "2025-04-18", time: 41 },
  { date: "2025-04-19", time: 43 },
  { date: "2025-04-20", time: 40 },
  { date: "2025-04-21", time: 39 },
  { date: "2025-04-22", time: 44 },
  { date: "2025-04-23", time: 46 },
  { date: "2025-04-24", time: 43 },

  // Previous 2 months (just showing 1 per week for brevity)
  { date: "2025-03-03", time: 48 },
  { date: "2025-03-10", time: 46 },
  { date: "2025-03-17", time: 44 },
  { date: "2025-03-24", time: 45 },
  { date: "2025-03-31", time: 43 },
  { date: "2025-02-03", time: 52 },
  { date: "2025-02-10", time: 50 },
  { date: "2025-02-17", time: 47 },
  { date: "2025-02-24", time: 46 },

  // Previous 6 months (just showing 2 per month for brevity)
  { date: "2025-01-06", time: 55 },
  { date: "2025-01-20", time: 53 },
  { date: "2024-12-02", time: 59 },
  { date: "2024-12-16", time: 56 },
  { date: "2024-11-04", time: 60 },
  { date: "2024-11-18", time: 58 },

  // Much older data (for 1Y view)
  { date: "2024-10-15", time: 62 },
  { date: "2024-09-15", time: 65 },
  { date: "2024-08-15", time: 68 },
  { date: "2024-07-15", time: 64 },
  { date: "2024-06-15", time: 59 },
  { date: "2024-05-15", time: 57 },
];

// ------------------------------------
// Status summary
// ------------------------------------
export const statusSummary: StatusSummary = {
  totalSystems: 28,
  systemsUp: 26,
  systemsWarning: 1,
  systemsDown: 1,
  criticalIssues: 1,
  backupStatus: "Delvis",
  batchStatus: "Fejlet",
  averageResponseTime: 0.62,
};
