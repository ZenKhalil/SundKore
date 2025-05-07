import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  LineChart,
  Line,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

import {
  Download,
  ChevronDown,
  PlusCircle,
  CalendarDays,
  ArrowUpDown,
  Filter,
  Search,
  Sliders,
  Eye,
  Check,
  AlertCircle,
  Clock,
  CheckCircle2,
  Settings,
  Info,
  List,
  Grid3X3,
  BarChart2,
} from "lucide-react";

import {
  triggerCategories,
  mockTriggers,
  triggerStats,
  donutData,
  mockMonthlyActivity,
  mockWeeklyActivity,
  mockYearlyActivity,
  triggerTrend,
  recentActivity,
  efficiencyData,
  days, // ← import your days array
} from "./mockData";

import {
  getCategoryById,
  getActionIcon,
  renderCustomizedLabel,
  renderTriggerRow,
  renderTriggerCard,
  getSortOptionDisplayName,
} from "./helpers";

import type { Trigger, SortOption, SortOrder, ViewMode } from "./types";

export default function Triggers() {
  // Mass‐action modal state
  const [showMassActionModal, setShowMassActionModal] = useState(false);

  // Header controls
  const [timeFrame, setTimeFrame] = useState("Sidste 30 dage");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Filters & view state
  const [activityTimeFrame, setActivityTimeFrame] = useState<
    "month" | "week" | "year"
  >("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("position");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isPerfMetricsExpanded, setIsPerfMetricsExpanded] = useState(false);

  // Advanced‐search flags & date‐range
  const [searchInTitle, setSearchInTitle] = useState(true);
  const [searchInDescription, setSearchInDescription] = useState(true);
  const [searchInConditions, setSearchInConditions] = useState(false);
  const [searchInActions, setSearchInActions] = useState(false);
  const [searchInEmail, setSearchInEmail] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  // Selected for mass‐actions
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  // Derived & filtered list
  const [filteredTriggers, setFilteredTriggers] =
    useState<Trigger[]>(mockTriggers);

  // Pick the right activity data
  const activityData = useMemo(() => {
    if (activityTimeFrame === "week") return mockWeeklyActivity;
    if (activityTimeFrame === "year") return mockYearlyActivity;
    return mockMonthlyActivity;
  }, [activityTimeFrame]);

  // Handlers (category, status, sort, clear)
  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    setIsFilterDropdownOpen(false);
  };
  const handleActiveFilterToggle = (val: boolean | null) =>
    setActiveFilter(val);
  const handleSortOptionChange = (opt: SortOption) => setSortOption(opt);
  const toggleSortOrder = () =>
    setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter(null);
    setSelectedCategory("all");
    setDateRange([null, null]);
    setShowAdvancedSearch(false);
  };

  // Main filter + sort effect
  useEffect(() => {
    let arr = [...mockTriggers];

    // Status filter
    if (activeFilter !== null) {
      arr = arr.filter((t) =>
        activeFilter ? t.status === "active" : t.status !== "active"
      );
    }
    // Category filter
    if (selectedCategory !== "all") {
      arr = arr.filter((t) => t.category_id === selectedCategory);
    }
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter((t) => {
        let match =
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q);

        if (showAdvancedSearch) {
          if (searchInConditions) {
            match =
              match ||
              t.conditions.some(
                (c) => c.field.includes(q) || c.value.includes(q)
              );
          }
          if (searchInActions) {
            match =
              match ||
              t.actions.some(
                (a) => a.description.includes(q) || a.value.includes(q)
              );
          }
          if (searchInEmail) {
            match =
              match ||
              t.actions.some((a) =>
                ["email_notification", "add_cc"].includes(a.type)
              );
          }
          if (dateRange[0] && dateRange[1]) {
            const d = new Date(t.updated_at);
            match = match && d >= dateRange[0]! && d <= dateRange[1]!;
          }
        }

        return match;
      });
    }

    // Sort
    arr.sort((a, b) => {
      let diff = 0;
      switch (sortOption) {
        case "alphabetical":
          diff = a.title.localeCompare(b.title);
          break;
        case "created_at":
          diff =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "updated_at":
          diff =
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "position":
          diff = a.position - b.position;
          break;
        case "usage_1h":
          diff = a.usage_stats.usage_1h - b.usage_stats.usage_1h;
          break;
        case "usage_24h":
          diff = a.usage_stats.usage_24h - b.usage_stats.usage_24h;
          break;
        case "usage_7d":
          diff = a.usage_stats.usage_7d - b.usage_stats.usage_7d;
          break;
        case "usage_30d":
          diff = a.usage_stats.usage_30d - b.usage_stats.usage_30d;
          break;
      }
      return sortOrder === "asc" ? diff : -diff;
    });

    setFilteredTriggers(arr);
  }, [
    activeFilter,
    selectedCategory,
    searchQuery,
    showAdvancedSearch,
    searchInConditions,
    searchInActions,
    searchInEmail,
    dateRange,
    sortOption,
    sortOrder,
  ]);

  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-300 border-opacity-50 pb-3 mb-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Triggers</h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-white border rounded">
            <Download size={18} className="mr-2" /> Download
          </button>
        </div>
      </div>

      {/* Time Filter */}
      <div className="mb-6">
        <div className="relative inline-block">
          <button
            onClick={() => setIsTimeDropdownOpen((o) => !o)}
            className="flex items-center px-4 py-2 bg-white border rounded"
          >
            <CalendarDays size={16} className="mr-2" /> {timeFrame}
            <ChevronDown size={16} className="ml-2" />
          </button>
          {isTimeDropdownOpen && (
            <div className="absolute mt-1 bg-white shadow rounded w-full">
              {[
                "Sidste 30 dage",
                "Sidste 7 dage",
                "Sidste år",
                "I dag",
                "Denne uge",
                "Denne måned",
              ].map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    setTimeFrame(opt);
                    setIsTimeDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 1st Row: Stats Cards & Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center h-44">
          <h3 className="text-gray-500 text-sm">Totale Triggers</h3>
          <p className="text-4xl font-bold my-2">{triggerStats.total}</p>
          <div className="flex flex-wrap justify-center gap-1">
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
              {triggerStats.active} Aktive
            </span>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
              {triggerStats.inactive} Inaktive
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
              {triggerStats.disabled} Deaktiverede
            </span>
          </div>
        </div>

        {/* Executions */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center h-44">
          <h3 className="text-gray-500 text-sm">Udførte Triggers (30d)</h3>
          <p className="text-4xl font-bold my-2">
            {triggerStats.total_executions.toLocaleString()}
          </p>
          <div className="flex items-center bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs">
            <BarChart2 size={12} className="mr-1" />
            {Math.round(triggerStats.total_executions / 30)} gns. pr. dag
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center h-44">
          <h3 className="text-gray-500 text-sm">Trigger Succesrate</h3>
          <p className="text-4xl font-bold my-2">
            {triggerStats.success_rate.toFixed(1)}%
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
              {Math.round(
                (triggerStats.success_rate / 100) *
                  triggerStats.total_executions
              ).toLocaleString()}{" "}
              Vellykkede
            </span>
            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
              {Math.round(
                ((100 - triggerStats.success_rate) / 100) *
                  triggerStats.total_executions
              ).toLocaleString()}{" "}
              Fejlede
            </span>
          </div>
        </div>
      </div>
      {/* 2nd Row: Trend + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Trend */}
        {/* Trend Chart Section */}
        <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm">Trigger udførelser trend</h3>
            <button
              onClick={() => setIsPerfMetricsExpanded((e) => !e)}
              className="text-xs text-indigo-600 flex items-center"
            >
              {isPerfMetricsExpanded
                ? "Vis standard"
                : "Vis performance metrikker"}
              <ChevronDown
                size={14}
                className={`ml-1 ${isPerfMetricsExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          <div style={{ height: 300 }}>
            {!isPerfMetricsExpanded ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={triggerTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, "auto"]}
                  />
                  <ReferenceLine
                    y={75}
                    stroke="#6B7280"
                    strokeDasharray="3 3"
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="executions"
                    stroke="#6366F1"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="executionTime"
                    name="Gns. Udførelsestid (ms)"
                    domain={[0, "auto"]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="successRate"
                    name="Succesrate (%)"
                    domain={[80, 100]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ZAxis
                    type="number"
                    dataKey="executionCount"
                    range={[50, 400]}
                  />
                  {/* Fixed TypeScript compatible Tooltip */}
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (typeof name !== "string") return [value, ""];

                      if (name === "Gns. Udførelsestid (ms)") {
                        const numValue = typeof value === "number" ? value : 0;
                        return [Math.round(numValue).toString(), name];
                      }

                      if (name === "Succesrate (%)") {
                        const numValue = typeof value === "number" ? value : 0;
                        return [numValue.toFixed(1), name];
                      }

                      return [value, name];
                    }}
                    labelFormatter={() => "Trigger detaljer"}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      padding: "8px 12px",
                    }}
                  />
                  <Scatter name="Triggers" data={efficiencyData}>
                    {efficiencyData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Scatter>
                  <ReferenceLine
                    y={95}
                    stroke="#10B981"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine
                    x={150}
                    stroke="#6B7280"
                    strokeDasharray="3 3"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <div className="flex space-x-4">
              {!isPerfMetricsExpanded ? (
                <>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full mr-1" />{" "}
                    Daglige udførelser
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-gray-400 rounded-full mr-1" />{" "}
                    Målsætning (75 pr. dag)
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />{" "}
                    Succesrate &gt;95%
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-gray-400 rounded-full mr-1" />{" "}
                    Udførelsestid &lt;150ms
                  </div>
                </>
              )}
            </div>
            <div>Tidsperiode: {timeFrame}</div>
          </div>
        </div>

        {/* Donut Chart with Improved Legend Colors */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm mb-2">Trigger resultater</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="none"
                >
                  {donutData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${(Number(value) * 100).toFixed(1)}%`,
                    "Andel",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">
                {triggerStats.total_executions.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">TOTALT</span>
            </div>
          </div>

          {/* Vertically Stacked Legend with Improved Colors */}
          <div className="flex justify-center mt-15 space-x-5">
            {donutData.map((d) => (
              <div key={d.name} className="flex flex-col w-28 shadow-sm">
                <div
                  className="rounded-t-md px-2 py-1 text-white text-xs font-medium text-center"
                  style={{ backgroundColor: d.color }}
                >
                  {d.name.toUpperCase()}
                </div>
                <div className="rounded-b-md px-2 py-1.5 bg-gray-800 text-white text-xs font-medium text-center">
                  {(d.value * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3rd Row: Filter/Search Panel */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Søg efter triggers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border rounded-md"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} />
            </div>
            <button
              onClick={() => setShowAdvancedSearch((s) => !s)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <Sliders size={16} />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen((o) => !o)}
              className="flex items-center px-2 py-2 border rounded-md"
            >
              <Filter size={16} className="mr-2" />
              Kategori: {getCategoryById(selectedCategory).name}
              <ChevronDown size={16} className="ml-2" />
            </button>
            {isFilterDropdownOpen && (
              <div className="absolute mt-1 bg-white shadow-lg rounded-md w-48 divide-y">
                {triggerCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div
                      className="w-4 h-4 mr-2 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: cat.color + "20" }}
                    >
                      {React.createElement(cat.icon as React.ElementType, {
                        width: 12,
                        height: 12,
                        color: cat.color,
                      })}
                    </div>
                    {cat.name}
                    {selectedCategory === cat.id && (
                      <Check size={14} className="ml-auto text-indigo-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {([null, true, false] as (boolean | null)[]).map((val) => (
              <button
                key={String(val)}
                onClick={() => handleActiveFilterToggle(val)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  activeFilter === val
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-white text-gray-700"
                }`}
              >
                {val === null ? "Alle" : val ? "Aktive" : "Inaktive"}
              </button>
            ))}
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Sortér:</span>
            <select
              value={sortOption}
              onChange={(e) =>
                handleSortOptionChange(e.target.value as SortOption)
              }
              className="px-2 py-1 rounded-md border"
            >
              {Object.values([
                "position",
                "alphabetical",
                "created_at",
                "updated_at",
                "usage_1h",
                "usage_24h",
                "usage_7d",
                "usage_30d",
              ] as SortOption[]).map((opt) => (
                <option key={opt} value={opt}>
                  {getSortOptionDisplayName(opt)}
                </option>
              ))}
            </select>
            <button onClick={toggleSortOrder} className="ml-1 p-1 rounded">
              <ArrowUpDown size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded-md ${
                viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-md ${
                viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>

        {/* Advanced search panel */}
        {showAdvancedSearch && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Søg i:</h4>
                <div className="space-y-1">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={searchInTitle}
                      onChange={(e) => setSearchInTitle(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">Titel</span>
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={searchInDescription}
                      onChange={(e) => setSearchInDescription(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">Beskrivelse</span>
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={searchInConditions}
                      onChange={(e) => setSearchInConditions(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">Betingelser</span>
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={searchInActions}
                      onChange={(e) => setSearchInActions(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">Handlinger</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Specifik søgning:
                </h4>
                <div className="space-y-1">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={searchInEmail}
                      onChange={(e) => setSearchInEmail(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2">Kun e-mail indhold</span>
                  </label>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opdateret i perioden:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      onChange={(e) => {
                        const startDate = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        setDateRange([startDate, dateRange[1]]);
                      }}
                    />
                    <span>til</span>
                    <input
                      type="date"
                      className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      onChange={(e) => {
                        const endDate = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        setDateRange([dateRange[0], endDate]);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="text-xs text-gray-500">
                  <p className="mb-2">
                    <Info size={14} className="inline mr-1" />
                    Avanceret søgning lader dig filtrere på tværs af alle
                    aspekter af dine triggers.
                  </p>
                  <p>
                    <AlertCircle size={14} className="inline mr-1" />
                    Søgning i betingelser og handlinger kan være langsommere ved
                    mange triggers.
                  </p>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Nulstil filtre
                  </button>
                  <button
                    onClick={() => setShowAdvancedSearch(false)}
                    className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Anvend filtre
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4th Row: Trigger List & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* List/Grid */}
        <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-sm">
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead>
                  <tr>
                    <th className="py-3 pl-4 pr-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={
                          filteredTriggers.length > 0 &&
                          selectedTriggers.length === filteredTriggers.length
                        }
                        onChange={() => {
                          if (
                            selectedTriggers.length === filteredTriggers.length
                          ) {
                            // Deselect all
                            setSelectedTriggers([]);
                          } else {
                            // Select all
                            setSelectedTriggers(
                              filteredTriggers.map((t) => t.id)
                            );
                          }
                        }}
                      />
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium">
                      Trigger
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium">
                      Beskrivelse
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium">
                      Status
                    </th>
                    <th className="py-3 px-3 text-left text-xs font-medium">
                      Opdateret
                    </th>
                    <th className="py-3 px-3 text-right text-xs font-medium">
                      24t
                    </th>
                    <th className="py-3 px-3 text-right text-xs font-medium">
                      7d
                    </th>
                    <th className="py-3 px-3 text-right text-xs font-medium">
                      30d
                    </th>
                    <th className="py-3 px-3 text-right text-xs font-medium">
                      Succes
                    </th>
                    <th className="py-3 px-3 text-right text-xs font-medium">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTriggers.length ? (
                    filteredTriggers.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="py-3 pl-4 pr-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={selectedTriggers.includes(t.id)}
                            onChange={() => {
                              if (selectedTriggers.includes(t.id)) {
                                setSelectedTriggers(
                                  selectedTriggers.filter((id) => id !== t.id)
                                );
                              } else {
                                setSelectedTriggers([
                                  ...selectedTriggers,
                                  t.id,
                                ]);
                              }
                            }}
                          />
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-900">
                          {t.title}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-500">
                          {t.description}
                        </td>
                        <td className="py-3 px-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded ${
                              t.status === "active"
                                ? "bg-green-100 text-green-800"
                                : t.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {t.status === "active"
                              ? "Aktiv"
                              : t.status === "inactive"
                              ? "Inaktiv"
                              : "Deaktiveret"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-500">
                          {new Date(t.updated_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-500">
                          {t.usage_stats.usage_24h}
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-500">
                          {t.usage_stats.usage_7d}
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-500">
                          {t.usage_stats.usage_30d}
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-500">
                          {Math.round(t.usage_stats.success_rate)}%
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Eye
                              size={14}
                              className="text-gray-400 hover:text-gray-600"
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-8 text-center text-gray-500"
                      >
                        Ingen triggers matcher dine søgekriterier.
                        <button
                          onClick={clearFilters}
                          className="ml-2 text-indigo-600"
                        >
                          Nulstil filtre
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTriggers.length ? (
                filteredTriggers.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300 mt-1 mr-2"
                        checked={selectedTriggers.includes(t.id)}
                        onChange={() => {
                          if (selectedTriggers.includes(t.id)) {
                            setSelectedTriggers(
                              selectedTriggers.filter((id) => id !== t.id)
                            );
                          } else {
                            setSelectedTriggers([...selectedTriggers, t.id]);
                          }
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{t.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          {t.description}
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              t.status === "active"
                                ? "bg-green-100 text-green-800"
                                : t.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {t.status === "active"
                              ? "Aktiv"
                              : t.status === "inactive"
                              ? "Inaktiv"
                              : "Deaktiveret"}
                          </span>
                          <span className="text-gray-500">
                            {t.usage_stats.usage_30d} udførelser
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-gray-500">
                  Ingen triggers matcher dine søgekriterier.
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-indigo-600"
                  >
                    Nulstil filtre
                  </button>
                </div>
              )}
            </div>
          )}
          {filteredTriggers.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Viser {filteredTriggers.length} af {mockTriggers.length}{" "}
                triggers
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={!selectedTriggers.length}
                  onClick={() => setShowMassActionModal(true)}
                  className={`flex items-center px-3 py-1.5 border rounded-md text-sm ${
                    selectedTriggers.length
                      ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Settings size={14} className="mr-1" />
                  Massehandling ({selectedTriggers.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm mb-4">
            Seneste trigger aktivitet
          </h3>
          <div className="space-y-1 divide-y">
            {recentActivity.slice(0, 8).map((act) => (
              <div key={act.id} className="py-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    {act.status === "success" ? (
                      <CheckCircle2 size={16} className="text-green-500 mr-2" />
                    ) : act.status === "failed" ? (
                      <AlertCircle size={16} className="text-red-500 mr-2" />
                    ) : (
                      <Clock size={16} className="text-amber-500 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {act.trigger_name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{act.timestamp}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 pl-6">
                  <div className="flex items-center truncate">
                    <span className="text-indigo-600 mr-1">
                      {act.ticket_id}
                    </span>
                    <span className="mx-1">•</span>
                    {getActionIcon(act.action_type)}
                    <span className="ml-1 truncate">{act.details}</span>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mass Action Modal */}
      {showMassActionModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-200 shadow-lg">
            <h3 className="text-lg font-medium mb-4">Massehandling</h3>
            <p className="mb-4">
              Vælg en handling for {selectedTriggers.length} valgte triggers:
            </p>
            <div className="space-y-2">
              <button
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center"
                onClick={() => {
                  // Update status to active for all selected triggers
                  const updated = mockTriggers.map((t) =>
                    selectedTriggers.includes(t.id)
                      ? { ...t, status: "active" }
                      : t
                  );
                  // In a real app you would update state here:
                  // setMockTriggers(updated);
                  alert(
                    "Aktivér handling blev udført på " +
                      selectedTriggers.length +
                      " triggers"
                  );
                  setShowMassActionModal(false);
                }}
              >
                <CheckCircle2 size={16} className="mr-2 text-green-500" />
                Aktivér
              </button>
              <button
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center"
                onClick={() => {
                  // Update status to inactive for all selected triggers
                  const updated = mockTriggers.map((t) =>
                    selectedTriggers.includes(t.id)
                      ? { ...t, status: "inactive" }
                      : t
                  );
                  // In a real app you would update state here:
                  // setMockTriggers(updated);
                  alert(
                    "Deaktivér handling blev udført på " +
                      selectedTriggers.length +
                      " triggers"
                  );
                  setShowMassActionModal(false);
                }}
              >
                <Clock size={16} className="mr-2 text-yellow-500" />
                Deaktivér
              </button>
              <button
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md flex items-center"
                onClick={() => {
                  if (
                    confirm(
                      "Er du sikker på, at du vil slette " +
                        selectedTriggers.length +
                        " triggers?"
                    )
                  ) {
                    // In a real app you would filter out deleted triggers:
                    // setMockTriggers(mockTriggers.filter(t => !selectedTriggers.includes(t.id)));
                    // setFilteredTriggers(filteredTriggers.filter(t => !selectedTriggers.includes(t.id)));
                    alert(
                      "Slet handling blev udført på " +
                        selectedTriggers.length +
                        " triggers"
                    );
                    setSelectedTriggers([]);
                  }
                  setShowMassActionModal(false);
                }}
              >
                <AlertCircle size={16} className="mr-2 text-red-500" />
                Slet
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMassActionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
              >
                Annuller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5th Row: Monthly Activity Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-500 text-sm">Trigger aktivitet over tid</h3>
          <select
            value={activityTimeFrame}
            onChange={(e) => setActivityTimeFrame(e.target.value as any)}
            className="text-indigo-600"
          >
            <option value="month">Måned</option>
            <option value="year">År</option>
            <option value="week">Uge</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} domain={[0, "auto"]} />
            <Tooltip />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="success"
              name="Vellykkede"
              fill="#10B981"
              barSize={35}
              stackId="a"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="failed"
              name="Mislykkede"
              fill="#F97066"
              barSize={20}
              stackId="a"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="skipped"
              name="Sprunget over"
              fill="#F59E0B"
              barSize={20}
              stackId="a"
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey={(p: any) => (p.success + p.failed + p.skipped) * 0.95}
              name="95% mål"
              stroke="#6366F1"
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
