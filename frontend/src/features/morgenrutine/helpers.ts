// src/features/morgenrutine/helpers.ts
import React from "react";
import { systemCategories, priorityLevels } from "./mockData";
import type { Period, CompletedRoutine } from "./types";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  MessageSquare,
  Tag,
  User,
  FileText,
} from "lucide-react";

// Get category by ID
export const getCategoryById = (id: string) => {
  return systemCategories.find((cat) => cat.id === id) || systemCategories[0];
};

// Get priority level by ID
export const getPriorityById = (id: number) => {
  return priorityLevels.find((p) => p.id === id) || priorityLevels[3];
};

// Function to save a completed routine to localStorage
export const saveCompletedRoutine = (routine: CompletedRoutine): void => {
  try {
    // Get existing routines from localStorage
    const existingRoutinesStr = localStorage.getItem("completedRoutines");
    const existingRoutines: CompletedRoutine[] = existingRoutinesStr
      ? JSON.parse(existingRoutinesStr)
      : [];

    // Add new routine
    existingRoutines.push(routine);

    // Save back to localStorage
    localStorage.setItem("completedRoutines", JSON.stringify(existingRoutines));
  } catch (error) {
    console.error("Error saving routine:", error);
  }
};

// Function to get all completed routines from localStorage
export const getCompletedRoutines = (): CompletedRoutine[] => {
  try {
    const routinesStr = localStorage.getItem("completedRoutines");
    return routinesStr ? JSON.parse(routinesStr) : [];
  } catch (error) {
    console.error("Error retrieving routines:", error);
    return [];
  }
};

// Function to get a specific completed routine by ID
export const getCompletedRoutineById = (
  id: string
): CompletedRoutine | undefined => {
  try {
    const routines = getCompletedRoutines();
    return routines.find((routine) => routine.id === id);
  } catch (error) {
    console.error("Error retrieving routine by ID:", error);
    return undefined;
  }
};

// Filter data by selected time period
export const filterDataByPeriod = (
  data: { date: string; time: number }[],
  period: Period,
  currentDate: Date = new Date()
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

// Get status icon based on status string
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
    case "active":
      return React.createElement(CheckCircle2, {
        size: 16,
        className: "text-green-500",
      });
    case "warning":
      return React.createElement(Clock, {
        size: 16,
        className: "text-amber-500",
      });
    case "error":
    case "inactive":
      return React.createElement(AlertCircle, {
        size: 16,
        className: "text-red-500",
      });
    default:
      return React.createElement(AlertCircle, {
        size: 16,
        className: "text-gray-500",
      });
  }
};

// Get action icon based on action type
export const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "email":
      return React.createElement(Mail, {
        size: 14,
        className: "text-indigo-600",
      });
    case "note":
      return React.createElement(MessageSquare, {
        size: 14,
        className: "text-indigo-600",
      });
    case "tag":
      return React.createElement(Tag, {
        size: 14,
        className: "text-indigo-600",
      });
    case "user":
      return React.createElement(User, {
        size: 14,
        className: "text-indigo-600",
      });
    case "document":
      return React.createElement(FileText, {
        size: 14,
        className: "text-indigo-600",
      });
    default:
      return null;
  }
};

// Format date from ISO string
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("da-DK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  } catch (error) {
    return dateString;
  }
};

// Format time from ISO string
export const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format date and time from ISO string
export const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("da-DK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get sort option display name
export const getSortOptionDisplayName = (option: string) => {
  switch (option) {
    case "name":
      return "Navn";
    case "type":
      return "Type";
    case "status":
      return "Status";
    case "responseTime":
      return "Svartid";
    case "uptime":
      return "Uptime";
    default:
      return option;
  }
};

// Calculate checklist progress
export const calculateProgress = (completed: number, total: number) => {
  return Math.round((completed / total) * 100);
};

// Convert to friendly formatted date for display in the history component
export const formatDateForHistory = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("da-DK", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

// Get completed routine statistics
export const getRoutineStatistics = (routines: CompletedRoutine[]) => {
  if (!routines || routines.length === 0) {
    return {
      totalRoutines: 0,
      averageCompletionTime: 0,
      completionRate: 0,
    };
  }

  const totalRoutines = routines.length;
  const totalCompletionTime = routines.reduce(
    (sum, routine) => sum + routine.completionTime,
    0
  );
  const averageCompletionTime = Math.round(totalCompletionTime / totalRoutines);

  // Calculate the percentage of steps marked as completed across all routines
  let totalSteps = 0;
  let completedSteps = 0;

  routines.forEach((routine) => {
    totalSteps += routine.steps.length;
    completedSteps += routine.steps.filter((step) => step.completed).length;
  });

  const completionRate =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return {
    totalRoutines,
    averageCompletionTime,
    completionRate,
  };
};
