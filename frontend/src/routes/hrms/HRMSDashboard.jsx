import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    Building2,
    CreditCard,
    FileText,
    Save,
    Search,
    TicketCheck,
    ToggleLeft,
    ToggleRight,
    UserCog,
} from "lucide-react";
import { isSuperProviderUser } from "@/utils/businessSuite";

const summaryCards = [
    { label: "Total Organizations", value: "24", helper: "All HRMS customers", icon: Building2, tone: "bg-blue-50 text-blue-600", border: "border-t-blue-600" },
    { label: "Active Subscriptions", value: "18", helper: "Paid and active", icon: CreditCard, tone: "bg-emerald-50 text-emerald-600", border: "border-t-emerald-500" },
    { label: "Pending Onboarding", value: "5", helper: "Setup in progress", icon: UserCog, tone: "bg-amber-50 text-amber-600", border: "border-t-amber-500" },
    { label: "Open Support Tickets", value: "9", helper: "Needs Cresco action", icon: TicketCheck, tone: "bg-rose-50 text-rose-600", border: "border-t-rose-500" },
];

const moduleCatalogue = ["Core HR", "Attendance", "Leave", "Payroll", "Recruitment", "Performance", "Employee Self Service", "Reports"];
const roleTemplates = ["HR Admin", "HR Executive", "Payroll Admin", "Manager", "Employee Self Service", "Read-only Auditor"];
const settingsTabs = ["Cresco Staff", "Provider Roles & Permissions", "Notification Templates", "Audit Logs", "System Health", "Security", "Service Settings"];

const initialOrganizations = [
    { id: 1, name: "Acme Industries", plan: "HRMS Professional", employees: 150, modules: "4 modules", expiry: "31 Dec 2026", status: "Active", admin: "Nisha Mehta", invitation: "Accepted" },
    { id: 2, name: "Northwind Traders", plan: "HRMS Starter", employees: 60, modules: "3 modules", expiry: "15 Aug 2026", status: "Trial", admin: "Rahul Sen", invitation: "Pending" },
    { id: 3, name: "BluePeak Services", plan: "HRMS Enterprise", employees: 300, modules: "All modules", expiry: "Expired", status: "Suspended", admin: "Amit Shah", invitation: "Accepted" },
];

const planRows = [
    ["HRMS Starter", "Core HR, Leave, ESS", "75 users", "Trial + monthly", "4 active"],
    ["HRMS Professional", "Core HR, Attendance, Leave, Reports", "250 users", "Monthly / yearly", "11 active"],
    ["HRMS Enterprise", "All HRMS modules", "Unlimited", "Annual", "3 active"],
];

const implementationProjects = [
    { org: "GreenLeaf Foods", manager: "Cresco Implementation Manager", progress: "Admin invitation", target: "20 Jul 2026", status: "On track" },
    { org: "Vertex Labs", manager: "Cresco Implementation Manager", progress: "Module access review", target: "25 Jul 2026", status: "Delayed" },
    { org: "Metro Services", manager: "Cresco Support", progress: "Subscription confirmation", target: "18 Jul 2026", status: "Pending" },
];

const supportTickets = [
    { org: "Acme Industries", ticket: "Admin invitation not received", priority: "High", status: "Open" },
    { org: "Northwind Traders", ticket: "Attendance module access change", priority: "Medium", status: "In progress" },
    { org: "BluePeak Services", ticket: "Renewal clarification", priority: "High", status: "Open" },
];

const attentionItems = [
    { title: "Trial expiring", detail: "Northwind Traders trial ends on 15 Aug 2026.", tone: "border-amber-200 bg-amber-50 text-amber-700" },
    { title: "Subscription expiring", detail: "Metro Services renewal is due this month.", tone: "border-orange-200 bg-orange-50 text-orange-700" },
    { title: "Pending admin invitation", detail: "Rahul Sen has not accepted the organization admin invite.", tone: "border-blue-200 bg-blue-50 text-blue-700" },
    { title: "Delayed implementation", detail: "Vertex Labs target go-live needs follow-up.", tone: "border-violet-200 bg-violet-50 text-violet-700" },
    { title: "High-priority support ticket", detail: "BluePeak Services renewal clarification is open.", tone: "border-rose-200 bg-rose-50 text-rose-700" },
];

const sectionMeta = {
    dashboard: "Cresco HRMS Control Center",
    organizations: "Organizations",
    "plans-subscriptions": "Plans & Subscriptions",
    modules: "HRMS Modules",
    "organization-admins": "Organization Admins",
    "role-templates": "Role Templates",
    implementation: "Implementation",
    support: "Support",
    reports: "Reports",
    settings: "Settings",
};

const getProviderSection = (pathname) => {
    if (pathname === "/hrms" || pathname === "/hrms/provider") return "dashboard";
    return pathname.replace(/^\/hrms\/provider\/?/, "") || "dashboard";
};

const getStatusTone = (status) => {
    if (["Active", "Accepted", "On track", "Enabled", "Completed"].includes(status)) return "bg-emerald-50 text-emerald-600";
    if (["Suspended", "Open", "High", "Delayed"].includes(status)) return "bg-rose-50 text-rose-600";
    if (["Trial", "Pending", "In progress", "Medium"].includes(status)) return "bg-amber-50 text-amber-600";
    return "bg-slate-100 text-slate-600";
};

const StatusPill = ({ status }) => <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${getStatusTone(status)}`}>{status}</span>;

const ProviderHrmsDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const sectionKey = getProviderSection(location.pathname);
    const [organizations, setOrganizations] = useState(initialOrganizations);
    const [enabledModules, setEnabledModules] = useState(() => new Set(["Core HR", "Attendance", "Leave", "Reports"]));
    const [enabledTemplates, setEnabledTemplates] = useState(() => new Set(roleTemplates));
    const [adminStatus, setAdminStatus] = useState(() => new Map(initialOrganizations.map((org) => [org.id, org.status === "Suspended" ? "Inactive" : "Active"])));
    const [showOrgFlow, setShowOrgFlow] = useState(false);
    const [orgStep, setOrgStep] = useState(1);
    const [orgMode, setOrgMode] = useState("link");
    const [settingsTab, setSettingsTab] = useState(settingsTabs[0]);

    const toggleOrganization = (id) => {
        setOrganizations((current) =>
            current.map((org) => (org.id === id ? { ...org, status: org.status === "Suspended" ? "Active" : "Suspended" } : org)),
        );
    };

    const toggleAdmin = (id) => {
        setAdminStatus((current) => {
            const next = new Map(current);
            next.set(id, next.get(id) === "Inactive" ? "Active" : "Inactive");
            return next;
        });
    };

    const toggleSet = (setter, value) => {
        setter((current) => {
            const next = new Set(current);
            if (next.has(value)) next.delete(value);
            else next.add(value);
            return next;
        });
    };

    const renderOrganizationFlow = () => (
        <SectionCard>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Add Organization</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">Provision HRMS service</h2>
                    <p className="mt-1 text-sm text-slate-500">Create only the HRMS tenant subscription, module access and customer admin invitation.</p>
                </div>
                <button type="button" onClick={() => setShowOrgFlow(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600">
                    Close
                </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
                {["Organization", "Subscription and Modules", "Organization Admin", "Review and Create"].map((step, index) => {
                    const active = orgStep === index + 1;
                    return (
                        <button
                            key={step}
                            type="button"
                            onClick={() => setOrgStep(index + 1)}
                            className={`rounded-2xl border p-3 text-left text-xs font-black transition ${active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                        >
                            Step {index + 1}
                            <span className="mt-1 block text-sm text-slate-800">{step}</span>
                        </button>
                    );
                })}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                {orgStep === 1 && (
                    <div className="space-y-5">
                        <div className="grid gap-3 md:grid-cols-2">
                            {[
                                ["link", "Link Existing CRM Organization", "Reuse organization_id, company and admin details."],
                                ["new", "Create New HRMS Organization", "Create only a new HRMS customer record."],
                            ].map(([value, title, description]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setOrgMode(value)}
                                    className={`rounded-2xl border p-4 text-left transition ${orgMode === value ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-white"}`}
                                >
                                    <p className="text-sm font-black text-slate-900">{title}</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">{description}</p>
                                </button>
                            ))}
                        </div>
                        {orgMode === "link" ? (
                            <div className="rounded-2xl border border-blue-100 bg-white p-4">
                                <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                                    Search existing CRM organizations
                                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                                        <Search size={17} className="text-slate-400" />
                                        <input className="h-11 w-full bg-transparent text-sm font-bold text-slate-700 outline-none" placeholder="Search by company, email or organization ID" />
                                    </div>
                                </label>
                                <p className="mt-3 text-sm font-semibold text-slate-500">Selected CRM organization details will prefill company and admin information. No organization, admin account or employee records will be recreated.</p>
                            </div>
                        ) : (
                            <FormGrid fields={["Organization name", "Legal name", "Industry", "Country", "Primary contact", "Billing email"]} />
                        )}
                    </div>
                )}
                {orgStep === 2 && (
                    <div className="space-y-5">
                        <FormGrid fields={["HRMS plan", "Start date", "Expiry date", "Trial or paid", "User limit"]} />
                        <ToggleGrid values={moduleCatalogue} enabled={enabledModules} onToggle={(moduleName) => toggleSet(setEnabledModules, moduleName)} />
                    </div>
                )}
                {orgStep === 3 && <FormGrid fields={["Admin name", "Work email", "Mobile number", "Send invitation"]} />}
                {orgStep === 4 && (
                    <div>
                        <p className="text-sm font-black text-slate-900">Ready to create HRMS subscription, module entitlements and organization admin invitation.</p>
                        <p className="mt-2 text-sm font-semibold text-slate-500">Customer departments, designations, hierarchy, employees, shifts, holidays, leave and payroll remain for the customer admin phase.</p>
                        <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200">
                            <Save size={17} />
                            Review and Create
                        </button>
                    </div>
                )}
            </div>
        </SectionCard>
    );

    const renderDashboard = () => (
        <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`rounded-2xl border border-slate-200 border-t-4 ${card.border} bg-white p-5 shadow-xl shadow-slate-200/70`}>
                            <span className={`flex size-11 items-center justify-center rounded-2xl ${card.tone}`}>
                                <Icon size={21} />
                            </span>
                            <p className="mt-4 text-xs font-bold text-slate-500">{card.label}</p>
                            <p className="mt-1 text-3xl font-extrabold text-slate-950">{card.value}</p>
                            <p className="mt-1 text-[12px] font-semibold text-slate-400">{card.helper}</p>
                        </div>
                    );
                })}
            </section>
            <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
                {renderRecentOrganizations()}
                {renderAttentionRequired()}
            </div>
        </>
    );

    const renderRecentOrganizations = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Recent Organizations</h2>
            <DataTable
                columns={["Organization", "Plan", "Employees", "Enabled Modules", "Subscription Status", "Action"]}
                rows={organizations.map((org) => [
                    org.name,
                    org.plan,
                    org.employees,
                    org.modules,
                    <StatusPill status={org.status} />,
                    <ActionGroup actions={["View", "Manage"]} extra={<button type="button" onClick={() => toggleOrganization(org.id)} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">{org.status === "Suspended" ? "Activate" : "Suspend"}</button>} />,
                ])}
            />
        </SectionCard>
    );

    const renderAttentionRequired = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Attention Required</h2>
            <div className="mt-5 space-y-3">
                {attentionItems.map((item) => (
                    <div key={item.title} className={`rounded-2xl border p-4 ${item.tone}`}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-black">{item.title}</p>
                                <p className="mt-1 text-xs font-semibold opacity-80">{item.detail}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </SectionCard>
    );

    const renderOrganizations = () => (
        <>
            <SectionCard>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">All HRMS Organizations</h2>
                        <p className="mt-1 text-sm text-slate-500">Manage onboarding status, subscriptions, modules and activation for HRMS customer organizations.</p>
                    </div>
                    <button type="button" onClick={() => setShowOrgFlow(true)} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200">
                        Add Organization
                    </button>
                </div>
                <DataTable
                    columns={["Organization", "Plan", "Employees", "Modules", "Expiry", "Status", "Actions"]}
                    rows={organizations.map((org) => [
                        org.name,
                        org.plan,
                        org.employees,
                        org.modules,
                        org.expiry,
                        <StatusPill status={org.status} />,
                        <ActionGroup actions={["View", "Manage"]} extra={<button type="button" onClick={() => toggleOrganization(org.id)} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">{org.status === "Suspended" ? "Activate" : "Suspend"}</button>} />,
                    ])}
                />
            </SectionCard>
            {showOrgFlow && renderOrganizationFlow()}
        </>
    );

    const renderPlansSubscriptions = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Plans & Subscriptions</h2>
            <p className="mt-1 text-sm text-slate-500">HRMS plans, subscription records, trials, renewals, expiring subscriptions and user limits.</p>
            <DataTable columns={["Plan", "Included Modules", "User Limit", "Billing", "Active Subscriptions"]} rows={planRows} />
        </SectionCard>
    );

    const renderModules = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">HRMS Modules</h2>
            <p className="mt-1 text-sm text-slate-500">Maintain module catalogue and organization module entitlements from one place.</p>
            <div className="mt-5">
                <ToggleGrid values={moduleCatalogue} enabled={enabledModules} onToggle={(moduleName) => toggleSet(setEnabledModules, moduleName)} />
            </div>
            <DataTable
                columns={["Organization", "Enabled Modules", "Status", "Action"]}
                rows={organizations.map((org) => [org.name, org.modules, <StatusPill status={org.status} />, <ActionGroup actions={["Manage Modules"]} />])}
            />
        </SectionCard>
    );

    const renderOrganizationAdmins = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Organization Admins</h2>
            <p className="mt-1 text-sm text-slate-500">Customer organization admin accounts, invitation status and account activation.</p>
            <DataTable
                columns={["Organization", "Admin", "Invitation", "Account", "Actions"]}
                rows={organizations.map((org) => [
                    org.name,
                    org.admin,
                    <StatusPill status={org.invitation} />,
                    <StatusPill status={adminStatus.get(org.id)} />,
                    <ActionGroup actions={["Resend Invitation"]} extra={<button type="button" onClick={() => toggleAdmin(org.id)} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">{adminStatus.get(org.id) === "Inactive" ? "Activate" : "Deactivate"}</button>} />,
                ])}
            />
        </SectionCard>
    );

    const renderRoleTemplates = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Role Templates</h2>
            <p className="mt-1 text-sm text-slate-500">Reusable default role templates for customer HRMS organizations.</p>
            <ToggleGrid values={roleTemplates} enabled={enabledTemplates} onToggle={(template) => toggleSet(setEnabledTemplates, template)} />
        </SectionCard>
    );

    const renderImplementation = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Implementation</h2>
            <p className="mt-1 text-sm text-slate-500">Onboarding projects, Cresco implementation manager, setup progress and target go-live date.</p>
            <DataTable columns={["Organization", "Manager", "Setup Progress", "Target Go-live", "Status"]} rows={implementationProjects.map((item) => [item.org, item.manager, item.progress, item.target, <StatusPill status={item.status} />])} />
        </SectionCard>
    );

    const renderSupport = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Support</h2>
            <p className="mt-1 text-sm text-slate-500">Customer support tickets, service announcements, priorities and statuses.</p>
            <DataTable columns={["Organization", "Ticket", "Priority", "Status", "Action"]} rows={supportTickets.map((item) => [item.org, item.ticket, <StatusPill status={item.priority} />, <StatusPill status={item.status} />, <ActionGroup actions={["Open Ticket"]} />])} />
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-black text-blue-700">Service announcements</p>
                <p className="mt-1 text-sm font-semibold text-blue-600">Use this area for HRMS release notices, maintenance windows and customer-facing service updates.</p>
            </div>
        </SectionCard>
    );

    const renderReports = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Reports</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {["Organization report", "Subscription report", "Module usage summary", "Support report"].map((item) => (
                    <InfoTile key={item} icon={FileText} title={item} />
                ))}
            </div>
        </SectionCard>
    );

    const renderSettings = () => (
        <SectionCard>
            <h2 className="text-xl font-black text-slate-950">Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Secondary platform functions are grouped here instead of crowding the HRMS sidebar.</p>
            <div className="mt-5 flex flex-wrap gap-2">
                {settingsTabs.map((tab) => (
                    <button key={tab} type="button" onClick={() => setSettingsTab(tab)} className={`rounded-xl border px-3 py-2 text-xs font-black ${settingsTab === tab ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500"}`}>
                        {tab}
                    </button>
                ))}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-900">{settingsTab}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Manage {settingsTab.toLowerCase()} for the Cresco HRMS provider platform.</p>
            </div>
        </SectionCard>
    );

    const renderSection = () => {
        if (sectionKey === "organizations") return renderOrganizations();
        if (sectionKey === "plans-subscriptions") return renderPlansSubscriptions();
        if (sectionKey === "modules") return renderModules();
        if (sectionKey === "organization-admins") return renderOrganizationAdmins();
        if (sectionKey === "role-templates") return renderRoleTemplates();
        if (sectionKey === "implementation") return renderImplementation();
        if (sectionKey === "support") return renderSupport();
        if (sectionKey === "reports") return renderReports();
        if (sectionKey === "settings") return renderSettings();
        return renderDashboard();
    };

    return (
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6">
            <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-7 text-white shadow-[0_24px_70px_rgba(37,99,235,0.22)]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">CRESCO HRMS PLATFORM</p>
                        <h1 className="mt-3 text-3xl font-extrabold">{sectionMeta[sectionKey] || "Cresco HRMS Control Center"}</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">Manage HRMS customers, subscriptions, onboarding and support from one workspace.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => navigate("/hrms/provider/organizations")} className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-lg">Add Organization</button>
                        <button onClick={() => navigate("/hrms/provider/plans-subscriptions")} className="rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white">Manage Plans</button>
                        <button onClick={() => navigate("/hrms/provider/support")} className="rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white">View Support Tickets</button>
                    </div>
                </div>
            </section>
            {renderSection()}
        </div>
    );
};

const SectionCard = ({ children }) => <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">{children}</section>;

const FormGrid = ({ fields }) => (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
            <label key={field} className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                {field}
                <input className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-400" placeholder={field} />
            </label>
        ))}
    </div>
);

const ToggleGrid = ({ values, enabled, onToggle }) => (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {values.map((value) => {
            const active = enabled.has(value);
            return (
                <button key={value} type="button" onClick={() => onToggle(value)} className={`flex items-center justify-between rounded-2xl border p-4 text-sm font-black transition ${active ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                    {value}
                    {active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
            );
        })}
    </div>
);

const ActionGroup = ({ actions, extra }) => (
    <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
            <button key={action} type="button" className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                {action}
            </button>
        ))}
        {extra}
    </div>
);

const InfoTile = ({ icon: Icon, title }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <Icon size={18} className="text-blue-600" />
        <p className="mt-3 text-sm font-black text-slate-800">{title}</p>
    </div>
);

const DataTable = ({ columns, rows }) => (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
        <div className="min-w-[980px]">
            <div className="grid bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(130px, 1fr))` }}>
                {columns.map((column) => <span key={column}>{column}</span>)}
            </div>
            {rows.map((row, index) => (
                <div key={index} className="grid items-center border-t border-slate-100 px-4 py-4 text-sm" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(130px, 1fr))` }}>
                    {row.map((cell, cellIndex) => <div key={cellIndex} className="font-semibold text-slate-700">{cell}</div>)}
                </div>
            ))}
        </div>
    </div>
);

const ReservedPortal = ({ type }) => (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
        <h1 className="text-2xl font-black text-slate-950">{type} portal is reserved for the next phase</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
            This keeps Cresco provider controls separate from customer organization admin and employee self-service features.
        </p>
    </div>
);

const HRMSDashboard = () => {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (location.pathname.startsWith("/hrms/organization")) return <ReservedPortal type="Organization Admin" />;
    if (location.pathname.startsWith("/hrms/employee")) return <ReservedPortal type="Employee Self Service" />;
    if (!isSuperProviderUser(user) && location.pathname.startsWith("/hrms/provider")) return <Navigate to="/hrms/organization" replace />;

    return <ProviderHrmsDashboard />;
};

export default HRMSDashboard;
