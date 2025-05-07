import {
  List,
  MailIcon,
  User,
  Clock,
  AlertTriangle,
  RefreshCw,
  Tag,
} from "lucide-react";
import type {
  Trigger,
  TriggerCategory,
  TriggerStats,
  DonutItem,
  ActivityData,
  RecentActivity,
  PerformanceMetrics,
  EfficiencyData,
  ActionType,
} from "./types";

// ------------------------------------
// Trigger Categories
// ------------------------------------

export const triggerCategories: TriggerCategory[] = [
  { id: "all", name: "Alle kategorier", icon: List, color: "#6366F1" },
  {
    id: "notification",
    name: "Notifikationer",
    icon: MailIcon,
    color: "#2DD4BF",
  },
  { id: "assignment", name: "Tildeling", icon: User, color: "#F97066" },
  { id: "sla", name: "SLA", icon: Clock, color: "#F59E0B" },
  {
    id: "escalation",
    name: "Eskalering",
    icon: AlertTriangle,
    color: "#8B5CF6",
  },
  {
    id: "automation",
    name: "Automatisering",
    icon: RefreshCw,
    color: "#EC4899",
  },
  { id: "tagging", name: "Tagging", icon: Tag, color: "#10B981" },
];

// ------------------------------------
// Mock Triggers
// ------------------------------------

export const mockTriggers: Trigger[] = [
  {
    id: "trig_1001",
    title: "SLA Påmindelse",
    description: "Sender påmindelse til agent når SLA nærmer sig deadline",
    status: "active",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-04-22T14:15:00Z",
    category_id: "sla",
    position: 1,
    conditions: [
      { field: "sla.hours_until_breach", operator: "less_than", value: "4" },
      { field: "ticket.status", operator: "is", value: "open" },
    ],
    actions: [
      {
        type: "email_notification",
        value: "agent",
        description: "Send email til ansvarlig agent",
      },
    ],
    permissions: { update: true, delete: true },
    usage_stats: {
      usage_1h: 12,
      usage_24h: 143,
      usage_7d: 872,
      usage_30d: 3241,
      success_rate: 98.5,
    },
  },
  {
    id: "trig_1002",
    title: "Ticket Tildeling",
    description: "Tildeler tickets baseret på emne og prioritet",
    status: "active",
    created_at: "2024-02-10T09:15:00Z",
    updated_at: "2024-04-15T11:30:00Z",
    category_id: "assignment",
    position: 2,
    conditions: [
      {
        field: "ticket.subject",
        operator: "contains",
        value: "teknisk support",
      },
      { field: "ticket.priority", operator: "is", value: "høj" },
    ],
    actions: [
      {
        type: "assign_agent",
        value: "tech_team",
        description: "Tildel til teknisk team",
      },
    ],
    permissions: { update: true, delete: true },
    usage_stats: {
      usage_1h: 8,
      usage_24h: 98,
      usage_7d: 612,
      usage_30d: 2845,
      success_rate: 99.2,
    },
  },
  {
    id: "trig_1003",
    title: "Support Eskalering",
    description: "Eskalerer tickets der ikke er besvaret inden for 24 timer",
    status: "active",
    created_at: "2023-11-05T16:45:00Z",
    updated_at: "2024-03-20T08:10:00Z",
    category_id: "escalation",
    position: 3,
    conditions: [
      {
        field: "ticket.hours_since_created",
        operator: "greater_than",
        value: "24",
      },
      { field: "ticket.status", operator: "is", value: "open" },
    ],
    actions: [
      {
        type: "priority_change",
        value: "urgent",
        description: "Opgrader prioritet til haster",
      },
      {
        type: "email_notification",
        value: "manager",
        description: "Send besked til leder",
      },
    ],
    permissions: { update: true, delete: false },
    app_installation: "escalation_app",
    usage_stats: {
      usage_1h: 3,
      usage_24h: 45,
      usage_7d: 312,
      usage_30d: 1254,
      success_rate: 95.3,
    },
  },
  {
    id: "trig_1004",
    title: "Kundetilfredshed",
    description: "Sender tilfredshedsundersøgelse når ticket lukkes",
    status: "active",
    created_at: "2023-09-18T13:20:00Z",
    updated_at: "2024-04-05T10:45:00Z",
    category_id: "notification",
    position: 4,
    conditions: [{ field: "ticket.status", operator: "is", value: "solved" }],
    actions: [
      {
        type: "email_notification",
        value: "customer",
        description: "Send tilfredshedsundersøgelse til kunde",
      },
    ],
    permissions: { update: true, delete: true },
    usage_stats: {
      usage_1h: 15,
      usage_24h: 182,
      usage_7d: 1253,
      usage_30d: 5142,
      success_rate: 99.7,
    },
  },
  {
    id: "trig_1005",
    title: "Automatisk Tagging",
    description: "Tilføjer relevante tags baseret på emnelinjen",
    status: "active",
    created_at: "2024-01-30T11:55:00Z",
    updated_at: "2024-02-15T16:30:00Z",
    category_id: "tagging",
    position: 5,
    conditions: [
      { field: "ticket.subject", operator: "contains", value: "faktura" },
    ],
    actions: [
      {
        type: "add_tags",
        value: "faktura,regnskab,økonomi",
        description: "Tilføj økonomirelaterede tags",
      },
    ],
    permissions: { update: true, delete: true },
    usage_stats: {
      usage_1h: 6,
      usage_24h: 75,
      usage_7d: 485,
      usage_30d: 1932,
      success_rate: 100,
    },
  },
  {
    id: "trig_1006",
    title: "Kritisk Fejl Notifikation",
    description: "Sender besked til udviklingsholdet ved kritiske fejl",
    status: "active",
    created_at: "2023-12-12T14:40:00Z",
    updated_at: "2024-03-28T09:25:00Z",
    category_id: "notification",
    position: 6,
    conditions: [
      { field: "ticket.subject", operator: "contains", value: "fejl" },
      { field: "ticket.priority", operator: "is", value: "urgent" },
    ],
    actions: [
      {
        type: "email_notification",
        value: "dev_team",
        description: "Send besked til udviklingsholdet",
      },
      {
        type: "add_cc",
        value: "product_manager",
        description: "Tilføj produktchef som cc",
      },
    ],
    permissions: { update: true, delete: true },
    usage_stats: {
      usage_1h: 2,
      usage_24h: 28,
      usage_7d: 185,
      usage_30d: 734,
      success_rate: 97.2,
    },
  },
  {
    id: "trig_1007",
    title: "Gruppetildeling",
    description: "Tildeler tickets til den korrekte supportgruppe",
    status: "active",
    created_at: "2024-02-05T15:10:00Z",
    updated_at: "2024-04-10T13:50:00Z",
    category_id: "assignment",
    position: 7,
    conditions: [
      { field: "ticket.subject", operator: "contains", value: "hardware" },
    ],
    actions: [
      {
        type: "set_group",
        value: "hardware_support",
        description: "Tildel til hardware supportgruppen",
      },
    ],
    permissions: { update: true, delete: true },
    usage_stats: {
      usage_1h: 7,
      usage_24h: 86,
      usage_7d: 529,
      usage_30d: 2187,
      success_rate: 99.8,
    },
  },
  {
    id: "trig_1008",
    title: "Automatisk Svar",
    description: "Sender automatisk svar ved nye henvendelser",
    status: "inactive",
    created_at: "2023-10-25T09:30:00Z",
    updated_at: "2024-04-01T10:15:00Z",
    category_id: "automation",
    position: 8,
    conditions: [{ field: "ticket.status", operator: "is", value: "new" }],
    actions: [
      {
        type: "email_notification",
        value: "customer_auto_reply",
        description: "Send automatisk svar til kunden",
      },
    ],
    permissions: { update: true, delete: true },
    usage_stats: {
      usage_1h: 0,
      usage_24h: 0,
      usage_7d: 0,
      usage_30d: 2541,
      success_rate: 99.5,
    },
  },
  {
    id: "trig_1009",
    title: "VIP Kunde Håndtering",
    description: "Prioriterer henvendelser fra VIP kunder",
    status: "active",
    created_at: "2023-11-15T11:20:00Z",
    updated_at: "2024-03-12T14:35:00Z",
    category_id: "assignment",
    position: 9,
    conditions: [
      { field: "customer.tags", operator: "contains", value: "vip" },
    ],
    actions: [
      {
        type: "priority_change",
        value: "high",
        description: "Sæt prioritet til høj",
      },
      {
        type: "assign_agent",
        value: "vip_team",
        description: "Tildel til VIP-team",
      },
    ],
    permissions: { update: true, delete: true },
    usage_stats: {
      usage_1h: 1,
      usage_24h: 15,
      usage_7d: 98,
      usage_30d: 412,
      success_rate: 100,
    },
  },
  {
    id: "trig_1010",
    title: "GDPR Relateret",
    description: "Håndterer GDPR relaterede henvendelser",
    status: "disabled",
    created_at: "2023-08-30T10:10:00Z",
    updated_at: "2024-02-28T15:45:00Z",
    category_id: "escalation",
    position: 10,
    conditions: [
      { field: "ticket.subject", operator: "contains", value: "gdpr" },
      { field: "ticket.subject", operator: "contains", value: "persondata" },
    ],
    actions: [
      {
        type: "set_group",
        value: "legal_team",
        description: "Tildel til juridisk afdeling",
      },
      {
        type: "add_tags",
        value: "gdpr,persondata,sensitivt",
        description: "Tilføj GDPR relaterede tags",
      },
    ],
    permissions: { update: false, delete: false },
    app_installation: "compliance_app",
    usage_stats: {
      usage_1h: 0,
      usage_24h: 0,
      usage_7d: 0,
      usage_30d: 124,
      success_rate: 89.5,
    },
  },
];

// ------------------------------------
// Statistics Generator
// ------------------------------------

export function generateTriggerStats(triggers: Trigger[]): TriggerStats {
  const active = triggers.filter((t) => t.status === "active").length;
  const inactive = triggers.filter((t) => t.status === "inactive").length;
  const disabled = triggers.filter((t) => t.status === "disabled").length;
  const total_executions = triggers.reduce(
    (sum, t) => sum + t.usage_stats.usage_30d,
    0
  );
  const success_rate =
    triggers.reduce(
      (sum, t) => sum + t.usage_stats.success_rate * t.usage_stats.usage_30d,
      0
    ) / total_executions;

  return {
    total: triggers.length,
    active,
    inactive,
    disabled,
    total_executions,
    success_rate,
    failure_rate: (100 - success_rate) * 0.7,
    skip_rate: (100 - success_rate) * 0.3,
  };
}

export const triggerStats = generateTriggerStats(mockTriggers);

// ------------------------------------
// Donut Data
// ------------------------------------

export function generateDonutData(stats: TriggerStats): DonutItem[] {
  return [
    { name: "Vellykkede", value: stats.success_rate / 100, color: "#10B981" },
    { name: "Mislykkede", value: stats.failure_rate / 100, color: "#F97066" },
    { name: "Sprunget over", value: stats.skip_rate / 100, color: "#F59E0B" },
  ];
}

export const donutData = generateDonutData(triggerStats);

// ------------------------------------
// Activity Data
// ------------------------------------

const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAJ",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DEC",
];
export const mockMonthlyActivity: ActivityData[] = months.map((m) => {
  const success = 100 + Math.floor(Math.random() * 300);
  return {
    name: m,
    success,
    failed: Math.floor(success * 0.08 * Math.random()),
    skipped: Math.floor(success * 0.04 * Math.random()),
  };
});

export const days = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
export const mockWeeklyActivity: ActivityData[] = days.map((d) => {
  const success = 20 + Math.floor(Math.random() * 80);
  return {
    name: d,
    success,
    failed: Math.floor(success * 0.08 * Math.random()),
    skipped: Math.floor(success * 0.04 * Math.random()),
  };
});

export const mockYearlyActivity: ActivityData[] = [
  { name: "2022", success: 1200, failed: 110, skipped: 60 },
  { name: "2023", success: 1500, failed: 120, skipped: 70 },
  { name: "2024", success: 1800, failed: 130, skipped: 80 },
];

// ------------------------------------
// Trend & Heatmap
// ------------------------------------

export const triggerTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  executions: 50 + Math.sin(i / 3) * 20 + Math.random() * 15,
}));

// ------------------------------------
// Recent Activity
// ------------------------------------

export const recentActivity: RecentActivity[] = Array.from(
  { length: 20 },
  (_, i) => {
    const trigger = mockTriggers[i % mockTriggers.length];
    const statuses: RecentActivity["status"][] = [
      "success",
      "failed",
      "skipped",
    ];
    const status = statuses[i % statuses.length];
    const actionTypes: ActionType[] = [
      "email_notification",
      "status_change",
      "priority_change",
      "assign_agent",
      "add_cc",
      "add_tags",
      "set_group",
    ];
    const action_type = actionTypes[i % actionTypes.length];
    const detailsMap: Record<ActionType, string> = {
      email_notification: "Email sendt til kunde",
      status_change: "Status ændret til 'løst'",
      priority_change: "Prioritet ændret til 'høj'",
      assign_agent: "Tildelt til Agent Jensen",
      add_cc: "Tilføjet leder som CC",
      add_tags: "Tags tilføjet: urgent, hardware",
      set_group: "Tildelt til teknisk support",
    };
    const timestamp =
      i < 5
        ? `I dag ${14 + i}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, "0")}`
        : i < 10
        ? `I går ${9 + (i % 5)}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, "0")}`
        : `${Math.floor((i - 9) / 2) + 1} dage siden`;

    return {
      id: `act_${1000 + i}`,
      trigger_id: trigger.id,
      trigger_name: trigger.title,
      ticket_id: `#${15400 + i}`,
      timestamp,
      status,
      action_type,
      details: detailsMap[action_type],
    };
  }
);

// ------------------------------------
// Performance & Efficiency
// ------------------------------------

export const performanceMetrics: PerformanceMetrics[] = mockTriggers.map(
  (t) => ({
    trigger_id: t.id,
    trigger_name: t.title,
    execution_count: t.usage_stats.usage_30d,
    avg_execution_time: 50 + Math.random() * 200,
    success_rate: t.usage_stats.success_rate,
    failure_rate: (100 - t.usage_stats.success_rate) * 0.7,
    category_id: t.category_id,
  })
);

export const efficiencyData: EfficiencyData[] = mockTriggers.map((t) => {
  const cat = triggerCategories.find((c) => c.id === t.category_id)!;
  return {
    id: t.id,
    name: t.title,
    executionTime: 50 + Math.random() * 300,
    successRate: t.usage_stats.success_rate,
    executionCount: t.usage_stats.usage_30d,
    category: t.category_id,
    color: cat.color,
  };
});
