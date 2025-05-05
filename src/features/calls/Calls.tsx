// src/features/calls/Calls.tsx

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Download, ChevronDown } from "lucide-react";

// ------------------------------------
// Mock data
// ------------------------------------
const mockCallsData = {
  total: 38,
  percentageChange: 2,
  avgCallDuration: 334, // seconds
  responseRate: 78, // percentage
  responseRateChange: 5 // percentage change
};

// Monthly activity with multiple data series for the bar chart
const mockMonthlyActivity = [
  { name: "JAN", besvaret: 250, ubesvaret: 150, afbrudt: 100 },
  { name: "FEB", besvaret: 180, ubesvaret: 190, afbrudt: 40 },
  { name: "MAR", besvaret: 130, ubesvaret: 140, afbrudt: 60 },
  { name: "APR", besvaret: 210, ubesvaret: 360, afbrudt: 280 },
  { name: "MAJ", besvaret: 260, ubesvaret: 210, afbrudt: 230 },
  { name: "JUN", besvaret: 150, ubesvaret: 270, afbrudt: 130 },
  { name: "JUL", besvaret: 300, ubesvaret: 240, afbrudt: 120 },
  { name: "AUG", besvaret: 120, ubesvaret: 240, afbrudt: 50 },
  { name: "SEP", besvaret: 380, ubesvaret: 220, afbrudt: 150 },
  { name: "OKT", besvaret: 250, ubesvaret: 190, afbrudt: 200 },
  { name: "NOV", besvaret: 320, ubesvaret: 180, afbrudt: 50 },
  { name: "DEC", besvaret: 140, ubesvaret: 150, afbrudt: 40 },
];

const mockWeeklyActivity = [
  { name: "Man", besvaret: 40, ubesvaret: 30, afbrudt: 20 },
  { name: "Tir", besvaret: 55, ubesvaret: 35, afbrudt: 25 },
  { name: "Ons", besvaret: 60, ubesvaret: 45, afbrudt: 30 },
  { name: "Tor", besvaret: 80, ubesvaret: 50, afbrudt: 40 },
  { name: "Fre", besvaret: 70, ubesvaret: 40, afbrudt: 30 },
  { name: "Lør", besvaret: 50, ubesvaret: 30, afbrudt: 20 },
  { name: "Søn", besvaret: 30, ubesvaret: 20, afbrudt: 10 },
];

const mockYearlyActivity = [
  { name: "2022", besvaret: 1200, ubesvaret: 900, afbrudt: 700 },
  { name: "2023", besvaret: 1350, ubesvaret: 1050, afbrudt: 800 },
  { name: "2024", besvaret: 1500, ubesvaret: 1200, afbrudt: 900 },
];

// Response rate trend data for the line chart
const responseRateTrend = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  besvaret: 60 + Math.sin(i / 2) * 20 + Math.random() * 5,
  ubesvaret: 50 + Math.cos(i / 3) * 15 + Math.random() * 5,
  mål: 80,
}));

// Staff performance data
const staffPerformance = [
  { name: "Steen Andersen", resolved: 15, initial: "S" },
  { name: "Eva Hansen", resolved: 9, initial: "E" },
  { name: "Peter Mortensen", resolved: 11, initial: "P" },
];

// Call statistics for the table
const callStats = [
  {
    id: 1,
    label: "Total Opkald i kø",
    count: 276,
    change: 51,
    increasing: true,
  },
  {
    id: 2,
    label: "Total Opkald besvaret",
    count: 149,
    change: 12,
    increasing: false,
  },
  {
    id: 3,
    label: "Total Opkald ubesvaret",
    count: 189,
    change: 19,
    increasing: true,
  },
  {
    id: 4,
    label: "Total Opkald Afbrudt",
    count: 159,
    change: 33,
    increasing: false,
  },
];

// Donut chart data
interface DonutItem {
  name: string;
  value: number;
  color: string;
}

const donutData: DonutItem[] = [
  { name: "Afbrudt", value: 0.32, color: "#F97066" },
  { name: "Ubesvaret", value: 0.38, color: "#6366F1" },
  { name: "Besvaret", value: 0.3, color: "#2DD4BF" },
];
const totalCalls = 497;

// ------------------------------------
// Calls component
// ------------------------------------
export const Calls: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState("Tidsramme: Sidste 30 dage");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activityTimeFrame, setActivityTimeFrame] = useState<
    "month" | "year" | "week"
  >("month");

  // Define fixed heatmap data with type safety
  const heatmap = [
    { month: "JAN", "9": 2, "10": 3, "11": 1, "12": 4, "13": 2, "14": 3 },
    { month: "MAR", "9": 3, "10": 1, "11": 4, "12": 2, "13": 3, "14": 1 },
    { month: "FEB", "9": 1, "10": 4, "11": 3, "12": 2, "13": 1, "14": 3 },
    { month: "APR", "9": 4, "10": 2, "11": 1, "12": 3, "13": 4, "14": 2 },
    { month: "JUN", "9": 3, "10": 4, "11": 2, "12": 1, "13": 3, "14": 4 },
    { month: "MAJ", "9": 2, "10": 1, "11": 3, "12": 4, "13": 2, "14": 1 },
    { month: "JUL", "9": 1, "10": 3, "11": 4, "12": 2, "13": 1, "14": 3 },
    { month: "AUG", "9": 4, "10": 2, "11": 1, "12": 3, "13": 4, "14": 2 },
    { month: "SEP", "9": 3, "10": 1, "11": 2, "12": 4, "13": 3, "14": 1 },
    { month: "OKT", "9": 2, "10": 4, "11": 3, "12": 1, "13": 2, "14": 4 },
    { month: "NOV", "9": 4, "10": 2, "11": 1, "12": 3, "13": 4, "14": 2 },
    { month: "DEC", "9": 1, "10": 3, "11": 4, "12": 2, "13": 1, "14": 3 },
  ];

  // Pick data based on timeFrame for Activity chart
  const activityData =
    activityTimeFrame === "month"
      ? mockMonthlyActivity
      : activityTimeFrame === "week"
      ? mockWeeklyActivity
      : mockYearlyActivity;

  // Activity time frame options
  const frameOptions = [
    { label: "Måned", value: "month" },
    { label: "År", value: "year" },
    { label: "Uge", value: "week" },
  ];

  // Interface for label props
  interface RenderLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    value: number;
    name: string;
    index: number;
  }

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
    <div className="max-w-7xl mx-auto p-5 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Calls</h1>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Download size={18} className="mr-2" />
          Download
        </button>
      </div>

      {/* Time filter dropdown */}
      <div className="mb-6">
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
              {["Tidsramme: Sidste 30 dage", "Sidste 7 dage", "Sidste år"].map(
                (option) => (
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
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* 1st Row: Stats Cards & Donut - Improved Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Samlede Opkald Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 text-center">
            Samlede Opkald
          </h3>
          <p className="text-4xl md:text-5xl font-bold text-gray-900 my-2 truncate w-full text-center">
            {mockCallsData.total}
          </p>
          <p className="text-lg md:text-xl font-medium text-red-500">
            ↑ {mockCallsData.percentageChange}%
          </p>
        </div>

        {/* Gn. opkaldsvarighed Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 text-center">
            Gn. opkaldsvarighed
          </h3>
          <p className="text-4xl md:text-5xl font-bold text-gray-900 my-2 truncate w-full text-center">
            {Math.floor(mockCallsData.avgCallDuration / 60)}m{" "}
            {(mockCallsData.avgCallDuration % 60).toString().padStart(2, "0")}s
          </p>
          <div className="invisible text-sm h-6">&nbsp;</div>
        </div>

        {/* Besvarelsesrate */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 text-center">
            Besvarelsesrate
          </h3>
          <p className="text-4xl md:text-5xl font-bold text-gray-900 my-2 truncate w-full text-center">
            {mockCallsData.responseRate}%
          </p>
          <p className="text-lg md:text-xl font-medium text-green-500">
            ↑ {mockCallsData.responseRateChange}%
          </p>
        </div>
        {/* Donut Chart - More responsive */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Alle opkald
          </h3>

          <div className="relative flex-1 flex justify-center items-center min-h-[160px] md:min-h-[180px]">
            {/* Donut Chart Implementation */}
            <ResponsiveContainer width="100%" height="100%" minHeight={160}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="42%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius="55%"
                  outerRadius="87%"
                  paddingAngle={2}
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ pointerEvents: "none", marginTop: "-20px" }}
            >
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                {totalCalls}
              </span>
              <span className="text-xs text-gray-500">OPKALD</span>
            </div>
          </div>

          {/* Legend with colored boxes */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {donutData.map((entry) => (
              <div
                key={entry.name}
                className="px-2 py-1 rounded-md text-white text-xs font-medium"
                style={{ backgroundColor: entry.color }}
              >
                {entry.name.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2nd Row: Response Rate Chart - With Legend Positioned Lower */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-500">
            Besvarelsesrate & «60s trend (7-dages gns.)
          </h3>
        </div>

        {/* Original height container */}
        <div className="h-[250px] flex flex-col">
          {/* Chart area - slightly taller to push legend down */}
          <div className="h-[85%]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={responseRateTrend}
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
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: "0.85rem" }}
                />
                <Tooltip
                  formatter={(value: number) => {
                    return [`${Math.round(value)}%`, ""];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mål"
                  stroke="#6B7280"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="mål"
                />
                <Line
                  type="monotone"
                  dataKey="besvaret"
                  stroke="#2DD4BF"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="besvaret"
                />
                <Line
                  type="monotone"
                  dataKey="ubesvaret"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="ubesvaret"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with larger text - positioned at the bottom */}
          <div className="h-[15%] flex items-end justify-center pb-1">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-gray-500 mr-1"></div>
                <span className="text-[clamp(11px,0.8vw,14px)]">Mål: 80%</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-teal-400 mr-1"></div>
                <span className="text-[clamp(11px,0.8vw,14px)]">
                  Besvaret (7-dages gns.)
                </span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                <span className="text-[clamp(11px,0.8vw,14px)]">
                  Ubesvaret (7-dages gns.)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 3rd Row: Staff Performance & Call Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Staff Performance */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Opkald besvaret
          </h3>

          <div className="space-y-3">
            {staffPerformance.map((agent) => {
              // Get initials from the name
              const nameParts = agent.name.split(" ");
              const initials =
                nameParts.length > 1
                  ? `${nameParts[0][0]}${nameParts[1][0]}`
                  : nameParts[0][0];

              return (
                <div key={agent.name} className="flex items-center">
                  {/* Initials Circle */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-medium text-sm">
                      {initials}
                    </div>
                  </div>

                  <div className="ml-3 flex-grow">
                    <p className="font-medium text-gray-900 text-sm">
                      {agent.name}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="flex-grow bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(agent.resolved / 15) * 75}%`,
                            backgroundColor: "#10B981",
                            backgroundImage:
                              "linear-gradient(to right, #10B981, #34d399)",
                          }}
                        />
                      </div>
                      <span className="ml-3 font-medium text-gray-900">
                        {agent.resolved}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Call Statistics with reduced height */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Målinger</h3>

          <div className="divide-y divide-gray-100">
            {callStats.map((stat) => (
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
                    <span className="ml-1">{stat.increasing ? "▲" : "▼"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4th Row (Last): Monthly Activity Chart & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Activity Chart - Takes more space (3/5) */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Aktivitet</h3>
            <select
              value={activityTimeFrame}
              onChange={(e) =>
                setActivityTimeFrame(
                  e.target.value as "month" | "week" | "year"
                )
              }
              className="text-indigo-600 font-medium text-sm focus:outline-none"
            >
              {frameOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={activityData}
              margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={40}
                domain={[0, "auto"]}
                tickCount={5}
                allowDecimals={false}
              />
              <Tooltip />
              <Bar
                dataKey="besvaret"
                fill="#2DD4BF"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="ubesvaret"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="afbrudt"
                fill="#F97066"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap - Takes less space (2/5) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">
            Opkald Volume (Heatmap)
          </h3>

          <div className="grid grid-cols-7 gap-1">
            {/* Time labels */}
            <div className="col-span-1"></div>
            {["9", "10", "11", "12", "13", "14"].map((hour) => (
              <div
                key={hour}
                className="text-center text-xs font-medium text-gray-500"
              >
                {hour}
              </div>
            ))}

            {/* Month rows */}
            {heatmap.map((monthData, idx) => (
              <React.Fragment key={idx}>
                <div className="text-xs font-medium text-gray-500 flex items-center">
                  {monthData.month}
                </div>
                {["9", "10", "11", "12", "13", "14"].map((hour) => {
                  // Type casting to handle TypeScript index signature
                  const hourKey = hour as keyof typeof monthData;
                  const intensity = monthData[hourKey] as number;
                  let bgColor = "bg-indigo-100";
                  if (intensity === 2) bgColor = "bg-indigo-300";
                  if (intensity === 3) bgColor = "bg-indigo-400";
                  if (intensity === 4) bgColor = "bg-indigo-500";

                  return (
                    <div
                      key={`${monthData.month}-${hour}`}
                      className={`h-5 rounded-md ${bgColor}`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
