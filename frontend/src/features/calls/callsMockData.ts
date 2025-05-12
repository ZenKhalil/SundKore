// src/features/calls/callsMockData.ts
import {
  addDays,
  format,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";

// Define interfaces for all data structures
export interface CallCenterStats {
  total: number;
  answered: number;
  abandoned: number;
  presented: number;
  bounced: number;
  answeredIn60Secs: number;
  percentAnswered: number;
  percentAbandoned: number;
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

interface PeriodData {
  stats: CallCenterStats;
  dateRange: string;
}

export interface CallStat {
  id: number;
  label: string;
  count: number;
  change: string;
  increasing: boolean;
}

export interface DonutItem {
  name: string;
  value: number;
  color: string;
}

export interface WeeklyActivity {
  name: string;
  besvaret: number;
  ubesvaret: number;
}

export interface ResponseRateTrend {
  day: string;
  besvaret: number;
  ubesvaret: number;
  besvaret60: number;
  mål: number;
  target: number;
  date: string;
  dayOfWeek: number;
}

export interface DailyActivity {
  date: string;
  time: string;
  queued: number;
  abandoned: number;
  presented: number;
  answered: number;
  answeredIn60Secs: number;
  percentAnsweredIn60Secs: number;
  percentAnswered: number;
  hour: number;
  dayOfWeek: number;
}

export interface WaitTimeItem {
  date: string;
  time: string;
  longestWait: string;
  longestAnswer: string;
  longestAbandoned: string;
  numericWait: number;
  numericAnswer: number;
  numericAbandoned: number;
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

export interface AgentStats {
  totalAgents: number;
  avgResponseTimePerAgent: string;
  avgCallsPerAgent: number;
  agentAvailability: number;
}

export interface TimingMetrics {
  avgWaitTimeAllCalls: string;
  avgTalkTime: string;
  percentAnsweredIn30Secs: number;
  avgAfterCallWork: string;
}

export interface PerformanceMetrics {
  slaPerformance: number;
  trendDirection: "up" | "down";
  trendChange: string;
  csatScore: number;
  fcrRate: number;
}

export interface ServiceTargets {
  serviceLevel: number;
  responseRate: number;
  maxWaitTime: string;
  maxAbandonRate: number;
}

// Updated HeatmapDataItem to include both queued and answered calls
export type HeatmapDataItem = [number, number, number, string, number]; // [hour, dayOfWeek, queued, date, answered]

export interface TimeRangeData {
  callCenterStats: CallCenterStats;
  callStats: CallStat[];
  donutData: DonutItem[];
  weeklyCallActivity: WeeklyActivity[];
  responseRateTrend: ResponseRateTrend[];
  reportDateRange: string;
  waitTimeData: WaitTimeItem[];
  dailyCallActivity: DailyActivity[];
  callHeatmapData: HeatmapDataItem[];
  companyName: string;
  serviceTargets: ServiceTargets;
  agentStats: AgentStats;
  timingMetrics: TimingMetrics;
  performanceMetrics: PerformanceMetrics;
  combinedActivityData: CombinedActivityItem[];
}

// Helper function to generate random call data
function generateRandomCalls(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to create time string in format HH:MM:SS
function createTimeString(minutes: number, seconds: number): string {
  return `00:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// Generate mock data for different time periods
function generateDataForPeriod(days: number): PeriodData {
  const today = new Date();
  const startDate = subDays(today, days);
  const dateRange = `${format(startDate, "dd-MM-yyyy")} - ${format(
    today,
    "dd-MM-yyyy"
  )}`;

  // Call center summary stats
  const total = generateRandomCalls(150, 300);
  const answered = Math.floor(total * (0.7 + Math.random() * 0.2)); // 70-90% answered
  const abandoned = total - answered;
  const answeredIn60Secs = Math.floor(answered * (0.6 + Math.random() * 0.3)); // 60-90% of answered under 60s
  const bounced = generateRandomCalls(20, 50);
  const presented = total + bounced;

  // Create more detailed stats
  const longestWaitMinutes = generateRandomCalls(1, 5);
  const longestWaitSeconds = generateRandomCalls(0, 59);
  const longestAnswerMinutes = generateRandomCalls(1, 6);
  const longestAnswerSeconds = generateRandomCalls(0, 59);
  const longestAbandonedSeconds = generateRandomCalls(10, 59);

  // Average time values
  const avgWaitMinutes = generateRandomCalls(0, 1);
  const avgWaitSeconds = generateRandomCalls(10, 50);
  const avgTalkMinutes = generateRandomCalls(2, 4);
  const avgTalkSeconds = generateRandomCalls(0, 59);
  const avgTaskMinutes = generateRandomCalls(2, 5);
  const avgTaskSeconds = generateRandomCalls(0, 59);
  const avgQueueMinutes = generateRandomCalls(0, 1);
  const avgQueueSeconds = generateRandomCalls(20, 55);

  return {
    stats: {
      total,
      answered,
      abandoned,
      presented,
      bounced,
      answeredIn60Secs,
      percentAnswered: Math.round((answered / total) * 100),
      percentAbandoned: Math.round((abandoned / total) * 100),
      percentAnsweredIn60Secs: Math.round((answeredIn60Secs / total) * 100),
      percentAnsweredIn60SecsOfAnswered: Math.round(
        (answeredIn60Secs / answered) * 100
      ),
      longestWaitTime: createTimeString(longestWaitMinutes, longestWaitSeconds),
      longestAnswerTime: createTimeString(
        longestAnswerMinutes,
        longestAnswerSeconds
      ),
      longestWaitAbandoned: createTimeString(0, longestAbandonedSeconds),
      avgWaitTime: createTimeString(avgWaitMinutes, avgWaitSeconds),
      avgTalkTime: createTimeString(avgTalkMinutes, avgTalkSeconds),
      avgTaskTime: createTimeString(avgTaskMinutes, avgTaskSeconds),
      avgQueueTime: createTimeString(avgQueueMinutes, avgQueueSeconds),
      callsPerHour: Math.round(total / (10 * 8)),
    },
    dateRange,
  };
}

// Generate daily activity data - more realistic with weekly patterns
function generateDailyCallActivity(days: number): DailyActivity[] {
  const result: DailyActivity[] = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const currentDate = subDays(today, i);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Generate data based on day of week patterns
    const baseQueued = isWeekend
      ? generateRandomCalls(1, 10)
      : generateRandomCalls(15, 40);

    // Morning peak (9-11 AM)
    const morningPeakQueued = isWeekend
      ? generateRandomCalls(5, 15)
      : generateRandomCalls(30, 60);

    // Lunch hour (12-1 PM)
    const lunchQueued = isWeekend
      ? generateRandomCalls(3, 10)
      : generateRandomCalls(10, 25);

    // Afternoon peak (2-4 PM)
    const afternoonPeakQueued = isWeekend
      ? generateRandomCalls(5, 15)
      : generateRandomCalls(25, 50);

    // Evening (5-6 PM)
    const eveningQueued = isWeekend
      ? generateRandomCalls(2, 8)
      : generateRandomCalls(15, 30);

    // Generate hourly entries for this day
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

    hours.forEach((hour) => {
      let queued;
      if (hour >= 9 && hour <= 10) {
        queued = morningPeakQueued;
      } else if (hour === 12) {
        queued = lunchQueued;
      } else if (hour >= 14 && hour <= 15) {
        queued = afternoonPeakQueued;
      } else if (hour >= 16) {
        queued = eveningQueued;
      } else {
        queued = baseQueued;
      }

      // Create random abandoned rate between 5-25%
      const abandonedRate = 0.05 + Math.random() * 0.2;
      const abandoned = Math.round(queued * abandonedRate);
      const answered = queued - abandoned;

      // 60-90% of answered calls are within 60s
      const answeredIn60SecsRate = 0.6 + Math.random() * 0.3;
      const answeredIn60Secs = Math.round(answered * answeredIn60SecsRate);

      // Add bounced calls
      const bounced = generateRandomCalls(0, 10);
      const presented = queued + bounced;

      result.push({
        date: format(currentDate, "dd-MM-yyyy"),
        time: `${hour}:00`,
        queued,
        abandoned,
        presented,
        answered,
        answeredIn60Secs,
        percentAnsweredIn60Secs:
          answered > 0 ? Math.round((answeredIn60Secs / answered) * 100) : 0,
        percentAnswered: queued > 0 ? Math.round((answered / queued) * 100) : 0,
        hour,
        dayOfWeek: dayOfWeek === 0 ? 6 : dayOfWeek - 1, // Convert to 0=Monday, 6=Sunday
      });
    });
  }

  return result;
}

// Generate wait time data
function generateWaitTimeData(days: number): WaitTimeItem[] {
  const result: WaitTimeItem[] = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const currentDate = subDays(today, i);
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Generate different entries for each hour of the day
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

    hours.forEach((hour) => {
      // Higher wait times during peak hours
      const isPeakHour =
        (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);

      const waitMinutes = isPeakHour
        ? generateRandomCalls(0, 3)
        : generateRandomCalls(0, 1);
      const waitSeconds = generateRandomCalls(5, 59);

      const answerMinutes =
        waitMinutes === 0 && waitSeconds < 30 ? 0 : waitMinutes;
      const answerSeconds = generateRandomCalls(waitSeconds, 59);

      const abandonedMinutes = generateRandomCalls(0, 1);
      const abandonedSeconds = generateRandomCalls(5, 59);

      result.push({
        date: format(currentDate, "dd-MM-yyyy"),
        time: `${hour}:00`,
        longestWait: createTimeString(waitMinutes, waitSeconds),
        longestAnswer:
          answerMinutes > 0 || answerSeconds > 0
            ? createTimeString(answerMinutes, answerSeconds)
            : "00:00:00",
        longestAbandoned:
          Math.random() > 0.3
            ? createTimeString(abandonedMinutes, abandonedSeconds)
            : "00:00:00",
        numericWait: waitMinutes * 60 + waitSeconds,
        numericAnswer: answerMinutes * 60 + answerSeconds,
        numericAbandoned: abandonedMinutes * 60 + abandonedSeconds,
      });
    });
  }

  return result.sort((a, b) => {
    // Sort by date and time
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
}

// Generate trend data
function generateTrendData(days: number): ResponseRateTrend[] {
  const result: ResponseRateTrend[] = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const currentDate = subDays(today, i);

    // Base values with some seasonal trends
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Create up/down trends over time with some randomness
    const trendFactor = 1 + Math.sin(i / 5) * 0.2; // Oscillating trend
    const weekendFactor = isWeekend ? 0.6 : 1; // Weekends have lower values

    const besvaretBase =
      Math.min(95, 75 + (i % 15)) * trendFactor * weekendFactor;
    const besvaret = Math.round(Math.min(100, Math.max(50, besvaretBase)));
    const ubesvaret = 100 - besvaret;

    // Service level (answered within 60s) typically slightly below overall answer rate
    const besvaret60Base = besvaret * (0.8 + Math.random() * 0.15);
    const besvaret60 = Math.round(Math.min(100, besvaret60Base));

    result.push({
      day: format(currentDate, "dd/MM"),
      besvaret,
      ubesvaret,
      mål: 75, // Target percentage
      besvaret60,
      target: 80, // 60s target
      date: format(currentDate, "yyyy-MM-dd"),
      dayOfWeek: dayOfWeek === 0 ? 6 : dayOfWeek - 1, // Convert to 0=Monday, 6=Sunday
    });
  }

  return result;
}

// Generate heatmap data
function generateHeatmapData(
  dailyCallActivity: DailyActivity[]
): HeatmapDataItem[] {
  const heatmapData: HeatmapDataItem[] = [];

  // Process daily call activity to create heatmap data
  dailyCallActivity.forEach((entry) => {
    heatmapData.push([
      entry.hour, // Hour
      entry.dayOfWeek, // Day of week
      entry.queued, // Queued calls for "queued" view
      entry.date, // Date for tooltip
      entry.answered, // Answered calls for "answered" view
    ]);
  });

  return heatmapData;
}

// Generate weekly summary
function generateWeeklySummary(
  dailyCallActivity: DailyActivity[]
): WeeklyActivity[] {
  const weeklyData: WeeklyActivity[] = [
    { name: "Man", besvaret: 0, ubesvaret: 0 },
    { name: "Tir", besvaret: 0, ubesvaret: 0 },
    { name: "Ons", besvaret: 0, ubesvaret: 0 },
    { name: "Tor", besvaret: 0, ubesvaret: 0 },
    { name: "Fre", besvaret: 0, ubesvaret: 0 },
    { name: "Lør", besvaret: 0, ubesvaret: 0 },
    { name: "Søn", besvaret: 0, ubesvaret: 0 },
  ];

  // Group daily call activity by day of week
  dailyCallActivity.forEach((entry) => {
    const dayIndex = entry.dayOfWeek;
    weeklyData[dayIndex].besvaret += entry.answered;
    weeklyData[dayIndex].ubesvaret += entry.abandoned;
  });

  return weeklyData;
}

// Generate call statistics with deltas
function generateCallStats(
  stats: CallCenterStats,
  prevStats: CallCenterStats
): CallStat[] {
  return [
    {
      id: 1,
      label: "Total opkald i kø",
      count: stats.total,
      change: (stats.total - prevStats.total).toString(),
      increasing: stats.total >= prevStats.total,
    },
    {
      id: 2,
      label: "Besvarede opkald",
      count: stats.answered,
      change: (stats.answered - prevStats.answered).toString(),
      increasing: stats.answered >= prevStats.answered,
    },
    {
      id: 3,
      label: "Ubesvarede opkald",
      count: stats.abandoned,
      change: (stats.abandoned - prevStats.abandoned).toString(),
      increasing: stats.abandoned >= prevStats.abandoned,
    },
    {
      id: 4,
      label: "Besvaret <60s",
      count: stats.answeredIn60Secs,
      change: (stats.answeredIn60Secs - prevStats.answeredIn60Secs).toString(),
      increasing: stats.answeredIn60Secs >= prevStats.answeredIn60Secs,
    },
    {
      id: 5,
      label: "Præsenterede opkald",
      count: stats.presented,
      change: (stats.presented - prevStats.presented).toString(),
      increasing: stats.presented >= prevStats.presented,
    },
    {
      id: 6,
      label: "Afviste opkald",
      count: stats.bounced,
      change: (stats.bounced - prevStats.bounced).toString(),
      increasing: stats.bounced >= prevStats.bounced,
    },
  ];
}

// Function to combine daily activity and wait time data
export function generateCombinedActivityData(
  dailyActivity: DailyActivity[],
  waitTimeData: WaitTimeItem[]
): CombinedActivityItem[] {
  return dailyActivity.map((activity) => {
    // Find matching wait time data for the same date and time
    const waitTime = waitTimeData.find(
      (w) => w.date === activity.date && w.time === activity.time
    ) || {
      longestWait: "00:00:00",
      longestAnswer: "00:00:00",
      longestAbandoned: "00:00:00",
    };

    return {
      date: activity.date,
      time: activity.time,
      // Call metrics
      queued: activity.queued,
      presented: activity.presented,
      answered: activity.answered,
      answeredIn60Secs: activity.answeredIn60Secs,
      abandoned: activity.abandoned,
      // Wait times
      longestWait: waitTime.longestWait,
      longestAnswer: waitTime.longestAnswer,
      longestAbandoned: waitTime.longestAbandoned,
      // Performance
      percentAnswered: activity.percentAnswered,
    };
  });
}

// Generate donut chart data with all three segments
function generateDonutData(stats: CallCenterStats): DonutItem[] {
  const totalWithBounced = stats.total + stats.bounced;

  return [
    {
      name: "Besvaret",
      value: stats.answered / totalWithBounced,
      color: "#2DD4BF", // Teal/green for answered
    },
    {
      name: "Ubesvaret",
      value: stats.abandoned / totalWithBounced,
      color: "#F97066", // Red for abandoned/unanswered
    },
    {
      name: "Afbrudte",
      value: stats.bounced / totalWithBounced,
      color: "#FFA600", // Orange for bounced calls
    },
  ];
}

// Generate agent statistics
function generateAgentStats(stats: CallCenterStats): AgentStats {
  const totalAgents = generateRandomCalls(10, 15);

  return {
    totalAgents,
    avgResponseTimePerAgent: createTimeString(1, generateRandomCalls(0, 30)),
    avgCallsPerAgent: Math.round(stats.total / totalAgents),
    agentAvailability: generateRandomCalls(85, 98),
  };
}

// Generate timing metrics
function generateTimingMetrics(): TimingMetrics {
  return {
    avgWaitTimeAllCalls: createTimeString(0, generateRandomCalls(30, 55)),
    avgTalkTime: createTimeString(3, generateRandomCalls(0, 30)),
    percentAnsweredIn30Secs: generateRandomCalls(55, 75),
    avgAfterCallWork: createTimeString(1, generateRandomCalls(0, 45)),
  };
}

// Generate performance metrics
function generatePerformanceMetrics(
  stats: CallCenterStats
): PerformanceMetrics {
  const trendDirection = Math.random() > 0.5 ? "up" : "down";

  return {
    slaPerformance: stats.percentAnsweredIn60SecsOfAnswered,
    trendDirection,
    trendChange: generateRandomCalls(1, 10).toString(),
    csatScore: 3.5 + Math.random() * 1.5,
    fcrRate: generateRandomCalls(70, 90),
  };
}

// Generate service targets
function generateServiceTargets(): ServiceTargets {
  return {
    serviceLevel: 80,
    responseRate: 75,
    maxWaitTime: "02:00",
    maxAbandonRate: 25,
  };
}

// Create a function to get current timestamp for the report generation
export const getReportGeneratedTime = (): string => {
  return format(new Date(), "dd-MM-yyyy, HH:mm");
};

// Generate data for all time periods
const LAST_7_DAYS = generateDataForPeriod(7);
const LAST_14_DAYS = generateDataForPeriod(14);
const LAST_30_DAYS = generateDataForPeriod(30);
const LAST_90_DAYS = generateDataForPeriod(90);
const LAST_YEAR = generateDataForPeriod(365);

// Generate a previous period for comparison (to show deltas)
const PREV_7_DAYS = generateDataForPeriod(14).stats;
const PREV_14_DAYS = generateDataForPeriod(28).stats;
const PREV_30_DAYS = generateDataForPeriod(60).stats;
const PREV_90_DAYS = generateDataForPeriod(180).stats;
const PREV_YEAR = generateDataForPeriod(730).stats;

// Generate daily activity data
const DAILY_ACTIVITY_7_DAYS = generateDailyCallActivity(7);
const DAILY_ACTIVITY_14_DAYS = generateDailyCallActivity(14);
const DAILY_ACTIVITY_30_DAYS = generateDailyCallActivity(30);
const DAILY_ACTIVITY_90_DAYS = generateDailyCallActivity(90);
const DAILY_ACTIVITY_YEAR = generateDailyCallActivity(365);

// Generate wait time data
const WAIT_TIME_DATA_7_DAYS = generateWaitTimeData(7);
const WAIT_TIME_DATA_14_DAYS = generateWaitTimeData(14);
const WAIT_TIME_DATA_30_DAYS = generateWaitTimeData(30);
const WAIT_TIME_DATA_90_DAYS = generateWaitTimeData(90);
const WAIT_TIME_DATA_YEAR = generateWaitTimeData(365);

// Generate combined activity data
const COMBINED_ACTIVITY_7_DAYS = generateCombinedActivityData(
  DAILY_ACTIVITY_7_DAYS,
  WAIT_TIME_DATA_7_DAYS
);
const COMBINED_ACTIVITY_14_DAYS = generateCombinedActivityData(
  DAILY_ACTIVITY_14_DAYS,
  WAIT_TIME_DATA_14_DAYS
);
const COMBINED_ACTIVITY_30_DAYS = generateCombinedActivityData(
  DAILY_ACTIVITY_30_DAYS,
  WAIT_TIME_DATA_30_DAYS
);
const COMBINED_ACTIVITY_90_DAYS = generateCombinedActivityData(
  DAILY_ACTIVITY_90_DAYS,
  WAIT_TIME_DATA_90_DAYS
);
const COMBINED_ACTIVITY_YEAR = generateCombinedActivityData(
  DAILY_ACTIVITY_YEAR,
  WAIT_TIME_DATA_YEAR
);

// Generate trend data
const TREND_DATA_7_DAYS = generateTrendData(7);
const TREND_DATA_14_DAYS = generateTrendData(14);
const TREND_DATA_30_DAYS = generateTrendData(30);
const TREND_DATA_90_DAYS = generateTrendData(90);
const TREND_DATA_YEAR = generateTrendData(365);

// Generate heatmap data
const HEATMAP_DATA_7_DAYS = generateHeatmapData(DAILY_ACTIVITY_7_DAYS);
const HEATMAP_DATA_14_DAYS = generateHeatmapData(DAILY_ACTIVITY_14_DAYS);
const HEATMAP_DATA_30_DAYS = generateHeatmapData(DAILY_ACTIVITY_30_DAYS);
const HEATMAP_DATA_90_DAYS = generateHeatmapData(DAILY_ACTIVITY_90_DAYS);
const HEATMAP_DATA_YEAR = generateHeatmapData(DAILY_ACTIVITY_YEAR);

// Generate weekly summary
const WEEKLY_SUMMARY_7_DAYS = generateWeeklySummary(DAILY_ACTIVITY_7_DAYS);
const WEEKLY_SUMMARY_14_DAYS = generateWeeklySummary(DAILY_ACTIVITY_14_DAYS);
const WEEKLY_SUMMARY_30_DAYS = generateWeeklySummary(DAILY_ACTIVITY_30_DAYS);
const WEEKLY_SUMMARY_90_DAYS = generateWeeklySummary(DAILY_ACTIVITY_90_DAYS);
const WEEKLY_SUMMARY_YEAR = generateWeeklySummary(DAILY_ACTIVITY_YEAR);

// Generate call statistics with deltas
const CALL_STATS_7_DAYS = generateCallStats(LAST_7_DAYS.stats, PREV_7_DAYS);
const CALL_STATS_14_DAYS = generateCallStats(LAST_14_DAYS.stats, PREV_14_DAYS);
const CALL_STATS_30_DAYS = generateCallStats(LAST_30_DAYS.stats, PREV_30_DAYS);
const CALL_STATS_90_DAYS = generateCallStats(LAST_90_DAYS.stats, PREV_90_DAYS);
const CALL_STATS_YEAR = generateCallStats(LAST_YEAR.stats, PREV_YEAR);

// Generate donut chart data
const DONUT_DATA_7_DAYS = generateDonutData(LAST_7_DAYS.stats);
const DONUT_DATA_14_DAYS = generateDonutData(LAST_14_DAYS.stats);
const DONUT_DATA_30_DAYS = generateDonutData(LAST_30_DAYS.stats);
const DONUT_DATA_90_DAYS = generateDonutData(LAST_90_DAYS.stats);
const DONUT_DATA_YEAR = generateDonutData(LAST_YEAR.stats);

// Generate service targets (same for all periods)
const SERVICE_TARGETS = generateServiceTargets();

// Generate additional metrics for time periods
const AGENT_STATS_7_DAYS = generateAgentStats(LAST_7_DAYS.stats);
const AGENT_STATS_14_DAYS = generateAgentStats(LAST_14_DAYS.stats);
const AGENT_STATS_30_DAYS = generateAgentStats(LAST_30_DAYS.stats);
const AGENT_STATS_90_DAYS = generateAgentStats(LAST_90_DAYS.stats);
const AGENT_STATS_YEAR = generateAgentStats(LAST_YEAR.stats);

const TIMING_METRICS_7_DAYS = generateTimingMetrics();
const TIMING_METRICS_14_DAYS = generateTimingMetrics();
const TIMING_METRICS_30_DAYS = generateTimingMetrics();
const TIMING_METRICS_90_DAYS = generateTimingMetrics();
const TIMING_METRICS_YEAR = generateTimingMetrics();

const PERFORMANCE_METRICS_7_DAYS = generatePerformanceMetrics(
  LAST_7_DAYS.stats
);
const PERFORMANCE_METRICS_14_DAYS = generatePerformanceMetrics(
  LAST_14_DAYS.stats
);
const PERFORMANCE_METRICS_30_DAYS = generatePerformanceMetrics(
  LAST_30_DAYS.stats
);
const PERFORMANCE_METRICS_90_DAYS = generatePerformanceMetrics(
  LAST_90_DAYS.stats
);
const PERFORMANCE_METRICS_YEAR = generatePerformanceMetrics(LAST_YEAR.stats);

// Export data with time ranges
export const mockDataByTimeRange: Record<string, TimeRangeData> = {
  "Sidste 7 dage": {
    companyName: "Sundk callcenter",
    callCenterStats: LAST_7_DAYS.stats,
    callStats: CALL_STATS_7_DAYS,
    donutData: DONUT_DATA_7_DAYS,
    weeklyCallActivity: WEEKLY_SUMMARY_7_DAYS,
    responseRateTrend: TREND_DATA_7_DAYS,
    reportDateRange: LAST_7_DAYS.dateRange,
    waitTimeData: WAIT_TIME_DATA_7_DAYS,
    dailyCallActivity: DAILY_ACTIVITY_7_DAYS,
    callHeatmapData: HEATMAP_DATA_7_DAYS,
    serviceTargets: SERVICE_TARGETS,
    agentStats: AGENT_STATS_7_DAYS,
    timingMetrics: TIMING_METRICS_7_DAYS,
    performanceMetrics: PERFORMANCE_METRICS_7_DAYS,
    combinedActivityData: COMBINED_ACTIVITY_7_DAYS,
  },
  "Sidste 14 dage": {
    companyName: "Sundk callcenter",
    callCenterStats: LAST_14_DAYS.stats,
    callStats: CALL_STATS_14_DAYS,
    donutData: DONUT_DATA_14_DAYS,
    weeklyCallActivity: WEEKLY_SUMMARY_14_DAYS,
    responseRateTrend: TREND_DATA_14_DAYS,
    reportDateRange: LAST_14_DAYS.dateRange,
    waitTimeData: WAIT_TIME_DATA_14_DAYS,
    dailyCallActivity: DAILY_ACTIVITY_14_DAYS,
    callHeatmapData: HEATMAP_DATA_14_DAYS,
    serviceTargets: SERVICE_TARGETS,
    agentStats: AGENT_STATS_14_DAYS,
    timingMetrics: TIMING_METRICS_14_DAYS,
    performanceMetrics: PERFORMANCE_METRICS_14_DAYS,
    combinedActivityData: COMBINED_ACTIVITY_14_DAYS,
  },
  "Sidste 30 dage": {
    companyName: "Sundk callcenter",
    callCenterStats: LAST_30_DAYS.stats,
    callStats: CALL_STATS_30_DAYS,
    donutData: DONUT_DATA_30_DAYS,
    weeklyCallActivity: WEEKLY_SUMMARY_30_DAYS,
    responseRateTrend: TREND_DATA_30_DAYS,
    reportDateRange: LAST_30_DAYS.dateRange,
    waitTimeData: WAIT_TIME_DATA_30_DAYS,
    dailyCallActivity: DAILY_ACTIVITY_30_DAYS,
    callHeatmapData: HEATMAP_DATA_30_DAYS,
    serviceTargets: SERVICE_TARGETS,
    agentStats: AGENT_STATS_30_DAYS,
    timingMetrics: TIMING_METRICS_30_DAYS,
    performanceMetrics: PERFORMANCE_METRICS_30_DAYS,
    combinedActivityData: COMBINED_ACTIVITY_30_DAYS,
  },
  "Sidste 90 dage": {
    companyName: "Sundk callcenter",
    callCenterStats: LAST_90_DAYS.stats,
    callStats: CALL_STATS_90_DAYS,
    donutData: DONUT_DATA_90_DAYS,
    weeklyCallActivity: WEEKLY_SUMMARY_90_DAYS,
    responseRateTrend: TREND_DATA_90_DAYS,
    reportDateRange: LAST_90_DAYS.dateRange,
    waitTimeData: WAIT_TIME_DATA_90_DAYS,
    dailyCallActivity: DAILY_ACTIVITY_90_DAYS,
    callHeatmapData: HEATMAP_DATA_90_DAYS,
    serviceTargets: SERVICE_TARGETS,
    agentStats: AGENT_STATS_90_DAYS,
    timingMetrics: TIMING_METRICS_90_DAYS,
    performanceMetrics: PERFORMANCE_METRICS_90_DAYS,
    combinedActivityData: COMBINED_ACTIVITY_90_DAYS,
  },
  "Sidste år": {
    companyName: "Sundk callcenter",
    callCenterStats: LAST_YEAR.stats,
    callStats: CALL_STATS_YEAR,
    donutData: DONUT_DATA_YEAR,
    weeklyCallActivity: WEEKLY_SUMMARY_YEAR,
    responseRateTrend: TREND_DATA_YEAR,
    reportDateRange: LAST_YEAR.dateRange,
    waitTimeData: WAIT_TIME_DATA_YEAR,
    dailyCallActivity: DAILY_ACTIVITY_YEAR,
    callHeatmapData: HEATMAP_DATA_YEAR,
    serviceTargets: SERVICE_TARGETS,
    agentStats: AGENT_STATS_YEAR,
    timingMetrics: TIMING_METRICS_YEAR,
    performanceMetrics: PERFORMANCE_METRICS_YEAR,
    combinedActivityData: COMBINED_ACTIVITY_YEAR,
  },
};

// Default exports for backward compatibility
export const callCenterStats = LAST_7_DAYS.stats;
export const callStats = CALL_STATS_7_DAYS;
export const donutData = DONUT_DATA_7_DAYS;
export const weeklyCallActivity = WEEKLY_SUMMARY_7_DAYS;
export const responseRateTrend = TREND_DATA_7_DAYS;
export const reportDateRange = LAST_7_DAYS.dateRange;
export const waitTimeData = WAIT_TIME_DATA_7_DAYS;
export const dailyCallActivity = DAILY_ACTIVITY_7_DAYS;
export const callHeatmapData = HEATMAP_DATA_7_DAYS;
export const combinedActivityData = COMBINED_ACTIVITY_7_DAYS;

// Export available time ranges
export const availableTimeRanges = [
  "Sidste 7 dage",
  "Sidste 14 dage",
  "Sidste 30 dage",
  "Sidste 90 dage",
  "Sidste år",
];
