import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Phone,
  Ticket,
  Repeat,
  FileText,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";
import { TicketsViews } from "../../features/tickets/TicketsViews";

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false); // Default to light mode
  const [activeView, setActiveView] = useState("Forskningsudtræk (Ny)");

  useEffect(() => {
    // Initialize light mode
    document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", "false");
  }, []);

  const navItems = [
    { path: "/reports", name: "Reports", icon: <FileText size={20} /> },
    { path: "/calls", name: "Calls", icon: <Phone size={20} /> },
    { path: "/tickets", name: "Tickets", icon: <Ticket size={20} /> },
    { path: "/triggers", name: "Triggers", icon: <Repeat size={20} /> },
    {
      path: "/morgenrutine",
      name: "Morgenrutine",
      icon: <BarChart3 size={20} />,
    },
  ];

  // Check if we're on the tickets page
  const isTicketsPage = location.pathname === "/tickets";

  // Handle view change from the sidebar
  const handleViewChange = (viewName: string) => {
    setActiveView(viewName);
    // You can pass this to the Tickets component if needed
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2">
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="10" height="10" x="2" y="2" rx="1" fill="#000" />
                <rect width="10" height="10" x="12" y="2" rx="1" fill="#000" />
                <rect width="10" height="10" x="2" y="12" rx="1" fill="#000" />
                <rect width="10" height="10" x="12" y="12" rx="1" fill="#000" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold">Sundhedsvæsenets</h1>
              <h2 className="text-xs font-medium">Kvalitetsinstitut</h2>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 px-3 mb-2">
              Support
            </h3>
            <Link
              to="/help"
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <HelpCircle size={20} />
              <span>Kom i gang</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <Settings size={20} />
              <span>Indstillinger</span>
            </Link>
          </div>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <User size={20} />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Smith</p>
              <p className="text-xs text-gray-500">jsmith@sundk.dk</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              Admin
            </span>
          </div>
        </div>
      </aside>

      {/* Main content with conditional Views sidebar for Tickets page */}
      <main className="flex flex-1 overflow-hidden">
        {/* Views sidebar - Only shown on the Tickets page */}
        {isTicketsPage && <TicketsViews onViewChange={handleViewChange} />}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
