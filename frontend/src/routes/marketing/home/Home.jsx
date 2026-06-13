import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";
import { ArrowRight, BarChart3, Check, Headphones, ShieldCheck, Sparkles, UsersRound, Workflow } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearSnackbar } from "@/redux/actions/commonActions";
import assets, { company_logos } from "../../../assets/assets";

const capabilities = [
    {
        title: "Lead & contact management",
        description: "Capture, organize, and track every opportunity from first enquiry to conversion.",
        icon: UsersRound,
        tone: "bg-blue-50 text-blue-600",
    },
    {
        title: "Sales pipeline automation",
        description: "Automate follow-ups, standardize workflows, and help your team close deals faster.",
        icon: Workflow,
        tone: "bg-violet-50 text-violet-600",
    },
    {
        title: "Customer support",
        description: "Deliver timely, personalized service across every customer touchpoint.",
        icon: Headphones,
        tone: "bg-emerald-50 text-emerald-600",
    },
    {
        title: "Analytics & insights",
        description: "Turn real-time CRM data into practical decisions and sustainable growth.",
        icon: BarChart3,
        tone: "bg-amber-50 text-amber-600",
    },
];

const Home = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
        if (location.state?.snackbarMessage) {
            setSnackbarMessage(location.state.snackbarMessage);
            setSnackbarSeverity(location.state.snackbarSeverity || "success");
            setSnackbarOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    return (
        <>
            <section className="relative overflow-hidden bg-[#f8fafc] px-5 pb-20 pt-14 dark:bg-slate-950 sm:px-8 lg:px-12 lg:pb-28 lg:pt-20">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-200/35 blur-[120px] dark:bg-indigo-900/20" />
                <div className="relative mx-auto grid max-w-[1380px] items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300">
                            <Sparkles size={15} />
                            One connected CRM for growing teams
                        </div>
                        <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl lg:text-[64px]">
                            Turn every customer relationship into{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">business growth.</span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                            Unite sales, support, and marketing in one practical platform built to help your team manage leads, close deals, and
                            deliver connected customer experiences.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/signup"
                                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 dark:shadow-none"
                            >
                                Start free
                                <ArrowRight size={17} />
                            </Link>
                            <Link
                                to="/marketing-website/features"
                                state={{ scrollTo: "features" }}
                                className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                Explore features
                            </Link>
                        </div>
                        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {["Simple setup", "Role-based security", "Built for scale"].map((item) => (
                                <span key={item} className="flex items-center gap-2">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-indigo-200/60 to-blue-100/30 blur-2xl dark:from-indigo-900/30 dark:to-blue-900/10" />
                        <div className="relative overflow-hidden rounded-[28px] border border-white bg-white p-3 shadow-2xl shadow-slate-300/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                                <span className="size-2.5 rounded-full bg-rose-400" />
                                <span className="size-2.5 rounded-full bg-amber-400" />
                                <span className="size-2.5 rounded-full bg-emerald-400" />
                                <span className="ml-3 text-xs font-medium text-slate-400">CRESCO CRM workspace</span>
                            </div>
                            <img src={assets.work_dashboard_management} alt="CRESCO CRM dashboard preview" className="w-full rounded-2xl" />
                        </div>
                        <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <ShieldCheck size={21} />
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Secure by design</p>
                                    <p className="text-xs text-slate-500">Controlled access for every team</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-slate-200 bg-white px-5 py-9 dark:border-slate-800 dark:bg-slate-900 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[1280px]">
                    <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Trusted by ambitious teams</p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 opacity-65 grayscale">
                        {company_logos.map((logo, index) => (
                            <img key={index} src={logo} alt="Customer company" className="h-8 w-auto object-contain sm:h-10" />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-20 dark:bg-slate-950 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Everything in one place</p>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                            A clearer way to manage your customer journey
                        </h2>
                        <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                            From lead management to customer success, Crescosoft gives every team the context and tools needed to move work forward.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {capabilities.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.title}
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                                >
                                    <span className={`flex size-12 items-center justify-center rounded-xl ${item.tone}`}>
                                        <Icon size={22} />
                                    </span>
                                    <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 px-5 py-20 dark:bg-slate-900 sm:px-8 lg:px-12 lg:py-28">
                <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                        <img src={assets.get_statrted_free} alt="CRESCO customer management experience" className="w-full rounded-2xl" />
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">CRM expertise that works for you</p>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                            Built to fit the way your business actually works
                        </h2>
                        <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                            A powerful, easy-to-use CRM platform designed to help you manage leads, close deals, and build lasting customer
                            relationships securely and at scale.
                        </p>
                        <div className="mt-7 space-y-3">
                            {["Centralize customer information", "Create consistent sales workflows", "Track performance with live reporting"].map(
                                (item) => (
                                    <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                        {item}
                                    </div>
                                ),
                            )}
                        </div>
                        <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-600">
                            Get started for free
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>
            </section>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Home;
