// src/features/reports/Reports.tsx

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
} from "recharts";
import { Download } from "lucide-react";

// ------------------------------------
// Mock data
// ------------------------------------
const mockTicketsData = {
  total: 256,
  pending: 72,
  avgCallDuration: 334, // seconds
  percentageChange: 12,
  pendingPercentageChange: -7,
};

const mockMonthlyActivity = [
  { name: "JAN", tickets: 100 },
  { name: "FEB", tickets: 140 },
  { name: "MAR", tickets: 135 },
  { name: "APR", tickets: 240 },
  { name: "MAJ", tickets: 275 },
  { name: "JUN", tickets: 200 },
  { name: "JUL", tickets: 230 },
  { name: "AUG", tickets: 100 },
  { name: "SEP", tickets: 270 },
  { name: "OKT", tickets: 330 },
  { name: "NOV", tickets: 380 },
  { name: "DEC", tickets: 250 },
];

const mockWeeklyActivity = [
  { name: "Man", tickets: 40 },
  { name: "Tir", tickets: 55 },
  { name: "Ons", tickets: 60 },
  { name: "Tor", tickets: 80 },
  { name: "Fre", tickets: 70 },
  { name: "Lør", tickets: 50 },
  { name: "Søn", tickets: 30 },
];

const mockYearlyActivity = [
  { name: "2022", tickets: 1200 },
  { name: "2023", tickets: 1350 },
  { name: "2024", tickets: 1500 },
];

const mockFormData = [
  { name: "Opret ny bruger", percentage: 67 },
  { name: "Glemt Brugernavn", percentage: 26 },
  { name: "Fejl i database", percentage: 9 },
];

const mockTicketHistory = [
  { status: "Åbne", count: 77 },
  { status: "Løst", count: 107 },
  { status: "I Bero", count: 72 },
];

const mockAgents = [
  { name: "Steen Andersen", resolved: 15, initial: "S" },
  { name: "Eva Hansen", resolved: 9, initial: "E" },
  { name: "Peter Mortensen", resolved: 11, initial: "P" },
];

const mockTriggers = [
  { name: "Set Normal Prioritet", count: 51, trend: "up" },
  { name: "Genåben Sideløbende Samtaler", count: 12, trend: "down" },
  { name: "Tildel ticket til Support Gruppe", count: 19, trend: "up" },
  { name: "Forskningsudtræk tildeling", count: 33, trend: "down" },
];

interface DonutItem {
  name: string;
  value: number;
  color: string;
}

const donutData: DonutItem[] = [
  { name: "Afbrudt", value: 0.32, color: "#F97066" },
  { name: "Ubesvaret", value: 0.38, color: "#6366F1" },
  { name: "Besvaret", value: 0.30, color: "#2DD4BF" },
];
const totalCalls = 498;

// ------------------------------------
// Reports component
// ------------------------------------
export const Reports: React.FC = () => {
  // Heatmap state
  const [heatmapData] = useState(() => {
    const intensities = [
      "bg-indigo-100",
      "bg-indigo-200",
      "bg-indigo-300",
      "bg-indigo-400",
      "bg-indigo-500",
      "bg-indigo-600",
    ];
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAJ", "JUN",
      "JUL", "AUG", "SEP", "OKT", "NOV", "DEC",
    ];
    const hours = ["9", "10", "11", "12", "13", "14"];
    return months.map((m) =>
      hours.map((h) => ({
        month: m,
        hour: h,
        intensity:
          intensities[Math.floor(Math.random() * intensities.length)],
      }))
    );
  });

  // Timeframe dropdown state
  const [timeFrame, setTimeFrame] = useState<"month" | "year" | "week">("month");

  // Pick data based on timeFrame
  const activityData =
    timeFrame === "month"
      ? mockMonthlyActivity
      : timeFrame === "week"
      ? mockWeeklyActivity
      : mockYearlyActivity;

  // Dropdown options
  const frameOptions = [
    { label: "Måned", value: "month" },
    { label: "År", value: "year" },
    { label: "Uge", value: "week" }
  ];
  
  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 pb-3 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Download size={18} className="mr-2" />
          Download
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-3">
        {[
          {
            defaultValue: "Sidste 30 dage",
            options: ["Sidste 30 dage", "Sidste 7 dage", "Sidste år"],
          },
          {
            defaultValue: "Personer: Alle",
            options: ["Personer: Alle", "Kun agenter", "Kun administratorer"],
          },
          {
            defaultValue: "Emner: All",
            options: ["Emner: All", "Tekniske problemer", "Konto problemer"],
          },
        ].map((sel, i) => (
          <select
            key={i}
            defaultValue={sel.defaultValue}
            className="block w-64 pl-3 pr-10 py-2 text-base border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {sel.options.map((opt, j) => (
              <option key={j} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* 1st Row: Stats + Chart */}
      <div className="flex flex-col md:flex-row items-start gap-5 mb-4">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-shrink-0">
          {[
            {
              label: "Samlede Tickets",
              value: mockTicketsData.total,
              change: `↑ ${mockTicketsData.percentageChange}%`,
              changeClass: "text-red-500",
            },
            {
              label: "I Bero Tickets",
              value: mockTicketsData.pending,
              change: `↓ ${Math.abs(
                mockTicketsData.pendingPercentageChange
              )}%`,
              changeClass: "text-green-500",
            },
            {
              label: "Gn. opkaldsvarighed",
              value: `${Math.floor(
                mockTicketsData.avgCallDuration / 60
              )}m ${(
                mockTicketsData.avgCallDuration % 60
              )
                .toString()
                .padStart(2, "0")}s`,
              noChange: true,
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between h-38"
            >
              <h3 className="text-sm font-medium text-gray-500 text-center">
                {card.label}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              {card.noChange ? (
                <div className="invisible text-sm">&nbsp;</div>
              ) : (
                <p className={`text-sm font-medium ${card.changeClass}`}>
                  {card.change}
                </p>
              )}
            </div>
          ))}
        </div>

{/* Aktivitet Chart */}
        <div className="w-full md:w-[90%] bg-white rounded-xl shadow-sm p-4 flex flex-col h-66">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Aktivitet</h3>
            <select
              value={timeFrame}
              onChange={(e) =>
                setTimeFrame(e.target.value as "month" | "week" | "year")
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
          <div className="flex-1 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 16, right: 16 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="tickets"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  barSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2nd Row: Forms & History - Balanced content size */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
        {/* Tickets formularer - Balanced content */}
        <div className="bg-white rounded-xl shadow-sm p-3 h-44">
          <h2 className="text-sm font-medium text-gray-500">
            Tickets formularer
          </h2>
          <div className="space-y-4">
            {mockFormData.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-sm font-medium text-gray-900">
                    {item.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-red-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Ticket Historik - Balanced content */}
        <div className="bg-white rounded-xl shadow-sm p-3 h-44">
          <h2 className="text-sm font-medium text-gray-500">
            Ticket Historik
          </h2>
          <div className="space-y-4">
            {mockTicketHistory.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-sm font-medium text-gray-900">
                    {item.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-red-100 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(item.count / 120) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3rd Row: Calls & Triggers - Responsive content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
{/* Opkald besvaret - Responsive content */}
<div className="bg-white rounded-xl shadow-sm p-4">
  <h3 className="text-sm font-medium text-gray-500 mb-3">
    Opkald besvaret
  </h3>
  
  <div className="space-y-3">
    {mockAgents.map((agent) => {
      // Get first letter of first name and first letter of last name
      const nameParts = agent.name.split(' ');
      const firstInitial = nameParts[0][0];
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
      const initials = `${firstInitial}${lastInitial}`;
      
      return (
        <div key={agent.name} className="flex items-center">
          {/* Initials Circle */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-medium text-base">
              {initials}
            </div>
          </div>
          
          <div className="ml-3 flex-grow">
            <p className="font-medium text-gray-900 text-sm mb-1">
              {agent.name}
            </p>
            
            {/* Container that aligns progress bar and number */}
            <div className="flex items-center">
              <div className="flex-grow bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${(agent.resolved / 15) * 75}%`,
                    backgroundColor: "#10B981",
                    backgroundImage: "linear-gradient(to right, #10B981, #34d399)",
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
        
        {/* Aktive Triggers - With fully contained content */}
        <div className="bg-white rounded-xl shadow-sm p-3 h-57 flex flex-col">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Aktive Triggers
          </h2>
          
          {/* Main content with flex-1 to take available space */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Trigger items with auto-sizing */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-2">
                {mockTriggers.map((trigger, idx) => (
                  <div key={idx} className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-gray-900 text-sm">
                      {trigger.name}
                    </span>
                    <div className="flex items-center">
                      <span className="mr-1 font-medium text-gray-900">
                        {trigger.count}
                      </span>
                      <span
                        className={
                          trigger.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {trigger.trend === "up" ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer always at bottom with padding to create space */}
            <div className="pt-2 text-center border-t mt-auto">
              <a
                href="#"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Vis alle triggers
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4th Row: Heatmap & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Heatmap */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col h-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-500">
              Opkald Volume (Heatmap)
            </h2>
            <div className="text-sm font-medium text-gray-500">
              Alle opkald
            </div>
          </div>
          <div className="flex flex-1">
            {/* Months */}
            <div className="flex flex-col gap-0.5 mr-2">
              {heatmapData.map((row, i) => (
                <div
                  key={i}
                  className="h-6 flex items-center text-sm font-medium text-gray-700"
                >
                  {row[0].month}
                </div>
              ))}
            </div>
            {/* Cells + Hours */}
            <div className="flex-1">
              <div className="grid grid-cols-6 gap-0.5">
                {heatmapData.flat().map((cell, i) => (
                  <div
                    key={i}
                    className={`h-6 rounded-md ${cell.intensity}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-6 gap-0.5 mt-1 text-sm font-medium text-gray-700">
                {heatmapData[0].map((cell, i) => (
                  <div key={i} className="text-center">
                    {cell.hour}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

{/* Donut Chart */}
<div className="bg-white rounded-xl shadow-sm p-4 flex flex-col h-auto">
  <h2 className="text-large font-medium text-gray-500 mb-4">Alle opkald</h2>
  
  <div className="relative flex-1 flex justify-center items-center min-h-64">
    {/* Define the proper type for label props */}
    {(() => {
      // Define the interface for the label props
      interface RenderLabelProps {
        cx: number;
        cy: number;
        midAngle: number;
        outerRadius: number;
        value: number;
        name: string;
        index: number;
      }
      
      const renderCustomizedLabel = (props: RenderLabelProps) => {
        const { cx, cy, midAngle, outerRadius, value } = props;
        // Convert the midAngle to radians for calculation
        const radian = Math.PI / 180;
        // Position the label outside the pie
        const radius = outerRadius * 1.15; 
        // Calculate x, y position
        const x = cx + radius * Math.cos(-midAngle * radian);
        const y = cy + radius * Math.sin(-midAngle * radian);
        // Calculate percentage for display
        const percent = Math.round(value * 100);
        
        return (
          <g>
            <foreignObject 
              x={x - 25} 
              y={y - 15} 
              width={50} 
              height={30}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '3px 8px',
                  color: '#333',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  fontFamily: 'sans-serif'
                }}
              >
                {percent}%
              </div>
            </foreignObject>
          </g>
        );
      };
      
      return (
        <ResponsiveContainer width="100%" height={270}>
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
      );
    })()}
    
    {/* Center text - properly positioned with flexbox - now positioned higher */}
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center" 
      style={{ pointerEvents: 'none', marginTop: '-40px' }}
    >
      <span className="text-2xl font-bold text-gray-900">{totalCalls}</span>
      <span className="text-xs text-gray-500">OPKALD</span>
    </div>
  </div>
  
  {/* Single, properly styled legend at the bottom */}
<div className="mt-6 flex justify-center gap-6">
  {donutData.map((entry) => (
    <div 
      key={entry.name} 
      className="px-4 py-2 rounded-md text-white text-sm font-medium"
      style={{ backgroundColor: entry.color }}
    >
      {entry.name.toUpperCase()}
    </div>
  ))}
</div>
</div>
      </div>
    </div>
  );
};
