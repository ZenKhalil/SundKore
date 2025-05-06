import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ChevronDown,
  Check,
  UserPlus,
  Tag,
  Trash2,
  Archive,
  Clipboard,
  Bell,
} from "lucide-react";

// Define types with type modifier to comply with verbatimModuleSyntax
type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  updated: string;
  anmoder: string;
  anmoderName: string;
  database: string;
  response: string;
  group: string;
  assignee: string;
};

type SLAStats = {
  averageResponseTime: string;
  responseTimeChange: number;
  slaCompliance: number;
  slaComplianceChange: number;
  nearSLALimit: number;
  overSLA: number;
};

type TicketsTableProps = {
  initialTickets?: Ticket[];
};

// Mock SLA stats
const mockSLAStats: SLAStats = {
  averageResponseTime: "34 min",
  responseTimeChange: -12,
  slaCompliance: 91,
  slaComplianceChange: 3,
  nearSLALimit: 7,
  overSLA: 3,
};

// Mock tickets data - will be used if no initialTickets are provided
const defaultMockTickets: Ticket[] = [
  {
    id: "#15483",
    subject: "Glemt adgangskode/spærret bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 15:18",
    anmoder: "johanne.nielsen@company.dk",
    anmoderName: "Johanne Nielsen",
    database: "Dansk Anæstesidatabase (DAD)",
    response: "18t",
    group: "Support",
    assignee: "",
  },
  {
    id: "#15471",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 13:39",
    anmoder: "kasper.moller@healthorg.dk",
    anmoderName: "Kasper Møller",
    database: "Dansk Hoftealloplastik Register",
    response: "2d",
    group: "IT Support",
    assignee: "",
  },
  {
    id: "#15477",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 14:43",
    anmoder: "marie.andersen@research.org",
    anmoderName: "Marie Andersen",
    database: "Dansk Kolorektal Cancer Database",
    response: "2d",
    group: "Support",
    assignee: "",
  },
  {
    id: "#15478",
    subject: "Opret ny bruger",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 14:46",
    anmoder: "mikkel.poulsen@hospital.dk",
    anmoderName: "Mikkel Poulsen",
    database: "Dansk Herniedatabase (DHD)",
    response: "2d",
    group: "IT Support",
    assignee: "",
  },
  {
    id: "#15489",
    subject: "Anden henvendelse",
    status: "Ny",
    priority: "Normal",
    updated: "I dag 18:32",
    anmoder: "louise.madsen@clinic.dk",
    anmoderName: "Louise Madsen",
    database: "Support",
    response: "1d",
    group: "Support",
    assignee: "",
  },
  {
    id: "#15490",
    subject: "Anden henvendelse",
    status: "Ny",
    priority: "Normal",
    updated: "For 44 minutter siden",
    anmoder: "simon.berg@medcenter.dk",
    anmoderName: "Simon Berg",
    database: "Support",
    response: "2d",
    group: "Support",
    assignee: "",
  },
  {
    id: "#14931",
    subject: "Anden henvendelse",
    status: "Åben",
    priority: "Normal",
    updated: "22. apr",
    anmoder: "eva.thygesen@research.dk",
    anmoderName: "Eva Thygesen",
    database: "Den Nationale Skizofreni database",
    response: "2d",
    group: "Support",
    assignee: "Anders Johansen",
  },
];

// Main component with internal types
const TicketsTable: React.FC<TicketsTableProps> = ({ initialTickets }) => {
  // Use provided tickets or default to mock data
  const allTickets = initialTickets || defaultMockTickets;

  // State for tickets data
  const [displayedTickets, setDisplayedTickets] = useState<Ticket[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalTickets, setTotalTickets] = useState(allTickets.length);

  // Pagination state
  const [page, setPage] = useState(1);
  const ticketsPerPage = 5;

  // SLA stats state
  const [slaStats, setSlaStats] = useState<SLAStats>(mockSLAStats);

  // State for bulk actions
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [bulkActionMenuOpen, setBulkActionMenuOpen] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  // Initial data loading
  useEffect(() => {
    // Display initial tickets
    setDisplayedTickets(allTickets.slice(0, ticketsPerPage));
    setTotalTickets(allTickets.length);
  }, [initialTickets]);

  // Load more tickets when the button is clicked
  const loadMoreTickets = () => {
    setIsLoadingMore(true);

    // Simulate loading delay
    setTimeout(() => {
      const nextPage = page + 1;
      const endIndex = Math.min(nextPage * ticketsPerPage, allTickets.length);
      setDisplayedTickets(allTickets.slice(0, endIndex));
      setPage(nextPage);
      setIsLoadingMore(false);
    }, 500);
  };

  // Check if we've loaded all tickets
  const hasMoreTickets = displayedTickets.length < totalTickets;

  // Handle select all tickets
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all displayed tickets
      setSelectedTickets(displayedTickets.map((ticket) => ticket.id));
      setAllSelected(true);
    } else {
      // Deselect all tickets
      setSelectedTickets([]);
      setAllSelected(false);
    }
  };

  // Handle individual ticket selection
  const handleSelectTicket = (ticketId: string) => {
    if (selectedTickets.includes(ticketId)) {
      // Remove ticket from selection
      setSelectedTickets(selectedTickets.filter((id) => id !== ticketId));
      setAllSelected(false);
    } else {
      // Add ticket to selection
      setSelectedTickets([...selectedTickets, ticketId]);
      // Check if all displayed tickets are now selected
      if (selectedTickets.length + 1 === displayedTickets.length) {
        setAllSelected(true);
      }
    }
  };

  // Handle bulk action selection
  const handleBulkAction = (action: string) => {
    // Close the menu
    setBulkActionMenuOpen(false);

    // In mock data mode, just show an alert
    alert(`${action} udført på ${selectedTickets.length} valgte tickets`);

    // Clear selection after action
    setSelectedTickets([]);
    setAllSelected(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      {/* SLA Stats Overview */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">SLA Overblik</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">
              Gennemsnitlig svartid
            </div>
            <div className="text-xl font-semibold">
              {slaStats.averageResponseTime}
            </div>
            <div
              className={`text-xs ${
                slaStats.responseTimeChange < 0
                  ? "text-green-500"
                  : "text-red-500"
              } mt-1`}
            >
              {slaStats.responseTimeChange < 0 ? "↓" : "↑"}{" "}
              {Math.abs(slaStats.responseTimeChange)}% fra sidste uge
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">SLA overholdelse</div>
            <div className="text-xl font-semibold">
              {slaStats.slaCompliance}%
            </div>
            <div
              className={`text-xs ${
                slaStats.slaComplianceChange > 0
                  ? "text-green-500"
                  : "text-red-500"
              } mt-1`}
            >
              {slaStats.slaComplianceChange > 0 ? "↑" : "↓"}{" "}
              {Math.abs(slaStats.slaComplianceChange)}% fra sidste uge
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">
              Tickets nær SLA grænse
            </div>
            <div className="text-xl font-semibold text-orange-500">
              {slaStats.nearSLALimit}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              &lt; 2 timer tilbage
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Tickets over SLA</div>
            <div className="text-xl font-semibold text-red-500">
              {slaStats.overSLA}
            </div>
            <div className="text-xs text-red-500 mt-1">
              Kræver omgående handling
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700">
            Tickets, der kræver din opmærksomhed ({totalTickets})
          </h3>
          <div className="ml-3 flex space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {slaStats.overSLA} over SLA
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {slaStats.nearSLALimit} nær grænsen
            </span>
          </div>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          Hvad er det?
        </button>
      </div>

      {/* Bulk Actions Bar */}
      <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded-md">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
          />
          <span className="text-sm text-gray-500">
            {selectedTickets.length > 0
              ? `${selectedTickets.length} valgt${
                  selectedTickets.length > 1 ? "e" : ""
                }`
              : "Vælg alle"}
          </span>
        </div>

        {/* Bulk Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setBulkActionMenuOpen(!bulkActionMenuOpen)}
            disabled={selectedTickets.length === 0}
            className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Massehandlinger
            <ChevronDown size={14} className="ml-1 inline" />
          </button>

          {bulkActionMenuOpen && selectedTickets.length > 0 && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={() => handleBulkAction("assign")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <UserPlus size={14} className="mr-2" />
                  Tildel til agent
                </button>
                <button
                  onClick={() => handleBulkAction("update-status")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Check size={14} className="mr-2" />
                  Opdater status
                </button>
                <button
                  onClick={() => handleBulkAction("move-group")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Tag size={14} className="mr-2" />
                  Flyt til gruppe
                </button>
                <button
                  onClick={() => handleBulkAction("set-priority")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Bell size={14} className="mr-2" />
                  Sæt prioritet
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => handleBulkAction("export")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Clipboard size={14} className="mr-2" />
                  Eksportér valgte
                </button>
                <button
                  onClick={() => handleBulkAction("archive")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Archive size={14} className="mr-2" />
                  Arkivér valgte
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 size={14} className="mr-2" />
                  Slet valgte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-10 px-3 py-3 text-left"></th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket-status
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Id
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emne
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anmoder
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anmoder opdateret
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gruppe
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ansvarlig
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SLA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {displayedTickets.map((ticket, index) => (
              <tr
                key={ticket.id}
                className={`hover:bg-gray-50 ${
                  selectedTickets.includes(ticket.id) ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-3 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={() => handleSelectTicket(ticket.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.status === "Ny"
                        ? "bg-orange-100 text-orange-800"
                        : ticket.status === "Åben"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                  {ticket.id}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                  {ticket.subject}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {ticket.anmoderName} ({ticket.anmoder})
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {ticket.updated}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {ticket.group}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {ticket.assignee || "-"}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {/* SLA status with colored indicators */}
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        ticket.response === "18t" || ticket.response === "1d"
                          ? "bg-green-500"
                          : ticket.response === "4t"
                          ? "bg-red-500"
                          : ticket.response === "11t"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    <span
                      className={`text-xs font-medium ${
                        ticket.response === "4t"
                          ? "text-red-700"
                          : ticket.response === "11t"
                          ? "text-orange-700"
                          : "text-gray-500"
                      }`}
                    >
                      {ticket.response}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected tickets info */}
      {selectedTickets.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 text-blue-700 text-sm rounded-md flex items-center justify-between">
          <span>
            {selectedTickets.length} ticket
            {selectedTickets.length > 1 ? "s" : ""} valgt
          </span>
          <button
            onClick={() => {
              setSelectedTickets([]);
              setAllSelected(false);
            }}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          >
            Ryd valg
          </button>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex justify-center mt-6">
        {hasMoreTickets ? (
          <button
            onClick={loadMoreTickets}
            disabled={isLoadingMore}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Indlæser...
              </>
            ) : (
              <>
                Vis flere tickets
                <span className="ml-1 text-gray-400">
                  ({displayedTickets.length} af {totalTickets})
                </span>
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </button>
        ) : (
          <div className="text-sm text-gray-500">
            Alle tickets vises ({totalTickets})
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsTable;
