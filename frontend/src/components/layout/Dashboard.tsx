import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FileText,
  Phone,
  Ticket,
  Repeat,
  BarChart3,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";
import { TicketsViews } from "../../features/tickets/TicketsViews";

// Import the logo directly
import logo from "../../assets/logo.png";

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
    {
      path: "/reports",
      name: "Reports",
      icon: <FileText size={20} strokeWidth={1.5} />,
    },
    {
      path: "/calls",
      name: "Calls",
      icon: <Phone size={20} strokeWidth={1.5} />,
    },
    {
      path: "/tickets",
      name: "Tickets",
      icon: <Ticket size={20} strokeWidth={1.5} />,
    },
    {
      path: "/triggers",
      name: "Triggers",
      icon: <Repeat size={20} strokeWidth={1.5} />,
    },
    {
      path: "/morgenrutine",
      name: "Morgenrutine",
      icon: <BarChart3 size={20} strokeWidth={1.5} />,
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
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-5 border-b border-gray-100">
          {/* Full logo with text included */}
          <img
            src={logo}
            alt="Sundhedsvæsenets Kvalitetsinstitut"
          />
        </div>

        <nav className="p-4 space-y-1 flex-grow">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`mr-3 ${
                    isActive ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`font-medium ${
                    isActive ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 px-4 mb-3 uppercase tracking-wider">
              Support
            </h3>
            <Link
              to="/help"
              className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <HelpCircle
                size={20}
                strokeWidth={1.5}
                className="mr-3 text-gray-400"
              />
              <span className="font-medium text-gray-700">Kom i gang</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Settings
                size={20}
                strokeWidth={1.5}
                className="mr-3 text-gray-400"
              />
              <span className="font-medium text-gray-700">Indstillinger</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-white mt-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                {/* You can replace this with an actual avatar image if available */}
                <User size={20} strokeWidth={1.5} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">John Smith</p>
              <p className="text-xs text-gray-500">jsmith@sundk.dk</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
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
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
