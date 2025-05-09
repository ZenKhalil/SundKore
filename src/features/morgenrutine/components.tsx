// src/features/morgenrutine/components.tsx

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  Info,
  Coffee,
  CheckSquare,
  Loader,
  Shield,
  Bell,
  Database,
  Server,
  Zap,
  FileText,
  Monitor,
  ArrowRight,
  UserCheck,
  Play,
  ExternalLink,
  PlusCircle,
  Settings,
  X,
  RefreshCw,
  MoreHorizontal,
  Share2,
  CheckSquare as CheckSquareIcon,
} from "lucide-react";

// ------------------------------------
// Types
// ------------------------------------
export interface Alert {
  id: string;
  level: "error" | "warning" | "info";
  resolved: boolean;
  system: string;
  time: string;
  message: string;
  details?: string;
}

export interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  assignee: string;
  estimation: string;
  details?: string;
}

export interface SystemStatusItem {
  name: string;
  status: "active" | "warning" | "error";
  lastChecked: string;
  responseTime: number;
  uptime?: number;
  details?: string;
}

export interface RoutineStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  time: string;
  duration: number;
  guidance?: string;
  automatable?: boolean;
  isChecking?: boolean;
  autoCheckResult?: "success" | "error";
  checkMessage?: string;
  links?: { title: string; url: string }[];
}

export interface StatusSummary {
  totalSystems: number;
  systemsUp: number;
  systemsWarning: number;
  systemsDown: number;
  backupStatus: string;
  batchStatus: string;
  averageResponseTime: number;
}

// Define the period options
type Period = "14d" | "30d" | "3m" | "6m" | "1y";

interface CompletionTimeChartProps {
  // The original data will be the full dataset
  allCompletionData: { date: string; time: number }[];
  averageCompletionTime: number;
}

// Helper component for period buttons
interface PeriodButtonProps {
  period: Period;
  label: string;
  selected: boolean;
  onClick: () => void;
}

// ------------------------------------
// Utils
// ------------------------------------
export const getStatusIcon = (status: SystemStatusItem["status"]) => {
  switch (status) {
    case "active":
      return <CheckCircle2 size={16} className="text-green-500" />;
    case "warning":
      return <Clock size={16} className="text-amber-500" />;
    case "error":
      return <AlertCircle size={16} className="text-red-500" />;
    default:
      return <Info size={16} className="text-gray-500" />;
  }
};

export const getAlertIcon = (level: Alert["level"]) => {
  switch (level) {
    case "error":
      return <AlertCircle size={16} className="text-red-500" />;
    case "warning":
      return <Bell size={16} className="text-amber-500" />;
    case "info":
    default:
      return <Info size={16} className="text-blue-500" />;
  }
};

export const getPriorityStyle = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: <Zap size={14} className="text-red-500 mr-1" />,
      };
    case "medium":
      return {
        bgColor: "bg-amber-100",
        textColor: "text-amber-800",
        icon: <Clock size={14} className="text-amber-500 mr-1" />,
      };
    case "low":
    default:
      return {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: <Info size={14} className="text-blue-500 mr-1" />,
      };
  }
};

// Helper component for period buttons
const PeriodButton = ({ label, selected, onClick }: PeriodButtonProps) => (
  <button
    className={`px-3 py-1 text-xs font-medium rounded-md transition ${
      selected
        ? "bg-indigo-600 text-white"
        : "bg-transparent text-gray-600 hover:bg-gray-200"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Helper function to filter data by period
const filterDataByPeriod = (
  data: { date: string; time: number }[],
  period: Period,
  currentDate: Date
): { date: string; time: number }[] => {
  if (!data || data.length === 0) return [];

  // Clone to avoid mutating the original
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate cutoff date for the selected period
  let cutoffDate = new Date(currentDate);
  switch (period) {
    case "14d":
      cutoffDate.setDate(cutoffDate.getDate() - 14);
      break;
    case "30d":
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      break;
    case "3m":
      cutoffDate.setMonth(cutoffDate.getMonth() - 3);
      break;
    case "6m":
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
      break;
    case "1y":
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
      break;
  }

  // Filter data based on cutoff date
  return sortedData.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= cutoffDate && itemDate <= currentDate;
  });
};

// ------------------------------------
// Routine Checklist Component
// ------------------------------------
export const RoutineChecklist = ({
  steps,
  currentStep,
  routineStarted,
  routineComplete,
  progressPercentage,
  startTime,
  estimatedEndTime,
  elapsedTime,
  expandedSteps,
  stepNotes,
  toggleStep,
  toggleStepDetails,
  handleNoteChange,
  runAutomaticCheck,
}: {
  steps: RoutineStep[];
  currentStep: number;
  routineStarted: boolean;
  routineComplete: boolean;
  progressPercentage: number;
  startTime: string;
  estimatedEndTime: string;
  elapsedTime: number;
  expandedSteps: string[];
  stepNotes: Record<string, string>;
  toggleStep: (id: string) => void;
  toggleStepDetails: (id: string) => void;
  handleNoteChange: (id: string, note: string) => void;
  runAutomaticCheck: (id: string) => void;
}) => {
  return (
    <>
      {/* Progress circle and bar */}
      <div className="flex flex-col md:flex-row items-center mb-4">
        <div className="relative w-32 h-32 mb-4 md:mb-0 md:mr-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={
                progressPercentage === 100
                  ? "#10B981"
                  : progressPercentage > 60
                  ? "#6366F1"
                  : progressPercentage > 30
                  ? "#F59E0B"
                  : "#6366F1"
              }
              strokeWidth="8"
              strokeDasharray={`${
                (2 * Math.PI * 45 * progressPercentage) / 100
              } ${(2 * Math.PI * 45 * (100 - progressPercentage)) / 100}`}
              strokeDashoffset={(2 * Math.PI * 45 * 25) / 100}
              strokeLinecap="round"
              transform="rotate(-90, 50, 50)"
            />
            {/* Percentage text */}
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
              fontWeight="bold"
              fill="#374151"
            >
              {Math.round(progressPercentage)}%
            </text>
          </svg>
        </div>

        <div className="flex-grow w-full md:w-auto">
          <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
            <div
              className={`h-2 rounded-full ${
                progressPercentage === 100
                  ? "bg-green-500"
                  : progressPercentage > 60
                  ? "bg-blue-500"
                  : progressPercentage > 30
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Current step timer if routine has started */}
          {routineStarted && !routineComplete && steps[currentStep] && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock size={14} className="mr-1" />
              <span>
                Tid brugt på nuværende trin: {Math.floor(elapsedTime / 60)}m{" "}
                {elapsedTime % 60}s
                {elapsedTime > steps[currentStep].duration * 60 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                    Tager længere tid end forventet
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Time indicators */}
      {routineStarted && (
        <div className="flex justify-between text-sm text-gray-500 mb-6">
          <div>
            <span className="font-medium">Starttid:</span> {startTime}
          </div>
          <div>
            <span className="font-medium">Forventet sluttid:</span>{" "}
            {estimatedEndTime}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            {routineComplete ? (
              <span className="text-green-600">Gennemført</span>
            ) : (
              <span className="text-blue-600">
                I gang - Trin {currentStep + 1} af {steps.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-3 rounded-md ${
              step.completed
                ? "bg-green-50 border border-green-100"
                : index === currentStep && routineStarted
                ? "bg-blue-50 border border-blue-100"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => toggleStep(step.id)}
                  disabled={!routineStarted}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-sm font-medium ${
                      step.completed
                        ? "text-gray-400 line-through"
                        : index === currentStep && routineStarted
                        ? "text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    {step.name}
                  </p>
                  {index === currentStep &&
                    routineStarted &&
                    !step.completed && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Aktuel
                      </span>
                    )}
                  {step.autoCheckResult === "success" && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                      <CheckCircle2 size={12} className="mr-1" />{" "}
                      Auto-verificeret
                    </span>
                  )}
                  {step.autoCheckResult === "error" && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                      <AlertCircle size={12} className="mr-1" /> Verificering
                      fejlede
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Forventet tid: {step.time}</span>
                  <span>Varighed: {step.duration} min</span>
                  {step.automatable &&
                    routineStarted &&
                    !step.completed &&
                    !step.isChecking && (
                      <button
                        onClick={() => runAutomaticCheck(step.id)}
                        className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center"
                      >
                        <Zap size={12} className="mr-1" /> Auto-check
                      </button>
                    )}
                  {step.isChecking && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center">
                      <Loader size={12} className="mr-1 animate-spin" />{" "}
                      Checker...
                    </span>
                  )}
                </div>

                {/* Expandable content */}
                <div className="mt-2 flex justify-between">
                  <button
                    onClick={() => toggleStepDetails(step.id)}
                    className="text-indigo-600 text-xs flex items-center"
                  >
                    {expandedSteps.includes(step.id) ? (
                      <>
                        <ChevronDown size={14} className="mr-1" /> Skjul
                        detaljer
                      </>
                    ) : (
                      <>
                        <ChevronRight size={14} className="mr-1" /> Vis detaljer
                      </>
                    )}
                  </button>

                  {step.checkMessage && (
                    <div className="text-xs text-gray-500">
                      {step.checkMessage}
                    </div>
                  )}
                </div>

                {expandedSteps.includes(step.id) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-sm text-gray-700">
                      Vejledning:
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.guidance || "Ingen vejledning tilgængelig."}
                    </p>

                    {step.links && step.links.length > 0 && (
                      <>
                        <h4 className="font-medium text-sm text-gray-700 mt-3">
                          Links:
                        </h4>
                        <div className="mt-1 space-y-1">
                          {step.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              className="block text-sm text-indigo-600 hover:underline"
                            >
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="mt-3">
                      <label
                        htmlFor={`note-${step.id}`}
                        className="block font-medium text-sm text-gray-700"
                      >
                        Noter:
                      </label>
                      <textarea
                        id={`note-${step.id}`}
                        value={stepNotes[step.id] || ""}
                        onChange={(e) =>
                          handleNoteChange(step.id, e.target.value)
                        }
                        placeholder="Tilføj noter eller observationer..."
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ------------------------------------
// System Status Panel
// ------------------------------------
export const SystemStatusPanel = ({
  systemStatus,
  statusSummary,
  onSelectSystem,
}: {
  systemStatus: SystemStatusItem[];
  statusSummary: StatusSummary;
  onSelectSystem: (system: SystemStatusItem) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <h2 className="text-lg font-medium mb-4">Systemstatus</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
        <div className="text-xs text-gray-500">Systemer online</div>
        <div className="text-xl font-bold mt-1">
          {statusSummary.systemsUp} / {statusSummary.totalSystems}
        </div>
      </div>
      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
        <div className="text-xs text-gray-500">Backup status</div>
        <div className="text-xl font-bold mt-1 text-amber-600">
          {statusSummary.backupStatus}
        </div>
      </div>
      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
        <div className="text-xs text-gray-500">Batch job status</div>
        <div className="text-xl font-bold mt-1 text-red-600">
          {statusSummary.batchStatus}
        </div>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="text-xs text-gray-500">Gns. svartid</div>
        <div className="text-xl font-bold mt-1">
          {statusSummary.averageResponseTime}s
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-2">System</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Sidst tjekket</th>
            <th className="px-4 py-2 text-right">Svartid</th>
            <th className="px-4 py-2 text-right">Handlinger</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {systemStatus.map((system) => (
            <tr key={system.name} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {system.name}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    system.status === "active"
                      ? "bg-green-100 text-green-800"
                      : system.status === "warning"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {getStatusIcon(system.status)}
                  <span className="ml-1">
                    {system.status === "active"
                      ? "Online"
                      : system.status === "warning"
                      ? "Advarsel"
                      : "Fejl"}
                  </span>
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {system.lastChecked}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 text-right">
                {system.responseTime > 0 ? `${system.responseTime}s` : "-"}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                  onClick={() => onSelectSystem(system)}
                >
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ------------------------------------
// Alerts Panel
// ------------------------------------
export const AlertsPanel = ({
  alerts,
  onSelectAlert,
}: {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium">Nattens alarmer</h2>
      <div className="text-xs text-gray-500">
        {alerts.filter((a) => !a.resolved).length} uløste
      </div>
    </div>
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-md ${
            alert.level === "error"
              ? "bg-red-50 border border-red-100"
              : alert.level === "warning"
              ? "bg-amber-50 border border-amber-100"
              : "bg-blue-50 border border-blue-100"
          } ${alert.resolved ? "opacity-60" : ""}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {getAlertIcon(alert.level)}
              <span className="ml-2 font-medium text-sm">{alert.system}</span>
            </div>
            {alert.resolved && (
              <span className="text-xs bg-green-100 text-green-800 rounded px-1.5 py-0.5">
                Løst
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{alert.time}</span>
          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
          <div className="flex justify-between mt-2">
            <button
              className="text-indigo-600 text-xs hover:underline"
              onClick={() => onSelectAlert(alert)}
            >
              Se detaljer
            </button>
            {!alert.resolved && (
              <button className="text-green-600 text-xs hover:underline flex items-center">
                <CheckSquareIcon size={12} className="mr-1" />
                Markér som løst
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ------------------------------------
// Tasks Panel
// ------------------------------------
export const TasksPanel = ({
  tasks,
  completedTasks,
  toggleTaskCompletion,
  onAddTask,
}: {
  tasks: Task[];
  completedTasks: string[];
  toggleTaskCompletion: (taskId: string) => void;
  onAddTask: () => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium">Dagens opgaver</h2>
      <div className="text-xs text-gray-500">
        {completedTasks.length}/{tasks.length} gennemført
      </div>
    </div>
    <div className="space-y-3">
      {tasks.map((task) => {
        const style = getPriorityStyle(task.priority);
        const done = completedTasks.includes(task.id);
        return (
          <div
            key={task.id}
            className={`flex items-start border border-gray-200 rounded-md p-3 ${
              done ? "bg-green-50 border-green-100" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={done}
              onChange={() => toggleTaskCompletion(task.id)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div className="ml-3 flex-grow">
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium text-sm ${
                    done ? "text-gray-400 line-through" : "text-gray-800"
                  }`}
                >
                  {task.title}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${style.bgColor} ${style.textColor}`}
                >
                  {style.icon} {task.priority}
                </span>
              </div>
              {task.details && (
                <p
                  className={`text-xs mt-1 ${
                    done ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {task.details}
                </p>
              )}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Tildelt: {task.assignee}</span>
                <span>Estimat: {task.estimation}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    <div className="mt-4 flex justify-center">
      <button
        onClick={onAddTask}
        className="text-indigo-600 text-sm flex items-center"
      >
        <PlusCircle size={16} className="mr-1" /> Tilføj opgave
      </button>
    </div>
  </div>
);

// ------------------------------------
// Completion Time Chart
// ------------------------------------
export const CompletionTimeChart = ({
  allCompletionData,
  averageCompletionTime,
}: CompletionTimeChartProps) => {
  // State for selected period
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("14d");
  // State for filtered data based on selected period
  const [completionHistory, setCompletionHistory] = useState(
    allCompletionData || []
  );
  // State for period-specific average
  const [periodAverage, setPeriodAverage] = useState(averageCompletionTime);

  // Update the chart data when period changes
  useEffect(() => {
    const today = new Date();
    const filteredData = filterDataByPeriod(
      allCompletionData || [],
      selectedPeriod,
      today
    );
    setCompletionHistory(filteredData);

    // Calculate the average for the filtered period
    if (filteredData.length > 0) {
      const sum = filteredData.reduce((acc, item) => acc + item.time, 0);
      setPeriodAverage(Math.round(sum / filteredData.length));
    } else {
      setPeriodAverage(0);
    }
  }, [selectedPeriod, allCompletionData]);

  // Get display label for the header
  const getPeriodLabel = (period: Period): string => {
    switch (period) {
      case "14d":
        return "seneste 14 dage";
      case "30d":
        return "seneste 30 dage";
      case "3m":
        return "seneste 3 måneder";
      case "6m":
        return "seneste 6 måneder";
      case "1y":
        return "seneste år";
      default:
        return "seneste 14 dage";
    }
  };

  // Find minimum and maximum time values to set Y-axis domain
  const minTime =
    completionHistory.length > 0
      ? Math.max(
          Math.min(...completionHistory.map((item) => item.time)) - 5,
          25
        )
      : 30;

  const maxTime =
    completionHistory.length > 0
      ? Math.max(...completionHistory.map((item) => item.time)) + 5
      : 50;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-lg font-medium">
          Gennemførelsestid ({getPeriodLabel(selectedPeriod)})
        </h2>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <PeriodButton
            period="14d"
            label="14D"
            selected={selectedPeriod === "14d"}
            onClick={() => setSelectedPeriod("14d")}
          />
          <PeriodButton
            period="30d"
            label="30D"
            selected={selectedPeriod === "30d"}
            onClick={() => setSelectedPeriod("30d")}
          />
          <PeriodButton
            period="3m"
            label="3M"
            selected={selectedPeriod === "3m"}
            onClick={() => setSelectedPeriod("3m")}
          />
          <PeriodButton
            period="6m"
            label="6M"
            selected={selectedPeriod === "6m"}
            onClick={() => setSelectedPeriod("6m")}
          />
          <PeriodButton
            period="1y"
            label="1Y"
            selected={selectedPeriod === "1y"}
            onClick={() => setSelectedPeriod("1y")}
          />
        </div>
      </div>

      {completionHistory.length === 0 ? (
        <div className="flex justify-center items-center h-40 text-gray-500">
          Ingen data tilgængelig for den valgte periode
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart
            data={completionHistory}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              height={35}
              tickMargin={8}
              tickCount={
                selectedPeriod === "1y" ? 6 : selectedPeriod === "6m" ? 6 : 5
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[minTime, maxTime]}
              tickFormatter={(v) => `${v} min`}
              width={50}
            />
            <Tooltip
              formatter={(v: any) => [`${v} minutter`, "Gennemførelsestid"]}
              labelFormatter={(l) => `Dato: ${l}`}
            />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6366F1" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="flex justify-center items-center mt-3 text-sm text-gray-500">
        <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
        Gennemsnitlig tid for perioden: {periodAverage} minutter
      </div>
    </div>
  );
};

// ------------------------------------
// Success Rate Chart
// ------------------------------------
export const SuccessRateChart = ({
  successRates,
}: {
  successRates: { day: string; successRate: number }[];
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <h2 className="text-lg font-medium mb-4">Daglig succesrate</h2>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={successRates}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} />
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[80, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip formatter={(v: any) => [`${v}%`, "Succesrate"]} />
        <Bar dataKey="successRate" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// ------------------------------------
// Quick Links Panel
// ------------------------------------
export const QuickLinksPanel = () => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <h2 className="text-lg font-medium mb-4">Quick Links & Vejledning</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        {
          icon: <FileText size={16} />,
          title: "Morgenrutine vejledning",
          desc: "Komplet dokumentation om morgenrutinens trin, formål og fejlhåndtering",
        },
        {
          icon: <Monitor size={16} />,
          title: "Systemoversigt",
          desc: "Dashboard med detaljeret realtidsoversigt over alle systemstatusser",
        },
        {
          icon: <UserCheck size={16} />,
          title: "Vagtoversigt",
          desc: "Se hvem der har vagt i dag og kontaktoplysninger til support",
        },
      ].map(({ icon, title, desc }, i) => (
        <div
          key={i}
          className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition"
        >
          <h3 className="text-indigo-600 font-medium text-sm flex items-center">
            {React.cloneElement(icon, { className: "mr-2" })}
            {title}
          </h3>
          <p className="mt-2 text-xs text-gray-500">{desc}</p>
          <div className="mt-2 flex justify-end">
            <ArrowRight size={14} className="text-indigo-600" />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
      <h3 className="font-medium text-sm text-blue-700 flex items-center">
        <Info size={16} className="mr-2" />
        Morgenrutine tjekliste
      </h3>
      <ul className="mt-2 text-sm text-gray-600 space-y-2">
        {[
          "Tjek alle systemer i prioriteret rækkefølge (brugerstyring, database, webservices)",
          "Verificer at alle nattens backups er gennemført korrekt og tilgængelige",
          "Gennemgå logs for kritiske fejl (især batch jobs og integrationer)",
          "Ved kritiske fejl: Kontakt vagthavende på telefonnummer 45 12 34 56",
        ].map((text, i) => (
          <li key={i} className="flex items-start">
            <CheckSquare
              size={14}
              className="text-green-500 mr-2 mt-1 flex-shrink-0"
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// ------------------------------------
// System Links Grid
// ------------------------------------
export const SystemLinksGrid = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <h2 className="text-lg font-medium mb-4">Systemer der skal tjekkes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <a
          href="#"
          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
        >
          <Shield className="text-green-500 mr-3" />
          <div>
            <div className="font-medium text-gray-800">Brugerstyring</div>
            <div className="text-xs text-gray-500">
              Administrér brugere og rettigheder
            </div>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
        >
          <Database className="text-blue-500 mr-3" />
          <div>
            <div className="font-medium text-gray-800">Database Admin</div>
            <div className="text-xs text-gray-500">
              Administrér databaser og queries
            </div>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
        >
          <Server className="text-indigo-500 mr-3" />
          <div>
            <div className="font-medium text-gray-800">Server Oversigt</div>
            <div className="text-xs text-gray-500">
              Tjek servere og infrastruktur
            </div>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
        >
          <Clock className="text-amber-500 mr-3" />
          <div>
            <div className="font-medium text-gray-800">Batch Jobs</div>
            <div className="text-xs text-gray-500">
              Overvåg og administrér schedulerede jobs
            </div>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
        >
          <ExternalLink className="text-purple-500 mr-3" />
          <div>
            <div className="font-medium text-gray-800">Web Tjenester</div>
            <div className="text-xs text-gray-500">
              Status for alle eksterne web API'er
            </div>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
        >
          <AlertCircle className="text-red-500 mr-3" />
          <div>
            <div className="font-medium text-gray-800">Alarm Oversigt</div>
            <div className="text-xs text-gray-500">
              Aktuelle alarmer og hændelser
            </div>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
        >
          <FileText className="text-teal-500 mr-3" />
          <div>
            <div className="font-medium text-gray-800">Logfiler</div>
            <div className="text-xs text-gray-500">Gennemse systemlogfiler</div>
          </div>
        </a>
        <a
          href="#"
          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
        >
          <Coffee className="text-amber-800 mr-3" />
          <div>
            <div className="font-medium text-gray-800">Kaffepause</div>
            <div className="text-xs text-gray-500">
              Sæt rutinen på pause 5 minutter
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

// ------------------------------------
// Settings Modal
// ------------------------------------
export const SettingsModal = ({
  steps,
  onClose,
}: {
  steps: RoutineStep[];
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Morgenrutine Indstillinger</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X size={20} />
        </button>
      </div>
      {/* Notifications */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h4 className="font-medium mb-2">Notifikationer</h4>
        <div className="space-y-2">
          {[
            { id: "email-notifications", label: "Send email påmindelser" },
            { id: "slack-notifications", label: "Send Slack notifikationer" },
          ].map(({ id, label }) => (
            <div key={id} className="flex items-center">
              <input
                type="checkbox"
                id={id}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={id} className="ml-2 text-sm text-gray-700">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
      {/* Routine Settings */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h4 className="font-medium mb-2">Tilpas Rutine</h4>
        <div className="space-y-3">
          <div>
            <label htmlFor="start-time" className="block text-sm text-gray-700">
              Daglig starttid
            </label>
            <input
              type="time"
              id="start-time"
              defaultValue="08:00"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="auto-check" className="flex items-center">
              <input
                type="checkbox"
                id="auto-check"
                defaultChecked
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Aktivér automatisk system-check
              </span>
            </label>
          </div>
          <div>
            <label
              htmlFor="report-format"
              className="block text-sm text-gray-700"
            >
              Rapport format
            </label>
            <select
              id="report-format"
              defaultValue="pdf"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="email">Email format</option>
            </select>
          </div>
        </div>
      </div>
      {/* Steps Toggle */}
      <div className="pb-4 mb-4">
        <h4 className="font-medium mb-2">Tilpas Trin</h4>
        <p className="text-sm text-gray-500 mb-3">
          Aktivér eller deaktivér trin i morgenrutinen
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                id={`enable-${step.id}`}
                defaultChecked
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`enable-${step.id}`}
                className="ml-2 text-sm text-gray-700 flex-grow"
              >
                {step.name}
              </label>
              <div className="text-gray-400 flex space-x-1">
                <button className="p-1 hover:text-gray-600">
                  <ArrowUpDown size={14} />
                </button>
                <button className="p-1 hover:text-gray-600">
                  <Settings size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
        >
          Annuller
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Gem indstillinger
        </button>
      </div>
    </div>
  </div>
);

// ------------------------------------
// System Details Modal
// ------------------------------------
export const SystemDetailsModal = ({
  system,
  onClose,
}: {
  system: SystemStatusItem;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {system.name} - Detaljeret Status
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X size={20} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[
          {
            label: "Status",
            content: getStatusIcon(system.status) && (
              <div className="flex items-center">
                {getStatusIcon(system.status)}
                <span className="ml-2 font-medium">
                  {system.status === "active"
                    ? "Online"
                    : system.status === "warning"
                    ? "Advarsel"
                    : "Fejl"}
                </span>
              </div>
            ),
          },
          {
            label: "Svartid",
            content: (
              <div className="font-medium mt-1">
                {system.responseTime.toFixed(2)}s
              </div>
            ),
          },
          {
            label: "Uptime",
            content: (
              <div className="font-medium mt-1">
                {system.uptime?.toFixed(1)}%
              </div>
            ),
          },
          {
            label: "Sidst kontrolleret",
            content: (
              <div className="font-medium mt-1">{system.lastChecked}</div>
            ),
          },
        ].map(({ label, content }, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">{label}</div>
            {content}
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 rounded mb-4">
        <h4 className="font-medium mb-2">Detaljer</h4>
        <p className="text-sm text-gray-600">
          {system.details || "Ingen yderligere detaljer tilgængelige."}
        </p>
      </div>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="font-medium mb-2">Handlinger</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm flex items-center">
            <RefreshCw size={14} className="mr-1" /> Opdater status
          </button>
          <button className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md text-sm flex items-center">
            <ExternalLink size={14} className="mr-1" /> Åbn admin panel
          </button>
          <button className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-md text-sm flex items-center">
            <FileText size={14} className="mr-1" /> Se logs
          </button>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
        >
          Luk
        </button>
      </div>
    </div>
  </div>
);

// ------------------------------------
// Alert Details Modal
// ------------------------------------
export const AlertDetailsModal = ({
  alert,
  onClose,
}: {
  alert: Alert;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Alarm Detaljer - {alert.system}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X size={20} />
        </button>
      </div>
      <div
        className={`p-4 rounded-md mb-4 ${
          alert.level === "error"
            ? "bg-red-50"
            : alert.level === "warning"
            ? "bg-amber-50"
            : "bg-blue-50"
        }`}
      >
        <div className="flex items-center mb-2">
          {getAlertIcon(alert.level)}
          <span className="ml-2 font-medium">{alert.message}</span>
        </div>
        <div className="text-sm text-gray-600">
          {alert.details || "Ingen yderligere detaljer tilgængelige."}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Tidspunkt</div>
          <div className="font-medium mt-1">{alert.time}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Status</div>
          <div className="font-medium mt-1">
            {alert.resolved ? "Løst" : "Uløst"}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="font-medium mb-2">Handlinger</h4>
        <div className="flex flex-wrap gap-2">
          {!alert.resolved && (
            <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm flex items-center">
              <CheckSquareIcon size={14} className="mr-1" /> Markér som løst
            </button>
          )}
          <button className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md text-sm flex items-center">
            <Share2 size={14} className="mr-1" /> Send til kollega
          </button>
          <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm flex items-center">
            <FileText size={14} className="mr-1" /> Opret sag
          </button>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
        >
          Luk
        </button>
      </div>
    </div>
  </div>
);

// ------------------------------------
// Add Task Modal
// ------------------------------------
export const AddTaskModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Tilføj ny opgave</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-gray-700"
          >
            Opgave titel
          </label>
          <input
            type="text"
            id="task-title"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Indtast opgave titel"
          />
        </div>
        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-gray-700"
          >
            Beskrivelse
          </label>
          <textarea
            id="task-description"
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Beskriv opgaven"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-gray-700"
            >
              Prioritet
            </label>
            <select
              id="task-priority"
              defaultValue="medium"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="high">Høj</option>
              <option value="medium">Medium</option>
              <option value="low">Lav</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="task-estimation"
              className="block text-sm font-medium text-gray-700"
            >
              Estimeret tid
            </label>
            <input
              type="text"
              id="task-estimation"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="f.eks. 1 time"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="task-assignee"
            className="block text-sm font-medium text-gray-700"
          >
            Tildel til
          </label>
          <select
            id="task-assignee"
            defaultValue="me"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="me">Mig selv</option>
            <option value="team">Team</option>
            <option value="peter">Peter Jensen</option>
            <option value="maria">Maria Nielsen</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
        >
          Annuller
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Tilføj opgave
        </button>
      </div>
    </div>
  </div>
);
