import {
    BarChart3,
    BriefcaseBusiness,
    Building2,
    CalendarClock,
    FolderKanban,
    Headphones,
    Package,
    ReceiptText,
    ShieldCheck,
    UsersRound,
} from "lucide-react";
import { hrmsModuleNames } from "@/constants";
import { isHrmsFeatureEnabled } from "./platformConfig";

export const CRM_MODULE_NAMES = [
    "Enquiry",
    "Leads",
    "API Leads",
    "Followup",
    "Quotations",
    "Orders",
    "Customer",
    "Invoice",
    "Reports",
    "Incentive",
    "Master",
];

export const BUSINESS_APPS = [
    {
        id: "crm",
        name: "CRM",
        path: "/",
        icon: BarChart3,
        status: "active",
        gradient: "from-blue-600 via-indigo-600 to-sky-500",
        accent: "text-blue-700",
        description: "Manage leads, customers, enquiries, followups, orders, reports and sales performance.",
        features: ["Leads", "Customers", "Enquiries", "Followups", "Orders", "Reports"],
        moduleNames: CRM_MODULE_NAMES,
    },
    {
        id: "hrms",
        name: "HRMS",
        path: "/hrms/provider",
        icon: UsersRound,
        status: "active",
        gradient: "from-emerald-500 via-teal-500 to-cyan-500",
        accent: "text-emerald-700",
        description: "Manage HRMS tenants, subscriptions, module access, onboarding and service operations.",
        features: ["Organizations", "Subscriptions", "Modules", "Onboarding", "Support", "Reports"],
        moduleNames: hrmsModuleNames,
    },
    {
        id: "inventory",
        name: "Inventory",
        icon: Package,
        status: "future",
        gradient: "from-orange-500 via-amber-500 to-yellow-400",
        description: "Stock, warehouses, purchase and inventory movement.",
    },
    {
        id: "accounting",
        name: "Accounting",
        icon: ReceiptText,
        status: "future",
        gradient: "from-violet-600 via-purple-600 to-fuchsia-500",
        description: "Books, billing, ledgers, taxes and finance reports.",
    },
    {
        id: "projects",
        name: "Projects",
        icon: FolderKanban,
        status: "future",
        gradient: "from-slate-700 via-slate-800 to-slate-950",
        description: "Tasks, milestones, delivery and collaboration.",
    },
    {
        id: "helpdesk",
        name: "Help Desk",
        icon: Headphones,
        status: "future",
        gradient: "from-rose-500 via-pink-500 to-red-500",
        description: "Tickets, SLA, customer support and service desk.",
    },
    {
        id: "assets",
        name: "Assets",
        icon: Building2,
        status: "future",
        gradient: "from-cyan-600 via-blue-600 to-indigo-600",
        description: "Asset allocation, maintenance and lifecycle.",
    },
    {
        id: "visitor",
        name: "Visitor",
        icon: CalendarClock,
        status: "future",
        gradient: "from-lime-500 via-green-500 to-emerald-500",
        description: "Visitor entry, passes and front desk workflows.",
    },
    {
        id: "procurement",
        name: "Procurement",
        icon: BriefcaseBusiness,
        status: "future",
        gradient: "from-blue-900 via-blue-700 to-cyan-500",
        description: "Requisitions, vendors, approvals and purchase flow.",
    },
];

export const hasPackageModule = (user, moduleNames = []) =>
    user?.packageModules?.some((moduleItem) => moduleNames.includes(moduleItem.module));

export const isSuperProviderUser = (user) => user?.user_type === "provider" || user?.role_name === "Super Provider Admin";

export const canAccessBusinessApp = (user, app) => {
    if (!user || app.status !== "active") return false;
    if (app.id === "hrms" && !isHrmsFeatureEnabled()) return false;
    if (isSuperProviderUser(user)) return ["crm", "hrms"].includes(app.id);
    if (user?.role_name === "Super Admin") return true;
    return hasPackageModule(user, app.moduleNames);
};

export const getUserBusinessApps = (user) => BUSINESS_APPS.filter((app) => canAccessBusinessApp(user, app));

export const getFutureBusinessApps = () => BUSINESS_APPS.filter((app) => app.status === "future");

export const getBusinessAppById = (appId) => BUSINESS_APPS.find((app) => app.id === appId);

export const getDefaultBusinessApp = (user) => {
    const apps = getUserBusinessApps(user);
    const lastWorkspace = localStorage.getItem("lastWorkspace") || localStorage.getItem("activeWorkspace");
    return apps.find((app) => app.id === lastWorkspace) || apps[0];
};

export const rememberBusinessApp = (appId) => {
    localStorage.setItem("activeWorkspace", appId);
    localStorage.setItem("lastWorkspace", appId);
};

export const sharedSuiteCapabilities = [
    "Single login",
    "User profile",
    "Notifications",
    "Company settings",
    "Roles and permissions",
    "Theme",
    "Audit logs",
    "Language",
    "Dark mode",
];

export const suiteTrustItems = [
    { icon: ShieldCheck, label: "Role based access" },
    { icon: BriefcaseBusiness, label: "Future app ready" },
    { icon: CalendarClock, label: "Last workspace remembered" },
];
