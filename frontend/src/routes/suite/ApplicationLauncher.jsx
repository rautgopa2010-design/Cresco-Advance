import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Grid3X3, LockKeyhole, MoreHorizontal, Sparkles } from "lucide-react";
import {
    getDefaultBusinessApp,
    getFutureBusinessApps,
    getUserBusinessApps,
    rememberBusinessApp,
    sharedSuiteCapabilities,
    suiteTrustItems,
} from "@/utils/businessSuite";
import { fetchPlatformConfig } from "@/utils/platformConfig";
import logo from "@/assets/logo.jpg";

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
};

const formatDate = () =>
    new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());

const ApplicationLauncher = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const query = new URLSearchParams(location.search);
    const forceChoose = query.get("choose") === "1" || location.state?.forceChoose;
    const [loading, setLoading] = useState(true);
    const [configVersion, setConfigVersion] = useState(0);

    const apps = useMemo(() => getUserBusinessApps(user), [user, configVersion]);
    const futureApps = useMemo(() => getFutureBusinessApps(), []);
    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "User";
    const isCrescoSuperMaster = user?.user_type === "provider" || user?.role_name === "Super Provider Admin";

    useEffect(() => {
        const timer = window.setTimeout(() => setLoading(false), 350);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const syncConfig = () => setConfigVersion((current) => current + 1);
        window.addEventListener("platformConfigUpdated", syncConfig);
        fetchPlatformConfig().finally(syncConfig);
        return () => window.removeEventListener("platformConfigUpdated", syncConfig);
    }, []);

    useEffect(() => {
        if (loading || forceChoose || isCrescoSuperMaster) return;
        const defaultApp = getDefaultBusinessApp(user);
        if (defaultApp && (apps.length === 1 || localStorage.getItem("lastWorkspace"))) {
            rememberBusinessApp(defaultApp.id);
            navigate(defaultApp.path, { replace: true });
        }
    }, [apps.length, forceChoose, isCrescoSuperMaster, loading, navigate, user]);

    const openApp = (app) => {
        rememberBusinessApp(app.id);
        navigate(app.path);
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 p-6">
                <div className="mx-auto max-w-7xl animate-pulse">
                    <div className="h-72 rounded-[2rem] bg-white/10" />
                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        {[1, 2].map((item) => (
                            <div key={item} className="h-80 rounded-[1.75rem] bg-white/10" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (isCrescoSuperMaster) {
        const superMasterApps = apps;
        const shortDescription = {
            crm: "Leads, customers, orders and sales performance.",
            hrms: "Employees, attendance, payroll and recruitment.",
        };
        const sharedItems = ["Single login", "Profile", "Roles and permissions", "Theme"];

        return (
            <main className="min-h-screen overflow-hidden bg-[#f5f7fb] px-4 py-6 text-slate-950 sm:px-8 lg:px-12">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_28%),linear-gradient(180deg,#eef4ff_0%,#f8fafc_48%,#f5f7fb_100%)]" />
                <section className="mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#312e81] px-6 py-9 text-white shadow-2xl shadow-blue-200/70 sm:px-9"
                    >
                        <button
                            type="button"
                            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-blue-50 transition hover:bg-white/20 hover:text-white"
                            aria-label="More options"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_34%,rgba(34,197,94,0.14))]" />
                        <div className="relative">
                            <p className="text-sm font-black uppercase tracking-wide text-blue-100">Super Master Workspace</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Select an application</h1>
                            <p className="mt-2 text-base font-semibold text-blue-100 sm:text-lg">One secure login across CRM and future Cresco apps.</p>
                        </div>
                    </motion.div>

                    <div className={`mt-8 grid gap-6 ${superMasterApps.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-xl"}`}>
                        {superMasterApps.map((app, index) => {
                            const Icon = app.icon;
                            const isHrms = app.id === "hrms";
                            const cardAccent = isHrms ? "border-t-emerald-500" : "border-t-blue-600";
                            const iconClass = isHrms ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600";
                            const badgeClass = isHrms ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700";

                            return (
                                <motion.button
                                    key={app.id}
                                    type="button"
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: index * 0.08 }}
                                    whileHover={{ y: -5, scale: 1.01 }}
                                    onClick={() => openApp(app)}
                                    className={`group relative min-h-[300px] rounded-[22px] border border-slate-200 border-t-4 ${cardAccent} bg-white px-7 py-8 text-center shadow-xl shadow-slate-200/80 transition hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-200/60`}
                                >
                                    {isHrms && (
                                        <span className={`absolute right-5 top-5 rounded-xl px-4 py-1.5 text-sm font-black ${badgeClass}`}>
                                            New
                                        </span>
                                    )}

                                    <span
                                        className={`mx-auto flex size-[76px] items-center justify-center rounded-full ${iconClass} shadow-lg shadow-slate-100 transition group-hover:scale-105`}
                                    >
                                        <Icon size={34} />
                                    </span>
                                    <h2 className="mt-10 text-3xl font-black tracking-tight text-slate-950">{app.name}</h2>
                                    <p className="mx-auto mt-3 max-w-[290px] text-base font-semibold leading-6 text-slate-500">
                                        {shortDescription[app.id] || app.description}
                                    </p>
                                    <span className="mx-auto mt-7 flex h-[46px] w-full max-w-[354px] items-center justify-center rounded-xl bg-[#2563eb] text-lg font-black text-white shadow-lg shadow-blue-200 transition group-hover:bg-[#1d4ed8]">
                                        Open {app.name}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.18 }}
                            className="rounded-[22px] border border-slate-200 bg-white px-6 py-6 shadow-xl shadow-slate-200/70"
                        >
                            <h3 className="text-lg font-black text-slate-900">Shared across apps</h3>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {sharedItems.map((item) => (
                                    <span key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-600">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.24 }}
                            className="rounded-[22px] border border-slate-200 bg-white px-6 py-6 shadow-xl shadow-slate-200/70"
                        >
                            <h3 className="text-lg font-black text-slate-900">Coming soon</h3>
                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3">
                                {futureApps.slice(0, 3).map((app) => {
                                    const Icon = app.icon;
                                    return (
                                        <span key={app.id} className="inline-flex items-center gap-1.5 text-base font-bold text-slate-500">
                                            <Icon size={16} />
                                            {app.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.20),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_30%),linear-gradient(180deg,#eef4ff_0%,#f8fafc_42%,#ffffff_100%)]" />
            <div className="absolute left-1/2 top-0 h-72 w-[70vw] -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />

            <section className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 shadow-2xl shadow-blue-200/40 backdrop-blur-2xl"
                >
                    <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-800 px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-12">
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16),transparent_35%,rgba(34,197,94,0.14))]" />
                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-7 flex items-center gap-3">
                                    <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-xl">
                                        <img src={logo} alt="CRESCO" className="h-10 w-auto object-contain" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.34em] text-blue-100">CRESCO BUSINESS SUITE</p>
                                        <p className="mt-1 text-sm font-medium text-slate-300">{formatDate()}</p>
                                    </div>
                                </div>

                                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-blue-100">
                                    <Sparkles size={16} />
                                    {getGreeting()}
                                </p>
                                <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Welcome back, {displayName}</h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                                    Choose your workspace and continue with one secure login across CRM, HRMS and future CRESCO applications.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
                                {suiteTrustItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                                            <Icon className="text-emerald-200" size={22} />
                                            <p className="mt-3 text-sm font-bold leading-5 text-white">{item.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
                    {isCrescoSuperMaster ? (
                        <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl sm:p-8">
                            <div className="mx-auto max-w-3xl text-center">
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Super Master Workspace</p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Select master application</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Open CRM master or HRMS master from the same Cresco Super Provider login.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-8 md:grid-cols-2">
                                {apps.slice(0, 2).map((app, index) => {
                                    const Icon = app.icon;
                                    return (
                                        <motion.button
                                            key={app.id}
                                            type="button"
                                            initial={{ opacity: 0, scale: 0.92 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.35, delay: index * 0.1 }}
                                            whileHover={{ y: -8, scale: 1.03 }}
                                            onClick={() => openApp(app)}
                                            className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/80 transition"
                                        >
                                            <div className={`absolute inset-x-8 top-0 h-1 rounded-full bg-gradient-to-r ${app.gradient}`} />
                                            <div className={`mx-auto flex size-36 items-center justify-center rounded-full bg-gradient-to-br ${app.gradient} text-white shadow-2xl transition group-hover:shadow-blue-200`}>
                                                <Icon size={56} />
                                            </div>
                                            <h3 className="mt-7 text-3xl font-black tracking-tight text-slate-950">{app.name}</h3>
                                            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">{app.description}</p>
                                            <span className={`mx-auto mt-7 flex h-12 max-w-[210px] items-center justify-center gap-2 rounded-full bg-gradient-to-r ${app.gradient} text-sm font-black text-white shadow-lg`}>
                                                Open {app.name} Master
                                                <ArrowRight size={18} />
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2">
                            {apps.map((app, index) => {
                                const Icon = app.icon;
                                return (
                                    <motion.article
                                        key={app.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35, delay: index * 0.08 }}
                                        whileHover={{ y: -8, scale: 1.01 }}
                                        className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 transition"
                                    >
                                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${app.gradient}`} />
                                        <div className="flex items-start justify-between gap-4">
                                            <div className={`flex size-20 items-center justify-center rounded-full bg-gradient-to-br ${app.gradient} text-white shadow-lg`}>
                                                <Icon size={34} />
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Available</span>
                                        </div>

                                        <h2 className="mt-7 text-3xl font-black tracking-tight text-slate-950">{app.name}</h2>
                                        <p className="mt-3 min-h-[52px] text-sm leading-6 text-slate-500">{app.description}</p>

                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            {app.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                                                    <CheckCircle2 size={16} className={app.accent} />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => openApp(app)}
                                            className={`mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${app.gradient} text-sm font-black text-white shadow-lg transition group-hover:shadow-xl`}
                                        >
                                            Open {app.name}
                                            <ArrowRight size={18} />
                                        </button>
                                    </motion.article>
                                );
                            })}
                        </div>
                    )}

                    <aside className="space-y-5">
                        <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                                    <Grid3X3 size={20} />
                                </span>
                                <div>
                                    <h3 className="text-lg font-black text-slate-950">Shared Platform</h3>
                                    <p className="text-sm text-slate-500">Common services across apps</p>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {sharedSuiteCapabilities.map((item) => (
                                    <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5 shadow-xl shadow-slate-200/60 backdrop-blur">
                            <h3 className="text-lg font-black text-slate-950">Future Apps</h3>
                            <p className="mt-1 text-sm text-slate-500">Ready to plug into the same launcher.</p>
                            <div className="mt-4 space-y-2">
                                {futureApps.slice(0, 6).map((app) => {
                                    const Icon = app.icon;
                                    return (
                                        <div key={app.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                            <span className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient} text-white`}>
                                                <Icon size={18} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-black text-slate-800">{app.name}</p>
                                                <p className="truncate text-xs text-slate-500">Coming soon</p>
                                            </div>
                                            <LockKeyhole size={16} className="text-slate-400" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
};

export default ApplicationLauncher;
