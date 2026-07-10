import { CalendarClock, FileText, UsersRound, WalletCards } from "lucide-react";

const HRMSDashboard = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";

    const cards = [
        { label: "Employees", value: "0", icon: UsersRound, tone: "bg-blue-50 text-blue-600" },
        { label: "Attendance Today", value: "0", icon: CalendarClock, tone: "bg-green-50 text-green-600" },
        { label: "Pending Leaves", value: "0", icon: FileText, tone: "bg-amber-50 text-amber-600" },
        { label: "Payroll", value: "0", icon: WalletCards, tone: "bg-violet-50 text-violet-600" },
    ];

    return (
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
            <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 p-7 text-white shadow-[0_24px_70px_rgba(37,99,235,0.22)]">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">CRESCO HRMS</p>
                <h1 className="mt-3 text-3xl font-extrabold">Welcome to HRMS, {displayName}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                    Manage employees, attendance, leaves, payroll, documents and HR reports from one workspace.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className={`flex size-12 items-center justify-center rounded-2xl ${card.tone}`}>
                                    <Icon size={23} />
                                </span>
                                <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">Coming soon</span>
                            </div>
                            <p className="mt-5 text-sm font-bold text-slate-500">{card.label}</p>
                            <p className="mt-1 text-3xl font-extrabold text-slate-950">{card.value}</p>
                        </div>
                    );
                })}
            </section>

            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900">HRMS module foundation is ready</h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    The HRMS workspace is now visible from package access. Next we can build Employees, Departments,
                    Attendance, Leaves and Payroll one by one.
                </p>
            </section>
        </div>
    );
};

export default HRMSDashboard;
