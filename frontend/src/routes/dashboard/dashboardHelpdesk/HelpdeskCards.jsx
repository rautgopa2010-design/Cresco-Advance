// import React from "react";
// import { Blocks, PhoneCall, PhoneMissed, TrendingUp, Users } from "lucide-react";
// const HelpdeskCards = ({ dashData }) => {
//     console.log(dashData)
//     return (
//         <>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//                 <div className="card bg-blue-200">
//                     <div className="card-header">
//                         <div className="w-fit rounded-lg bg-blue-900/15 p-2 text-blue-900 transition-colors">
//                             <PhoneCall size={26} />
//                         </div>
//                         <p className="card-title text-[#433C50]">Total Calls</p>
//                     </div>
//                     <div className="card-body bg-blue-900/15 transition-colors">
//                         <p className="text-3xl font-bold text-[#433C50] transition-colors">25,154</p>
//                         <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-900 px-2 py-1 font-medium text-blue-900">
//                             <TrendingUp size={18} />
//                             25%
//                         </span>
//                     </div>
//                 </div>
//                 <div className="card bg-red-200">
//                     <div className="card-header">
//                         <div className="rounded-lg bg-red-900/15 p-2 text-red-900 transition-colors">
//                             <PhoneMissed size={26} />
//                         </div>
//                         <p className="card-title text-[#433C50]">Pending Calls</p>
//                     </div>
//                     <div className="card-body bg-red-900/15 transition-colors">
//                         <p className="text-3xl font-bold text-[#433C50] transition-colors">$16,000</p>
//                         <span className="flex w-fit items-center gap-x-2 rounded-full border border-red-900 px-2 py-1 font-medium text-red-900">
//                             <TrendingUp size={18} />
//                             12%
//                         </span>
//                     </div>
//                 </div>
//                 <div className="card bg-green-200">
//                     <div className="card-header">
//                         <div className="rounded-lg bg-green-900/15 p-2 text-green-900 transition-colors">
//                             <Blocks size={26} />
//                         </div>
//                         <p className="card-title text-[#433C50]">Total AMC's</p>
//                     </div>
//                     <div className="card-body bg-green-900/15 transition-colors">
//                         <p className="text-3xl font-bold text-[#433C50] transition-colors">15,400k</p>
//                         <span className="flex w-fit items-center gap-x-2 rounded-full border border-green-900 px-2 py-1 font-medium text-green-900">
//                             <TrendingUp size={18} />
//                             15%
//                         </span>
//                     </div>
//                 </div>
//                 <div className="card bg-indigo-200">
//                     <div className="card-header">
//                         <div className="rounded-lg bg-indigo-900/15 p-2 text-indigo-900 transition-colors">
//                             <Users size={26} />
//                         </div>
//                         <p className="card-title text-[#433C50]">Total Customers</p>
//                     </div>
//                     <div className="card-body bg-indigo-900/15 transition-colors">
//                         <p className="text-3xl font-bold text-[#433C50] transition-colors">12,340</p>
//                         <span className="flex w-fit items-center gap-x-2 rounded-full border border-indigo-900 px-2 py-1 font-medium text-indigo-900">
//                             <TrendingUp size={18} />
//                             19%
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default HelpdeskCards;

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Ticket,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  CalendarClock,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#f97316"];

const HelpdeskCards = ({ dashData }) => {
  const navigate = useNavigate();

  const tickets = dashData?.tickets || {
    totalTickets: 0,
    openTickets: 0,
    dueTodayTickets: 0,
    overdueTickets: 0,
    highPriorityTickets: 0,
    escalatedTickets: 0,
    ticketsByStatus: [],
  };

  // Prepare data for status pie chart
  const statusData = tickets.ticketsByStatus.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  // If no status breakdown → fallback to basic open/closed
  if (statusData.length === 0) {
    statusData.push(
      { name: "Open", value: tickets.openTickets },
      { name: "Completed / Closed", value: tickets.totalTickets - tickets.openTickets }
    );
  }

  const handleCardClick = (route) => {
    navigate(route);
  };

  const ticketCards = [
    {
      title: "Total Tickets",
      value: tickets.totalTickets,
      icon: Ticket,
      color: "blue",
      bg: "bg-blue-50",
      text: "text-blue-700",
      accent: "bg-blue-600",
      route: "/tickets",
    },
    {
      title: "Open Tickets",
      value: tickets.openTickets,
      icon: Clock,
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-700",
      accent: "bg-amber-500",
      route: "/tickets",
    },
    {
      title: "Due Today",
      value: tickets.dueTodayTickets,
      icon: CalendarClock,
      color: "purple",
      bg: "bg-purple-50",
      text: "text-purple-700",
      accent: "bg-purple-600",
      route: "/tickets",
    },
    {
      title: "Overdue",
      value: tickets.overdueTickets,
      icon: AlertTriangle,
      color: "red",
      bg: "bg-red-50",
      text: "text-red-700",
      accent: "bg-red-600",
      urgent: tickets.overdueTickets > 0,
      route: "/tickets",
    },
    {
      title: "High Priority",
      value: tickets.highPriorityTickets,
      icon: Flame,
      color: "rose",
      bg: "bg-rose-50",
      text: "text-rose-700",
      accent: "bg-rose-600",
      urgent: tickets.highPriorityTickets > 0,
      route: "/tickets",
    },
    {
      title: "Escalated",
      value: tickets.escalatedTickets,
      icon: ArrowUpRight,
      color: "indigo",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      accent: "bg-indigo-600",
      urgent: tickets.escalatedTickets > 0,
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {ticketCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => handleCardClick(card.route)}
              className={`
                group relative overflow-hidden cursor-pointer rounded-2xl border border-gray-200/70 
                ${card.bg} shadow-sm hover:shadow-lg transition-all duration-300
                ${card.urgent ? "ring-2 ring-red-400/60 animate-pulse-slow" : ""}
              `}
            >
              <div className={`absolute top-0 right-0 h-20 w-20 -translate-y-8 translate-x-8 rotate-45 ${card.accent} opacity-10`} />

              <div className="relative p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-xl ${card.accent} p-3 text-white shadow-md`}>
                    <Icon size={24} />
                  </div>
                  {card.urgent && (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Attention
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`mt-1 text-3xl font-bold ${card.text}`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution - Pie Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold text-gray-800">
            <CheckCircle className="text-green-600" size={24} />
            Tickets by Status
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  label={({ name, percent }) => (percent > 0.06 ? `${name} (${(percent * 100).toFixed(0)}%)` : "")}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} tickets`, ""]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "0.9rem" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority & Critical Indicators - Bar Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold text-gray-800">
            <AlertCircle className="text-rose-600" size={24} />
            Priority & Critical Tickets
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Overdue", value: tickets.overdueTickets },
                  { name: "Due Today", value: tickets.dueTodayTickets },
                  { name: "High Priority", value: tickets.highPriorityTickets },
                  { name: "Escalated", value: tickets.escalatedTickets },
                ]}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" angle={-25} textAnchor="end" height={60} tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="value" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Optional: small stat row at bottom */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500"></div>
          Critical tickets: {tickets.overdueTickets + tickets.escalatedTickets}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500"></div>
          Needs attention: {tickets.dueTodayTickets + tickets.highPriorityTickets}
        </div>
      </div>
    </div>
  );
};

export default HelpdeskCards;