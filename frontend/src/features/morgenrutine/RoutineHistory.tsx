// src/features/morgenrutine/components/RoutineHistory.tsx

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar as CalendarIcon,
  CheckCheck,
} from "lucide-react";
import type { CompletedRoutine, RoutineStatistics } from "./types";
import {
  getCompletedRoutines,
  formatDate,
  getRoutineStatistics,
} from "./helpers";
import { initializeMockHistoryData } from "./mockData";

/**
 * Component that displays the history of completed morning routines
 * Allows viewing past routines, their steps, and any notes taken
 */
const RoutineHistory: React.FC = () => {
  // State for storing all completed routines
  const [routines, setRoutines] = useState<CompletedRoutine[]>([]);
  // State for keeping track of which routine details are expanded
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);
  // State for routine statistics
  const [statistics, setStatistics] = useState<RoutineStatistics>({
    totalRoutines: 0,
    averageCompletionTime: 0,
    completionRate: 0,
  });

  // Load routines from localStorage on component mount
  useEffect(() => {
    // Initialize mock data for demonstration purposes
    initializeMockHistoryData();

    // Now load the data (which might be real or mock)
    const loadedRoutines = getCompletedRoutines();
    setRoutines(loadedRoutines);
    setStatistics(getRoutineStatistics(loadedRoutines));
  }, []);

  // Toggle expanding/collapsing a routine's details
  const toggleRoutineDetails = (routineId: string) => {
    setExpandedRoutine(expandedRoutine === routineId ? null : routineId);
  };

  // If no routines have been completed yet, show a message
  if (routines.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 text-center">
        <h2 className="text-lg font-medium mb-4">Tidligere rutiner</h2>
        <p className="text-gray-500 mb-2">Ingen tidligere rutiner fundet.</p>
        <p className="text-sm text-gray-400">
          Når du gennemfører en morgenrutine, vil den blive gemt her.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-medium mb-2 md:mb-0">Tidligere rutiner</h2>

        {/* Statistics cards */}
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          <div className="bg-indigo-50 p-2 rounded-lg text-center">
            <div className="flex items-center justify-center text-indigo-600 mb-1">
              <CalendarIcon size={14} className="mr-1" />
              <span className="text-xs font-medium">Antal</span>
            </div>
            <p className="font-bold text-indigo-700">
              {statistics.totalRoutines}
            </p>
          </div>

          <div className="bg-green-50 p-2 rounded-lg text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <Clock size={14} className="mr-1" />
              <span className="text-xs font-medium">Gns. tid</span>
            </div>
            <p className="font-bold text-green-700">
              {statistics.averageCompletionTime} min
            </p>
          </div>

          <div className="bg-blue-50 p-2 rounded-lg text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <CheckCheck size={14} className="mr-1" />
              <span className="text-xs font-medium">Gennemført</span>
            </div>
            <p className="font-bold text-blue-700">
              {statistics.completionRate}%
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* List of completed routines, sorted by date (newest first) */}
        {routines
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((routine) => {
            // Calculate completion percentage for this routine
            const totalSteps = routine.steps.length;
            const completedSteps = routine.steps.filter(
              (step) => step.completed
            ).length;
            const completionPercentage = Math.round(
              (completedSteps / totalSteps) * 100
            );

            return (
              <div
                key={routine.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Routine header/summary (always visible) */}
                <div
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleRoutineDetails(routine.id)}
                >
                  <div className="flex items-center">
                    <Calendar
                      size={18}
                      className="text-indigo-500 mr-2 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-medium">
                        {formatDate(routine.date)}
                      </h3>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock size={14} className="mr-1 flex-shrink-0" />
                        <span>
                          {routine.startTime} - {routine.endTime} (
                          {routine.completionTime} min)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex flex-col items-end mr-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">
                          {completionPercentage}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {completedSteps}/{totalSteps}
                        </span>
                      </div>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-1.5 rounded-full bg-indigo-500"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    {expandedRoutine === routine.id ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded routine details (only visible when expanded) */}
                {expandedRoutine === routine.id && (
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <h4 className="font-medium mb-2 flex items-center text-gray-700">
                      <BarChart3 size={16} className="mr-1.5" />
                      Oversigt over trin
                    </h4>

                    <div className="space-y-2 mt-3">
                      {routine.steps.map((step) => (
                        <div
                          key={step.id}
                          className={`bg-white p-2.5 rounded border ${
                            step.completed
                              ? "border-green-200"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                                step.completed
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {step.completed ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <AlertCircle size={14} />
                              )}
                            </div>
                            <h5
                              className={`font-medium ${
                                step.completed ? "" : "text-gray-500"
                              }`}
                            >
                              {step.name}
                            </h5>
                          </div>

                          {/* Show notes if they exist */}
                          {step.notes && (
                            <div className="mt-2 ml-7">
                              <div className="flex items-center text-gray-700 mb-1 text-sm">
                                <FileText size={14} className="mr-1" />
                                <span>Noter:</span>
                              </div>
                              <p className="text-gray-600 bg-gray-50 p-2 rounded text-sm">
                                {step.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RoutineHistory;
