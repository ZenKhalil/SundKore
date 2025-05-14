// src/features/calls/utils.ts

import type {
  TransformedData,
  ExtendedCombinedActivityItem,
  WeeklyHeatmapData,
} from "./types";

// Day names for heatmap
export const dayNames = ["Man", "Tir", "Ons", "Tor", "Fre"];
export const fullDayNames = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
];

// Month options for filtering
export const monthOptions = [
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

// Date formatting utilities
export const formatDateDDMM = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}-${month}`;
};

export const formatDateYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateDDMMYYYY = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${day}-${month}-${year}`;
};

// Time formatting
export const formatTime = (timeString: string): string => {
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

// Get week number from date
export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Get first date of a week
export const getFirstDateOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay() || 7; // Adjust for Sunday (0) to be last day (7)
  const firstDay = new Date(date);
  firstDay.setDate(date.getDate() - dayOfWeek + 1); // Monday is first day of week
  return firstDay;
};

// Get last date of a week
export const getLastDateOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay() || 7; // Adjust for Sunday (0) to be last day (7)
  const lastDay = new Date(date);
  lastDay.setDate(date.getDate() + (7 - dayOfWeek)); // Sunday is last day of week
  return lastDay;
};

// Get heatmap color based on value
export const getHeatmapColor = (val: number, maxVal: number): string => {
  const intensity = Math.min(0.95, val / maxVal);
  if (intensity < 0.2) return "rgba(237, 246, 255, 0.95)";
  else if (intensity < 0.4) return "rgba(191, 219, 254, 0.95)";
  else if (intensity < 0.6) return "rgba(96, 165, 250, 0.95)";
  else if (intensity < 0.8) return "rgba(59, 130, 246, 0.95)";
  else return "rgba(30, 64, 175, 0.95)";
};

// Generate report time
export const getReportGeneratedTime = () => {
  return new Date().toLocaleString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Generate weekly activity data
export const generateWeeklyActivity = (
  data: ExtendedCombinedActivityItem[]
) => {
  const activity = dayNames.map((day) => ({
    name: day,
    besvaret: 0,
    opkaldtabt: 0,
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
        activity[dayOfWeek].opkaldtabt += item.abandoned;
        activity[dayOfWeek].abandoned += item.abandoned;

        // Include bounced calls in opkaldtabt if available
        if (item.bounced) {
          activity[dayOfWeek].opkaldtabt += item.bounced;
        }
      }
    } catch (error) {
      console.error(`Error processing date: ${item.date}`, error);
    }
  });

  return activity;
};

// Generate response rate trend data
export const generateResponseRateTrend = (
  data: ExtendedCombinedActivityItem[]
) => {
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
      opkaldtabt: day.total > 0 ? (day.abandoned / day.total) * 100 : 0,
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

// Generate heatmap data
export const generateHeatmapData = (data: ExtendedCombinedActivityItem[]) => {
  if (!data || !data.length) {
    return {
      heatmapData: [],
      weeklyData: [],
    };
  }

  // Extract all dates from the data
  const dates = data.map((item) => {
    const [day, month, year] = item.date.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  // Sort dates and get min/max
  dates.sort((a, b) => a.getTime() - b.getTime());
  const minDate = dates.length > 0 ? new Date(dates[0]) : new Date();
  const maxDate =
    dates.length > 0 ? new Date(dates[dates.length - 1]) : new Date();

  // Create a raw heatmap data array for backward compatibility
  const heatmapData: any[] = [];

  // Create a Map to group data by week number
  const weekMap = new Map<number, WeeklyHeatmapData>();

  data.forEach((item) => {
    try {
      const [day, month, year] = item.date.split("-").map(Number);
      const itemDate = new Date(year, month - 1, day);
      const dayOfWeek = (itemDate.getDay() + 6) % 7; // Convert to Monday-based index (0 = Monday)
      const hour = parseInt(item.time.split(":")[0]);
      const weekNumber = getWeekNumber(itemDate);

      // Only include business hours (8-17) and weekdays (0-4)
      if (hour >= 8 && hour <= 17 && dayOfWeek < 5) {
        const dataPoint = [
          hour,
          dayOfWeek,
          item.queued,
          item.date,
          item.answered,
        ];
        heatmapData.push(dataPoint);

        // Also group by week for our week selector
        if (!weekMap.has(weekNumber)) {
          const weekStart = getFirstDateOfWeek(itemDate);
          const weekEnd = getLastDateOfWeek(itemDate);
          weekMap.set(weekNumber, {
            weekNumber,
            startDate: formatDateDDMMYYYY(weekStart),
            endDate: formatDateDDMMYYYY(weekEnd),
            data: [],
          });
        }

        // Get the week object and push the data point
        const weekObject = weekMap.get(weekNumber);
        if (weekObject) {
          weekObject.data.push(dataPoint);
        }
      }
    } catch (error) {
      console.error(`Error processing date: ${item.date}`, error);
    }
  });

  // Convert the Map to an array of WeeklyHeatmapData objects
  const weeklyData = Array.from(weekMap.values());

  // Return both datasets instead of setting state directly
  return {
    heatmapData,
    weeklyData,
  };
};

// Filter data by time frame
export const filterDataByTimeFrame = (
  data: TransformedData,
  timeFrame: string,
  customDateRange: { start: string; end: string }
): TransformedData => {
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

        // Generate heatmap data without directly updating state
        const { heatmapData } = generateHeatmapData(filteredCombinedData);

        return {
          ...data,
          combinedActivityData: filteredCombinedData,
          callCenterStats: recalculateCallStats(filteredCombinedData),
          weeklyCallActivity: generateWeeklyActivity(filteredCombinedData),
          responseRateTrend: generateResponseRateTrend(filteredCombinedData),
          callHeatmapData: heatmapData,
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

  // Generate heatmap data without directly updating state
  const { heatmapData } = generateHeatmapData(filteredCombinedData);

  return {
    ...data,
    combinedActivityData: filteredCombinedData,
    callCenterStats: recalculateCallStats(filteredCombinedData),
    weeklyCallActivity: generateWeeklyActivity(filteredCombinedData),
    responseRateTrend: generateResponseRateTrend(filteredCombinedData),
    callHeatmapData: heatmapData,
    donutData: generateDonutData(filteredCombinedData),
    callStats: generateCallStats(filteredCombinedData),
  };
};

// Recalculate call stats from filtered data
export const recalculateCallStats = (data: ExtendedCombinedActivityItem[]) => {
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
      const [hours, minutes, seconds] = item.longestWait.split(":").map(Number);
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

// Generate donut data
export const generateDonutData = (data: ExtendedCombinedActivityItem[]) => {
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
      name: "Opkald tabt",
      value: totals.abandoned / total,
      color: "#F97066",
    },
    {
      name: "Viderestillet",
      value: totals.bounced / total,
      color: "#FFA600",
    },
  ];
};

// Generate call stats
export const generateCallStats = (data: ExtendedCombinedActivityItem[]) => {
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
      label: "Opkaldtabt",
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
      label: "Viderestillet opkald",
      count: stats.bounced,
      change: "0%", // Placeholder change value
      increasing: false, // Usually we want fewer bounced calls
    },
  ];
};

// Transform backend data
export const transformData = (data: any): TransformedData => {
  const total = data.callCenterStats.presented || 1;

  // Calculate the bounced percentage
  const bouncedPercentage = Math.round(
    ((data.callCenterStats.bounced || 0) / total) * 100
  );

  // Generate heatmap data without updating state
  const { heatmapData } = generateHeatmapData(data.combinedActivityData);

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
        name: "Opkaldtabt",
        value: data.callCenterStats.abandoned / total,
        color: "#F97066",
      },
      {
        name: "Viderestillet",
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
        label: "Opkaldtabt",
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
        label: "Viderestillet opkald",
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
    callHeatmapData: data.callHeatmapData || heatmapData,
  };
};

// Generate proper period data
export const generateProperPeriodData = (
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
    Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) +
    1;
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(minDate);
    date.setDate(minDate.getDate() + i);

    // Format key as DD-MM for display
    const dayMonth = formatDateDDMM(date);

    dailyData.set(dayMonth, {
      name: dayMonth,
      date: new Date(date), // Keep full date for sorting
      besvaret: 0,
      opkaldtabt: 0,
      abandoned: 0,
      viderestillet: 0, // Add specific tracking for bounced calls
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
        entry.viderestillet += item.bounced || 0;

        // For chart display, combine abandoned and bounced into opkaldtabt
        entry.opkaldtabt = entry.abandoned + entry.viderestillet;
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

// Generate yearly data
export const generateProperYearlyData = (
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
      opkaldtabt: 0,
      abandoned: 0,
      viderestillet: 0,
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
        entry.viderestillet += item.bounced || 0;

        // For chart display, combine abandoned and bounced into opkaldtabt
        entry.opkaldtabt = entry.abandoned + entry.viderestillet;
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

// Calculate average wait time
export const calculateAverageWaitTime = (
  data: ExtendedCombinedActivityItem[]
) => {
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
