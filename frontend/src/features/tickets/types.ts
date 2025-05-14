// ticketTypes.ts - Shared type definitions for the ticket system
// This ensures consistent types across components and data files

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

// SLA statistics
export interface SLAStats {
  averageResponseTime: string;
  responseTimeChange: number;
  slaCompliance: number;
  slaComplianceChange: number;
  nearSLALimit: number;
  overSLA: number;
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

// TicketsTable component props
export interface TicketsTableProps {
  initialTickets?: Ticket[];
  apiEndpoint: string;
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
