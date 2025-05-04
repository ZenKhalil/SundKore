import React, { useState, useEffect, useContext } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import { Calendar, Filter } from "lucide-react";
import { format, subMonths } from "date-fns";
import { zendeskApi } from "../../services/zendesk";

// Add TypeScript interfaces
interface Agent {
  id: number;
  name: string;
  tickets: number;
}

interface TicketStats {
  total: number;
  pending: number;
  solved: number;
  avgCallDuration: number;
}

interface ActivityData {
  name: string;
  tickets: number;
}

interface DashboardData {
  ticketStats: TicketStats;
  monthlyActivity: ActivityData[];
  topAgents: Agent[];
}

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export const Reports: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd")
  });
  
  // Check if dark mode is active
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const stats = await zendeskApi.getDashboardStats(dateRange);
        setData(stats);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [dateRange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date filter */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Rapporter</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Calendar size={16} className="mr-2" />
            <span>
              {format(new Date(dateRange.startDate), "dd MMM yyyy")} - {format(new Date(dateRange.endDate), "dd MMM yyyy")}
            </span>
          </div>
          
          <button className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Samlet antal tickets</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.ticketStats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">I bero</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.ticketStats.pending}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Løst</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.ticketStats.solved}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Gns. opkaldsvarighed</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(data.ticketStats.avgCallDuration)}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly activity chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">Aktivitet pr. måned</h2>
          <div className="h-72 bg-slate-50 dark:bg-slate-900 rounded p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E2E8F0"} />
                <XAxis dataKey="name" stroke={isDarkMode ? "#94A3B8" : "#475569"} />
                <YAxis stroke={isDarkMode ? "#94A3B8" : "#475569"} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', color: isDarkMode ? '#F1F5F9' : '#334155', borderColor: isDarkMode ? '#4B5563' : '#E2E8F0' }} />
                <Bar dataKey="tickets" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top agents */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">Brugere der har løst flest sager</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-50 dark:bg-slate-900 rounded p-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topAgents}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="tickets"
                    nameKey="name"
                  >
                    {data.topAgents.map((entry: Agent, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', color: isDarkMode ? '#F1F5F9' : '#334155', borderColor: isDarkMode ? '#4B5563' : '#E2E8F0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <ul className="divide-y divide-slate-200 dark:divide-slate-700 bg-slate-50 dark:bg-slate-900 rounded p-2">
                {data.topAgents.map((agent: Agent, index: number) => (
                  <li key={agent.id} className="py-3 flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{agent.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{agent.tickets} tickets</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};