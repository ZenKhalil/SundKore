// src/features/morgenrutine/mockData.ts
import {
  Layers,
  Database,
  Server,
  ExternalLink,
  Users,
  FileText,
  Mail,
  Bell,
  Globe,
} from "lucide-react";

import type { CompletedRoutine } from "./types";

// Data types
export interface System {
  id: string;
  name: string;
  type: "database" | "api" | "webservice";
  status: "active" | "warning" | "error";
  lastChecked: string;
  responseTime: number;
  uptime: number;
  issues: Issue[];
}

export interface Issue {
  id: string;
  priority: 1 | 2 | 3 | 4;
  description: string;
  discovered: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: any;
}

export interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  timestamp: string;
  system: string;
  status: "success" | "warning" | "error";
  message: string;
}

// System statistics
export const systemStatusStats = {
  total: 143,
  active: 135,
  partiallyActive: 6,
  inactive: 2,
  databasesChecked: 12,
  apisChecked: 43,
  webservicesChecked: 88,
  problemsLastWeek: 8,
  avgResponseTime: 0.94, // seconds
  uptime: 99.7, // percentage
};

// Data categories for filtering
export const systemCategories: Category[] = [
  { id: "all", name: "Alle systemer", color: "#6366F1", icon: Layers },
  { id: "database", name: "Databaser", color: "#10B981", icon: Database },
  { id: "api", name: "API'er", color: "#F59E0B", icon: Server },
  {
    id: "webservice",
    name: "Webservices",
    color: "#F97066",
    icon: ExternalLink,
  },
];

// Priority levels for issues
export const priorityLevels = [
  {
    id: 1,
    name: "Haster",
    color: "#F97066",
    description: "Kritiske fejl der blokerer systemet",
  },
  {
    id: 2,
    name: "Høj",
    color: "#F59E0B",
    description: "Væsentlige problemer der påvirker funktionalitet",
  },
  {
    id: 3,
    name: "Normal",
    color: "#6366F1",
    description: "Almindelige henvendelser og mindre fejl",
  },
  {
    id: 4,
    name: "Lav",
    color: "#10B981",
    description: "Kosmetiske problemer uden funktionel påvirkning",
  },
];

// Weekly activity data - status checks
export const weeklyActivityData = [
  { day: "Man", successful: 143, warnings: 3, errors: 1 },
  { day: "Tir", successful: 138, warnings: 5, errors: 2 },
  { day: "Ons", successful: 141, warnings: 2, errors: 0 },
  { day: "Tor", successful: 139, warnings: 4, errors: 3 },
  { day: "Fre", successful: 142, warnings: 1, errors: 0 },
  { day: "Lør", successful: 143, warnings: 0, errors: 0 },
  { day: "Søn", successful: 142, warnings: 1, errors: 0 },
];

// Response time trends
export const responseTimeTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  responseTime: 0.8 + Math.sin(i / 5) * 0.3 + Math.random() * 0.1,
  avgLine: 0.95,
}));

// Mock systems
export const mockSystems: System[] = Array.from({ length: 15 }, (_, i) => ({
  id: `sys-${i + 1}`,
  name: `System ${i + 1}`,
  type: i % 3 === 0 ? "database" : i % 3 === 1 ? "api" : "webservice",
  status: i < 12 ? "active" : i < 14 ? "warning" : "error",
  lastChecked: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Last 24 hours
  responseTime: 0.5 + Math.random() * 1.2,
  uptime: 98 + Math.random() * 2,
  issues:
    i < 10
      ? []
      : [
          {
            id: `issue-${i}`,
            priority: ((i % 4) + 1) as 1 | 2 | 3 | 4,
            description: `Problem med ${
              i % 3 === 0
                ? "databaseforbindelse"
                : i % 3 === 1
                ? "API integration"
                : "webservice svar"
            }`,
            discovered: new Date(
              Date.now() - Math.random() * 604800000
            ).toISOString(), // Last week
          },
        ],
}));

// Donut chart data
export const statusDistribution = [
  { name: "Aktive", value: 0.95, color: "#10B981" },
  { name: "Delvist aktive", value: 0.04, color: "#F59E0B" },
  { name: "Inaktive", value: 0.01, color: "#F97066" },
];

// Recent activities log
export const recentActivities: Activity[] = [
  {
    id: "act-1",
    timestamp: "08:03",
    system: "Database Server 1",
    status: "success",
    message: "Rutinekontrol gennemført uden problemer",
  },
  {
    id: "act-2",
    timestamp: "08:05",
    system: "API Gateway",
    status: "warning",
    message: "Langsom responstid detekteret (1.8s)",
  },
  {
    id: "act-3",
    timestamp: "08:07",
    system: "Webservice /datasets",
    status: "success",
    message: "Alle endpoints svarer korrekt",
  },
  {
    id: "act-4",
    timestamp: "08:12",
    system: "GIS Database",
    status: "error",
    message: "Forbindelsesfejl - forsøger igen om 5 min.",
  },
  {
    id: "act-5",
    timestamp: "08:15",
    system: "GIS Database",
    status: "success",
    message: "Forbindelse genoprettet",
  },
  {
    id: "act-6",
    timestamp: "08:17",
    system: "Login Service",
    status: "success",
    message: "Normal svartid og tilgængelighed",
  },
  {
    id: "act-7",
    timestamp: "08:20",
    system: "Backup Service",
    status: "success",
    message: "Natlig backup valideret og tilgængelig",
  },
  {
    id: "act-8",
    timestamp: "08:22",
    system: "Metrics API",
    status: "warning",
    message: "Høj CPU belastning - overvåges",
  },
];

// Daily checklist for morning routine
export const morningChecklist: ChecklistItem[] = [
  {
    id: "check-1",
    name: "Brugerstyring",
    description: "Åben brugerstyring og log ind",
    completed: true,
  },
  {
    id: "check-2",
    name: "Fagsystemer",
    description: "Tjek at alle fagsystemer er online",
    completed: true,
  },
  {
    id: "check-3",
    name: "Database status",
    description: "Kontroller database tilgængelighed",
    completed: true,
  },
  {
    id: "check-4",
    name: "API Gateway",
    description: "Verificer at API Gateway er responsiv",
    completed: true,
  },
  {
    id: "check-5",
    name: "Webservices",
    description: "Test kritiske webservices",
    completed: false,
  },
  {
    id: "check-6",
    name: "GIS-tjenester",
    description: "Kontroller at GIS-tjenester er tilgængelige",
    completed: false,
  },
  {
    id: "check-7",
    name: "Backup status",
    description: "Bekræft at natlige backups er gennemført",
    completed: true,
  },
  {
    id: "check-8",
    name: "Batch jobs",
    description: "Verificer at natlige batch jobs er kørt",
    completed: false,
  },
];

// Mock completed routines for the history view
export const mockCompletedRoutines: CompletedRoutine[] = [
  // Yesterday's routine (all steps completed)
  {
    id: "routine-1683724800000",
    date: "2025-05-08",
    startTime: "08:00",
    endTime: "08:42",
    completionTime: 42,
    steps: [
      {
        id: "step-1",
        name: "Log ind",
        completed: true,
        notes: "Systemet var hurtigere end normalt i dag.",
      },
      {
        id: "step-2",
        name: "Email tjek",
        completed: true,
        notes: "Ingen kritiske emails modtaget i nat.",
      },
      {
        id: "step-3",
        name: "Systemstatus",
        completed: true,
        notes: "Alle systemer kører normalt.",
      },
      {
        id: "step-4",
        name: "Database tjek",
        completed: true,
        notes:
          "Primær og sekundær database er synkroniserede og svarer hurtigt.",
      },
      {
        id: "step-5",
        name: "Backup validering",
        completed: true,
        notes:
          "Alle backups gennemført uden fejl. Verificeret at filerne kan tilgås.",
      },
      {
        id: "step-6",
        name: "Batch jobs",
        completed: true,
        notes: "Alle natlige jobs kørte som planlagt.",
      },
      {
        id: "step-7",
        name: "Log gennemgang",
        completed: true,
        notes: "Ingen kritiske fejl i logfilerne.",
      },
      {
        id: "step-8",
        name: "Opsummering",
        completed: true,
        notes: "Alt er i orden i dag. Rapport sendt til teamet.",
      },
    ],
  },
  // 2 days ago (some issues)
  {
    id: "routine-1683638400000",
    date: "2025-05-07",
    startTime: "08:05",
    endTime: "09:02",
    completionTime: 57,
    steps: [
      {
        id: "step-1",
        name: "Log ind",
        completed: true,
        notes: "",
      },
      {
        id: "step-2",
        name: "Email tjek",
        completed: true,
        notes: "To advarselsemails fra overvågningssystemet - har tjekket dem.",
      },
      {
        id: "step-3",
        name: "Systemstatus",
        completed: true,
        notes: "API Gateway viser advarsel om høj belastning.",
      },
      {
        id: "step-4",
        name: "Database tjek",
        completed: true,
        notes: "",
      },
      {
        id: "step-5",
        name: "Backup validering",
        completed: true,
        notes:
          "Backup tog længere tid end normalt - undersøgte årsagen: større datamængde end forventet.",
      },
      {
        id: "step-6",
        name: "Batch jobs",
        completed: false,
        notes:
          "Et job fejlede: dataindeksering. Genstartet manuelt og overvåger status.",
      },
      {
        id: "step-7",
        name: "Log gennemgang",
        completed: true,
        notes:
          "Fandt fejlmeddelelser relateret til batch job fejlen. Noteret i ticket #4532.",
      },
      {
        id: "step-8",
        name: "Opsummering",
        completed: true,
        notes:
          "Rapporteret om batch job fejl til udviklingsteamet. Opdaterer ticket når problemet er løst.",
      },
    ],
  },
  // 3 days ago
  {
    id: "routine-1683552000000",
    date: "2025-05-06",
    startTime: "07:58",
    endTime: "08:41",
    completionTime: 43,
    steps: [
      {
        id: "step-1",
        name: "Log ind",
        completed: true,
        notes: "",
      },
      {
        id: "step-2",
        name: "Email tjek",
        completed: true,
        notes: "",
      },
      {
        id: "step-3",
        name: "Systemstatus",
        completed: true,
        notes: "Alt ser normalt ud.",
      },
      {
        id: "step-4",
        name: "Database tjek",
        completed: true,
        notes:
          "Primær database kører perfekt. Sekundær database er lidt langsom, men indenfor acceptable grænser.",
      },
      {
        id: "step-5",
        name: "Backup validering",
        completed: true,
        notes: "",
      },
      {
        id: "step-6",
        name: "Batch jobs",
        completed: true,
        notes: "",
      },
      {
        id: "step-7",
        name: "Log gennemgang",
        completed: true,
        notes:
          "Mindre advarsel om diskplads på en af serverne - 85% brugt. Holder øje med situationen.",
      },
      {
        id: "step-8",
        name: "Opsummering",
        completed: true,
        notes: "",
      },
    ],
  },
  // Last week (major issue day)
  {
    id: "routine-1683120000000",
    date: "2025-05-01",
    startTime: "08:00",
    endTime: "09:23",
    completionTime: 83,
    steps: [
      {
        id: "step-1",
        name: "Log ind",
        completed: true,
        notes: "",
      },
      {
        id: "step-2",
        name: "Email tjek",
        completed: true,
        notes:
          "Flere kritiske alarmer gennem natten - et databasecluster var nede.",
      },
      {
        id: "step-3",
        name: "Systemstatus",
        completed: true,
        notes: "Flere kritiske systemer viser fejl eller advarsler.",
      },
      {
        id: "step-4",
        name: "Database tjek",
        completed: false,
        notes:
          "Primær database er nede! Kontaktet database-teamet, de er allerede i gang med at løse problemet.",
      },
      {
        id: "step-5",
        name: "Backup validering",
        completed: true,
        notes:
          "Backups fra i går er OK og kan bruges til genopretning hvis nødvendigt.",
      },
      {
        id: "step-6",
        name: "Batch jobs",
        completed: false,
        notes: "Flere natlige jobs er fejlet pga. databaseproblemer.",
      },
      {
        id: "step-7",
        name: "Log gennemgang",
        completed: true,
        notes:
          "Mange fejl i logfilerne, alle relateret til databaseproblemerne.",
      },
      {
        id: "step-8",
        name: "Opsummering",
        completed: true,
        notes:
          "Major incident: Database-teamet arbejder på genopretning. Løbende opdateringer sendes til ledelsen. Estimeret løsningstid: 2-3 timer.",
      },
    ],
  },
  // Two weeks ago
  {
    id: "routine-1682515200000",
    date: "2025-04-24",
    startTime: "08:03",
    endTime: "08:49",
    completionTime: 46,
    steps: [
      {
        id: "step-1",
        name: "Log ind",
        completed: true,
        notes: "",
      },
      {
        id: "step-2",
        name: "Email tjek",
        completed: true,
        notes: "",
      },
      {
        id: "step-3",
        name: "Systemstatus",
        completed: true,
        notes: "",
      },
      {
        id: "step-4",
        name: "Database tjek",
        completed: true,
        notes: "",
      },
      {
        id: "step-5",
        name: "Backup validering",
        completed: true,
        notes:
          "Gennemgået sikkerhedskopier for de sidste 7 dage som del af månedlig audit.",
      },
      {
        id: "step-6",
        name: "Batch jobs",
        completed: true,
        notes: "",
      },
      {
        id: "step-7",
        name: "Log gennemgang",
        completed: true,
        notes: "",
      },
      {
        id: "step-8",
        name: "Opsummering",
        completed: true,
        notes: "Alt kører normalt i dag.",
      },
    ],
  },
];

// Function to initialize mock data in localStorage (for development/demo purposes)
export const initializeMockHistoryData = (): void => {
  // Check if data already exists to avoid overwriting real user data
  const existingData = localStorage.getItem("completedRoutines");
  if (!existingData || existingData === "[]") {
    localStorage.setItem(
      "completedRoutines",
      JSON.stringify(mockCompletedRoutines)
    );
    console.log("Initialized mock routine history data");
  }
};
