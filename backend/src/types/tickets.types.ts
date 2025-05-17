// src/types/tickets.types.ts
// Basic ticket information
export interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  updated: string;
  anmoder: string; // Requester email
  anmoderName: string; // Requester name
  database: string;
  response: string; // SLA response time remaining
  group: string; // Support group
  assignee: string; // Person responsible (can be empty)
}

// View definition for the sidebar
export interface TicketView {
  id: string; // Unique identifier for the view
  name: string; // Display name of the view
  count: number | string; // Count or metric for the view
  active?: boolean; // Whether the view is currently active
  type?: string; // Optional category/type for grouping views
  icon?: string; // Optional icon identifier
}

// SLA statistics
export interface SLAStats {
  averageResponseTime: string;
  responseTimeChange: number;
  slaCompliance: number;
  slaComplianceChange: number;
  nearSLALimit: number;
  overSLA: number;
}

// Stats card data
export interface TicketsStatsData {
  totalTickets: number;
  totalTicketsChange: number;
  ticketsOpen: number;
  ticketsOpenChange: number;
  ticketsWaiting: number;
  ticketsWaitingChange: number;
  avgResolutionTime: number;
  avgResolutionTimeChange: number;
}

// Chart data types
export interface ActivityData {
  name: string;
  tickets: number;
}

export interface DonutItem {
  name: string;
  value: number;
  color: string;
}

export interface PriorityData {
  priority: string;
  antal: number;
  vaerdi: number;
  decreasing: boolean;
}

export interface DatabaseData {
  name: string;
  tickets: number;
}

export interface AgentPerformance {
  name: string;
  initial: string;
  resolved: number;
  responseTime: number;
  resolutionTime: number;
  sla: number;
  satisfaction: number;
}

export interface VolumeTrendData {
  day: string;
  current: number;
  previous: number;
}

export interface FrameOption {
  label: string;
  value: string;
}

// API response types
export interface TicketsResponse {
  data: Ticket[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BulkActionResponse {
  success: boolean;
  message: string;
  failedIds: string[];
}

// Interface for pie chart label props
export interface RenderLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  value: number;
  name: string;
  index: number;
}
