import axios from "axios";

// This would come from environment variables in a real app
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const zendeskApi = {
  // Dashboard stats
  getDashboardStats: async (dateRange?: {
    startDate: string;
    endDate: string;
  }) => {
    try {
      // For development, return mock data
      // In production, this would be:
      // const response = await api.get('/zendesk/stats', { params: dateRange });
      // return response.data;

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ticketStats: {
          total: 1248,
          pending: 45,
          solved: 982,
          avgCallDuration: 185,
        },
        monthlyActivity: [
          { name: "Jan", tickets: 65 },
          { name: "Feb", tickets: 78 },
          { name: "Mar", tickets: 82 },
          { name: "Apr", tickets: 70 },
          { name: "May", tickets: 85 },
          { name: "Jun", tickets: 90 },
        ],
        topAgents: [
          { name: "Marie Hansen", tickets: 156, id: 1 },
          { name: "Niels Jensen", tickets: 142, id: 2 },
          { name: "Sofie Poulsen", tickets: 124, id: 3 },
          { name: "Thomas Andersen", tickets: 98, id: 4 },
          { name: "Lise Nielsen", tickets: 87, id: 5 },
        ],
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Tickets
  getTickets: async (params: {
    status?: string;
    page?: number;
    perPage?: number;
  }) => {
    try {
      // For development, return mock data
      // In production:
      // const response = await api.get('/zendesk/tickets', { params });
      // return response.data;

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        tickets: [
          {
            id: 1,
            subject: "Login issues",
            status: "open",
            priority: "high",
            created_at: "2025-05-01T10:30:00Z",
            updated_at: "2025-05-01T11:45:00Z",
            requester_id: 101,
            assignee_id: 1,
            channel: "web_form",
          },
          {
            id: 2,
            subject: "Password reset",
            status: "pending",
            priority: "normal",
            created_at: "2025-05-02T11:20:00Z",
            updated_at: "2025-05-02T12:15:00Z",
            requester_id: 102,
            assignee_id: 2,
            channel: "email",
          },
          // Add more mock tickets as needed
        ],
        meta: {
          total_count: 1248,
          page: params.page || 1,
          per_page: params.perPage || 10,
        },
      };
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  // Call data
  getCallData: async (params: { startDate?: string; endDate?: string }) => {
    try {
      // For development, return mock data
      // In production:
      // const response = await api.get('/zendesk/calls', { params });
      // return response.data;

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        calls: [
          {
            id: "call-001",
            status: "answered",
            duration: 185,
            timestamp: "2025-05-01T10:30:00Z",
            agent_id: 1,
            customer_number: "+45123456789",
          },
          {
            id: "call-002",
            status: "missed",
            duration: 0,
            timestamp: "2025-05-01T11:15:00Z",
            agent_id: null,
            customer_number: "+45987654321",
          },
          // Add more mock calls as needed
        ],
        stats: {
          total: 245,
          answered: 198,
          missed: 32,
          abandoned: 15,
          avg_duration: 210,
          under_60s_percent: 78,
        },
      };
    } catch (error) {
      console.error("Error fetching call data:", error);
      throw error;
    }
  },
};
