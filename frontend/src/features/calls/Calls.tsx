// src/features/calls/Calls.tsx

import React, { useState } from "react";
import {
  useCallData,
  useActivityData,
  useHeatmapData,
  useTableData,
} from "./hooks";
import {
  HeaderSection,
  TimeFilter,
  SummaryBanner,
  KPICards,
  DonutChart,
  ActivityChart,
  HeatmapSection,
  ResponseRateTrendChart,
  CallActivityTable,
  Footer,
} from "./components";
import { monthOptions } from "./utils";

// Available time ranges
const availableTimeRanges = [
  "Sidste 7 dage",
  "Sidste 30 dage",
  "Sidste 90 dage",
  "I år",
];

// Year options (last 5 years)
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

export const Calls: React.FC = () => {
  // UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedTables, setExpandedTables] = useState({
    waitTimes: false,
    dailyActivity: false,
    combinedActivity: false,
  });

  // Get data and state from hooks
  const {
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
  } = useCallData();

  const {
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
  } = useActivityData(currentData);

  const {
    heatmapView,
    setHeatmapView,
    heatmapWeeks,
    currentHeatmapWeekIndex,
    getFilteredHeatmapData,
    navigateHeatmapWeek,
    getCurrentHeatmapDateInfo,
  } = useHeatmapData(currentData);

  const {
    selectedPeriod,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handlePeriodFilter,
    handleSort,
    getSortIndicator,
    getFilteredTableData,
    exportTableData,
  } = useTableData(currentData);

  // Toggle expanded tables
  const toggleTable = (
    table: "waitTimes" | "dailyActivity" | "combinedActivity"
  ) => {
    setExpandedTables({
      ...expandedTables,
      [table]: !expandedTables[table],
    });
  };

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

  // Get heatmap date info
  const heatmapDateInfo = getCurrentHeatmapDateInfo();

  // Get filtered heatmap data
  const filteredHeatmapData = getFilteredHeatmapData();

  // Activities data for chart
  const activityData = getActivityData();

  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-50">
      {/* Header */}
      <HeaderSection
        companyName={currentData.companyName}
        reportDateRange={currentData.reportDateRange}
        handleRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Time filter dropdown */}
      <TimeFilter
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        showCustomDatePicker={showCustomDatePicker}
        setShowCustomDatePicker={setShowCustomDatePicker}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        availableTimeRanges={availableTimeRanges}
      />

      {/* Summary banner */}
      <SummaryBanner callCenterStats={currentData.callCenterStats} />

      {/* KPI Cards */}
      <KPICards currentData={currentData} />

      {/* Combined Section: Donut Chart + Målinger + Ugentlig aktivitet & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
        {/* LEFT STACK: Donut → Ugentlig aktivitet */}
        <div className="flex flex-col space-y-2">
          {/* Donut Chart */}
          <DonutChart
            data={currentData.donutData}
            totalCalls={currentData.callCenterStats.presented}
          />

          {/* Activity Chart */}
          <ActivityChart
            activityPeriod={activityPeriod}
            setActivityPeriod={setActivityPeriod}
            chartType={chartType}
            setChartType={setChartType}
            activityData={activityData}
            getTotalCalls={getTotalCalls}
            getAnswerRate={getAnswerRate}
            getAverageDailyCalls={getAverageDailyCalls}
            getTotalForBar={getTotalForBar}
            getActivityPeriodLabel={getActivityPeriodLabel}
          />
        </div>

        {/* RIGHT COLUMN: Call Volume Heatmap */}
        <HeatmapSection
          heatmapView={heatmapView}
          setHeatmapView={setHeatmapView}
          navigateHeatmapWeek={navigateHeatmapWeek}
          heatmapDateInfo={heatmapDateInfo}
          filteredHeatmapData={filteredHeatmapData}
          currentHeatmapWeekIndex={currentHeatmapWeekIndex}
          heatmapWeeks={heatmapWeeks}
        />
      </div>

      {/* Response Rate and Service Level Trend */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ResponseRateTrendChart
          data={currentData.responseRateTrend}
          serviceTargets={currentData.serviceTargets}
        />
      </div>

      {/* Combined Call Activity & Wait Times Table */}
      <CallActivityTable
        filteredTableData={filteredTableData}
        paginatedData={paginatedData}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedPeriod={selectedPeriod}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handlePeriodFilter={handlePeriodFilter}
        handleSort={handleSort}
        getSortIndicator={getSortIndicator}
        exportTableData={exportTableData}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
        serviceTargets={currentData.serviceTargets}
      />

      {/* Footer */}
      <Footer reportDateRange={currentData.reportDateRange} />
    </div>
  );
};
