// mockDataTickets.ts
// Import all shared type definitions using type-only imports
import type {
  Ticket,
  DonutItem,
  PriorityData,
  DatabaseData,
  ActivityData,
  SLAStats,
  TicketsStatsData,
  AgentPerformance,
  VolumeTrendData,
  FrameOption,
} from "./types";

// Stats overview data
export const ticketsStatsData: TicketsStatsData = {
  totalTickets: 286,
  totalTicketsChange: 34,
  ticketsOpen: 74,
  ticketsOpenChange: 11,
  ticketsWaiting: 66,
  ticketsWaitingChange: 7,
  avgResolutionTime: 339, // minutes
  avgResolutionTimeChange: -34,
};

// Monthly activity data for the bar chart
export const monthlyActivity: ActivityData[] = [
  { name: "JAN", tickets: 190 },
  { name: "FEB", tickets: 260 },
  { name: "MAR", tickets: 310 },
  { name: "APR", tickets: 230 },
  { name: "MAJ", tickets: 240 },
  { name: "JUN", tickets: 170 },
  { name: "JUL", tickets: 140 },
  { name: "AUG", tickets: 200 },
  { name: "SEP", tickets: 300 },
  { name: "OKT", tickets: 250 },
  { name: "NOV", tickets: 240 },
  { name: "DEC", tickets: 270 },
];

// Ticket channels data for donut chart
export const donutData: DonutItem[] = [
  { name: "E-mail", value: 0.21, color: "#10B981" },
  { name: "Support formular", value: 0.57, color: "#6366F1" },
  { name: "Telefon", value: 0.22, color: "#F97066" },
];

// Ticket priority data
export const ticketPriorityData: PriorityData[] = [
  { priority: "Lav", antal: 54, vaerdi: 13, decreasing: true },
  { priority: "Normal", antal: 180, vaerdi: 12, decreasing: false },
  { priority: "Høj", antal: 32, vaerdi: 24, decreasing: true },
  { priority: "Haster", antal: 20, vaerdi: 43, decreasing: false },
];

// Databases data
export const databaseData: DatabaseData[] = [
  { name: "Dansk Anæstesidatabase (DAD)", tickets: 32 },
  { name: "Dansk Hoftealloplastik Register", tickets: 28 },
  { name: "Dansk Kolorektal Cancer Database", tickets: 22 },
  { name: "Dansk Herniedatabase (DHD)", tickets: 18 },
  { name: "Den Nationale Skizofreni database", tickets: 12 },
  { name: "Dansk Psykiatrisk Selskabe", tickets: 22 },
];

// Recent tickets data (with completely new, random emails and names)
export const mockTickets: Ticket[] = [
  {
    id: "#15483",
    subject: "Glemt adgangskode/spærret bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 15:18",
    anmoder: "johanne.nielsen@company.dk",
    anmoderName: "Johanne Nielsen",
    database: "Dansk Anæstesidatabase (DAD)",
    response: "18t",
    group: "Support",
    assignee: "",
  },
  {
    id: "#15471",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 13:39",
    anmoder: "kasper.moller@healthorg.dk",
    anmoderName: "Kasper Møller",
    database: "Dansk Hoftealloplastik Register",
    response: "2d",
    group: "IT Support",
    assignee: "",
  },
  {
    id: "#15477",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 14:43",
    anmoder: "marie.andersen@research.org",
    anmoderName: "Marie Andersen",
    database: "Dansk Kolorektal Cancer Database",
    response: "2d",
    group: "Support",
    assignee: "",
  },
  {
    id: "#15478",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 14:46",
    anmoder: "mikkel.poulsen@hospital.dk",
    anmoderName: "Mikkel Poulsen",
    database: "Dansk Herniedatabase (DHD)",
    response: "2d",
    group: "IT Support",
    assignee: "",
  },
  {
    id: "#15489",
    subject: "Anden henvendelse",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 18:32",
    anmoder: "louise.madsen@clinic.dk",
    anmoderName: "Louise Madsen",
    database: "Support",
    response: "1d",
    group: "Support",
    assignee: "",
  },
  {
    id: "#15490",
    subject: "Anden henvendelse",
    status: "Ny",
    priority: "Normal",
    updated: "For 44 minutter siden",
    anmoder: "simon.berg@medcenter.dk",
    anmoderName: "Simon Berg",
    database: "Support",
    response: "2d",
    group: "Support",
    assignee: "",
  },
  {
    id: "#14931",
    subject: "Anden henvendelse",
    status: "Åben",
    priority: "Normal",
    updated: "22. apr",
    anmoder: "eva.thygesen@research.dk",
    anmoderName: "Eva Thygesen",
    database: "Den Nationale Skizofreni database",
    response: "2d",
    group: "Support",
    assignee: "Anders Johansen",
  },
];

// Agent performance data
export const agentPerformance: AgentPerformance[] = [
  {
    name: "Emma Petersen",
    initial: "EP",
    resolved: 24,
    responseTime: 34,
    resolutionTime: 5.2,
    sla: 93,
    satisfaction: 94,
  },
  {
    name: "Jens Thomsen",
    initial: "JT",
    resolved: 18,
    responseTime: 31,
    resolutionTime: 4.8,
    sla: 91,
    satisfaction: 92,
  },
  {
    name: "Freja Larsen",
    initial: "FL",
    resolved: 22,
    responseTime: 29,
    resolutionTime: 5.5,
    sla: 95,
    satisfaction: 96,
  },
  {
    name: "Magnus Olsen",
    initial: "MO",
    resolved: 15,
    responseTime: 37,
    resolutionTime: 6.1,
    sla: 88,
    satisfaction: 90,
  },
];

// Ticket volume trend
export const volumeTrendData: VolumeTrendData[] = [
  { day: "1", current: 12, previous: 10 },
  { day: "2", current: 15, previous: 13 },
  { day: "3", current: 18, previous: 11 },
  { day: "4", current: 14, previous: 16 },
  { day: "5", current: 16, previous: 14 },
  { day: "6", current: 19, previous: 15 },
  { day: "7", current: 21, previous: 18 },
  { day: "8", current: 17, previous: 19 },
  { day: "9", current: 20, previous: 17 },
  { day: "10", current: 22, previous: 18 },
  { day: "11", current: 18, previous: 15 },
  { day: "12", current: 15, previous: 13 },
  { day: "13", current: 19, previous: 17 },
  { day: "14", current: 20, previous: 21 },
  { day: "15", current: 24, previous: 19 },
];

// Activity data by different timeframes
export const mockMonthlyActivity: ActivityData[] = [
  { name: "JAN", tickets: 100 },
  { name: "FEB", tickets: 140 },
  { name: "MAR", tickets: 135 },
  { name: "APR", tickets: 240 },
  { name: "MAJ", tickets: 275 },
  { name: "JUN", tickets: 200 },
  { name: "JUL", tickets: 230 },
  { name: "AUG", tickets: 100 },
  { name: "SEP", tickets: 270 },
  { name: "OKT", tickets: 330 },
  { name: "NOV", tickets: 380 },
  { name: "DEC", tickets: 250 },
];

export const mockWeeklyActivity: ActivityData[] = [
  { name: "Man", tickets: 40 },
  { name: "Tir", tickets: 55 },
  { name: "Ons", tickets: 60 },
  { name: "Tor", tickets: 80 },
  { name: "Fre", tickets: 70 },
  { name: "Lør", tickets: 50 },
  { name: "Søn", tickets: 30 },
];

export const mockYearlyActivity: ActivityData[] = [
  { name: "2022", tickets: 1200 },
  { name: "2023", tickets: 1350 },
  { name: "2024", tickets: 1500 },
];

// Dropdown options for Activity chart
export const frameOptions: FrameOption[] = [
  { label: "Måned", value: "month" },
  { label: "År", value: "year" },
  { label: "Uge", value: "week" },
];

// SLA stats for TicketsTable
export const mockSLAStats: SLAStats = {
  averageResponseTime: "34 min",
  responseTimeChange: -12,
  slaCompliance: 91,
  slaComplianceChange: 3,
  nearSLALimit: 7,
  overSLA: 3,
};

// Helper to get activity data based on selected frame
export const getActivityData = (
  chartFrame: "month" | "week" | "year"
): ActivityData[] => {
  return chartFrame === "month"
    ? mockMonthlyActivity
    : chartFrame === "week"
    ? mockWeeklyActivity
    : mockYearlyActivity;
};
