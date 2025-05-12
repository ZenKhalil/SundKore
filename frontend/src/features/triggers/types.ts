import type { ReactElement } from "react";

export type TriggerCategory = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
};

export type SortOption =
  | "alphabetical"
  | "created_at"
  | "updated_at"
  | "position"
  | "usage_1h"
  | "usage_24h"
  | "usage_7d"
  | "usage_30d";

export type SortOrder = "asc" | "desc";
export type ViewMode = "list" | "grid";
export type ConditionOperator =
  | "is"
  | "is_not"
  | "less_than"
  | "greater_than"
  | "contains"
  | "not_contains";

export type TriggerCondition = {
  field: string;
  operator: ConditionOperator;
  value: string;
};

export type ActionType =
  | "email_notification"
  | "status_change"
  | "priority_change"
  | "assign_agent"
  | "add_cc"
  | "add_tags"
  | "set_group";

export type TriggerAction = {
  type: ActionType;
  value: string;
  description: string;
};

export type TriggerStatus = "active" | "inactive" | "disabled";

export interface Trigger {
  id: string;
  title: string;
  description: string;
  status: TriggerStatus;
  created_at: string;
  updated_at: string;
  category_id: string;
  position: number;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  permissions: { update: boolean; delete: boolean };
  app_installation?: string;
  usage_stats: {
    usage_1h: number;
    usage_24h: number;
    usage_7d: number;
    usage_30d: number;
    success_rate: number;
  };
}

export interface TriggerStats {
  total: number;
  active: number;
  inactive: number;
  disabled: number;
  total_executions: number;
  success_rate: number;
  failure_rate: number;
  skip_rate: number;
}

export interface ActivityData {
  name: string;
  success: number;
  failed: number;
  skipped: number;
}

export interface DonutItem {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  trigger_id: string;
  trigger_name: string;
  ticket_id: string;
  timestamp: string;
  status: "success" | "failed" | "skipped";
  action_type: ActionType;
  details: string;
}

export interface PerformanceMetrics {
  trigger_id: string;
  trigger_name: string;
  execution_count: number;
  avg_execution_time: number;
  success_rate: number;
  failure_rate: number;
  category_id: string;
}

export interface EfficiencyData {
  id: string;
  name: string;
  executionTime: number;
  successRate: number;
  executionCount: number;
  category: string;
  color: string;
}
