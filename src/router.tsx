import { createBrowserRouter, Navigate } from "react-router-dom";
import { Dashboard } from "./components/layout/Dashboard";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";

// Import feature pages
import { Home } from "./features/home/home";
import { Reports } from "./features/reports/Reports";
import { Calls } from "./features/calls/Calls";
import { Tickets } from "./features/tickets/Tickets";
import  Triggers  from "./features/triggers/Triggers";
import { MorningRoutine } from "./features/morning/MorningRoutine";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/reports" replace />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "calls",
        element: <Calls />,
      },
      {
        path: "tickets",
        element: <Tickets />,
      },
      {
        path: "triggers",
        element: <Triggers />,
      },
      {
        path: "morning",
        element: <MorningRoutine />,
      },
    ],
  },
]);
