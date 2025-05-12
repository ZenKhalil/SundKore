// src/features/morgenrutine/Morgenrutine.tsx
import RoutineHistory from "./RoutineHistory";

import React, { useState, useEffect } from "react";
import {
  Download,
  ChevronDown,
  Settings,
  Calendar,
  Play,
  CheckCircle2,
} from "lucide-react";

import type { RoutineStep, CompletedRoutine } from "./types";
import { saveCompletedRoutine } from "./helpers";

import {
  routineSteps,
  systemStatus,
  overnightAlerts,
  statusSummary,
  tasksForToday,
  completionHistory,
  dailySuccessRates,
} from "./data";

// Import components - ensure these match the components you have
import {
  SystemStatusPanel,
  AlertsPanel,
  TasksPanel,
  CompletionTimeChart,
  SuccessRateChart,
  QuickLinksPanel,
  SystemLinksGrid,
  SettingsModal,
  SystemDetailsModal,
  AlertDetailsModal,
  AddTaskModal,
} from "./components";

import RoutineChecklist from "./RoutineChecklist";

export default function Morgenrutine() {
  // State for morning routine
  const [steps, setSteps] = useState<RoutineStep[]>(routineSteps);
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString("da-DK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  const [startTime, setStartTime] = useState<string>("08:00");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [routineStarted, setRoutineStarted] = useState<boolean>(false);
  const [routineComplete, setRoutineComplete] = useState<boolean>(false);
  const [estimatedEndTime, setEstimatedEndTime] = useState<string>("08:45");
  const [selectedDate, setSelectedDate] = useState<string>("I dag");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentStepStartTime, setCurrentStepStartTime] = useState<number>(
    Date.now()
  );
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedSystem, setSelectedSystem] = useState<any | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  // New state for tracking routine start timestamp
  const [routineStartTimeStamp, setRoutineStartTimeStamp] = useState<number>(0);

  // Timer to update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (routineStarted && !routineComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - currentStepStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [routineStarted, routineComplete, currentStepStartTime]);

  // Update timer when currentStep changes
  useEffect(() => {
    if (routineStarted && !routineComplete) {
      setCurrentStepStartTime(Date.now());
      setElapsedTime(0);
    }
  }, [currentStep, routineStarted, routineComplete]);

  // New function to save completed routine
  const saveRoutineHistory = () => {
    // Only save if the routine was actually started
    if (!routineStartTimeStamp) return;

    // Calculate actual completion time in minutes
    const completionTimeMinutes = Math.round(
      (Date.now() - routineStartTimeStamp) / 60000
    );

    // Create completed routine object
    const completedRoutine: CompletedRoutine = {
      id: `routine-${Date.now()}`,
      date: new Date().toLocaleDateString("da-DK"),
      startTime,
      endTime: new Date().toLocaleTimeString("da-DK", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      completionTime: completionTimeMinutes,
      steps: steps.map((step) => ({
        id: step.id,
        name: step.name,
        completed: step.completed,
        notes: stepNotes[step.id] || "",
      })),
    };

    // Save to localStorage
    saveCompletedRoutine(completedRoutine);
  };

  // Toggle step completion
  const toggleStep = (id: string) => {
    const updatedSteps = steps.map((step) => {
      if (step.id === id) {
        return { ...step, completed: !step.completed };
      }
      return step;
    });
    setSteps(updatedSteps);

    // Update current step
    const completedCount = updatedSteps.filter((step) => step.completed).length;
    setCurrentStep(completedCount);

    // Check if all steps are completed
    if (completedCount === steps.length) {
      setRoutineComplete(true);
      saveRoutineHistory(); // Save routine history when completed
    } else {
      setRoutineComplete(false);
    }
  };

  // Start morning routine
  const startRoutine = () => {
    setRoutineStarted(true);
    // Reset all steps to not completed
    const resetSteps = steps.map((step) => ({ ...step, completed: false }));
    setSteps(resetSteps);
    setCurrentStep(0);
    setRoutineComplete(false);

    // Set timestamps
    const now = new Date();
    setRoutineStartTimeStamp(now.getTime());
    setCurrentStepStartTime(now.getTime());

    // Set current time as start time
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    setStartTime(currentTime);

    // Calculate estimated end time
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    const endDate = new Date(now.getTime() + totalDuration * 60000);
    const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    setEstimatedEndTime(endTime);
  };

  // Complete current step
  const completeCurrentStep = () => {
    if (currentStep < steps.length) {
      const updatedSteps = [...steps];
      updatedSteps[currentStep].completed = true;
      setSteps(updatedSteps);
      setCurrentStep(currentStep + 1);
      setCurrentStepStartTime(Date.now());

      // Check if all steps are completed
      if (currentStep + 1 === steps.length) {
        setRoutineComplete(true);
        saveRoutineHistory(); // Save routine history when completed
      }
    }
  };

  // Toggle step details
  const toggleStepDetails = (id: string) => {
    setExpandedSteps((prev) =>
      prev.includes(id) ? prev.filter((stepId) => stepId !== id) : [...prev, id]
    );
  };

  // Handle note change
  const handleNoteChange = (stepId: string, note: string) => {
    setStepNotes((prev) => ({
      ...prev,
      [stepId]: note,
    }));
  };

  // Run automatic check for a step
  const runAutomaticCheck = async (stepId: string) => {
    // Find the step to update
    const stepToUpdate = steps.find((step) => step.id === stepId);
    if (!stepToUpdate || !stepToUpdate.automatable) return;

    // Update step to checking state
    const updatedSteps: RoutineStep[] = steps.map(
      (step): RoutineStep =>
        step.id === stepId ? { ...step, isChecking: true } : step
    );
    setSteps(updatedSteps);

    try {
      // Simulate an API call to check the system
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Random success for demonstration (80% chance of success)
      const isSuccess = Math.random() > 0.2;

      // Update the step result
      const completedSteps: RoutineStep[] = updatedSteps.map(
        (step): RoutineStep =>
          step.id === stepId
            ? {
                ...step,
                isChecking: false,
                completed: isSuccess,
                autoCheckResult: isSuccess ? "success" : "error",
                checkMessage: isSuccess
                  ? "System er verificeret og fungerer normalt"
                  : "Fejl: Kunne ikke bekræfte systemstatus",
              }
            : step
      );
      setSteps(completedSteps);

      // If successful, bump currentStep and maybe mark all done
      if (isSuccess) {
        const completedCount = completedSteps.filter((s) => s.completed).length;
        setCurrentStep(completedCount);
        if (completedCount === steps.length) {
          setRoutineComplete(true);
          saveRoutineHistory(); // Save routine history when completed via auto-check
        }
      }
    } catch (error) {
      // Handle errors: mark this one as errored
      const errorSteps: RoutineStep[] = steps.map(
        (step): RoutineStep =>
          step.id === stepId
            ? {
                ...step,
                isChecking: false,
                autoCheckResult: "error",
                checkMessage: "Fejl ved system-check",
              }
            : step
      );
      setSteps(errorSteps);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Calculate progress percentage
  const progressPercentage =
    (steps.filter((step) => step.completed).length / steps.length) * 100;

  // Calculate average minutes
  const averageCompletionTime = Math.round(
    completionHistory.reduce((sum, item) => sum + item.time, 0) /
      completionHistory.length
  );

  return (
    <div className="max-w-7xl mx-auto p-5 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Morgenrutine</h1>
          <p className="text-gray-500">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <Calendar size={16} className="mr-2" />
              {selectedDate}
              <ChevronDown size={14} className="ml-2" />
            </button>
            {isDateDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md z-10">
                {["I dag", "I går", "Denne uge", "Sidste uge"].map((date) => (
                  <div
                    key={date}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedDate(date);
                      setIsDateDropdownOpen(false);
                    }}
                  >
                    {date}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="flex items-center px-3 py-2 border border-gray-300 shadow-sm rounded-md bg-white"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={16} className="mr-2" />
            Indstillinger
          </button>
          <button className="flex items-center px-3 py-2 border border-gray-300 shadow-sm rounded-md bg-white">
            <Download size={16} className="mr-2" />
            Rapport
          </button>
        </div>
      </div>

      {/* Routine Progress & Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Dagens Morgenrutine</h2>
          {!routineStarted ? (
            <button
              onClick={startRoutine}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Play size={16} className="mr-2" />
              Start Morgenrutine
            </button>
          ) : routineComplete ? (
            <div className="text-green-600 flex items-center">
              <CheckCircle2 size={18} className="mr-2" />
              Rutine gennemført
            </div>
          ) : (
            <button
              onClick={completeCurrentStep}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <CheckCircle2 size={16} className="mr-2" />
              Markér trin {currentStep + 1} som fuldført
            </button>
          )}
        </div>

        <RoutineChecklist
          steps={steps}
          currentStep={currentStep}
          routineStarted={routineStarted}
          routineComplete={routineComplete}
          progressPercentage={progressPercentage}
          startTime={startTime}
          estimatedEndTime={estimatedEndTime}
          elapsedTime={elapsedTime}
          expandedSteps={expandedSteps}
          stepNotes={stepNotes}
          toggleStep={toggleStep}
          toggleStepDetails={toggleStepDetails}
          handleNoteChange={handleNoteChange}
          runAutomaticCheck={runAutomaticCheck}
        />
      </div>

      {/* System Status & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* System Status */}
        <div className="lg:col-span-2">
          <SystemStatusPanel
            systemStatus={systemStatus}
            statusSummary={statusSummary}
            onSelectSystem={setSelectedSystem}
          />
        </div>

        {/* Overnight Alerts */}
        <div className="lg:col-span-1">
          <AlertsPanel
            alerts={overnightAlerts}
            onSelectAlert={setSelectedAlert}
          />
        </div>
      </div>

      {/* Routine History */}
      <div className="mb-6">
        <RoutineHistory />
      </div>

      {/* Tasks for Today & Completion Time History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tasks for Today */}
        <div className="lg:col-span-1">
          <TasksPanel
            tasks={tasksForToday}
            completedTasks={completedTasks}
            toggleTaskCompletion={toggleTaskCompletion}
            onAddTask={() => setShowAddTaskModal(true)}
          />
        </div>

        {/* Routine Success Rate & Completion Time */}
        <div className="lg:col-span-2">
          <CompletionTimeChart
            allCompletionData={completionHistory}
            averageCompletionTime={averageCompletionTime}
          />
        </div>
      </div>

      {/* Success Rate Chart & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Success Rate */}
        <div className="lg:col-span-1">
          <SuccessRateChart successRates={dailySuccessRates} />
        </div>

        {/* Quick Links & Documentation */}
        <div className="lg:col-span-2">
          <QuickLinksPanel />
        </div>
      </div>

      {/* External System Links */}
      <SystemLinksGrid />

      {/* Footer */}
      <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-500 flex justify-between">
        <div>
          <p>Seneste rutine gennemført: I går - 42 minutter</p>
          <p>Ansvarlig: Peter Jensen</p>
        </div>
        <div className="text-right">
          <p>Ved kritiske fejl: Ring +45 12 34 56 78</p>
          <p>Support e-mail: support@example.com</p>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <SettingsModal steps={steps} onClose={() => setShowSettings(false)} />
      )}

      {selectedSystem && (
        <SystemDetailsModal
          system={selectedSystem}
          onClose={() => setSelectedSystem(null)}
        />
      )}

      {selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      {showAddTaskModal && (
        <AddTaskModal onClose={() => setShowAddTaskModal(false)} />
      )}
    </div>
  );
}
