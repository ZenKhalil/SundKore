export interface CombinedActivityItem {
  date: string;
  time: string;
  // Call metrics
  queued: number;
  presented: number;
  answered: number;
  answeredIn60Secs: number;
  abandoned: number;
  bounced: number;
  // Wait times
  longestWait: string;
  longestAnswer: string;
  longestAbandoned: string;
  // Performance
  percentAnswered: number;
}

export interface CallCenterStats {
  total: number;
  answered: number;
  abandoned: number;
  presented: number;
  bounced: number;
  answeredIn60Secs: number;
  percentAnswered: number;
  percentAbandoned: number;
  percentBounced: number;
  percentAnsweredIn60Secs: number;
  percentAnsweredIn60SecsOfAnswered: number;
  longestWaitTime: string;
  longestAnswerTime: string;
  longestWaitAbandoned: string;
  avgWaitTime: string;
  avgTalkTime: string;
  avgTaskTime: string;
  avgQueueTime: string;
  callsPerHour: number;
}

export interface WeeklyActivityItem {
  name: string;
  besvaret: number;
  ubesvaret: number;
}

export interface ResponseRateTrendItem {
  day: string;
  besvaret: number;
  ubesvaret: number;
  besvaret60: number;
}

export interface CallCenterData {
  callCenterStats: CallCenterStats;
  combinedActivityData: CombinedActivityItem[];
  reportDateRange: string;
  companyName: string;
  // Additional properties expected by frontend
  weeklyCallActivity: WeeklyActivityItem[];
  responseRateTrend: ResponseRateTrendItem[];
  callHeatmapData: (number | string)[][];
}
