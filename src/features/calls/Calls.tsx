// src/features/calls/Calls.tsx

import React, { useState, useEffect } from "react";
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

// Import mock data from separate file
import {
  mockDataByTimeRange,
  availableTimeRanges,
  reportGenerated,
} from "./callsMockData";

import type { DonutItem } from "./callsMockData";

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
    payload: [number, number, number, string, number]; // hour, day, queued, date, answered
  }>;
}

// ------------------------------------
// Calls component
// ------------------------------------
export const Calls: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState(availableTimeRanges[0]); // Default to last 7 days
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentData, setCurrentData] = useState(
    mockDataByTimeRange[timeFrame]
  );
  const [heatmapView, setHeatmapView] = useState<"queued" | "answered">(
    "queued"
  );
  const [expandedTables, setExpandedTables] = useState({
    waitTimes: false,
    dailyActivity: false,
  });

  // Update data when time frame changes
  useEffect(() => {
    setCurrentData(mockDataByTimeRange[timeFrame]);
  }, [timeFrame]);

  // Toggle expanded tables
  const toggleTable = (table: "waitTimes" | "dailyActivity") => {
    setExpandedTables({
      ...expandedTables,
      [table]: !expandedTables[table],
    });
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

  // Format time string to human readable
  const formatTime = (timeString: string) => {
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

  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Call Center Rapport
          </h1>
          <p className="text-gray-500">
            Sundk callcenter - {currentData.reportDateRange}
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw size={16} className="mr-2" />
            Opdater
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
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Summary banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-center md:justify-start">
            <div className="bg-blue-100 p-3 rounded-full">
              <Phone className="h-6 w-6 text-blue-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Total opkald</p>
              <p className="text-xl font-semibold text-blue-900">
                {currentData.callCenterStats.total}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Besvaret</p>
              <p className="text-xl font-semibold text-blue-900">
                {currentData.callCenterStats.answered}
                <span className="text-sm ml-1 font-normal">
                  ({currentData.callCenterStats.percentAnswered}%)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Ubesvaret</p>
              <p className="text-xl font-semibold text-blue-900">
                {currentData.callCenterStats.abandoned}
                <span className="text-sm ml-1 font-normal">
                  ({100 - currentData.callCenterStats.percentAnswered}%)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Timer className="h-6 w-6 text-indigo-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">
                Svartid &lt;60s
              </p>
              <p className="text-xl font-semibold text-blue-900">
                {currentData.callCenterStats.percentAnsweredIn60Secs}%
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* 1st Row: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <div className="mt-1">
            <p className="text-2xl font-bold text-gray-900">
              {currentData.callCenterStats.percentAnsweredIn60SecsOfAnswered}%
            </p>
            <div className="text-xs text-gray-500 mt-1">
              <span
                className={
                  currentData.callStats[3].increasing
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {currentData.callStats[3].increasing ? "↑" : "↓"}{" "}
                {currentData.callStats[3].change}
              </span>{" "}
              fra forrige periode
            </div>
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
              <span>Mål: 80%</span>
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
          <div className="mt-1">
            <p className="text-2xl font-bold text-gray-900">
              {currentData.callCenterStats.percentAnswered}%
            </p>
            <div className="text-xs text-gray-500 mt-1">
              <span
                className={
                  currentData.callStats[1].increasing
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {currentData.callStats[1].increasing ? "↑" : "↓"}{" "}
                {currentData.callStats[1].change}
              </span>{" "}
              fra forrige periode
            </div>
          </div>
          <div className="mt-auto pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${currentData.callCenterStats.percentAnswered}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>Mål: 75%</span>
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
          <div className="mt-1">
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(currentData.callCenterStats.longestWaitTime)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maksimal acceptabel: 2:00 min
            </p>
          </div>
          <div className="mt-auto pt-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500">
                  Gns. ventetid
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  0:30 min
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500">
                  Gns. taletid
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  2:45 min
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500">
                  Opkald/time
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {Math.round(currentData.callCenterStats.total / (10 * 8))}
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
              Frafaldsprocent
            </h3>
          </div>
          <div className="mt-1">
            <p className="text-2xl font-bold text-gray-900">
              {100 - currentData.callCenterStats.percentAnswered}%
            </p>
            <div className="text-xs text-gray-500 mt-1">
              <span
                className={
                  !currentData.callStats[2].increasing
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {!currentData.callStats[2].increasing ? "↓" : "↑"}{" "}
                {currentData.callStats[2].change}
              </span>{" "}
              fra forrige periode
            </div>
          </div>
          <div className="mt-auto pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${
                    100 - currentData.callCenterStats.percentAnswered
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>Max: 25%</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Combined Section: Donut Chart + Målinger + Ugentlig aktivitet  &  Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* LEFT STACK: Donut → Målinger → Ugentlig aktivitet */}
        <div className="flex flex-col space-y-6">
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
                  {currentData.callCenterStats.total}
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

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <div className="text-xs text-gray-500">Gns. tid på opgave</div>
                <div className="text-sm font-semibold">3:15 min</div>
              </div>
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <div className="text-xs text-gray-500">Gns. tid i kø</div>
                <div className="text-sm font-semibold">0:45 min</div>
              </div>
            </div>
          </div>

          {/* Målinger */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Målinger</h3>
            <div className="divide-y divide-gray-100">
              {currentData.callStats.map((stat) => (
                <div key={stat.id} className="flex justify-between py-2">
                  <span className="text-sm font-medium text-gray-900">
                    {stat.label}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-3">
                      {stat.count}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        stat.increasing
                          ? "text-green-800 bg-green-100"
                          : "text-red-800 bg-red-100"
                      }`}
                    >
                      <span>{stat.change}</span>
                      <span className="ml-1">
                        {stat.increasing ? "▲" : "▼"}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ugentlig aktivitet */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Ugentlig aktivitet
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={currentData.weeklyCallActivity}
                margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
                barSize={25}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={25}
                  domain={[0, "auto"]}
                  allowDecimals={false}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="besvaret"
                  fill="#2DD4BF"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                  name="Besvaret"
                />
                <Bar
                  dataKey="ubesvaret"
                  fill="#F97066"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                  name="Ubesvaret"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: Call Volume Heatmap */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-blue-50 text-blue-600 mr-2">
                <Clock size={18} />
              </div>
              <h3 className="text-base font-medium text-gray-700">
                Opkald fordelt på ugedag og time
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setHeatmapView("queued")}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  heatmapView === "queued"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Alle opkald
              </button>
              <button
                onClick={() => setHeatmapView("answered")}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  heatmapView === "answered"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Besvarede
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center">
            <div className="text-xs text-gray-500 flex items-center">
              <Info size={14} className="mr-1" />
              Grafikken viser {heatmapView === "queued"
                ? "alle"
                : "besvarede"}{" "}
              opkald fordelt på ugedag og tid.
            </div>
          </div>

          <div className="relative">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map(
                (day, idx) => (
                  <div
                    key={day}
                    className={`text-xs font-medium text-center py-1 ${
                      idx >= 5 ? "text-blue-400" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            {/* Heatmap grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 70 }, (_, i) => {
                const hour = 8 + Math.floor(i / 7);
                const day = i % 7;
                const dataPoint = currentData.callHeatmapData.find(
                  (d) => d[0] === hour && d[1] === day
                );
                if (!dataPoint) {
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-md bg-gray-50"
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

                const getImprovedHeatmapColor = (
                  val: number,
                  maxVal: number
                ): string => {
                  const intensity = Math.min(0.95, val / maxVal);
                  if (intensity < 0.2) return "rgba(237, 246, 255, 0.95)";
                  else if (intensity < 0.4) return "rgba(191, 219, 254, 0.95)";
                  else if (intensity < 0.6) return "rgba(96, 165, 250, 0.95)";
                  else if (intensity < 0.8) return "rgba(59, 130, 246, 0.95)";
                  else return "rgba(30, 64, 175, 0.95)";
                };

                return (
                  <div
                    key={i}
                    className="group relative aspect-square rounded-md flex items-center justify-center transition-all duration-150 hover:scale-105 cursor-pointer overflow-visible"
                    style={{
                      backgroundColor: getImprovedHeatmapColor(value, viewMax),
                    }}
                  >
                    <span
                      className={`text-xs font-medium ${
                        isHigh ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {value > 0 ? value : ""}
                    </span>

                    {value > 0 && (
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 transition-opacity duration-150 pointer-events-none">
                        <div className="bg-gray-800 text-white text-xs rounded py-1.5 px-2 min-w-max shadow-lg">
                          <p className="font-medium">
                            {
                              [
                                "Mandag",
                                "Tirsdag",
                                "Onsdag",
                                "Torsdag",
                                "Fredag",
                                "Lørdag",
                                "Søndag",
                              ][day]
                            }
                            , {date}
                          </p>
                          <p>Kl. {hour}:00</p>
                          <p className="font-medium mt-1">
                            {heatmapView === "queued"
                              ? `${value} opkald i kø`
                              : `${value} besvarede opkald`}
                          </p>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hour markers */}
            <div className="flex justify-between mt-2 px-2">
              <span className="text-xs text-gray-500">8:00</span>
              <span className="text-xs text-gray-500">10:00</span>
              <span className="text-xs text-gray-500">12:00</span>
              <span className="text-xs text-gray-500">14:00</span>
              <span className="text-xs text-gray-500">16:00</span>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Intensitet:</p>
            <div className="flex items-center">
              <div
                className="h-2 flex-grow rounded-l-full"
                style={{ background: "rgba(237, 246, 255, 0.95)" }}
              />
              <div
                className="h-2 flex-grow"
                style={{ background: "rgba(191, 219, 254, 0.95)" }}
              />
              <div
                className="h-2 flex-grow"
                style={{ background: "rgba(96, 165, 250, 0.95)" }}
              />
              <div
                className="h-2 flex-grow"
                style={{ background: "rgba(59, 130, 246, 0.95)" }}
              />
              <div
                className="h-2 flex-grow rounded-r-full"
                style={{ background: "rgba(30, 64, 175, 0.95)" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Få opkald</span>
              <span className="text-xs text-gray-500">Mange opkald</span>
            </div>
          </div>
        </div>
      </div>
      {/* ── Besvarelsesrate og service niveau trend ── */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Besvarelsesrate og service niveau trend
            </h3>
          </div>

          <div className="h-[300px] flex flex-col">
            <div className="h-[85%]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={currentData.responseRateTrend}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 10, right: 10 }}
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
                    y={75}
                    stroke="#6B7280"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: "Mål: 75%",
                      position: "right",
                      fill: "#6B7280",
                      fontSize: 12,
                    }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#818CF8"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: "SLA: 80%",
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
      {/* 5th Row: Wait Times Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-500">
            Ventetider (High Water Marks)
          </h3>
          <button
            onClick={() => toggleTable("waitTimes")}
            className="text-xs text-blue-600 flex items-center"
          >
            {expandedTables.waitTimes ? "Vis mindre" : "Vis alle"}
            {expandedTables.waitTimes ? (
              <ArrowDown size={14} className="ml-1" />
            ) : (
              <ArrowRight size={14} className="ml-1" />
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dato & tid
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Længste ventetid
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Længste svartid
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Længste ventetid (afbrudt)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(expandedTables.waitTimes
                ? currentData.waitTimeData
                : currentData.waitTimeData.slice(0, 5)
              ).map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.date}, {item.time}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.longestWait}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.longestAnswer}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.longestAbandoned}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!expandedTables.waitTimes && currentData.waitTimeData.length > 5 && (
          <div className="text-center mt-2 text-sm text-gray-500">
            Viser 5 af {currentData.waitTimeData.length} rækker
          </div>
        )}
      </div>
      {/* 6th Row: Daily Call Activity Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-500">
            Daglig aktivitet
          </h3>
          <button
            onClick={() => toggleTable("dailyActivity")}
            className="text-xs text-blue-600 flex items-center"
          >
            {expandedTables.dailyActivity ? "Vis mindre" : "Vis alle"}
            {expandedTables.dailyActivity ? (
              <ArrowDown size={14} className="ml-1" />
            ) : (
              <ArrowRight size={14} className="ml-1" />
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dato & tid
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  I kø
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Præsenteret
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Besvaret
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Besvaret &lt;60s
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubesvaret
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(expandedTables.dailyActivity
                ? currentData.dailyCallActivity
                : currentData.dailyCallActivity.slice(0, 7)
              ).map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.date}, {item.time}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.queued}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.presented}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.answered}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.answeredIn60Secs}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.abandoned}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">
                    <span
                      className={
                        item.percentAnswered >= 75
                          ? "text-green-600"
                          : item.percentAnswered >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }
                    >
                      {item.percentAnswered}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!expandedTables.dailyActivity &&
          currentData.dailyCallActivity.length > 7 && (
            <div className="text-center mt-2 text-sm text-gray-500">
              Viser 7 af {currentData.dailyCallActivity.length} rækker
            </div>
          )}
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-2">
              <Users size={18} />
            </div>
            <h3 className="text-sm font-medium text-gray-700">
              Agent statistikker
            </h3>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Antal agenter:</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gns. svartid pr. agent:</span>
              <span className="font-medium">1:05 min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gns. opkald pr. agent:</span>
              <span className="font-medium">
                {Math.round(currentData.callCenterStats.total / 12)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Agent tilgængelighed:</span>
              <span className="font-medium text-green-600">94%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-indigo-50 text-indigo-600 mr-2">
              <Clock size={18} />
            </div>
            <h3 className="text-sm font-medium text-gray-700">
              Timing metrikker
            </h3>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gns. ventetid alle opkald:</span>
              <span className="font-medium">0:45 min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gns. samtaletid:</span>
              <span className="font-medium">3:15 min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Besvarede indenfor 30s:</span>
              <span className="font-medium text-green-600">68%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gns. efterbehandlingstid:</span>
              <span className="font-medium">1:20 min</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-green-50 text-green-600 mr-2">
              <BarChartIcon size={18} />
            </div>
            <h3 className="text-sm font-medium text-gray-700">Performance</h3>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">SLA Performance:</span>
              <span
                className={
                  currentData.callCenterStats.percentAnsweredIn60Secs >= 80
                    ? "font-medium text-green-600"
                    : "font-medium text-yellow-600"
                }
              >
                {currentData.callCenterStats.percentAnsweredIn60Secs >= 80
                  ? "✓"
                  : "⚠"}{" "}
                {currentData.callCenterStats.percentAnsweredIn60Secs}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Trendfaktor:</span>
              <span
                className={
                  currentData.callStats[1].increasing
                    ? "font-medium text-green-600"
                    : "font-medium text-red-600"
                }
              >
                {currentData.callStats[1].increasing ? "↑" : "↓"}{" "}
                {currentData.callStats[1].change}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">CSAT score:</span>
              <span className="font-medium">4.2/5.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">FCR rate:</span>
              <span className="font-medium">78%</span>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-10">
        <p>Call center rapport - {currentData.reportDateRange}</p>
        <p className="mt-1">Generet: {reportGenerated}</p>
      </div>
    </div>
  );
};
