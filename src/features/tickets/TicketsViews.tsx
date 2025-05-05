import React, { useState, useEffect } from "react";

// Type definitions
export interface TicketView {
  id: string; // Unique identifier for the view
  name: string; // Display name of the view
  count: number | string; // Count or metric for the view
  active?: boolean; // Whether the view is currently active
  type?: string; // Optional category/type for grouping views
  icon?: string; // Optional icon identifier
}

interface TicketsViewsProps {
  views?: TicketView[]; // Array of view data
  defaultActiveView?: string; // ID of the default active view
  onViewChange?: (viewId: string) => void; // Callback when view changes
  isLoading?: boolean; // Loading state
  className?: string; // Additional CSS classes
}

// Example data for preview purposes - this would normally come from your backend
export const mockViewsData: TicketView[] = [
  {
    id: "all-new-open",
    name: "Alle Nye og Åbne Tickets",
    count: 8,
    type: "Standard",
  },
  {
    id: "all-waiting",
    name: "Alle Ventende og i Bero Tickets",
    count: 34,
    type: "Standard",
  },
  {
    id: "all-solved",
    name: "Alle løste og lukkede tickets",
    count: "1,5 t",
    type: "Standard",
  },
  {
    id: "research-new",
    name: "Forskningsudtræk (Ny)",
    count: 19,
    active: true,
    type: "Forskningsudtræk",
  },
  {
    id: "research-open",
    name: "Forskningsudtræk (Åbne)",
    count: 10,
    type: "Forskningsudtræk",
  },
  {
    id: "research-waiting",
    name: "Forskningsudtræk (Venter & Bero)",
    count: 9,
    type: "Forskningsudtræk",
  },
  {
    id: "research-solved",
    name: "Forskningsudtræk (Løst)",
    count: 165,
    type: "Forskningsudtræk",
  },
  {
    id: "callcenter",
    name: "Callcenter-Rapporter",
    count: 4,
    type: "Rapporter",
  },
];

/**
 * TicketsViews component displays a sidebar of filterable views
 * for the ticketing system with improved styling and backend integration.
 */
export const TicketsViews: React.FC<TicketsViewsProps> = ({
  views = mockViewsData, // Use mockViewsData as default
  defaultActiveView = "research-new", // Default to research-new view
  onViewChange,
  isLoading = false,
  className = "",
}) => {
  // State to track the currently active view
  const [activeViewId, setActiveViewId] = useState<string>(
    defaultActiveView || views[0]?.id || ""
  );

  // Update active view when defaultActiveView prop changes
  useEffect(() => {
    if (defaultActiveView && defaultActiveView !== activeViewId) {
      setActiveViewId(defaultActiveView);
    }
  }, [defaultActiveView, activeViewId]);

  // Handle view selection
  const handleViewClick = (viewId: string) => {
    setActiveViewId(viewId);
    if (onViewChange) {
      onViewChange(viewId);
    }
  };

  // Group views by type for organization (if types are provided)
  const groupedViews = views.reduce((acc, view) => {
    const type = view.type || "default";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(view);
    return acc;
  }, {} as Record<string, TicketView[]>);

  // Render loading state
  if (isLoading) {
    return (
      <div
        className={`w-64 flex-shrink-0 bg-blue-50 border-r border-blue-100 overflow-y-auto ${className}`}
      >
        <div className="p-4">
          <div className="text-gray-500 text-sm mb-2">Views</div>
          <div className="bg-white rounded shadow-sm p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if we have any views to display
  if (views.length === 0) {
    return (
      <div
        className={`w-64 flex-shrink-0 bg-blue-50 border-r border-blue-100 overflow-y-auto ${className}`}
      >
        <div className="p-4">
          <div className="text-gray-500 text-sm mb-2">Views</div>
          <div className="bg-white rounded shadow-sm p-4 text-center">
            <p className="text-gray-400 text-sm">No views available</p>
          </div>
        </div>
      </div>
    );
  }

  // Render the views
  return (
    <div
      className={`w-64 flex-shrink-0 bg-blue-50 border-r border-blue-100 overflow-y-auto ${className}`}
    >
      <div className="p-4">
        <div className="text-gray-500 text-sm font-medium mb-2">Views</div>
        <div className="bg-white rounded-lg shadow-sm">
          {Object.entries(groupedViews).map(([type, typeViews], groupIndex) => (
            <div key={type} className={groupIndex > 0 ? "mt-2" : ""}>
              {/* Show type name as a header if it's not the default group */}
              {type !== "default" && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {type}
                </div>
              )}
              <div className="p-1">
                {typeViews.map((view) => (
                  <div
                    key={view.id}
                    className={`flex justify-between items-center py-2 px-3 rounded-md text-sm mb-1 cursor-pointer transition-colors duration-150 ease-in-out ${
                      view.id === activeViewId
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                    onClick={() => handleViewClick(view.id)}
                    data-testid={`view-${view.id}`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {view.icon && (
                        <span className="text-lg">{view.icon}</span>
                      )}
                      <span className="truncate">{view.name}</span>
                    </div>
                    <span
                      className={`ml-1 ${
                        view.id === activeViewId
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      } px-2 py-0.5 rounded-full text-xs font-medium`}
                    >
                      {view.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Default export with the mock data pre-loaded
export default function DefaultTicketsViews() {
  return (
    <TicketsViews
      views={mockViewsData}
      defaultActiveView="research-new"
      onViewChange={(viewId) => console.log(`View changed to: ${viewId}`)}
    />
  );
}
