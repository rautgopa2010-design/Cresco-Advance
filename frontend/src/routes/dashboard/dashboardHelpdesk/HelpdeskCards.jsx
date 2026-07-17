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
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle,
  Clock,
  Flame,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLORS = ["#2563eb", "#f59e0b", "#ef4444", "#22c55e", "#8b5cf6", "#f97316"];

const EmptyChart = ({ title, message }) => (
  <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
      <LifeBuoy size={28} />
    </div>
    <p className="text-base font-bold text-slate-900">{title}</p>
    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{message}</p>
  </div>
);

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

  const statusData = (tickets.ticketsByStatus || [])
    .map((item) => ({
      name: item.status,
      value: Number(item.count || 0),
    }))
    .filter((item) => item.value > 0);

  if (statusData.length === 0 && tickets.totalTickets > 0) {
    statusData.push(
      { name: "Open", value: Number(tickets.openTickets || 0) },
      {
        name: "Completed / Closed",
        value: Math.max(Number(tickets.totalTickets || 0) - Number(tickets.openTickets || 0), 0),
      }
    );
  }

  const priorityData = [
    { name: "Overdue", value: Number(tickets.overdueTickets || 0) },
    { name: "Due Today", value: Number(tickets.dueTodayTickets || 0) },
    { name: "High Priority", value: Number(tickets.highPriorityTickets || 0) },
    { name: "Escalated", value: Number(tickets.escalatedTickets || 0) },
  ];

  const hasStatusData = statusData.some((item) => item.value > 0);
  const hasPriorityData = priorityData.some((item) => item.value > 0);
  const attentionCount =
    Number(tickets.dueTodayTickets || 0) +
    Number(tickets.overdueTickets || 0) +
    Number(tickets.highPriorityTickets || 0) +
    Number(tickets.escalatedTickets || 0);

  const handleCardClick = (route = "/tickets") => {
    navigate(route);
  };

  const ticketCards = [
    {
      title: "Total Tickets",
      value: tickets.totalTickets,
      icon: Ticket,
      tone: "blue",
      bg: "from-blue-50 to-white",
      iconBg: "bg-blue-600",
      text: "text-blue-700",
      border: "border-t-blue-500",
      caption: "All support requests",
      route: "/tickets",
    },
    {
      title: "Open Tickets",
      value: tickets.openTickets,
      icon: Clock,
      tone: "amber",
      bg: "from-amber-50 to-white",
      iconBg: "bg-amber-500",
      text: "text-amber-700",
      border: "border-t-amber-500",
      caption: "Waiting for action",
      route: "/tickets",
    },
    {
      title: "Due Today",
      value: tickets.dueTodayTickets,
      icon: CalendarClock,
      tone: "purple",
      bg: "from-purple-50 to-white",
      iconBg: "bg-purple-600",
      text: "text-purple-700",
      border: "border-t-purple-500",
      caption: "SLA focus today",
      route: "/tickets",
    },
    {
      title: "Overdue",
      value: tickets.overdueTickets,
      icon: AlertTriangle,
      tone: "red",
      bg: "from-red-50 to-white",
      iconBg: "bg-red-600",
      text: "text-red-700",
      border: "border-t-red-500",
      caption: "Past due SLA",
      urgent: tickets.overdueTickets > 0,
      route: "/tickets",
    },
    {
      title: "High Priority",
      value: tickets.highPriorityTickets,
      icon: Flame,
      tone: "rose",
      bg: "from-rose-50 to-white",
      iconBg: "bg-rose-600",
      text: "text-rose-700",
      border: "border-t-rose-500",
      caption: "Needs fast response",
      urgent: tickets.highPriorityTickets > 0,
      route: "/tickets",
    },
    {
      title: "Escalated",
      value: tickets.escalatedTickets,
      icon: ArrowUpRight,
      tone: "indigo",
      bg: "from-indigo-50 to-white",
      iconBg: "bg-indigo-600",
      text: "text-indigo-700",
      border: "border-t-indigo-500",
      caption: "Raised to senior team",
      urgent: tickets.escalatedTickets > 0,
      route: "/tickets",
    },
  ];

  return (
    <div className="space-y-7 p-4 md:p-6">
      <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-600 to-slate-900 p-6 text-white shadow-xl shadow-blue-950/10 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-50">
              <Sparkles size={14} />
              Support Command Center
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Ticket Dashboard</h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-50 md:text-base">
              Track support volume, SLA pressure, priority tickets and escalations from one focused workspace.
            </p>
          </div>
          <div className="grid min-w-full grid-cols-2 gap-3 sm:min-w-[420px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Open workload</p>
              <p className="mt-2 text-3xl font-extrabold">{Number(tickets.openTickets || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Needs attention</p>
              <p className="mt-2 text-3xl font-extrabold">{attentionCount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {ticketCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => handleCardClick(card.route)}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 ${card.border} border-t-4 bg-gradient-to-br ${card.bg} p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/70 transition-transform duration-300 group-hover:scale-125" />
              <div className="relative">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg} text-white shadow-lg shadow-slate-300/70`}>
                    <Icon size={24} />
                  </div>
                  {card.urgent ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                      Attention
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      Stable
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-600">{card.title}</p>
                <p className={`mt-2 text-4xl font-black tracking-tight ${card.text}`}>
                  {Number(card.value || 0).toLocaleString()}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">{card.caption}</p>
              </div>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                <CheckCircle className="text-emerald-600" size={24} />
                Tickets by Status
              </h3>
              <p className="mt-1 text-sm text-slate-500">Open and closed ticket split for your support desk.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {Number(tickets.totalTickets || 0).toLocaleString()} total
            </span>
          </div>

          <div className="h-[340px]">
            {hasStatusData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={78}
                    outerRadius={118}
                    paddingAngle={4}
                    label={({ name, percent }) =>
                      percent > 0.06 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} tickets`, "Count"]}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 16px 35px rgba(15,23,42,0.12)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: "0.9rem" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart
                title="No ticket status data yet"
                message="When support tickets are created, their open and closed status will appear here automatically."
              />
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                <AlertCircle className="text-rose-600" size={24} />
                Priority & Critical Tickets
              </h3>
              <p className="mt-1 text-sm text-slate-500">SLA risks, priority pressure and escalations.</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              {attentionCount.toLocaleString()} alerts
            </span>
          </div>

          <div className="h-[340px]">
            {hasPriorityData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 10, right: 8, left: -12, bottom: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" height={56} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    cursor={{ fill: "rgba(37,99,235,0.06)" }}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 16px 35px rgba(15,23,42,0.12)",
                    }}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[10, 10, 0, 0]} barSize={44} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart
                title="No critical tickets right now"
                message="Overdue, due today, high priority and escalated tickets will be highlighted here."
              />
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" size={22} />
            <p className="font-bold text-emerald-900">SLA health</p>
          </div>
          <p className="mt-2 text-sm text-emerald-700">
            {attentionCount > 0 ? `${attentionCount} ticket(s) need review.` : "No immediate support risk detected."}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={22} />
            <p className="font-bold text-blue-900">Workload</p>
          </div>
          <p className="mt-2 text-sm text-blue-700">
            {Number(tickets.openTickets || 0).toLocaleString()} open ticket(s) currently visible.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Ticket className="text-slate-600" size={22} />
            <p className="font-bold text-slate-900">Next action</p>
          </div>
          <p className="mt-2 text-sm text-slate-500">Open the Tickets page to review, assign and update requests.</p>
        </div>
      </section>
    </div>
  );
};

export default HelpdeskCards;
