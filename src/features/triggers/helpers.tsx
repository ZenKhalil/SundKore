import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  User,
  MailIcon,
  Tag,
  RefreshCw,
} from "lucide-react";
import { Text } from "recharts";
import { triggerCategories } from "./mockData";
import type { Trigger, ActionType, SortOption } from "./types";

// ------------------------------------
// Category Helper
// ------------------------------------
/**
 * Find a category object by its id, defaulting to the "all" category.
 */
export function getCategoryById(id: string) {
  return triggerCategories.find((c) => c.id === id) || triggerCategories[0];
}

// ------------------------------------
// Action Icon Helper
// ------------------------------------
/**
 * Render the correct Lucide icon for a given action type.
 */
export function getActionIcon(type: ActionType) {
  switch (type) {
    case "email_notification":
    case "add_cc":
      return <MailIcon size={12} />;
    case "status_change":
      return <CheckCircle2 size={12} />;
    case "priority_change":
      return <AlertCircle size={12} />;
    case "assign_agent":
      return <User size={12} />;
    case "add_tags":
      return <Tag size={12} />;
    case "set_group":
      return <RefreshCw size={12} />;
    default:
      return null;
  }
}

// ------------------------------------
// Sort Option Display Name Helper
// ------------------------------------
/**
 * Convert technical sort option values to user-friendly display names.
 */
export function getSortOptionDisplayName(option: SortOption) {
  const displayNames = {
    position: "Position",
    alphabetical: "Alfabetisk",
    created_at: "Oprettelsesdato",
    updated_at: "Opdateringsdato",
    usage_1h: "Aktivitet (1 time)",
    usage_24h: "Aktivitet (24 timer)",
    usage_7d: "Aktivitet (7 dage)",
    usage_30d: "Aktivitet (30 dage)",
  };

  return displayNames[option] || option;
}

// ------------------------------------
// Custom Pie Label
// ------------------------------------
interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}
/**
 * Custom label renderer for Recharts Pie slices.
 * Combines value and "%" into a single string so TextProps.children stays a string.
 */
export const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: LabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
  const labelText = `${(percent * 100).toFixed(0)}%`; // single string child
  return (
    <Text
      x={x}
      y={y}
      fill="#fff"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
    >
      {labelText}
    </Text>
  );
};

// ------------------------------------
// Trigger Row Renderer
// ------------------------------------
/**
 * Render a single table row for list view.
 */
export function renderTriggerRow(trigger: Trigger) {
  return (
    <tr key={trigger.id}>
      <td className="py-3 pl-4 pr-3">
        <input type="checkbox" className="h-4 w-4 text-indigo-600" />
      </td>
      <td className="py-3 px-3 text-sm text-gray-900">{trigger.title}</td>
      <td className="py-3 px-3 text-sm text-gray-500">{trigger.description}</td>
      <td className="py-3 px-3 text-sm">
        <span
          className={`px-2 py-1 rounded ${
            trigger.status === "active" ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          {trigger.status}
        </span>
      </td>
      <td className="py-3 px-3 text-sm text-gray-500">
        {new Date(trigger.updated_at).toLocaleDateString()}
      </td>
      <td className="py-3 px-3 text-right text-sm text-gray-500">
        {trigger.usage_stats.usage_24h}
      </td>
      <td className="py-3 px-3 text-right text-sm text-gray-500">
        {trigger.usage_stats.usage_7d}
      </td>
      <td className="py-3 px-3 text-right text-sm text-gray-500">
        {trigger.usage_stats.usage_30d}
      </td>
      <td className="py-3 px-3 text-right text-sm text-gray-500">
        {Math.round(trigger.usage_stats.success_rate)}%
      </td>
      <td className="py-3 px-3 text-right">
        <button className="p-1 hover:bg-gray-100 rounded">
          <MailIcon size={14} />
        </button>
      </td>
    </tr>
  );
}

// ------------------------------------
// Trigger Card Renderer
// ------------------------------------
/**
 * Render a single card for grid view.
 */
export function renderTriggerCard(trigger: Trigger) {
  return (
    <div
      key={trigger.id}
      className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col justify-between"
    >
      <h4 className="font-medium text-gray-900">{trigger.title}</h4>
      <p className="text-sm text-gray-500 mb-2 truncate">
        {trigger.description}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{trigger.status}</span>
        <span>{trigger.usage_stats.usage_30d} udførelser</span>
      </div>
    </div>
  );
}
