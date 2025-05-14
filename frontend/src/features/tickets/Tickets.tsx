// src/features/tickets/Tickets.tsx
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
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  ChevronDown,
  Filter,
  Search,
  Calendar,
  Plus,
} from "lucide-react";

import TicketsTable from "./TicketsTable";
import type { RenderLabelProps } from "./types";
import {
  ticketsStatsData,
  donutData,
  ticketPriorityData,
  databaseData,
  mockTickets,
  frameOptions,
  getActivityData,
  volumeTrendData,
  agentPerformance,
} from "./mockDataTickets";

export const Tickets: React.FC = () => {
  // ALWAYS use mock data
  const useMock = true;

  // 1) Date picker
  const [dateRange, setDateRange] = useState("Sidste 30 dage");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // 2) Aktivitet chart timeframe
  const [chartFrame, setChartFrame] = useState<"month" | "week" | "year">(
    "month"
  );
  const activityData = getActivityData(chartFrame);

  // 3) Search + advanced search
  const [activeView, setActiveView] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "ticket" | "email">(
    "all"
  );
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Alle");
  const [selectedDatabase, setSelectedDatabase] = useState("Alle");

  const handleAdvancedSearch = () => {
    console.log({
      query: searchQuery,
      type: searchType,
      status: selectedStatus,
      database: selectedDatabase,
    });
    setAdvancedSearchOpen(false);
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header row with separator line */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        </div>
        {/* Search + actions row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          {/* Search input with advanced dropdown */}
          <div className="relative">
            <input
              type="text"
              placeholder="Søg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <button
              onClick={() => setAdvancedSearchOpen((o) => !o)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <ChevronDown size={16} />
            </button>
            {advancedSearchOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-10">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Søg efter
                    </label>
                    <div className="flex space-x-2 text-sm">
                      {["all", "ticket", "email"].map((t) => (
                        <label key={t} className="flex items-center">
                          <input
                            type="radio"
                            name="searchType"
                            value={t}
                            checked={searchType === t}
                            onChange={() => setSearchType(t as any)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-1">
                            {t === "all"
                              ? "Alt"
                              : t === "ticket"
                              ? "Ticket ID"
                              : "Email"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option>Alle</option>
                      <option>Ny</option>
                      <option>Åben</option>
                      <option>Løst</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Database
                    </label>
                    <select
                      className="w-full text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedDatabase}
                      onChange={(e) => setSelectedDatabase(e.target.value)}
                    >
                      <option>Alle</option>
                      {databaseData.map((db) => (
                        <option key={db.name}>{db.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md"
                      onClick={handleAdvancedSearch}
                    >
                      Søg
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter & Download buttons */}
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 shadow-sm rounded-md text-sm bg-white hover:bg-gray-50">
              <Filter size={16} className="mr-2" /> Filter
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 shadow-sm rounded-md text-sm bg-white hover:bg-gray-50">
              <Download size={16} className="mr-2" /> Download
            </button>
          </div>
        </div>

        {/* 1st Row: Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Antal Tickets",
              value: ticketsStatsData.totalTickets,
              change: ticketsStatsData.totalTicketsChange,
            },
            {
              label: "Tickets Åbne",
              value: ticketsStatsData.ticketsOpen,
              change: ticketsStatsData.ticketsOpenChange,
            },
            {
              label: "Tickets i Bero",
              value: ticketsStatsData.ticketsWaiting,
              change: -ticketsStatsData.ticketsWaitingChange,
            },
            {
              label: "Endelig løsningstid (min.)",
              value: ticketsStatsData.avgResolutionTime,
              change: -ticketsStatsData.avgResolutionTimeChange,
            },
          ].map(({ label, value, change }, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between"
            >
              <div className="text-sm text-gray-500 mb-1">{label}</div>
              <div className="text-4xl font-bold text-gray-900">{value}</div>
              <div
                className={`text-xl font-medium ${
                  change >= 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
              </div>
            </div>
          ))}
        </div>

        {/* 2nd Row: Ticket Volume Trend and Aktivitet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Volume Trend */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Ticket Volume
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={volumeTrendData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorCurrent"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#818CF8"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorPrevious"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.6} />
                      <stop
                        offset="95%"
                        stopColor="#94A3B8"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f5f5f5"
                  />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, "auto"]}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#818CF8"
                    fill="url(#colorCurrent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="previous"
                    stroke="#94A3B8"
                    fill="url(#colorPrevious)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center text-xs text-gray-500 space-x-6 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-400 mr-1" />{" "}
                Nuværende periode
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-400 mr-1" />{" "}
                Forrige periode
              </div>
            </div>
          </div>

          {/* Aktivitet */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col h-85">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Aktivitet</h3>
              <select
                value={chartFrame}
                onChange={(e) => setChartFrame(e.target.value as any)}
                className="text-indigo-600 font-medium text-sm focus:outline-none"
              >
                {frameOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="4 4"
                    stroke="#d1d5db"
                    strokeWidth={1.5}
                    opacity={0.8}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    padding={{ left: 12, right: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, "auto"]}
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

        {/* 3rd Row: Database Distribution and Agent Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Database Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tickets efter database
            </h3>
            <div className="space-y-3">
              {databaseData.map((db, i) => {
                const pct =
                  (db.tickets /
                    Math.max(...databaseData.map((d) => d.tickets))) *
                  100;
                return (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-900 truncate max-w-[70%]">
                        {db.name}
                      </span>
                      <span className="text-gray-500">{db.tickets}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Agent ydeevne
            </h3>
            <div className="space-y-4">
              {agentPerformance.map((ag, i) => (
                <div key={i} className="flex items-start">
                  <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {ag.initial}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {ag.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {ag.resolved} løst
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(ag.resolved / 25) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Gennemsnitlige nøgletal
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-500">Response</div>
                  <div className="text-sm font-semibold">34 min</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Resolution</div>
                  <div className="text-sm font-semibold">5.2 timer</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">SLA</div>
                  <div className="text-sm font-semibold">93%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4th Row: Tickets by Priority and Channel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tickets by Priority */}
          <div className="bg-white rounded-xl shadow-sm p-4 h-75">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tickets efter prioritet
            </h3>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                    Prioritet
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                    ANTAL
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                    VÆRDI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ticketPriorityData.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {item.priority}
                    </td>
                    <td className="py-3 text-lg font-medium text-gray-900 text-right">
                      {item.antal}
                    </td>
                    <td className="py-3 text-right">
                      <div
                        className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm ${
                          item.decreasing
                            ? "text-red-800 bg-red-100"
                            : "text-green-800 bg-green-100"
                        }`}
                        style={{ width: "fit-content" }}
                      >
                        {item.vaerdi} {item.decreasing ? "▼" : "▲"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Channel */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tickets efter kanal
            </h3>
            <div className="relative flex-1 flex justify-center items-center min-h-[250px] md:min-h-[200px] h-50">
              <ResponsiveContainer width="100%" height="100%" minHeight={230}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {donutData.map((cell, idx) => (
                      <Cell key={idx} fill={cell.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ pointerEvents: "none" }}
              >
                <div className="text-2xl font-bold text-gray-900">
                  {ticketsStatsData.totalTickets}
                </div>
                <div className="text-xs text-gray-500">TICKETS</div>
              </div>
            </div>
            <div className="flex justify-center space-x-3 mt-3">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center">
                  <span
                    className="inline-block w-12 text-xs text-center text-white py-1 px-2 rounded-md"
                    style={{ backgroundColor: d.color }}
                  >
                    {Math.round(d.value * 100)}%
                  </span>
                  <span className="ml-1 text-xs text-gray-700">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* 5th Row: Tickets Table */}
        <TicketsTable initialTickets={mockTickets} />
      </div>
    </div>
  );
};

export default Tickets;
