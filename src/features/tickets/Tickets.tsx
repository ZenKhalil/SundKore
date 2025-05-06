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

// Import the new TicketsTable component
import TicketsTable from "./TicketsTable";

// ------------------------------------
// Mock data based on SundK actual system
// ------------------------------------
const mockTicketsData = {
  totalTickets: 286,
  totalTicketsChange: 34,
  ticketsOpen: 74,
  ticketsOpenChange: 11,
  ticketsWaiting: 66,
  ticketsWaitingChange: 7,
  avgResolutionTime: 339, // minutes
  avgResolutionTimeChange: -34,
};

// Monthly activity data for the bar chart
const monthlyActivity = [
  { name: "JAN", tickets: 190 },
  { name: "FEB", tickets: 260 },
  { name: "MAR", tickets: 310 },
  { name: "APR", tickets: 230 },
  { name: "MAJ", tickets: 240 },
  { name: "JUN", tickets: 170 },
  { name: "JUL", tickets: 140 },
  { name: "AUG", tickets: 200 },
  { name: "SEP", tickets: 300 },
  { name: "OKT", tickets: 250 },
  { name: "NOV", tickets: 240 },
  { name: "DEC", tickets: 270 },
];

// Ticket channels data for donut chart
interface DonutItem {
  name: string;
  value: number;
  color: string;
}
const donutData: DonutItem[] = [
  { name: "E-mail", value: 0.21, color: "#10B981" },
  { name: "Support formular", value: 0.57, color: "#6366F1" },
  { name: "Telefon", value: 0.22, color: "#F97066" },
];
const totalTickets = 286;

// Ticket priority data
const ticketPriorityData = [
  { priority: "Lav", antal: 54, vaerdi: 13, decreasing: true },
  { priority: "Normal", antal: 180, vaerdi: 12, decreasing: false },
  { priority: "Høj", antal: 32, vaerdi: 24, decreasing: true },
  { priority: "Haster", antal: 20, vaerdi: 43, decreasing: false },
];

// Databases from screenshots
const databaseData = [
  { name: "Dansk Anæstesidatabase (DAD)", tickets: 32 },
  { name: "Dansk Hoftealloplastik Register", tickets: 28 },
  { name: "Dansk Kolorektal Cancer Database", tickets: 22 },
  { name: "Dansk Herniedatabase (DHD)", tickets: 18 },
  { name: "Den Nationale Skizofreni database", tickets: 12 },
  { name: "Dansk Psykiatrisk Selskabe", tickets: 22 },
];

// Recent tickets data for the table
const recentTickets = [
  {
    id: "#15483",
    subject: "Glemt adgangskode/spærret bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 15:18",
    anmoder: "tdp@dadlnet.dk",
    database: "Dansk Anæstesidatabase (DAD)",
    response: "18t",
  },
  {
    id: "#15471",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 13:39",
    anmoder: "Frederik Ulrik Scheel 01",
    database: "Dansk Hoftealloplastik Register",
    response: "2d",
  },
  {
    id: "#15477",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 14:43",
    anmoder: "Mortenhartwig",
    database: "Dansk Kolorektal Cancer Database",
    response: "2d",
  },
  {
    id: "#15478",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 14:46",
    anmoder: "Anlap",
    database: "Dansk Herniedatabase (DHD)",
    response: "2d",
  },
  {
    id: "#15489",
    subject: "Anden henvendelse",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 18:32",
    anmoder: "Bitruh",
    database: "",
    response: "1d",
  },
  {
    id: "#15490",
    subject: "Anden henvendelse",
    status: "Ny",
    priority: "Normal",
    updated: "For 44 minutter siden",
    anmoder: "Linnea Damslund",
    database: "",
    response: "2d",
  },
  {
    id: "#14931",
    subject: "Anden henvendelse",
    status: "Åben",
    priority: "Normal",
    updated: "22. apr",
    anmoder: "Ane-Sofie Sølvtofte",
    database: "Den Nationale Skizofreni database",
    response: "2d",
  },
];

// Agent performance data from screenshot 2
const agentPerformance = [
  {
    name: "Maria Jensen",
    initial: "MJ",
    resolved: 24,
    responseTime: 34,
    resolutionTime: 5.2,
    sla: 93,
    satisfaction: 94,
  },
  {
    name: "Lars Nielsen",
    initial: "LN",
    resolved: 18,
    responseTime: 34,
    resolutionTime: 5.2,
    sla: 93,
    satisfaction: 94,
  },
  {
    name: "Sofie Hansen",
    initial: "SH",
    resolved: 22,
    responseTime: 34,
    resolutionTime: 5.2,
    sla: 93,
    satisfaction: 94,
  },
  {
    name: "Thomas Pedersen",
    initial: "TP",
    resolved: 15,
    responseTime: 34,
    resolutionTime: 5.2,
    sla: 93,
    satisfaction: 94,
  },
];

// Ticket volume trend from screenshot 3
const volumeTrendData = [
  { day: "1", current: 12, previous: 10 },
  { day: "2", current: 15, previous: 13 },
  { day: "3", current: 18, previous: 11 },
  { day: "4", current: 14, previous: 16 },
  { day: "5", current: 16, previous: 14 },
  { day: "6", current: 19, previous: 15 },
  { day: "7", current: 21, previous: 18 },
  { day: "8", current: 17, previous: 19 },
  { day: "9", current: 20, previous: 17 },
  { day: "10", current: 22, previous: 18 },
  { day: "11", current: 18, previous: 15 },
  { day: "12", current: 15, previous: 13 },
  { day: "13", current: 19, previous: 17 },
  { day: "14", current: 20, previous: 21 },
  { day: "15", current: 24, previous: 19 },
];

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

// ------------------------------------
// Tickets component
// ------------------------------------
export const Tickets: React.FC = () => {
  // "Sidste 30 dage" / "Sidste år" picker
  const [dateRange, setDateRange] = useState("Sidste 30 dage");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Chart filter: month | week | year
  const [chartFrame, setChartFrame] = useState<"month" | "week" | "year">(
    "month"
  );

  // Other UI state
  const [activeView, setActiveView] = useState("Forskningsudtræk (Ny)");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all"); // "all", "ticket", "email"
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Alle");
  const [selectedDatabase, setSelectedDatabase] = useState("Alle");

  // Dropdown options for Aktivitet chart
  const frameOptions = [
    { label: "Måned", value: "month" },
    { label: "År", value: "year" },
    { label: "Uge", value: "week" },
  ];

  // Pick data based on chartFrame
  const activityData =
    chartFrame === "month"
      ? mockMonthlyActivity
      : chartFrame === "week"
      ? mockWeeklyActivity
      : mockYearlyActivity;

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

  // Function to handle advanced search submission
  const handleAdvancedSearch = () => {
    console.log("Advanced search:", {
      query: searchQuery,
      type: searchType,
      status: selectedStatus,
      database: selectedDatabase,
    });
    setAdvancedSearchOpen(false);
    // Here you would typically filter the tickets based on the search criteria
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* constrain everything to max width */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header row with improved styling */}
        <div className="flex justify-between items-center mb-4 pb-1 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight relative">
            <span className="relative z-10">Tickets</span>
          </h1>
          <div className="flex space-x-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Download size={16} className="mr-2" />
              Download
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">{activeView}</h2>
          <div className="flex items-center space-x-2">
            {/* Search input + advanced */}
            <div className="relative">
              <input
                type="text"
                placeholder="Søg..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <button
                onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <ChevronDown size={16} />
              </button>

              {/* Advanced Search Panel */}
              {advancedSearchOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white shadow-lg rounded-md border border-gray-200 p-3 z-10">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Søg efter
                      </label>
                      <div className="flex space-x-2 text-sm">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="searchType"
                            value="all"
                            checked={searchType === "all"}
                            onChange={() => setSearchType("all")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-1">Alt</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="searchType"
                            value="ticket"
                            checked={searchType === "ticket"}
                            onChange={() => setSearchType("ticket")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-1">Ticket ID</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="searchType"
                            value="email"
                            checked={searchType === "email"}
                            onChange={() => setSearchType("email")}
                            className="h-4 w-4 text-blue-610 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-1">Email</span>
                        </label>
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
          </div>
        </div>

        {/* Time filter */}
        <div className="mb-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calendar size={16} className="mr-2" />
            {dateRange}
            <ChevronDown size={16} className="ml-2" />
          </button>
          {isDropdownOpen && (
            <div className="absolute mt-1 z-10 bg-white shadow-lg rounded-md w-64">
              {[
                "Sidste 30 dage",
                "Sidste 7 dage",
                "Sidste år",
                "I dag",
                "Denne uge",
                "Denne måned",
              ].map((option) => (
                <div
                  key={option}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setDateRange(option);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 1st Row: Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Tickets Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between">
            <div className="text-sm text-gray-500 mb-1">Antal Tickets</div>
            <div className="text-4xl font-bold text-center">
              {mockTicketsData.totalTickets}
            </div>
            <div
              className={`text-sm font-medium ${
                mockTicketsData.totalTicketsChange > 0
                  ? "text-red-500"
                  : "text-green-500"
              } text-center`}
            >
              ↑ {Math.abs(mockTicketsData.totalTicketsChange)}%
            </div>
          </div>
          {/* Tickets Open Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between">
            <div className="text-sm text-gray-500 mb-1">Tickets Åbne</div>
            <div className="text-4xl font-bold text-center">
              {mockTicketsData.ticketsOpen}
            </div>
            <div
              className={`text-sm font-medium ${
                mockTicketsData.ticketsOpenChange > 0
                  ? "text-red-500"
                  : "text-green-500"
              } text-center`}
            >
              ↑ {Math.abs(mockTicketsData.ticketsOpenChange)}%
            </div>
          </div>
          {/* Tickets i Bero Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between">
            <div className="text-sm text-gray-500 mb-1">Tickets i Bero</div>
            <div className="text-4xl font-bold text-center">
              {mockTicketsData.ticketsWaiting}
            </div>
            <div
              className={`text-sm font-medium ${
                mockTicketsData.ticketsWaitingChange > 0
                  ? "text-red-500"
                  : "text-green-500"
              } text-center`}
            >
              ↓ {Math.abs(mockTicketsData.ticketsWaitingChange)}%
            </div>
          </div>
          {/* Average Resolution Time Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-between">
            <div className="text-sm text-gray-500 mb-1">
              Endelig løsningstid (min.)
            </div>
            <div className="text-4xl font-bold text-center">
              {mockTicketsData.avgResolutionTime}
            </div>
            <div
              className={`text-sm font-medium ${
                mockTicketsData.avgResolutionTimeChange > 0
                  ? "text-red-500"
                  : "text-green-500"
              } text-center`}
            >
              ↓ {Math.abs(mockTicketsData.avgResolutionTimeChange)}%
            </div>
          </div>
        </div>

        {/* 2nd Row: Ticket Volume Trend and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ticket Volume Trend */}
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
                    name="Nuværende periode"
                    stroke="#818CF8"
                    fillOpacity={1}
                    fill="url(#colorCurrent)"
                  />
                  <Area
                    type="monotone"
                    dataKey="previous"
                    name="Forrige periode"
                    stroke="#94A3B8"
                    fillOpacity={1}
                    fill="url(#colorPrevious)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center text-xs text-gray-500 space-x-6 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-400 mr-1"></div>
                <span>Nuværende periode</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
                <span>Forrige periode</span>
              </div>
            </div>
          </div>

          {/* Aktivitet Chart */}
          <div className="w-full md:w-[90%] bg-white rounded-xl shadow-sm p-4 flex flex-col h-66">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">Aktivitet</h3>
              <select
                value={chartFrame}
                onChange={(e) =>
                  setChartFrame(e.target.value as "month" | "week" | "year")
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

        {/* 3rd Row: Database Distribution and Agent Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Database Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tickets efter database
            </h3>
            <div className="space-y-3">
              {databaseData.map((database, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 truncate max-w-[70%]">
                      {database.name}
                    </span>
                    <span className="text-gray-500">{database.tickets}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          (database.tickets /
                            Math.max(...databaseData.map((d) => d.tickets))) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Performance */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Agent ydeevne
            </h3>
            <div className="space-y-4">
              {agentPerformance.map((agent, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {agent.initial}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {agent.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {agent.resolved} løst
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(agent.resolved / 25) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Gennemsnitlige nøgletal
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-xs font-medium text-gray-700">
                    Response
                  </div>
                  <div className="text-sm font-semibold">34 min</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700">
                    Resolution
                  </div>
                  <div className="text-sm font-semibold">5.2 timer</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700">SLA</div>
                  <div className="text-sm font-semibold">93%</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700">CSAT</div>
                  <div className="text-sm font-semibold">94%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4th Row: Tickets by Priority and Channel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tickets by Priority */}
          <div className="bg-white rounded-xl shadow-sm p-4">
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

          {/* Tickets per Channel */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tickets efter kanal
            </h3>
            <div className="relative flex-1 flex justify-center items-center min-h-[190px] md:min-h-[200px]">
              {/* Donut Chart Implementation */}
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
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
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ pointerEvents: "none" }}
              >
                <span className="text-2xl font-bold text-gray-900">
                  {totalTickets}
                </span>
                <span className="text-xs text-gray-500">TICKETS</span>
              </div>
            </div>
            {/* Legend with colored chips */}
            <div className="flex justify-center space-x-3 mt-3">
              {donutData.map((entry) => (
                <div key={entry.name} className="flex items-center">
                  <span
                    className="inline-block w-12 text-xs text-center text-white py-1 px-2 rounded-md"
                    style={{ backgroundColor: entry.color }}
                  >
                    {Math.round(entry.value * 100)}%
                  </span>
                  <span className="ml-1 text-xs text-gray-700">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5th Row: Use the new TicketsTable component */}
        <TicketsTable tickets={recentTickets} />
      </div>
    </div>
  );
};

export default Tickets;
