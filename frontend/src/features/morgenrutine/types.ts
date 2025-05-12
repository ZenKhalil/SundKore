// src/features/morgenrutine/types.ts

import type { ReactNode } from "react";

/**
 * One step in the morning routine checklist.
 */
export interface RoutineStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  time: string;
  duration: number;

  /** Optional user guidance for this step */
  guidance?: string;
  /** Optional deep links for further info */
  links?: { title: string; url: string }[];
  /** Whether this step can be auto‐checked */
  automatable?: boolean;
  /** True while an auto‐check is in progress */
  isChecking?: boolean;
  /** Result of the last auto‐check */
  autoCheckResult?: "success" | "error";
  /** Message from the last auto‐check */
  checkMessage?: string;
}

/**
 * One overnight alert entry.
 */
export interface Alert {
  id: string;
  time: string;
  system: string;
  level: "error" | "warning" | "info";
  message: string;

  /** Optional detailed description */
  details?: string;
  /** Has the user marked it resolved? */
  resolved: boolean;
}

/**
 * Status of a single system in the dashboard.
 */
export interface SystemStatusItem {
  name: string;
  status: "active" | "warning" | "error";
  lastChecked: string;
  responseTime: number;

  /** Uptime percentage (optional) */
  uptime?: number;
  /** Free‐form details (optional) */
  details?: string;
  /** Optional link to external dashboard */
  url?: string;
}

/**
 * A to-do task in today's list.
 */
export interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  assignee: string;
  estimation: string;

  /** Optional longer description */
  details?: string;
}

/**
 * Styling for a task's priority badge.
 */
export interface PriorityStyle {
  bgColor: string;
  textColor: string;
  icon: ReactNode;
}

/**
 * Stored record of a completed morning routine.
 */
export interface CompletedRoutine {
  /** Unique ID for this routine instance */
  id: string;
  /** Date when the routine was completed (in readable format) */
  date: string;
  /** Time when the routine was started */
  startTime: string;
  /** Time when the routine was completed */
  endTime: string;
  /** Total duration in minutes */
  completionTime: number;
  /** The steps that were part of this routine and their completion status */
  steps: {
    id: string;
    name: string;
    completed: boolean;
    notes: string;
  }[];
}

/**
 * Statistics for the routine history overview.
 */
export interface RoutineStatistics {
  /** Total number of routines completed */
  totalRoutines: number;
  /** Average completion time across all routines (minutes) */
  averageCompletionTime: number;
  /** Percentage of steps completed across all routines */
  completionRate: number;
}

/**
 * Summarized numbers for the SystemStatusPanel top row.
 */
export interface StatusSummary {
  totalSystems: number;
  systemsUp: number;
  systemsWarning: number;
  systemsDown: number;
  criticalIssues?: number;
  backupStatus: string;
  batchStatus: string;
  averageResponseTime: number;
}

/**
 * A single point in the completion‐time history chart.
 */
export interface CompletionHistoryPoint {
  date: string;
  time: number;
}

/**
 * A single point in the daily success‐rate chart.
 */
export interface SuccessRatePoint {
  day: string;
  successRate: number;
}

/**
 * Time period options for filtering data in charts.
 */
export type Period = "14d" | "30d" | "3m" | "6m" | "1y";

/**
 * Props for the CompletionTimeChart component.
 */
export interface CompletionTimeChartProps {
  allCompletionData: CompletionHistoryPoint[];
  averageCompletionTime: number;
}
