import React from "react";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Info,
  Zap,
  Bell,
} from "lucide-react";
import type { PriorityStyle } from "./types";

// Get alert icon based on level
export const getAlertIcon = (level: string) => {
  switch (level) {
    case "error":
      return <AlertCircle size={16} className="text-red-500" />;
    case "warning":
      return <Bell size={16} className="text-amber-500" />;
    case "info":
      return <Info size={16} className="text-blue-500" />;
    default:
      return <Info size={16} className="text-gray-500" />;
  }
};

// Get status icon based on status
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle2 size={16} className="text-green-500" />;
    case "warning":
      return <Clock size={16} className="text-amber-500" />;
    case "error":
      return <AlertCircle size={16} className="text-red-500" />;
    default:
      return <AlertCircle size={16} className="text-gray-500" />;
  }
};

// Get priority icon/style with proper return type definition
export const getPriorityStyle = (priority: string): PriorityStyle => {
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
      return {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: <Info size={14} className="text-blue-500 mr-1" />,
      };
    default:
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        icon: <Info size={14} className="text-gray-500 mr-1" />,
      };
  }
};

// Format date from ISO string
export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("da-DK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

// Get today's date in danish format
export const getDanishDate = () => {
  return new Date().toLocaleDateString("da-DK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Calculate average from an array of numbers
export const calculateAverage = (numbers: number[]) => {
  return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length);
};

// Calculate completion percentage
export const calculateCompletionPercentage = (completed: number, total: number) => {
  return (completed / total) * 100;
};