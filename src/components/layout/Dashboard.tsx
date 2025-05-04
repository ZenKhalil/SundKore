import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  Phone,
  Ticket,
  Repeat,
  Sun,
  Moon,
  User,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const location = useLocation();

  // Initial state with console logging
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    console.log("Initial dark mode from localStorage:", savedMode);

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    console.log("System prefers dark mode:", prefersDark);

    // Start with true for testing
    const initialValue =
      savedMode === "true" || (savedMode === null && prefersDark);
    console.log("Initial dark mode value:", initialValue);
    return initialValue;
  });

  // Apply dark mode class to document element with more direct approach
  useEffect(() => {
    console.log("Dark mode changed to:", darkMode);

    if (darkMode) {
      console.log("Adding dark class");
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      console.log("Removing dark class");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }

    // Force a re-render of the entire page
    const body = document.body;
    body.style.display = "none";
    // This triggers a reflow
    void body.offsetHeight;
    body.style.display = "";
  }, [darkMode]);

  const toggleDarkMode = () => {
    console.log("Toggle button clicked, current mode:", darkMode);
    setDarkMode((prevMode) => !prevMode);
  };

  const navItems = [
    { path: "/reports", name: "Reports", icon: <BarChart3 size={20} /> },
    { path: "/calls", name: "Calls", icon: <Phone size={20} /> },
    { path: "/tickets", name: "Tickets", icon: <Ticket size={20} /> },
    { path: "/triggers", name: "Triggers", icon: <Repeat size={20} /> },
    { path: "/morning", name: "Morgenrutine", icon: <Sun size={20} /> },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header with visible mode indicator */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              SundK Dashboard {darkMode ? "(Dark)" : "(Light)"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <User size={18} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with high contrast for testing */}
        <aside className="w-64 bg-white dark:bg-black border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path ||
                  (location.pathname === "/" && item.path === "/reports")
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                    : "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-white dark:bg-slate-950">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
