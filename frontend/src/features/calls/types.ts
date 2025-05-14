// src/features/calls/types.ts

import type { ReactNode } from "react";

// Interface for label props for the donut chart
export interface RenderLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  value: number;
  name: string;
  index: number;
}

export interface CombinedActivityItem {
  date: string;
  time: string;
  // Call metrics
  queued: number;
  presented: number;
  answered: number;
  answeredIn60Secs: number;
  abandoned: number;
  // Wait times
  longestWait: string;
  longestAnswer: string;
  longestAbandoned: string;
  // Performance
  percentAnswered: number;
}

// Custom tooltip interface
export interface HeatmapTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: [number, number, number, string, number];
  }>;
}

// Extended interface
export interface ExtendedCombinedActivityItem extends CombinedActivityItem {
  bounced?: number;
}

// Interface for grouped heatmap data by week
export interface WeeklyHeatmapData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  data: any[];
}

export interface TransformedData {
  callCenterStats: any;
  combinedActivityData: ExtendedCombinedActivityItem[];
  reportDateRange: string;
  companyName: string;
  serviceTargets: {
    serviceLevel: number;
    responseRate: number;
    maxWaitTime: string;
    maxAbandonRate: number;
    bouncedRate: number;
  };
  donutData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  callStats: Array<{
    id: number;
    label: string;
    count: string | number;
    change: string;
    increasing: boolean;
  }>;
  weeklyCallActivity: any[];
  responseRateTrend: any[];
  callHeatmapData: any[];
  monthlyCallActivity?: any[];
  yearlyCallActivity?: any[];
  customCallActivity?: any[];
}

// Table filter and pagination state
export interface TableState {
  selectedPeriod: number | null;
  selectedMonth: string;
  selectedYear: string;
  searchQuery: string;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  currentPage: number;
  itemsPerPage: number;
}

// Time filter state
export interface TimeFilterState {
  timeFrame: string;
  isDropdownOpen: boolean;
  customDateRange: {
    start: string;
    end: string;
  };
  showCustomDatePicker: boolean;
}

// Heatmap state
export interface HeatmapState {
  heatmapView: "queued" | "answered";
  heatmapWeeks: WeeklyHeatmapData[];
  currentHeatmapWeekIndex: number;
  heatmapDateFilter: {
    start: string;
    end: string;
  };
  showHeatmapDatePicker: boolean;
  isHeatmapFilterActive: boolean;
}

// Activity chart state
export interface ActivityChartState {
  activityData: Record<string, any[]> | null;
  activityPeriod: "weekly" | "monthly" | "yearly";
  chartType: "stacked" | "grouped";
}
