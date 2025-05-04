// src/features/reports/Reports.tsx
import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, ChevronRight } from "lucide-react";

// ------------------------------------
// Types & Mock data
// ------------------------------------
interface TicketsData {
  total: number;
  pending: number;
  avgCallDuration: number; // seconds
  percentageChange: number;
  pendingPercentageChange: number;
}
const mockTicketsData: TicketsData = {
  total: 256,
  pending: 72,
  avgCallDuration: 334,
  percentageChange: 12,
  pendingPercentageChange: -7,
};

interface ActivityPoint {
  name: string;
  tickets: number;
}
const mockMonthlyActivity: ActivityPoint[] = [
  { name: "JAN", tickets: 100 },
  { name: "FEB", tickets: 140 },
  { name: "MAR", tickets: 135 },
  { name: "APR", tickets: 240 },
  { name: "MAJ", tickets: 275 },
  { name: "JUN", tickets: 200 },
  { name: "JUL", tickets: 230 },
  { name: "AUG", tickets: 100 },
  { name: "SEP", tickets: 270 },
  { name: "OKT", tickets: 330 },
  { name: "NOV", tickets: 380 },
  { name: "DEC", tickets: 250 },
];

interface FormData {
  name: string;
  percentage: number;
}
const mockFormData: FormData[] = [
  { name: "Opret ny bruger", percentage: 67 },
  { name: "Glemt Brugernavn", percentage: 26 },
  { name: "Fejl i database", percentage: 9 },
];

interface HistoryData {
  status: string;
  count: number;
}
const mockTicketHistory: HistoryData[] = [
  { status: "Åbne", count: 77 },
  { status: "Løst", count: 107 },
  { status: "I Bero", count: 72 },
];

interface Agent {
  name: string;
  resolved: number;
  initial: string;
}
const mockAgents: Agent[] = [
  { name: "Steen Andersen", resolved: 15, initial: "S" },
  { name: "Eva Hansen",     resolved:  9, initial: "E" },
  { name: "Peter Mortensen",resolved: 11, initial: "P" },
];

interface Trigger {
  name: string;
  count: number;
  trend: "up" | "down";
}
const mockTriggers: Trigger[] = [
  { name: "Set Normal Prioritet",         count: 51, trend: "up"   },
  { name: "Genåben Sideløbende Samtaler",  count: 12, trend: "down" },
  { name: "Tildel ticket til Support Gruppe", count: 19, trend: "up" },
  { name: "Forskningsudtræk tildeling",    count: 33, trend: "down" },
];

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}
const donutData: DonutSlice[] = [
  { name: "Afbrudt",  value: 0.32, color: "#F97066" },
  { name: "Ubesvaret",value: 0.38, color: "#6366F1" },
  { name: "Besvaret", value: 0.30, color: "#2DD4BF" },
];
const totalCalls = 498;

// For heatmap we keep your random logic
interface HeatCell { month: string; hour: string; intensity: string; }
type HeatRow = HeatCell[];
// ------------------------------------
// Reports component
// ------------------------------------
export const Reports: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<"month" | "week" | "year">("month");
  const frameOptions = [
    { label: "Måned", value: "month" },
    { label: "Uge",   value: "week"  },
    { label: "År",    value: "year"  },
  ];
  const activityData = mockMonthlyActivity;

  const [heatmapData] = useState<HeatRow[]>(() => {
    const intensities = [
      "bg-indigo-100","bg-indigo-200","bg-indigo-300",
      "bg-indigo-400","bg-indigo-500","bg-indigo-600",
    ];
    const months = ["JAN","FEB","MAR","APR","MAJ","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];
    const hours = ["9","10","11","12","13","14"];
    return months.map((m) =>
      hours.map((h) => ({
        month: m,
        hour: h,
        intensity: intensities[Math.floor(Math.random()*intensities.length)],
      }))
    );
  });

  return (
    <div className="p-6 bg-gray-50 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm bg-white hover:bg-gray-50">
          <Download className="mr-2" /> Download
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {[
          { defaultValue: "lastMonth", options: ["Sidste 30 dage","Sidste 7 dage","Sidste år"] },
          { defaultValue: "all",       options: ["Personer: Alle","Kun agenter","Kun administratorer"] },
          { defaultValue: "all",       options: ["Emner: Alle","Tekniske problemer","Konto problemer"] },
        ].map((sel,i) => (
          <select
            key={i}
            defaultValue={sel.defaultValue}
            className="w-64 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sel.options.map((opt,j)=>(
              <option key={j} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Top 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Stats → Formularer → Historik */}
        <div className="space-y-6">

          {/* Stats */}
          <div className="flex justify-between gap-4">
            {[
              {
                label: "Samlede Tickets",
                value: mockTicketsData.total,
                change: `↑ ${mockTicketsData.percentageChange}%`,
                changeClass: "text-red-500",
              },
              {
                label: "I Bero Tickets",
                value: mockTicketsData.pending,
                change: `↓ ${Math.abs(mockTicketsData.pendingPercentageChange)}%`,
                changeClass: "text-green-500",
              },
              {
                label: "Gn. opkaldsvarighed",
                value:
                  `${Math.floor(mockTicketsData.avgCallDuration/60)}m ` +
                  String(mockTicketsData.avgCallDuration%60).padStart(2,"0") + "s",
                noChange:true,
              },
            ].map((c,i)=>(
              <div
                key={i}
                className="flex-1 bg-white rounded-xl shadow-sm p-4 flex flex-col items-center"
              >
                <h3 className="text-sm text-gray-500 mb-2">{c.label}</h3>
                <p className="text-3xl font-bold">{c.value}</p>
                {!c.noChange && (
                  <p className={`mt-1 text-sm font-medium ${c.changeClass}`}>
                    {c.change}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Tickets formularer */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-base font-medium mb-4">Tickets formularer</h2>
            <div className="space-y-3">
              {mockFormData.map((f,i)=>(
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span>{f.name}</span>
                    <span>{f.percentage}%</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width:`${f.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Historik */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-base font-medium mb-4">Ticket Historik</h2>
            <div className="space-y-3">
              {mockTicketHistory.map((h,i)=>(
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span>{h.status}</span>
                    <span>{h.count}</span>
                  </div>
                  <div className="w-full bg-red-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width:`${(h.count/120)*100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Aktivitet → Opkald besvaret */}
        <div className="space-y-6">

          {/* Aktivitet chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col h-60">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-500">Aktivitet</h3>
              <select
                value={timeFrame}
                onChange={e => setTimeFrame(e.target.value as any)}
                className="text-indigo-600 font-medium text-sm focus:outline-none"
              >
                {frameOptions.map(o=>(
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ left:0, right:16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false}/>
                  <YAxis axisLine={false} tickLine={false} width={32}/>
                  <Tooltip/>
                  <Bar dataKey="tickets" fill="#6366F1" radius={[4,4,0,0]} barSize={16}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Opkald besvaret */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-base font-medium mb-4">Opkald besvaret</h2>
            <div className="space-y-4">
              {mockAgents.map((a,i)=>(
                <div key={i} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                    {a.initial}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{a.name}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width:
                            a.name==="Steen Andersen" ? "75%" :
                            a.name==="Eva Hansen"     ? "45%" :
                            "55%",
                        }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 font-medium">{a.resolved}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

{/* 3rd Row: Calls answered & Triggers */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
 
     {/* Aktive Triggers */}
     <div className="bg-white rounded-xl shadow-sm p-4">
       <h2 className="text-base font-medium mb-4">Aktive Triggers</h2>
       <div className="space-y-4">
         {mockTriggers.map((trigger, idx) => (
           <div key={idx} className="flex justify-between items-center">
             <span className="font-medium">{trigger.name}</span>
             <div className="flex items-center">
               <span className="mr-2 font-medium">{trigger.count}</span>
               <span className={trigger.trend === "up" ? "text-green-500" : "text-red-500"}>
                 {trigger.trend === "up" ? "▲" : "▼"}
               </span>
             </div>
           </div>
         ))}
       </div>
       <div className="mt-4 text-center">
         <a href="#" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
           Vis alle triggers <ChevronRight size={16} className="ml-1"/>
         </a>
       </div>
     </div>
     </div>
      {/* 4th Row: Heatmap & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Heatmap */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col h-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-medium">Opkald Volume (Heatmap)</h2>
            <span>Alle opkald</span>
          </div>
          <div className="flex flex-1 overflow-auto">
            <div className="flex flex-col mr-2">
              {heatmapData.map((row,ri)=>(
                <div key={ri} className="h-5 flex items-center text-xs">
                  {row[0].month}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-6 gap-0.5">
                {heatmapData.map((row,ri)=>
                  row.map((cell,ci)=>(
                    <div key={`${ri}-${ci}`} className={`${cell.intensity} h-5`}/>
                  ))
                )}
              </div>
              <div className="grid grid-cols-6 gap-0.5 mt-1 text-xs">
                {heatmapData[0].map((cell,i)=>(
                  <div key={i} className="text-center">{cell.hour}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Donut */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col h-96">
          <h2 className="text-base font-medium mb-4">Alle opkald</h2>
          <div className="relative flex-1 flex items-center justify-center">
            <ResponsiveContainer width="80%" height="80%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius="60%"
                  outerRadius="100%"
                  paddingAngle={4}
                >
                  {donutData.map((s,i)=>(
                    <Cell key={i} fill={s.color}/>
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-2xl font-bold">{totalCalls}</p>
              <p className="text-xs text-gray-500">OPKALD</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {donutData.map((s,i)=>(
              <div key={i} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor:s.color}}/>
                <span className="text-sm">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
