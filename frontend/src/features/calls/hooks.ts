// src/features/calls/hooks.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import type {
  TransformedData,
  ExtendedCombinedActivityItem,
  WeeklyHeatmapData,
} from "./types";
import {
  transformData,
  filterDataByTimeFrame,
  generateHeatmapData,
  generateProperPeriodData,
  generateProperYearlyData,
  calculateAverageWaitTime,
  formatDateDDMM,
  formatDateDDMMYYYY,
} from "./utils";

// Hook for fetching call data
export const useCallData = () => {
  const [rawData, setRawData] = useState<TransformedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState("Sidste 30 dage");
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Computed filtered data based on time frame
  const currentData = useMemo<TransformedData | null>(() => {
    return rawData
      ? filterDataByTimeFrame(rawData, timeFrame, customDateRange)
      : null;
  }, [rawData, timeFrame, customDateRange.start, customDateRange.end]);

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

  // Initial data fetch
  useEffect(() => {
    fetchCallData();
  }, []);

  return {
    currentData,
    loading,
    error,
    refreshing,
    handleRefresh,
    timeFrame,
    setTimeFrame,
    customDateRange,
    setCustomDateRange,
    showCustomDatePicker,
    setShowCustomDatePicker,
  };
};

// Hook for activity chart data
export const useActivityData = (currentData: TransformedData | null) => {
  const [activityData, setActivityData] = useState<Record<
    string,
    any[]
  > | null>(null);
  const [activityPeriod, setActivityPeriod] = useState("weekly");
  const [chartType, setChartType] = useState("stacked");

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

  // Calculate total calls
  const getTotalCalls = () => {
    // Use the same value from the main dashboard stats
    if (currentData?.callCenterStats?.presented) {
      return currentData.callCenterStats.presented;
    }

    // Fallback to calculated value only if stats aren't available
    const data = getActivityData();
    const total = data.reduce(
      (sum: number, item: any) =>
        sum + (item.besvaret || 0) + (item.opkaldtabt || 0),
      0
    );

    return total;
  };

  // Calculate answer rate
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
        sum + (item.besvaret || 0) + (item.opkaldtabt || 0),
      0
    );
    const answered = data.reduce(
      (sum: number, item: any) => sum + (item.besvaret || 0),
      0
    );
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  };

  // Calculate average daily calls
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
      (dataPoint.opkaldtabt || 0) +
      (dataPoint.viderestillet || 0)
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

  // Clear activity data cache when time frame changes
  useEffect(() => {
    setActivityData(null);
  }, [currentData]);

  return {
    activityData,
    activityPeriod,
    setActivityPeriod,
    chartType,
    setChartType,
    getActivityData,
    getTotalCalls,
    getAnswerRate,
    getAverageDailyCalls,
    getTotalForBar,
    getActivityPeriodLabel,
  };
};

// Hook for heatmap data
export const useHeatmapData = (currentData: TransformedData | null) => {
  const [heatmapView, setHeatmapView] = useState<"queued" | "answered">(
    "queued"
  );
  const [heatmapWeeks, setHeatmapWeeks] = useState<WeeklyHeatmapData[]>([]);
  const [currentHeatmapWeekIndex, setCurrentHeatmapWeekIndex] = useState(0);
  const [heatmapDateFilter, setHeatmapDateFilter] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [showHeatmapDatePicker, setShowHeatmapDatePicker] = useState(false);
  const [isHeatmapFilterActive, setIsHeatmapFilterActive] = useState(false);

  // Get filtered heatmap data
  const getFilteredHeatmapData = useCallback(() => {
    // Use the selected week
    if (
      heatmapWeeks.length > 0 &&
      currentHeatmapWeekIndex >= 0 &&
      currentHeatmapWeekIndex < heatmapWeeks.length
    ) {
      return heatmapWeeks[currentHeatmapWeekIndex].data;
    }

    // Fallback to all data
    return currentData?.callHeatmapData || [];
  }, [heatmapWeeks, currentHeatmapWeekIndex, currentData]);

  // Apply custom date filter
  const applyHeatmapDateFilter = () => {
    if (heatmapDateFilter.start && heatmapDateFilter.end) {
      setIsHeatmapFilterActive(true);
      setShowHeatmapDatePicker(false);
    }
  };

  // Reset heatmap filter
  const resetHeatmapFilter = () => {
    setIsHeatmapFilterActive(false);
    setHeatmapDateFilter({ start: "", end: "" });
    setShowHeatmapDatePicker(false);

    // Default to most recent week
    if (heatmapWeeks.length > 0) {
      setCurrentHeatmapWeekIndex(heatmapWeeks.length - 1);
    }
  };

  // Navigate between weeks
  const navigateHeatmapWeek = (direction: "prev" | "next") => {
    if (direction === "prev" && currentHeatmapWeekIndex > 0) {
      setCurrentHeatmapWeekIndex(currentHeatmapWeekIndex - 1);
      setIsHeatmapFilterActive(false);
    } else if (
      direction === "next" &&
      currentHeatmapWeekIndex < heatmapWeeks.length - 1
    ) {
      setCurrentHeatmapWeekIndex(currentHeatmapWeekIndex + 1);
      setIsHeatmapFilterActive(false);
    }
  };

  // Get current heatmap date info
  const getCurrentHeatmapDateInfo = () => {
    if (isHeatmapFilterActive) {
      const startDate = new Date(heatmapDateFilter.start);
      const endDate = new Date(heatmapDateFilter.end);
      return {
        dateRange: `${formatDateDDMMYYYY(startDate)} - ${formatDateDDMMYYYY(
          endDate
        )}`,
        weekNumber: "Tilpasset periode",
      };
    }

    if (
      heatmapWeeks.length > 0 &&
      currentHeatmapWeekIndex >= 0 &&
      currentHeatmapWeekIndex < heatmapWeeks.length
    ) {
      const currentWeek = heatmapWeeks[currentHeatmapWeekIndex];
      return {
        dateRange: `${currentWeek.startDate} - ${currentWeek.endDate}`,
        weekNumber: `Uge ${currentWeek.weekNumber}`,
      };
    }

    return {
      dateRange: "Ingen data",
      weekNumber: "-",
    };
  };

  // Process heatmap data and update week state
  useEffect(() => {
    if (!currentData?.combinedActivityData) return;

    const { weeklyData } = generateHeatmapData(
      currentData.combinedActivityData
    );
    setHeatmapWeeks(weeklyData);

    if (!isHeatmapFilterActive && weeklyData.length > 0) {
      setCurrentHeatmapWeekIndex(weeklyData.length - 1);
    }
  }, [currentData, isHeatmapFilterActive]);

  return {
    heatmapView,
    setHeatmapView,
    heatmapWeeks,
    currentHeatmapWeekIndex,
    setCurrentHeatmapWeekIndex,
    heatmapDateFilter,
    setHeatmapDateFilter,
    showHeatmapDatePicker,
    setShowHeatmapDatePicker,
    isHeatmapFilterActive,
    setIsHeatmapFilterActive,
    getFilteredHeatmapData,
    applyHeatmapDateFilter,
    resetHeatmapFilter,
    navigateHeatmapWeek,
    getCurrentHeatmapDateInfo,
  };
};

// Hook for table data
export const useTableData = (currentData: TransformedData | null) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

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

  // Filter and sort table data
  const getFilteredTableData = () => {
    if (!currentData) return [];

    let filtered = currentData.combinedActivityData;

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

        const aValue = a[sortField as keyof ExtendedCombinedActivityItem];
        const bValue = b[sortField as keyof ExtendedCombinedActivityItem];

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
      "Opkaldtabt",
      "Ventetid",
      "Svartid",
      "Viderestillet",
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

  return {
    selectedPeriod,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handlePeriodFilter,
    handleSort,
    getSortIndicator,
    getFilteredTableData,
    exportTableData,
  };
};
