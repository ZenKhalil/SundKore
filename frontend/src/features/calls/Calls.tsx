// src/features/calls/Calls.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from "recharts";
import {
  Download,
  ChevronDown,
  FileText,
  Clock,
  Phone,
  PhoneOff,
  BarChart3,
  Layers,
  BarChart2,
  BarChart as BarChartIcon,
  AlertCircle,
  Calendar,
  Users,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Timer,
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

// Import types
import type {
  AgentStats,
  TimingMetrics,
  PerformanceMetrics,
  CombinedActivityItem,
} from "./callsMockData";

// Interface for label props for the donut chart
interface RenderLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  value: number;
  name: string;
  index: number;
}

// Custom tooltip interface
interface HeatmapTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: [number, number, number, string, number];
  }>;
}

// Extended interface
interface ExtendedCombinedActivityItem extends CombinedActivityItem {
  bounced?: number;
}

interface TransformedData {
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

export const Calls: React.FC = () => {
  // State for data loading
  const [rawData, setRawData] = useState<TransformedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // State for Activity Chart
  const [activityData, setActivityData] = useState<Record<
    string,
    any[]
  > | null>(null);
  const [activityPeriod, setActivityPeriod] = useState("weekly");
  const [chartType, setChartType] = useState("stacked");

  // Time filter state
  const [timeFrame, setTimeFrame] = useState("Sidste 30 dage");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Other state
  const [heatmapView, setHeatmapView] = useState<"queued" | "answered">(
    "queued"
  );
  const [expandedTables, setExpandedTables] = useState({
    waitTimes: false,
    dailyActivity: false,
    combinedActivity: false,
  });

  // State for table filtering
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Available time ranges
  const availableTimeRanges = [
    "Sidste 7 dage",
    "Sidste 30 dage",
    "Sidste 90 dage",
    "I år",
  ];

  // Generate month options
  const monthOptions = [
    { value: "01", label: "Januar" },
    { value: "02", label: "Februar" },
    { value: "03", label: "Marts" },
    { value: "04", label: "April" },
    { value: "05", label: "Maj" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Day names for heatmap
  const dayNames = ["Man", "Tir", "Ons", "Tor", "Fre"];
  const fullDayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

  // ===== ACTIVITY CHART HELPER FUNCTIONS =====

  // Format date as DD-MM
  const formatDateDDMM = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}-${month}`;
  };

  // Get activity data based on period
  const getActivityData = () => {
    if (!currentData) return [];

    // Check if we already have cached data for this period
    if (activityData && activityData[activityPeriod]) {
      return activityData[activityPeriod];
    }

    // Generate the appropriate data
    let periodData;
    switch (activityPeriod) {
      case "weekly":
        periodData = currentData.weeklyCallActivity || [];
        break;
      case "monthly":
        periodData = generateProperPeriodData(
          currentData.combinedActivityData,
          30
        );
        break;
      case "yearly":
        periodData = generateProperYearlyData(currentData.combinedActivityData);
        break;
      default:
        periodData = currentData.weeklyCallActivity || [];
    }

    // Cache the data for future use
    setActivityData((prev) => ({
      ...prev,
      [activityPeriod]: periodData,
    }));

    return periodData;
  };

  // Generate data for a specific period (days)
  const generateProperPeriodData = (
    combinedData: ExtendedCombinedActivityItem[],
    days = 30
  ) => {
    if (!combinedData || !combinedData.length) return [];

    // Create a map to group by day
    const dailyData = new Map();

    // Extract dates directly from data to get actual min/max dates in the filtered dataset
    const dates = combinedData.map((item) => {
      const [day, month, year] = item.date.split("-").map(Number);
      return new Date(year, month - 1, day);
    });

    // Get actual date range from the data
    dates.sort((a, b) => a.getTime() - b.getTime());
    const minDate = dates.length > 0 ? new Date(dates[0]) : new Date();
    const maxDate =
      dates.length > 0 ? new Date(dates[dates.length - 1]) : new Date();

    // Initialize all days in the actual data range
    const daysDiff =
      Math.ceil(
        (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(minDate);
      date.setDate(minDate.getDate() + i);

      // Format key as DD-MM for display
      const dayMonth = formatDateDDMM(date);

      dailyData.set(dayMonth, {
        name: dayMonth,
        date: new Date(date), // Keep full date for sorting
        besvaret: 0,
        ubesvaret: 0,
        abandoned: 0,
        afbrudte: 0, // Add specific tracking for bounced calls
      });
    }

    // Initialize daily totals for calculation verification
    let totalPresented = 0;
    let totalAnswered = 0;
    let totalAbandoned = 0;
    let totalBounced = 0;

    // Populate with actual data
    combinedData.forEach((item) => {
      try {
        const [day, month, year] = item.date.split("-").map(Number);
        const itemDate = new Date(year, month - 1, day);
        const key = formatDateDDMM(itemDate);

        // Track totals for verification
        totalPresented += item.presented;
        totalAnswered += item.answered;
        totalAbandoned += item.abandoned;
        totalBounced += item.bounced || 0;

        if (dailyData.has(key)) {
          const entry = dailyData.get(key);
          entry.besvaret += item.answered;
          entry.abandoned += item.abandoned;
          entry.afbrudte += item.bounced || 0;

          // For chart display, combine abandoned and bounced into ubesvaret
          entry.ubesvaret = entry.abandoned + entry.afbrudte;
        }
      } catch (error) {
        console.error(`Error processing date: ${item.date}`, error);
      }
    });

    // Log verification totals to match against main dashboard
    console.log("Activity Data Totals:", {
      presented: totalPresented,
      answered: totalAnswered,
      abandoned: totalAbandoned,
      bounced: totalBounced,
      timeRange: `${formatDateDDMM(minDate)} - ${formatDateDDMM(maxDate)}`,
    });

    // Convert map to array and sort by date
    return Array.from(dailyData.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, ...rest }) => rest); // Remove date used for sorting
  };

  // Generate yearly data from actual data
  const generateProperYearlyData = (
    combinedData: ExtendedCombinedActivityItem[]
  ) => {
    if (!combinedData || !combinedData.length) return [];

    // Use the month labels from monthOptions
    const monthsMap: Record<number, string> = {};
    monthOptions.forEach((month) => {
      monthsMap[parseInt(month.value)] = month.label.substring(0, 3); // Use first 3 chars as short month name
    });

    // Create a map to group by month
    const monthlyData = new Map();

    // Extract dates from the filtered data to determine actual range
    const dates = combinedData.map((item) => {
      const [day, month, year] = item.date.split("-").map(Number);
      return new Date(year, month - 1, day);
    });

    // Sort dates and get min/max
    dates.sort((a, b) => a.getTime() - b.getTime());
    const minDate = dates.length > 0 ? new Date(dates[0]) : new Date();
    const maxDate =
      dates.length > 0 ? new Date(dates[dates.length - 1]) : new Date();

    // Calculate number of months between min and max dates
    const monthDiff =
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
      maxDate.getMonth() -
      minDate.getMonth() +
      1;

    // Initialize all months in the actual data range
    for (let i = 0; i < monthDiff; i++) {
      const date = new Date(minDate);
      date.setMonth(minDate.getMonth() + i);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month}`;
      const shortMonth = monthsMap[month] || month.toString();

      monthlyData.set(monthKey, {
        name: shortMonth,
        sortKey: monthKey, // For sorting
        besvaret: 0,
        ubesvaret: 0,
        abandoned: 0,
        afbrudte: 0,
      });
    }

    // Initialize monthly totals for verification
    let totalPresented = 0;
    let totalAnswered = 0;
    let totalAbandoned = 0;
    let totalBounced = 0;

    // Populate with actual data
    combinedData.forEach((item) => {
      try {
        const [day, month, year] = item.date.split("-").map(Number);
        const itemDate = new Date(year, month - 1, day);
        const key = `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}`;

        // Track totals for verification
        totalPresented += item.presented;
        totalAnswered += item.answered;
        totalAbandoned += item.abandoned;
        totalBounced += item.bounced || 0;

        if (monthlyData.has(key)) {
          const entry = monthlyData.get(key);
          entry.besvaret += item.answered;
          entry.abandoned += item.abandoned;
          entry.afbrudte += item.bounced || 0;

          // For chart display, combine abandoned and bounced into ubesvaret
          entry.ubesvaret = entry.abandoned + entry.afbrudte;
        }
      } catch (error) {
        console.error(`Error processing date: ${item.date}`, error);
      }
    });

    // Log verification totals to match against main dashboard
    console.log("Yearly Activity Data Totals:", {
      presented: totalPresented,
      answered: totalAnswered,
      abandoned: totalAbandoned,
      bounced: totalBounced,
      timeRange: `${formatDateDDMM(minDate)} - ${formatDateDDMM(maxDate)}`,
    });

    // Convert map to array and sort by date
    const result = Array.from(monthlyData.values()).sort((a, b) => {
      const [yearA, monthA] = a.sortKey.split("-").map(Number);
      const [yearB, monthB] = b.sortKey.split("-").map(Number);

      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    // Remove the sortKey property
    return result.map(({ sortKey, ...rest }) => rest);
  };

  // Calculate total calls - use the SAME total as the main dashboard
  const getTotalCalls = () => {
    // Use the same value from the main dashboard stats
    if (currentData?.callCenterStats?.presented) {
      return currentData.callCenterStats.presented;
    }

    // Fallback to calculated value only if stats aren't available
    const data = getActivityData();
    const total = data.reduce(
      (sum: number, item: any) =>
        sum + (item.besvaret || 0) + (item.ubesvaret || 0),
      0
    );

    return total;
  };

  // Calculate answer rate - match the main dashboard percentage
  const getAnswerRate = () => {
    // Use the same calculation as the main dashboard
    if (currentData?.callCenterStats) {
      const { answered, presented } = currentData.callCenterStats;
      return presented > 0 ? Math.round((answered / presented) * 100) : 0;
    }

    // Fallback calculation only if stats aren't available
    const data = getActivityData();
    const total = data.reduce(
      (sum: number, item: any) =>
        sum + (item.besvaret || 0) + (item.ubesvaret || 0),
      0
    );
    const answered = data.reduce(
      (sum: number, item: any) => sum + (item.besvaret || 0),
      0
    );
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  };

  // Calculate average daily calls based on dashboard data
  const getAverageDailyCalls = () => {
    // First, get total calls from dashboard data
    const total = getTotalCalls();

    // Get date range from currentData if available
    if (currentData?.reportDateRange) {
      const rangeParts = currentData.reportDateRange.split(" - ");
      if (rangeParts.length === 2) {
        try {
          const [startDay, startMonth, startYear] = rangeParts[0]
            .split("-")
            .map(Number);
          const [endDay, endMonth, endYear] = rangeParts[1]
            .split("-")
            .map(Number);

          const startDate = new Date(startYear, startMonth - 1, startDay);
          const endDate = new Date(endYear, endMonth - 1, endDay);

          // Calculate actual days in range
          const daysDiff =
            Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
          return Math.round(total / daysDiff);
        } catch (error) {
          console.error("Error parsing date range:", error);
        }
      }
    }

    // Fallback to period-based calculation
    let divisor;
    switch (activityPeriod) {
      case "weekly":
        divisor = 7;
        break;
      case "monthly":
        divisor = 30;
        break;
      case "yearly":
        const now = new Date();
        const isLeapYear = new Date(now.getFullYear(), 1, 29).getDate() === 29;
        divisor = isLeapYear ? 366 : 365;
        break;
      default:
        divisor = getActivityData().length || 1;
    }

    return Math.round(total / divisor);
  };

  // Get consistent total for bar tooltip calculations
  const getTotalForBar = (dataPoint: any) => {
    // Include all relevant categories
    return (
      (dataPoint.besvaret || 0) +
      (dataPoint.ubesvaret || 0) +
      (dataPoint.afbrudte || 0)
    );
  };

  // Get accurate date range for the selected period based on actual data
  const getActivityPeriodLabel = () => {
    // If we have the report date range, use that
    if (currentData?.reportDateRange) {
      return currentData.reportDateRange;
    }

    // Otherwise generate based on period
    const today = new Date();

    switch (activityPeriod) {
      case "weekly": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        return `${formatDateDDMM(weekStart)} - ${formatDateDDMM(today)}`;
      }
      case "monthly": {
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 29);
        return `${formatDateDDMM(monthStart)} - ${formatDateDDMM(today)}`;
      }
      case "yearly": {
        const yearStart = new Date(today);
        yearStart.setFullYear(today.getFullYear() - 1);
        yearStart.setDate(today.getDate() + 1);
        return `${formatDateDDMM(yearStart)} - ${formatDateDDMM(today)}`;
      }
      default:
        return "Seneste 7 dage";
    }
  };
  
  // Function to filter data based on selected time frame
  const filterDataByTimeFrame = (data: TransformedData): TransformedData => {
    if (!data) return data;

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();

    switch (timeFrame) {
      case "Sidste 7 dage":
        startDate.setDate(today.getDate() - 7);
        break;
      case "Sidste 30 dage":
        startDate.setDate(today.getDate() - 30);
        break;
      case "Sidste 90 dage":
        startDate.setDate(today.getDate() - 90);
        break;
      case "I år":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case "Tilpasset periode":
        if (customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);

          const filteredCombinedData = data.combinedActivityData.filter(
            (item) => {
              const [day, month, year] = item.date.split("-").map(Number);
              const itemDate = new Date(year, month - 1, day);
              return itemDate >= startDate && itemDate <= endDate;
            }
          );

          return {
            ...data,
            combinedActivityData: filteredCombinedData,
            callCenterStats: recalculateCallStats(filteredCombinedData),
            weeklyCallActivity: generateWeeklyActivity(filteredCombinedData),
            responseRateTrend: generateResponseRateTrend(filteredCombinedData),
            callHeatmapData: generateHeatmapData(filteredCombinedData),
            donutData: generateDonutData(filteredCombinedData),
            callStats: generateCallStats(filteredCombinedData),
          };
        }
        return data;
      default:
        return data;
    }

    const filteredCombinedData = data.combinedActivityData.filter((item) => {
      const [day, month, year] = item.date.split("-").map(Number);
      const itemDate = new Date(year, month - 1, day);
      return itemDate >= startDate && itemDate <= today;
    });

    return {
      ...data,
      combinedActivityData: filteredCombinedData,
      callCenterStats: recalculateCallStats(filteredCombinedData),
      weeklyCallActivity: generateWeeklyActivity(filteredCombinedData),
      responseRateTrend: generateResponseRateTrend(filteredCombinedData),
      callHeatmapData: generateHeatmapData(filteredCombinedData),
      donutData: generateDonutData(filteredCombinedData),
      callStats: generateCallStats(filteredCombinedData),
    };
  };

  // Function to recalculate call stats from filtered data
  const recalculateCallStats = (data: ExtendedCombinedActivityItem[]) => {
    // Log the data to see what's coming in
    const totals = data.reduce(
      (acc, item) => ({
        presented: acc.presented + item.presented,
        answered: acc.answered + item.answered,
        abandoned: acc.abandoned + item.abandoned,
        bounced: acc.bounced + (item.bounced || 0),
        answeredIn60Secs: acc.answeredIn60Secs + item.answeredIn60Secs,
        queued: acc.queued + item.queued,
      }),
      {
        presented: 0,
        answered: 0,
        abandoned: 0,
        bounced: 0,
        answeredIn60Secs: 0,
        queued: 0,
      }
    );

    const percentAnsweredIn60SecsOfAnswered =
      totals.answered > 0
        ? Math.round((totals.answeredIn60Secs / totals.answered) * 100)
        : 0;

    // Calculate average wait time
    let totalWaitSeconds = 0;
    let waitCount = 0;
    data.forEach((item) => {
      if (item.longestWait && item.longestWait !== "00:00:00") {
        const [hours, minutes, seconds] = item.longestWait
          .split(":")
          .map(Number);
        totalWaitSeconds += hours * 3600 + minutes * 60 + seconds;
        waitCount++;
      }
    });
    const avgWaitSeconds = waitCount > 0 ? totalWaitSeconds / waitCount : 0;
    const avgWaitTime = `00:${Math.floor(avgWaitSeconds / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(avgWaitSeconds % 60)
      .toString()
      .padStart(2, "0")}`;

    return {
      ...totals,
      percentAnsweredIn60SecsOfAnswered,
      avgWaitTime,
      longestWaitTime: data.reduce((max, item) => {
        if (!item.longestWait) return max;
        return item.longestWait > max ? item.longestWait : max;
      }, "00:00:00"),
      avgTalkTime: "00:03:45",
      avgTaskTime: "00:05:30",
      avgQueueTime: "00:02:15",
      callsPerHour: Math.round(totals.presented / (data.length || 1)),
    };
  };

  // Function to generate donut data
  const generateDonutData = (data: ExtendedCombinedActivityItem[]) => {
    const totals = data.reduce(
      (acc, item) => ({
        answered: acc.answered + item.answered,
        abandoned: acc.abandoned + item.abandoned,
        bounced: acc.bounced + (item.bounced || 0),
        total: acc.total + item.presented,
      }),
      { answered: 0, abandoned: 0, bounced: 0, total: 0 }
    );

    const total = totals.total || 1;

    return [
      {
        name: "Besvaret",
        value: totals.answered / total,
        color: "#2DD4BF",
      },
      {
        name: "Ubesvaret",
        value: totals.abandoned / total,
        color: "#F97066",
      },
      {
        name: "Afbrudte",
        value: totals.bounced / total,
        color: "#FFA600",
      },
    ];
  };

  // Function to generate call stats
  const generateCallStats = (data: ExtendedCombinedActivityItem[]) => {
    const stats = recalculateCallStats(data);

    return [
      {
        id: 1,
        label: "Total opkald",
        count: stats.presented,
        change: "+5%",
        increasing: true,
      },
      {
        id: 2,
        label: "Besvaret",
        count: stats.answered,
        change: "+3%",
        increasing: true,
      },
      {
        id: 3,
        label: "Ubesvaret",
        count: stats.abandoned,
        change: "-2%",
        increasing: false,
      },
      {
        id: 4,
        label: "Service Niveau",
        count: `${stats.percentAnsweredIn60SecsOfAnswered}%`,
        change: "+1%",
        increasing: true,
      },
      {
        id: 5,
        label: "Afbrudte opkald",
        count: stats.bounced,
        change: "0%", // Placeholder change value
        increasing: false, // Usually we want fewer bounced calls
      },
    ];
  };

  // Function to transform backend data to match frontend structure
  const transformData = (data: any): TransformedData => {
    const total = data.callCenterStats.presented || 1;

    // Calculate the bounced percentage
    const bouncedPercentage = Math.round(
      ((data.callCenterStats.bounced || 0) / total) * 100
    );

    return {
      ...data,
      serviceTargets: {
        serviceLevel: 80,
        responseRate: 75,
        maxWaitTime: "02:00",
        maxAbandonRate: 25,
        bouncedRate: 20,
      },
      donutData: [
        {
          name: "Besvaret",
          value: data.callCenterStats.answered / total,
          color: "#2DD4BF",
        },
        {
          name: "Ubesvaret",
          value: data.callCenterStats.abandoned / total,
          color: "#F97066",
        },
        {
          name: "Afbrudte",
          value: (data.callCenterStats.bounced || 0) / total,
          color: "#FFA600",
        },
      ],
      callStats: [
        {
          id: 1,
          label: "Total opkald",
          count: data.callCenterStats.presented,
          change: "+5%",
          increasing: true,
        },
        {
          id: 2,
          label: "Besvaret",
          count: data.callCenterStats.answered,
          change: "+3%",
          increasing: true,
        },
        {
          id: 3,
          label: "Ubesvaret",
          count: data.callCenterStats.abandoned,
          change: "-2%",
          increasing: false,
        },
        {
          id: 4,
          label: "Service Niveau",
          count: `${data.callCenterStats.percentAnsweredIn60SecsOfAnswered}%`,
          change: "+1%",
          increasing: true,
        },
        {
          id: 5,
          label: "Afbrudte opkald",
          count: `${bouncedPercentage}%`,
          change: "0%", // Placeholder
          increasing: false,
        },
      ],
      weeklyCallActivity:
        data.weeklyCallActivity ||
        generateWeeklyActivity(data.combinedActivityData),
      responseRateTrend:
        data.responseRateTrend ||
        generateResponseRateTrend(data.combinedActivityData),
      callHeatmapData:
        data.callHeatmapData || generateHeatmapData(data.combinedActivityData),
    };
  };

  // Helper function to generate weekly activity
  const generateWeeklyActivity = (data: ExtendedCombinedActivityItem[]) => {
    const activity = dayNames.map((day) => ({
      name: day,
      besvaret: 0,
      ubesvaret: 0,
      abandoned: 0,
    }));

    data.forEach((item) => {
      try {
        const [day, month, year] = item.date.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday-based index

        // Only include weekdays (0 = Monday to 4 = Friday)
        if (dayOfWeek < dayNames.length) {
          activity[dayOfWeek].besvaret += item.answered;
          activity[dayOfWeek].ubesvaret += item.abandoned;
          activity[dayOfWeek].abandoned += item.abandoned;

          // Include bounced calls in ubesvaret if available
          if (item.bounced) {
            activity[dayOfWeek].ubesvaret += item.bounced;
          }
        }
      } catch (error) {
        console.error(`Error processing date: ${item.date}`, error);
      }
    });

    return activity;
  };

  // Helper function to generate response rate trend
  const generateResponseRateTrend = (data: ExtendedCombinedActivityItem[]) => {
    const trend: any[] = [];
    const dateMap = new Map();

    data.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, {
          date: item.date,
          answered: 0,
          total: 0,
          answeredIn60: 0,
          abandoned: 0,
        });
      }

      const dayData = dateMap.get(item.date);
      dayData.answered += item.answered;
      dayData.total += item.queued;
      dayData.answeredIn60 += item.answeredIn60Secs;
      dayData.abandoned += item.abandoned;
    });

    Array.from(dateMap.values()).forEach((day) => {
      trend.push({
        day: day.date,
        besvaret: day.total > 0 ? (day.answered / day.total) * 100 : 0,
        ubesvaret: day.total > 0 ? (day.abandoned / day.total) * 100 : 0,
        besvaret60: day.total > 0 ? (day.answeredIn60 / day.total) * 100 : 0,
      });
    });

    trend.sort((a, b) => {
      const [dayA, monthA, yearA] = a.day.split("-").map(Number);
      const [dayB, monthB, yearB] = b.day.split("-").map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });

    return trend;
  };

  // Helper function to generate heatmap data
  const generateHeatmapData = (data: ExtendedCombinedActivityItem[]) => {
    const heatmapData: any[] = [];

    data.forEach((item) => {
      const [day, month, year] = item.date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      const dayOfWeek = (date.getDay() + 6) % 7;
      const hour = parseInt(item.time.split(":")[0]);

      if (hour >= 8 && hour <= 17) {
        heatmapData.push([
          hour,
          dayOfWeek,
          item.queued,
          item.date,
          item.answered,
        ]);
      }
    });

    return heatmapData;
  };

  // Fetch data from backend
  const fetchCallData = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000/api"
        }/calls/stats`
      );
      const transformedData = transformData(response.data);
      setRawData(transformedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch call data:", err);
      setError("Failed to load call data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000/api"
        }/calls/refresh`
      );
      await fetchCallData();
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setError("Failed to refresh data");
    }
  };

  // Toggle expanded tables
  const toggleTable = (
    table: "waitTimes" | "dailyActivity" | "combinedActivity"
  ) => {
    setExpandedTables({
      ...expandedTables,
      [table]: !expandedTables[table],
    });
  };

  // Utility function for formatting time
  const formatTime = (timeString: string): string => {
    if (!timeString || timeString === "00:00:00") return "-";
    const parts = timeString.split(":");
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);

    if (minutes === 0) {
      return `${seconds} sek`;
    } else {
      return `${minutes} min ${seconds} sek`;
    }
  };

  // Handle period filter
  const handlePeriodFilter = (days: number | null) => {
    setSelectedPeriod(days);
    setSelectedMonth("");
    setSelectedYear("");
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort indicator
  const getSortIndicator = (field: string) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  // Filter data based on selected criteria for the table
  const getFilteredTableData = () => {
    if (!rawData) return [];

    let filtered = rawData.combinedActivityData;

    // Filter by period
    if (selectedPeriod !== null) {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - selectedPeriod);

      filtered = filtered.filter((item) => {
        const [day, month, year] = item.date.split("-").map(Number);
        const itemDate = new Date(year, month - 1, day);
        return itemDate >= startDate;
      });
    }

    // Filter by month/year
    if (selectedMonth || selectedYear) {
      filtered = filtered.filter((item) => {
        const [day, month, year] = item.date.split("-").map(Number);
        const itemMonth = month.toString().padStart(2, "0");
        const itemYear = year.toString();

        if (selectedMonth && selectedYear) {
          return itemMonth === selectedMonth && itemYear === selectedYear;
        } else if (selectedMonth) {
          return itemMonth === selectedMonth;
        } else if (selectedYear) {
          return itemYear === selectedYear;
        }
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((item) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          item.date.toLowerCase().includes(searchLower) ||
          item.time.toLowerCase().includes(searchLower) ||
          item.answered.toString().includes(searchQuery) ||
          item.percentAnswered.toString().includes(searchQuery) ||
          item.queued.toString().includes(searchQuery) ||
          item.presented.toString().includes(searchQuery)
        );
      });
    }

    // Sort data
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        if (sortField === "date") {
          const [dayA, monthA, yearA] = a.date.split("-").map(Number);
          const [dayB, monthB, yearB] = b.date.split("-").map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          return sortDirection === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }

        if (sortField === "time") {
          const [hourA, minuteA] = a.time.split(":").map(Number);
          const [hourB, minuteB] = b.time.split(":").map(Number);
          const timeA = hourA * 60 + minuteA;
          const timeB = hourB * 60 + minuteB;
          return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
        }

        const aValue = a[sortField as keyof CombinedActivityItem];
        const bValue = b[sortField as keyof CombinedActivityItem];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aString = aValue?.toString() || "";
        const bString = bValue?.toString() || "";

        return sortDirection === "asc"
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }

    return filtered;
  };

  // Calculate average wait time
  const calculateAverageWaitTime = (data: ExtendedCombinedActivityItem[]) => {
    if (data.length === 0) return "00:00";

    const totalSeconds = data.reduce((sum, item) => {
      if (!item.longestWait) return sum;
      const [hours, minutes, seconds] = item.longestWait.split(":").map(Number);
      return sum + hours * 3600 + minutes * 60 + seconds;
    }, 0);

    const averageSeconds = totalSeconds / data.length;
    const minutes = Math.floor(averageSeconds / 60);
    const seconds = Math.floor(averageSeconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Export table data
  const exportTableData = () => {
    const filteredData = getFilteredTableData();

    // Convert to CSV
    const headers = [
      "Dato",
      "Tid",
      "I kø",
      "Præsenteret",
      "Besvaret",
      "<60s",
      "Ubesvaret",
      "Ventetid",
      "Svartid",
      "Afbrudt",
      "Svarprocent",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map((item) =>
        [
          item.date,
          item.time,
          item.queued,
          item.presented,
          item.answered,
          item.answeredIn60Secs,
          item.abandoned,
          `"${item.longestWait}"`,
          `"${item.longestAnswer}"`,
          `"${item.longestAbandoned}"`,
          `${item.percentAnswered}%`,
        ].join(",")
      ),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `call_center_data_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Label rendering function for donut chart
  const renderCustomizedLabel = (props: RenderLabelProps) => {
    const { cx, cy, midAngle, outerRadius, value } = props;
    const radian = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * radian);
    const y = cy + radius * Math.sin(-midAngle * radian);
    const percent = Math.round(value * 100);

    return (
      <g>
        <foreignObject x={x - 25} y={y - 15} width={50} height={30}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              padding: "3px 8px",
              color: "#333",
              fontWeight: "bold",
              fontSize: "14px",
              textAlign: "center",
              whiteSpace: "nowrap",
              display: "inline-block",
              fontFamily: "sans-serif",
            }}
          >
            {percent}%
          </div>
        </foreignObject>
      </g>
    );
  };

  // Utility function to get heatmap color based on value
  const getHeatmapColor = (val: number, maxVal: number): string => {
    const intensity = Math.min(0.95, val / maxVal);
    if (intensity < 0.2) return "rgba(237, 246, 255, 0.95)";
    else if (intensity < 0.4) return "rgba(191, 219, 254, 0.95)";
    else if (intensity < 0.6) return "rgba(96, 165, 250, 0.95)";
    else if (intensity < 0.8) return "rgba(59, 130, 246, 0.95)";
    else return "rgba(30, 64, 175, 0.95)";
  };

  // Utility function to get report generated time
  const getReportGeneratedTime = () => {
    return new Date().toLocaleString("da-DK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Effect to fetch data on mount
  useEffect(() => {
    fetchCallData();
  }, []);

  // Effect to clear activity data cache when time frame changes
  useEffect(() => {
    setActivityData(null);
  }, [timeFrame, customDateRange]);

  // Compute filtered data based on time frame
  const currentData = rawData ? filterDataByTimeFrame(rawData) : null;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Indlæser opkaldsdata...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  // If no data
  if (!currentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Ingen data tilgængelig</div>
      </div>
    );
  }

  // Get paginated data
  const filteredTableData = getFilteredTableData();
  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage);
  const paginatedData = filteredTableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Call Center Rapport
          </h1>
          <p className="text-gray-500">
            {currentData.companyName} - {currentData.reportDateRange}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Opdaterer..." : "Opdater"}
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download size={16} className="mr-2" />
            Download Rapport
          </button>
        </div>
      </div>

      {/* Time filter dropdown */}
      <div className="mb-6 flex items-center">
        <div className="mr-2">
          <Calendar size={18} className="text-gray-500" />
        </div>
        <span className="mr-2 text-sm text-gray-600">Periode:</span>
        <div className="relative inline-block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            {timeFrame}
            <ChevronDown size={16} className="ml-2" />
          </button>

          {isDropdownOpen && (
            <div className="absolute mt-1 z-10 bg-white shadow-lg rounded-md w-full">
              {availableTimeRanges.map((option) => (
                <div
                  key={option}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setTimeFrame(option);
                    setIsDropdownOpen(false);
                    if (option === "Tilpasset periode") {
                      setShowCustomDatePicker(true);
                    }
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom date range picker */}
        {showCustomDatePicker && (
          <div className="ml-4 flex items-center space-x-2">
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) =>
                setCustomDateRange({
                  ...customDateRange,
                  start: e.target.value,
                })
              }
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-sm">til</span>
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) =>
                setCustomDateRange({ ...customDateRange, end: e.target.value })
              }
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={() => {
                setShowCustomDatePicker(false);
                // Trigger data refresh with custom date range
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Anvend
            </button>
          </div>
        )}
      </div>

      {/* Summary banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
          {/* Total opkald */}
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Phone className="h-6 w-6 text-blue-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Total opkald</p>
              <p className="text-xl font-semibold text-blue-900">
                {currentData.callCenterStats.presented}
              </p>
            </div>
          </div>

          {/* Besvaret */}
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Besvaret</p>
              <p className="text-xl font-semibold text-blue-900">
                {currentData.callCenterStats.answered}
                <span className="text-sm ml-1 font-normal">
                  (
                  {Math.round(
                    (currentData.callCenterStats.answered /
                      currentData.callCenterStats.presented) *
                      100
                  ) || 0}
                  %)
                </span>
              </p>
            </div>
          </div>

          {/* Ubesvaret */}
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Ubesvaret</p>
              <p className="text-xl font-semibold text-blue-900">
                {currentData.callCenterStats.abandoned}
                <span className="text-sm ml-1 font-normal">
                  (
                  {Math.round(
                    (currentData.callCenterStats.abandoned /
                      currentData.callCenterStats.presented) *
                      100
                  ) || 0}
                  %)
                </span>
              </p>
            </div>
          </div>

          {/* Svartid <60s */}
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Timer className="h-6 w-6 text-indigo-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">
                Svartid &lt;60s
              </p>
              <p className="text-xl font-semibold text-blue-900">
                {currentData.callCenterStats.percentAnsweredIn60SecsOfAnswered}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1st Row: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* KPI Card 1 - Service Level */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center mb-1">
            <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 mr-2">
              <Clock size={16} />
            </div>
            <h3 className="text-sm font-medium text-gray-500">
              Service Niveau
            </h3>
          </div>
          <div className="mt-1 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {currentData.callCenterStats.percentAnsweredIn60SecsOfAnswered}%
            </p>
          </div>
          <div className="mt-auto pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{
                  width: `${currentData.callCenterStats.percentAnsweredIn60SecsOfAnswered}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>Mål: {currentData.serviceTargets.serviceLevel}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* KPI Card 2 - Response Rate */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center mb-1">
            <div className="p-2 rounded-md bg-green-50 text-green-600 mr-2">
              <Phone size={16} />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Svarprocent</h3>
          </div>
          <div className="mt-1 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(
                (currentData.callCenterStats.answered /
                  currentData.callCenterStats.presented) *
                  100
              ) || 0}
              %
            </p>
          </div>
          <div className="mt-auto pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    Math.round(
                      (currentData.callCenterStats.answered /
                        currentData.callCenterStats.presented) *
                        100
                    ) || 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>Mål: {currentData.serviceTargets.responseRate}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* KPI Card 3 - Longest Wait Time */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center mb-1">
            <div className="p-2 rounded-md bg-yellow-50 text-yellow-600 mr-2">
              <AlertCircle size={16} />
            </div>
            <h3 className="text-sm font-medium text-gray-500">
              Længste Ventetid
            </h3>
          </div>
          <div className="mt-1 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {formatTime(currentData.callCenterStats.longestWaitTime)}
            </p>
          </div>
          <div className="mt-auto pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500">
                  Gns. ventetid
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {formatTime(currentData.callCenterStats.avgWaitTime)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500">
                  Opkald/time
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {currentData.callCenterStats.callsPerHour}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Card 4 - Abandonment Rate */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center mb-1">
            <div className="p-2 rounded-md bg-red-50 text-red-600 mr-2">
              <PhoneOff size={16} />
            </div>
            <h3 className="text-sm font-medium text-gray-500">
              Ubesvaretprocent
            </h3>
          </div>
          <div className="mt-1 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(
                (currentData.callCenterStats.abandoned /
                  currentData.callCenterStats.presented) *
                  100
              ) || 0}
              %
            </p>
          </div>
          <div className="mt-auto pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${
                    Math.round(
                      (currentData.callCenterStats.abandoned /
                        currentData.callCenterStats.presented) *
                        100
                    ) || 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>Max: {currentData.serviceTargets.maxAbandonRate}%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        {/* KPI Card 5 - Bounce Rate (NEW) */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center mb-1">
            <div className="p-2 rounded-md bg-amber-50 text-amber-600 mr-2">
              <AlertTriangle size={16} />
            </div>
            <h3 className="text-sm font-medium text-gray-500">
              Afbrudte opkald
            </h3>
          </div>
          <div className="mt-1 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(
                ((currentData.callCenterStats.bounced || 0) /
                  currentData.callCenterStats.presented) *
                  100
              )}
              %
            </p>
            <div className="text-xs text-gray-500 mt-1">
              {currentData.callCenterStats.bounced} af{" "}
              {currentData.callCenterStats.presented} opkald
            </div>
          </div>
          <div className="mt-auto pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{
                  width: `${Math.round(
                    ((currentData.callCenterStats.bounced || 0) /
                      currentData.callCenterStats.presented) *
                      100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>Mål: {"<"}20%</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Section: Donut Chart + Målinger + Ugentlig aktivitet & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
        {/* LEFT STACK: Donut → Målinger → Ugentlig aktivitet */}
        <div className="flex flex-col space-y-2">
          {/* Donut Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                Fordeling af opkald
              </h3>
            </div>

            <div className="relative flex-1 flex justify-center items-center min-h-[250px]">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={currentData.donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {currentData.donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [
                      `${Math.round(Number(v) * 100)}%`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ pointerEvents: "none" }}
              >
                <span className="text-3xl font-bold text-gray-900">
                  {currentData.callCenterStats.presented}
                </span>
                <span className="text-sm text-gray-500">TOTAL OPKALD</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {currentData.donutData.map((entry) => (
                <div
                  key={entry.name}
                  className="px-3 py-1 rounded-full text-white text-xs font-medium"
                  style={{ backgroundColor: entry.color }}
                >
                  {entry.name.toUpperCase()} ({Math.round(entry.value * 100)}%)
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4"></div>
          </div>

          {/* Ugentlig aktivitet - Improved version */}
          <div className="bg-white rounded-xl shadow-sm p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 mr-2">
                  <BarChart3 size={16} />
                </div>
                <h3 className="text-sm font-medium text-gray-700">
                  Opkaldsaktivitet
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActivityPeriod("weekly")}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activityPeriod === "weekly"
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Ugentlig
                </button>
                <button
                  onClick={() => setActivityPeriod("monthly")}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activityPeriod === "monthly"
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Månedlig
                </button>
                <button
                  onClick={() => setActivityPeriod("yearly")}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activityPeriod === "yearly"
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Årlig
                </button>
              </div>
            </div>

            {/* Info section */}
            <div className=" flex items-center justify-between">
              <div className="text-xs text-gray-500 flex items-center">
                <Info size={12} className="mr-1" />
                Viser data for: {getActivityPeriodLabel()}
              </div>

              {/* Toggle between stacked and side-by-side */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setChartType("stacked")}
                  className={`p-1.5 rounded ${
                    chartType === "stacked"
                      ? "bg-gray-200 text-gray-700"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Stacked view"
                >
                  <Layers size={14} />
                </button>
                <button
                  onClick={() => setChartType("grouped")}
                  className={`p-1.5 rounded ${
                    chartType === "grouped"
                      ? "bg-gray-200 text-gray-700"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Grouped view"
                >
                  <BarChart2 size={14} />
                </button>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={getActivityData()}
                margin={{ top: 2, right: 30, left: 0, bottom: 0 }}
                barGap={chartType === "grouped" ? 4 : 0}
                barCategoryGap={chartType === "grouped" ? "20%" : "10%"}
              >
                <defs>
                  <linearGradient
                    id="colorBesvaret"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient
                    id="colorUbesvaret"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient
                    id="colorAbandoned"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.6} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  angle={activityPeriod === "yearly" ? -45 : 0}
                  textAnchor={activityPeriod === "yearly" ? "end" : "middle"}
                  height={activityPeriod === "yearly" ? 60 : 30}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={35}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  domain={[0, "auto"]}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} (${Math.round(
                      (value / getTotalForBar(props.payload)) * 100
                    )}%)`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={20}
                  iconType="circle"
                  iconSize={11}
                  formatter={(value) => (
                    <span style={{ fontSize: "13px" }}>{value}</span>
                  )}
                  wrapperStyle={{ top: -7 }}
                />
                <Bar
                  dataKey="besvaret"
                  fill="url(#colorBesvaret)"
                  radius={chartType === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  stackId={chartType === "stacked" ? "a" : undefined}
                  name="Besvaret"
                />
                <Bar
                  dataKey="abandoned"
                  fill="url(#colorAbandoned)"
                  radius={chartType === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  stackId={chartType === "stacked" ? "a" : undefined}
                  name="Afbrudte"
                />
                <Bar
                  dataKey="ubesvaret"
                  fill="url(#colorUbesvaret)"
                  radius={chartType === "stacked" ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                  stackId={chartType === "stacked" ? "a" : undefined}
                  name="Ubesvaret"
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Summary stats */}
            <div className="pt-1 border-t border-gray-100 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total opkald</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getTotalCalls()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Svarprocent</p>
                <p className="text-lg font-semibold text-green-600">
                  {getAnswerRate()}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Gennemsnitlig daglig</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getAverageDailyCalls()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Call Volume Heatmap */}
        <div className="bg-white rounded-xl shadow-sm p-3 self-start">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-blue-50 text-blue-600 mr-2">
                <Clock size={16} />
              </div>
              <h3 className="text-sm font-medium text-gray-700">
                Opkald fordelt på ugedag og time
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setHeatmapView("queued")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  heatmapView === "queued"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Opkald i kø
              </button>
              <button
                onClick={() => setHeatmapView("answered")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  heatmapView === "answered"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Besvarede opkald
              </button>
            </div>
          </div>

          <div className="mb-3 flex items-center">
            <div className="text-xs text-gray-500 flex items-center">
              <Info size={12} className="mr-1" />
              {`Grafikken viser ${
                heatmapView === "queued"
                  ? "antal opkald i kø"
                  : "antal besvarede opkald"
              } fordelt på ugedag og tidspunkt.`}
            </div>
          </div>

          <div>
            {/* Day headers - only weekdays */}
            <div className="flex">
              {/* Empty cell for time column - match the time label width */}
              <div className="w-25"></div>

              {/* Day headers - NO WRAPPER needed, grid directly */}
              <div
                className="grid grid-cols-5 gap-0.5 mr-4"
                style={{ width: "calc(90% - 80px)" }}
              >
                {dayNames.slice(0, 5).map((day) => (
                  <div
                    key={day}
                    className="text-sm font-medium text-center text-gray-700"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap rows - only 8-14 */}
            {[8, 9, 10, 11, 12, 13, 14].map((hour) => (
              <div key={hour} className="flex items-center">
                {/* Time label - showing time range */}
                <div className="w-25 text-sm text-gray-500 text-right pr-1">
                  {hour.toString().padStart(2, "0")}:00-
                  {(hour + 1).toString().padStart(2, "0")}:00
                </div>

                {/* Heatmap cells - only weekdays - WRAPPED IN A CONTAINER */}
                <div
                  className="grid grid-cols-5 gap-0.5 my-1 mr-4"
                  style={{ width: "calc(90% - 80px)" }}
                >
                  {[0, 1, 2, 3, 4].map((day) => {
                    const dataPoint = currentData.callHeatmapData.find(
                      (d) => d[0] === hour && d[1] === day
                    );

                    if (!dataPoint) {
                      return (
                        <div
                          key={`${hour}-${day}`}
                          className="aspect-square rounded flex items-center justify-center bg-gray-50"
                          style={{ width: "80%", margin: "0 auto" }}
                        />
                      );
                    }

                    const value =
                      heatmapView === "queued" ? dataPoint[2] : dataPoint[4];
                    const date = dataPoint[3];
                    const viewMax = Math.max(
                      ...currentData.callHeatmapData.map((d) =>
                        heatmapView === "queued" ? d[2] : d[4]
                      )
                    );
                    const isHigh = value > viewMax * 0.7;

                    return (
                      <div
                        key={`${hour}-${day}`}
                        className="group relative aspect-square rounded flex items-center justify-center transition-all duration-150 hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: getHeatmapColor(value, viewMax),
                          width: "80%",
                          margin: "0 auto",
                        }}
                      >
                        <span
                          className={`text-lg font-bold ${
                            isHigh ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {value > 0 ? value : ""}
                        </span>

                        {value > 0 && (
                          <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-1 z-10 transition-opacity duration-150 pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-max shadow-lg">
                              <p className="font-medium">
                                {fullDayNames[day]}, {date}
                              </p>
                              <p>Kl. {hour}:00</p>
                              <p className="font-medium mt-0.5">
                                {heatmapView === "queued"
                                  ? `${value} opkald i kø`
                                  : `${value} besvarede opkald`}
                              </p>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap Legend */}
          {/* Heatmap Legend */}
          <div className="mt-4 pt-2 border-t border-gray-100">
            {/* Wrapper for label + bjælke */}
            <div className="relative mb-1">
              {/* Label absolut placeret og vertikalt centreret */}
              <span className="text-xs text-gray-500 absolute left-2 top-1/2 -translate-y-1/2">
                Intensitet:
              </span>

              {/* Heatmap-bjælken, centreret i sit eget container */}
              <div className="max-w-md mx-25 ">
                <div className="flex items-center space-x-0.5">
                  <div
                    className="h-1.5 flex-grow rounded-l-full"
                    style={{ background: "rgba(237, 246, 255, 0.95)" }}
                  />
                  <div
                    className="h-1.5 flex-grow"
                    style={{ background: "rgba(191, 219, 254, 0.95)" }}
                  />
                  <div
                    className="h-1.5 flex-grow"
                    style={{ background: "rgba(96, 165, 250, 0.95)" }}
                  />
                  <div
                    className="h-1.5 flex-grow"
                    style={{ background: "rgba(59, 130, 246, 0.95)" }}
                  />
                  <div
                    className="h-1.5 flex-grow rounded-r-full"
                    style={{ background: "rgba(30, 64, 175, 0.95)" }}
                  />
                </div>
              </div>
            </div>

            {/* Undertekst: Få / Mange, også centreret med max-w-md */}
            <div className="max-w-md mx-20 flex justify-between text-xs text-gray-500">
              <span>Få opkald</span>
              <span>Mange opkald</span>
            </div>
          </div>
        </div>
      </div>

      {/* Response Rate and Service Level Trend */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Besvarelsesrate og service niveau trend
            </h3>
          </div>

          <div className="h-[300px] flex flex-col">
            <div className="h-[100%]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={currentData.responseRateTrend}
                  margin={{ top: 5, right: 60, left: 0, bottom: 2 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 5, right: 5 }}
                    tick={{ fontSize: "0.85rem" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: "0.85rem" }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${Math.round(value)}%`, ""]}
                    labelFormatter={(label) => `Dato: ${label}`}
                  />
                  <Legend />
                  <ReferenceLine
                    y={currentData.serviceTargets.responseRate}
                    stroke="#6B7280"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: `Mål: ${currentData.serviceTargets.responseRate}%`,
                      position: "right",
                      fill: "#6B7280",
                      fontSize: 12,
                    }}
                  />
                  <ReferenceLine
                    y={currentData.serviceTargets.serviceLevel}
                    stroke="#818CF8"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: `SLA: ${currentData.serviceTargets.serviceLevel}%`,
                      position: "right",
                      fill: "#818CF8",
                      fontSize: 12,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="besvaret"
                    stroke="#2DD4BF"
                    strokeWidth={2}
                    dot={{ fill: "#2DD4BF", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Besvaret (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="ubesvaret"
                    stroke="#F97066"
                    strokeWidth={2}
                    dot={{ fill: "#F97066", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Ubesvaret (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="besvaret60"
                    stroke="#818CF8"
                    strokeWidth={2}
                    dot={{ fill: "#818CF8", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Besvaret <60s (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Call Activity & Wait Times Table */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Call Center Aktivitet & Ydeevne
                </h3>
                <p className="text-xs text-gray-500">
                  Detaljeret oversigt over daglig aktivitet og ventetider
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Time Filter Buttons */}
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-500" />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "7 dage", value: 7 },
                    { label: "14 dage", value: 14 },
                    { label: "30 dage", value: 30 },
                    { label: "90 dage", value: 90 },
                    { label: "1 år", value: 365 },
                    { label: "Alle", value: null },
                  ].map((period) => (
                    <button
                      key={period.value || "all"}
                      onClick={() => handlePeriodFilter(period.value)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        selectedPeriod === period.value
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month/Year Selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setSelectedPeriod(null); // Clear period filter when selecting month
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Vælg måned</option>
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedPeriod(null); // Clear period filter when selecting year
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Vælg år</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <button
                onClick={() => exportTableData()}
                className="flex items-center px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Download size={14} className="mr-1" />
                Eksporter
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <div className="text-xs text-gray-500">Total opkald:</div>
                <div className="ml-2 text-sm font-semibold text-gray-900">
                  {filteredTableData.reduce(
                    (sum, item) => sum + item.presented,
                    0
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-xs text-gray-500">Gns. svarprocent:</div>
                <div className="ml-2 text-sm font-semibold text-green-600">
                  {filteredTableData.length > 0
                    ? Math.round(
                        filteredTableData.reduce(
                          (sum, item) => sum + item.percentAnswered,
                          0
                        ) / filteredTableData.length
                      )
                    : 0}
                  %
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-xs text-gray-500">Gns. ventetid:</div>
                <div className="ml-2 text-sm font-semibold text-purple-600">
                  {calculateAverageWaitTime(filteredTableData)}
                </div>
              </div>
              {/* Active filters display */}
              {(selectedPeriod || selectedMonth || selectedYear) && (
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-md">
                  <Filter size={12} className="text-blue-600 mr-1" />
                  <span className="text-xs text-blue-600">
                    {selectedPeriod && `Sidste ${selectedPeriod} dage`}
                    {selectedMonth &&
                      ` ${
                        monthOptions.find((m) => m.value === selectedMonth)
                          ?.label
                      }`}
                    {selectedYear && ` ${selectedYear}`}
                  </span>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Søg..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Filter
                size={14}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th colSpan={2} className="bg-gray-50 px-4 py-3 text-left">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tidspunkt
                  </span>
                </th>
                <th colSpan={5} className="bg-blue-50 px-4 py-3 text-center">
                  <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Call Metrics
                  </span>
                </th>
                <th colSpan={3} className="bg-purple-50 px-4 py-3 text-center">
                  <span className="text-xs font-medium text-purple-700 uppercase tracking-wider">
                    Ventetider (High Water Marks)
                  </span>
                </th>
                <th className="bg-green-50 px-4 py-3 text-center">
                  <span className="text-xs font-medium text-green-700 uppercase tracking-wider">
                    Præstation
                  </span>
                </th>
              </tr>
              <tr className="text-xs bg-gray-50 border-b border-gray-200">
                <th
                  className="px-2 py-2 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("date")}
                >
                  Dato {getSortIndicator("date")}
                </th>
                <th
                  className="px-2 py-2 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("time")}
                >
                  Tid {getSortIndicator("time")}
                </th>
                <th
                  className="px-2 py-2 text-center font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("queued")}
                >
                  I kø {getSortIndicator("queued")}
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-600">
                  Præsenteret
                </th>
                <th
                  className="px-2 py-2 text-center font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("answered")}
                >
                  Besvaret {getSortIndicator("answered")}
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-600">
                  {"<60s"}
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-600">
                  Ubesvaret
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-600">
                  Ventetid
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-600">
                  Svartid
                </th>
                <th className="px-2 py-2 text-center font-medium text-gray-600">
                  Afbrudt
                </th>
                <th
                  className="px-2 py-2 text-center font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("percentAnswered")}
                >
                  Svarprocent {getSortIndicator("percentAnswered")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-2 py-2 text-sm text-gray-900">
                      {item.date}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-900 font-medium">
                      {item.time}
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-gray-700">
                      {item.queued}
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-gray-700">
                      {item.presented}
                    </td>
                    <td className="px-2 py-2 text-sm text-center font-medium text-blue-600">
                      {item.answered}
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-gray-700">
                      {item.answeredIn60Secs}
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-red-600">
                      {item.abandoned}
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-purple-600">
                      {item.longestWait}
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-purple-600">
                      {item.longestAnswer}
                    </td>
                    <td className="px-2 py-2 text-sm text-center text-purple-600">
                      {item.longestAbandoned}
                    </td>
                    <td className="px-2 py-2 text-sm text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.percentAnswered >=
                            currentData.serviceTargets.responseRate
                              ? "bg-green-100 text-green-800"
                              : item.percentAnswered >=
                                currentData.serviceTargets.responseRate / 1.5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.percentAnswered}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Ingen data fundet for de valgte kriterier
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination and summary stats */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Viser{" "}
                {Math.min(
                  itemsPerPage,
                  filteredTableData.length - (currentPage - 1) * itemsPerPage
                )}{" "}
                af {filteredTableData.length} rækker
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 text-xs rounded ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Forrige
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-2 py-1 text-xs rounded ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 text-xs rounded ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Næste
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Calls</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Ventetider</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Præstation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-10">
        <p>Call center rapport - {currentData.reportDateRange}</p>
        <p className="mt-1">Generet: {getReportGeneratedTime()}</p>
      </div>
    </div>
  );
};