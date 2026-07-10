import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { ArrowLeft, ArrowRight, BarChart3, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UsersRound } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { loginUser } from "@/redux/actions/auth";
import { clearSnackbar } from "@/redux/actions/commonActions";

const benefits = [
    { icon: UsersRound, text: "Manage leads and customer relationships in one place" },
    { icon: BarChart3, text: "Track sales performance with real-time dashboards" },
    { icon: ShieldCheck, text: "Keep business data secure with role-based access" },
];

const Signin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [localSnackbarMessage, setLocalSnackbarMessage] = useState("");
    const [localSnackbarSeverity, setLocalSnackbarSeverity] = useState("error");
    const [submitted, setSubmitted] = useState(false);

    const { snackbarMessage, snackbarSeverity, isAuthenticated, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        setForm({ email: "", password: "" });
        setErrors({});
    }, []);

    useEffect(() => {
        const sessionExpired = new URLSearchParams(location.search).get("session") === "expired";
        if (sessionExpired) {
            setLocalSnackbarMessage("Your session expired. Please sign in again.");
            setLocalSnackbarSeverity("info");
            setSnackbarOpen(true);
        } else if (location.state?.snackbarMessage) {
            setLocalSnackbarMessage(location.state.snackbarMessage);
            setLocalSnackbarSeverity(location.state.snackbarSeverity || "success");
            setSnackbarOpen(true);
            navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
        } else if (snackbarMessage?.trim()) {
            setLocalSnackbarMessage(snackbarMessage);
            setLocalSnackbarSeverity(snackbarSeverity || "success");
            setSnackbarOpen(true);
        }
    }, [location, snackbarMessage, snackbarSeverity, navigate]);

    useEffect(() => {
        if (isAuthenticated && submitted) {
            const redirectTimer = setTimeout(() => {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                if (user?.user_type === "company" && user?.role_name === "Super Admin" && !user?.packageId) {
                    navigate("/choose-package");
                } else {
                    navigate("/apps");
                }
            }, 500);

            const clearTimer = setTimeout(() => dispatch(clearSnackbar()), 500);
            return () => {
                clearTimeout(redirectTimer);
                clearTimeout(clearTimer);
            };
        }
    }, [isAuthenticated, submitted, navigate, dispatch]);

    const handleChange = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
        setErrors((current) => ({ ...current, [field]: false }));
    };

    const validateFields = () => {
        if (!form.email.trim()) {
            setErrors({ email: true });
            setLocalSnackbarMessage("Email Address is required");
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            setErrors({ email: true });
            setLocalSnackbarMessage("Enter a valid email address");
        } else if (!form.password.trim()) {
            setErrors({ password: true });
            setLocalSnackbarMessage("Password is required");
        } else {
            setErrors({});
            return true;
        }

        setLocalSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (validateFields()) {
            setSubmitted(true);
            dispatch(loginUser(form));
        }
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === "clickaway") return;
        setSnackbarOpen(false);
        setTimeout(() => {
            setLocalSnackbarMessage("");
            dispatch(clearSnackbar());
        }, 100);
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950">
            <div className="pointer-events-none absolute -left-40 top-1/3 size-[460px] rounded-full bg-indigo-600/25 blur-[130px]" />
            <div className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-cyan-500/15 blur-[140px]" />

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm">
                    <div className="rounded-2xl bg-white p-6 shadow-2xl">
                        <CircularProgress size={38} />
                    </div>
                </div>
            )}

            <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.05fr_0.95fr]">
                <section className="hidden flex-col justify-between px-12 py-10 text-white lg:flex xl:px-20 xl:py-14">
                    <Link to="/marketing-website" className="w-fit rounded-xl bg-white px-4 py-2 shadow-lg">
                        <img src={logo} alt="Crescosoft" className="h-14 w-auto object-contain" />
                    </Link>

                    <div className="max-w-2xl py-12">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-100">
                            <LockKeyhole size={16} />
                            Secure access to your CRM workspace
                        </div>
                        <h1 className="text-4xl font-bold leading-tight tracking-[-0.03em] xl:text-5xl">
                            Welcome back to smarter customer relationship management.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 xl:text-lg">
                            Sign in to manage your sales pipeline, customer conversations, follow-ups, quotations, orders, and business performance.
                        </p>
                        <div className="mt-9 space-y-5">
                            {benefits.map((benefit) => {
                                const Icon = benefit.icon;
                                return (
                                    <div key={benefit.text} className="flex items-center gap-4">
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-200">
                                            <Icon size={20} />
                                        </span>
                                        <span className="text-sm font-medium text-slate-200">{benefit.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">Cresco Software Solutions. Connected teams. Better customer experiences.</p>
                </section>

                <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:rounded-l-[40px] lg:px-12">
                    <div className="w-full max-w-[480px]">
                        <div className="mb-8 flex items-center justify-between lg:hidden">
                            <Link to="/marketing-website" className="rounded-xl bg-white px-3 py-2 shadow-sm">
                                <img src={logo} alt="Crescosoft" className="h-12 w-auto" />
                            </Link>
                            <Link to="/marketing-website" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-700">
                                <ArrowLeft size={16} />
                                Website
                            </Link>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 sm:p-9">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Welcome back</p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Sign in to CRESCO</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">Enter your account details to continue to your CRM dashboard.</p>
                            </div>

                            <form onSubmit={handleSubmit} autoComplete="off" className="mt-8 space-y-5">
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                                        Email address
                                    </label>
                                    <div className={`flex items-center rounded-xl border bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 ${errors.email ? "border-rose-400" : "border-slate-300"}`}>
                                        <Mail size={19} className="shrink-0 text-slate-400" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange("email")}
                                            placeholder="you@company.com"
                                            autoComplete="username"
                                            className="h-12 w-full border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                            Password
                                        </label>
                                        <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className={`flex items-center rounded-xl border bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 ${errors.password ? "border-rose-400" : "border-slate-300"}`}>
                                        <LockKeyhole size={19} className="shrink-0 text-slate-400" />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={form.password}
                                            onChange={handleChange("password")}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            className="h-12 w-full border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Sign in
                                    <ArrowRight size={17} />
                                </button>
                            </form>

                            <div className="my-6 flex items-center gap-3">
                                <span className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">New to CRESCO?</span>
                                <span className="h-px flex-1 bg-slate-200" />
                            </div>

                            <Link
                                to="/signup"
                                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                                Create your free account
                            </Link>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                                Your account is protected with secure authentication
                            </div>
                        </div>

                        <p className="mt-6 text-center text-xs text-slate-400">
                            By continuing, you agree to our{" "}
                            <Link to="/marketing-website/terms-service" className="font-semibold text-slate-600 hover:text-indigo-700">
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link to="/marketing-website/privacy-policy" className="font-semibold text-slate-600 hover:text-indigo-700">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </section>
            </div>

            <Snackbar open={snackbarOpen} autoHideDuration={3500} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleSnackbarClose} severity={localSnackbarSeverity} variant="filled">
                    {localSnackbarMessage}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default Signin;
