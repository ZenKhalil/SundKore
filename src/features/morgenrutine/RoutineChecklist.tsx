// src/features/morgenrutine/components/RoutineChecklist.tsx

import React from "react";
import { ChevronDown, ChevronUp, Check, Clock, Play } from "lucide-react";
import type { RoutineStep } from "./types";

interface RoutineChecklistProps {
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
  handleNoteChange: (stepId: string, note: string) => void;
  runAutomaticCheck: (stepId: string) => void;
}

const RoutineChecklist: React.FC<RoutineChecklistProps> = ({
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
}) => {
  // Format elapsed time to MM:SS
  const formatElapsedTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div>
      {/* Progress bar */}
      {routineStarted && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              {startTime} - {estimatedEndTime}
            </div>
            <div>
              {routineComplete
                ? "Gennemført"
                : `Trin ${currentStep + 1} af ${steps.length}`}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <div>Start: {startTime}</div>
            <div>
              {routineComplete
                ? "Færdig!"
                : `Tid på nuværende trin: ${formatElapsedTime(elapsedTime)}`}
            </div>
          </div>
        </div>
      )}

      {/* Steps list */}
      <div className="border border-gray-200 rounded-lg shadow-sm">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`border-b border-gray-200 last:border-b-0 ${
              !routineStarted
                ? "bg-white"
                : index === currentStep
                ? "bg-blue-50"
                : step.completed
                ? "bg-green-50"
                : "bg-white"
            }`}
          >
            <div
              className={`flex items-center p-3 ${
                expandedSteps.includes(step.id)
                  ? "border-b border-gray-200"
                  : ""
              }`}
            >
              <div className="flex-grow">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      !routineStarted
                        ? "bg-gray-100 text-gray-500"
                        : step.completed
                        ? "bg-green-100 text-green-600"
                        : index === currentStep
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {step.completed ? (
                      <Check size={16} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h3
                        className={`font-medium ${
                          !routineStarted
                            ? "text-gray-700"
                            : step.completed
                            ? "text-green-700"
                            : index === currentStep
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        {step.name}
                      </h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-3">
                          {step.time} ({step.duration} min)
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center ml-4 space-x-2">
                {step.automatable && routineStarted && !step.completed && (
                  <button
                    onClick={() => runAutomaticCheck(step.id)}
                    disabled={step.isChecking}
                    className={`px-2 py-1 text-xs rounded ${
                      step.isChecking
                        ? "bg-gray-100 text-gray-400"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    {step.isChecking ? "Tjekker..." : "Auto-tjek"}
                  </button>
                )}
                <button
                  onClick={() => toggleStep(step.id)}
                  disabled={!routineStarted}
                  className={`px-2 py-1 text-xs rounded ${
                    !routineStarted
                      ? "bg-gray-100 text-gray-400"
                      : step.completed
                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {step.completed ? "Gennemført" : "Markér gennemført"}
                </button>
                <button
                  onClick={() => toggleStepDetails(step.id)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  {expandedSteps.includes(step.id) ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded step details */}
            {expandedSteps.includes(step.id) && (
              <div className="p-3 bg-gray-50">
                {step.guidance && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Vejledning:
                    </h4>
                    <p className="text-sm text-gray-600">{step.guidance}</p>
                  </div>
                )}

                {step.autoCheckResult && (
                  <div
                    className={`p-2 rounded mb-3 text-sm ${
                      step.autoCheckResult === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {step.checkMessage}
                  </div>
                )}

                {step.links && step.links.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Links:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {step.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Noter:
                  </h4>
                  <textarea
                    value={stepNotes[step.id] || ""}
                    onChange={(e) => handleNoteChange(step.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Tilføj noter til dette trin..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!routineStarted && (
        <div className="mt-4 text-center">

        </div>
      )}
    </div>
  );
};

export default RoutineChecklist;
