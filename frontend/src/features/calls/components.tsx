// src/features/calls/components.tsx

import React from 'react';
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
  ReferenceLine,
} from "recharts";
import {
  Download,
  ChevronDown,
  Clock,
  Phone,
  PhoneOff,
  BarChart3,
  Layers,
  BarChart2,
  BarChart as BarChartIcon,
  AlertCircle,
  Calendar,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Timer,
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { 
  RenderLabelProps, 
  TransformedData,
  ExtendedCombinedActivityItem
} from './types';
import { 
  formatTime, 
  calculateAverageWaitTime,
  getReportGeneratedTime,
  dayNames,
  fullDayNames,
  getHeatmapColor
} from './utils';

// Header section component
export const HeaderSection = ({ 
  companyName, 
  reportDateRange, 
  handleRefresh, 
  refreshing 
}: { 
  companyName: string; 
  reportDateRange: string; 
  handleRefresh: () => void; 
  refreshing: boolean 
}) => (
  <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Call Center Rapport
      </h1>
      <p className="text-gray-500">
        {companyName} - {reportDateRange}
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
);

// Time filter component
export const TimeFilter = ({ 
  timeFrame, 
  setTimeFrame, 
  isDropdownOpen, 
  setIsDropdownOpen,
  showCustomDatePicker,
  setShowCustomDatePicker,
  customDateRange,
  setCustomDateRange,
  availableTimeRanges
}: any) => (
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
          {availableTimeRanges.map((option: string) => (
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
          }}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Anvend
        </button>
      </div>
    )}
  </div>
);

// Summary banner component
export const SummaryBanner = ({ callCenterStats }: any) => (
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
            {callCenterStats.presented}
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
            {callCenterStats.answered}
            <span className="text-sm ml-1 font-normal">
              (
              {Math.round(
                (callCenterStats.answered /
                  callCenterStats.presented) *
                  100
              ) || 0}
              %)
            </span>
          </p>
        </div>
      </div>

      {/* Opkald tabt */}
      <div className="flex items-center">
        <div className="bg-red-100 p-3 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-700" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-blue-900">Opkald tabt</p>
          <p className="text-xl font-semibold text-blue-900">
            {callCenterStats.abandoned}
            <span className="text-sm ml-1 font-normal">
              (
              {Math.round(
                (callCenterStats.abandoned /
                  callCenterStats.presented) *
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
            {callCenterStats.percentAnsweredIn60SecsOfAnswered}%
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Key Performance Indicators Cards
export const KPICards = ({ currentData }: { currentData: TransformedData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
    {/* KPI Card 1 - Service Level */}
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="flex items-center mb-1">
        <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 mr-2">
          <Clock size={16} />
        </div>
        <h3 className="text-sm font-medium text-gray-500">Service Niveau</h3>
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
        <h3 className="text-sm font-medium text-gray-500">Længste Ventetid</h3>
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
            <div className="text-xs font-medium text-gray-500">Opkald/time</div>
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
        <h3 className="text-sm font-medium text-gray-500">Opkald tabt</h3>
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

    {/* KPI Card 5 - Bounce Rate */}
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="flex items-center mb-1">
        <div className="p-2 rounded-md bg-amber-50 text-amber-600 mr-2">
          <AlertTriangle size={16} />
        </div>
        <h3 className="text-sm font-medium text-gray-500">
          Viderestillet opkald
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
);

// Donut chart component
export const DonutChart = ({ data, totalCalls }: { data: any[], totalCalls: number }) => {
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

  return (
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
              data={data}
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
              {data.map((entry, i) => (
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
            {totalCalls}
          </span>
          <span className="text-sm text-gray-500">TOTAL OPKALD</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {data.map((entry) => (
          <div
            key={entry.name}
            className="px-3 py-1 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: entry.color }}
          >
            {entry.name.toUpperCase()} ({Math.round(entry.value * 100)}%)
          </div>
        ))}
      </div>
    </div>
  );
};

// Activity chart component
export const ActivityChart = ({
  activityPeriod,
  setActivityPeriod,
  chartType,
  setChartType,
  activityData,
  getTotalCalls,
  getAnswerRate,
  getAverageDailyCalls,
  getTotalForBar,
  getActivityPeriodLabel,
}: any) => (
  <div className="bg-white rounded-xl shadow-sm p-2">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center">
        <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 mr-2">
          <BarChart3 size={16} />
        </div>
        <h3 className="text-sm font-medium text-gray-700">Opkaldsaktivitet</h3>
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
    <div className="flex items-center justify-between">
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
        data={activityData}
        margin={{ top: 2, right: 30, left: 0, bottom: 0 }}
        barGap={chartType === "grouped" ? 4 : 0}
        barCategoryGap={chartType === "grouped" ? "20%" : "10%"}
      >
        <defs>
          <linearGradient id="colorBesvaret" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="colorAbandoned" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="colorOpkaldTabt" x1="0" y1="0" x2="0" y2="1">
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
          dataKey="opkaldtabt"
          fill="url(#colorOpkaldTabt)"
          radius={chartType === "stacked" ? [4, 4, 0, 0] : [4, 4, 0, 0]}
          stackId={chartType === "stacked" ? "a" : undefined}
          name="Viderestillet"
        />
        <Bar
          dataKey="abandoned"
          fill="url(#colorAbandoned)"
          radius={chartType === "stacked" ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          stackId={chartType === "stacked" ? "a" : undefined}
          name="Opkald tabt"
        />
      </BarChart>
    </ResponsiveContainer>

    {/* Summary stats */}
    <div className="pt-1 border-t border-gray-100 grid grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-xs text-gray-500">Total opkald</p>
        <p className="text-lg font-semibold text-gray-900">{getTotalCalls()}</p>
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
);

// Heatmap section component
export const HeatmapSection = ({
  heatmapView,
  setHeatmapView,
  navigateHeatmapWeek,
  heatmapDateInfo,
  filteredHeatmapData,
  currentHeatmapWeekIndex,
  heatmapWeeks,
}: any) => (
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

      {/* View toggle for queued/answered */}
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
    {/* Heatmap week navigation and info */}
    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
      {/* LEFT: calendar icon + week info */}
      <div className="flex items-center space-x-2">
        <Calendar size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700 mr-3">
          {heatmapDateInfo.weekNumber}
        </span>
        <span className="text-xs text-gray-500">
          {heatmapDateInfo.dateRange}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {/* Week navigation buttons */}
        <button
          onClick={() => navigateHeatmapWeek("prev")}
          disabled={currentHeatmapWeekIndex === 0}
          className={`p-1 rounded ${
            currentHeatmapWeekIndex === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Forrige uge"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => navigateHeatmapWeek("next")}
          disabled={currentHeatmapWeekIndex === heatmapWeeks.length - 1}
          className={`p-1 rounded ${
            currentHeatmapWeekIndex === heatmapWeeks.length - 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Næste uge"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>

    {/* Info text about what the heatmap shows */}
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

    {/* Main heatmap display */}
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
              // Find data point from FILTERED heatmap data
              const dataPoint = filteredHeatmapData.find(
                (d: any[]) => d[0] === hour && d[1] === day
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
                ...filteredHeatmapData.map((d: any[]) =>
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
);

// Response rate trend chart component
export const ResponseRateTrendChart = ({ data, serviceTargets }: any) => (
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
            data={data}
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
              y={serviceTargets.responseRate}
              stroke="#6B7280"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: `Mål: ${serviceTargets.responseRate}%`,
                position: "right",
                fill: "#6B7280",
                fontSize: 12,
              }}
            />
            <ReferenceLine
              y={serviceTargets.serviceLevel}
              stroke="#818CF8"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: `SLA: ${serviceTargets.serviceLevel}%`,
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
              dataKey="opkaldtabt"
              stroke="#F97066"
              strokeWidth={2}
              dot={{ fill: "#F97066", r: 4 }}
              activeDot={{ r: 6 }}
              name="Opkald tabt (%)"
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
);

// CallActivityTable component for the large data table
export const CallActivityTable = ({
  filteredTableData,
  paginatedData,
  totalPages,
  currentPage,
  setCurrentPage,
  selectedPeriod,
  selectedMonth,
  selectedYear,
  searchQuery,
  setSearchQuery,
  handlePeriodFilter,
  handleSort,
  getSortIndicator,
  exportTableData,
  monthOptions,
  yearOptions,
  setSelectedMonth,
  setSelectedYear,
  serviceTargets,
}: any) => (
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
                handlePeriodFilter(null); // Clear period filter when selecting month
              }}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Vælg måned</option>
              {monthOptions.map((month: any) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                handlePeriodFilter(null); // Clear period filter when selecting year
              }}
              className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Vælg år</option>
              {yearOptions.map((year: number) => (
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
                (sum: number, item: ExtendedCombinedActivityItem) =>
                  sum + item.presented,
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
                      (sum: number, item: ExtendedCombinedActivityItem) =>
                        sum + item.percentAnswered,
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
                    monthOptions.find((m: any) => m.value === selectedMonth)
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
            <th colSpan={6} className="bg-blue-50 px-4 py-3 text-center">
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                Call Metrics
              </span>
            </th>
            <th colSpan={3} className="bg-purple-50 px-4 py-3 text-center">
              <span className="text-xs font-medium text-purple-700 uppercase tracking-wider">
                Ventetider (High Water Marks)
              </span>
            </th>
            <th colSpan={1} className="bg-green-50 px-4 py-3 text-center">
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
              Opkald tabt
            </th>
            <th className="px-2 py-2 text-center font-medium text-gray-600">
              Viderestillet
            </th>
            <th className="px-2 py-2 text-center font-medium text-gray-600">
              Ventetid
            </th>
            <th className="px-2 py-2 text-center font-medium text-gray-600">
              Svartid
            </th>
            <th className="px-2 py-2 text-center font-medium text-gray-600">
              Viderestillingstid
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
            paginatedData.map(
              (item: ExtendedCombinedActivityItem, index: number) => (
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
                  <td className="px-2 py-2 text-sm text-center text-red-600">
                    {item.bounced}
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
                          item.percentAnswered >= serviceTargets.responseRate
                            ? "bg-green-100 text-green-800"
                            : item.percentAnswered >=
                              serviceTargets.responseRate / 1.5
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.percentAnswered}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
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
              paginatedData.length,
              filteredTableData.length -
                (currentPage - 1) * (paginatedData.length || 1)
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
);

// Footer component
export const Footer = ({ reportDateRange }: { reportDateRange: string }) => (
  <div className="text-center text-xs text-gray-500 mt-10">
    <p>Call center rapport - {reportDateRange}</p>
    <p className="mt-1">Generet: {getReportGeneratedTime()}</p>
  </div>
);