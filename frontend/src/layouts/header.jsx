// import { ChevronsLeft, Mail, Phone, UserRound, LogOut, KeyRound } from "lucide-react";
// import PropTypes from "prop-types";
// import { Button } from "@material-tailwind/react";
// import { SiHelpdesk } from "react-icons/si";
// import { FaRev } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { useState, useRef, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { logoutUser } from "@/redux/actions/auth";
// import { IMAGE_BASE_URL } from "@/utils/api";
// import { getProfile } from "../redux/actions/profile";

// export const Header = ({ collapsed, setCollapsed, helpDeskMode, setHelpDeskMode }) => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     useEffect(() => {
//         const user = JSON.parse(localStorage.getItem("user") || "{}");
//         if (user?.id) {
//             dispatch(getProfile());
//         }
//     }, [dispatch]);

//     const { profile } = useSelector((state) => state.profile); // ✅ get profile from redux

//     const [showDropdown, setShowDropdown] = useState(false);
//     const dropdownRef = useRef();

//     // ------------------ Support Info Logic ------------------
//     let supportEmail = "";
//     let supportMobile = "";

//     if (user?.user_type === "provider" && user?.role_name === "Super Provider Admin") {
//         supportEmail = user?.email || "No Email";
//         supportMobile = user?.mobile || "No Mobile";
//     } else if (user?.user_type === "company") {
//         if (user?.role_name === "Super Admin") {
//             supportEmail = user?.supportedEmail;
//             supportMobile = user?.supportedMobile;
//             if (!supportEmail || !supportMobile) {
//                 supportEmail = "Tell Your Provider to set their company, if done then signin again.";
//                 supportMobile = "";
//             }
//         } else {
//             supportEmail = user?.supportedEmail;
//             supportMobile = user?.supportedMobile;
//             if (!supportEmail || !supportMobile) {
//                 supportEmail = "Tell Your Company to set their company, if done then signin again.";
//                 supportMobile = "";
//             }
//         }
//     }

//     const handleHelpDeskClick = () => {
//         setHelpDeskMode(!helpDeskMode);
//         navigate("/");
//     };

//     const handleProfileClick = () => {
//         setShowDropdown((prev) => !prev);
//     };

//     const handleLogout = () => {
//         setShowDropdown(false);
//         dispatch(logoutUser());
//         navigate("/marketing-website", {
//             state: {
//                 snackbarMessage: "Logged out successfully!",
//                 snackbarSeverity: "success",
//             },
//         });
//     };

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setShowDropdown(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     // ------------------ Profile Image / Avatar Logic ------------------
//     const profileImage = profile?.profileImage ? `${IMAGE_BASE_URL}${profile.profileImage}` : null;
//     const firstLetter = user?.firstName?.charAt(0)?.toUpperCase() || "U";

//     // Check if user has 'Tickets' module
//     const hasTicketsModule = user?.packageModules?.some(
//         (mod) => mod.module === "Tickets"
//     ) ?? false;

//     return (
//         <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors">
//             <div className="flex items-center gap-x-3">
//                 <button
//                     className="btn-ghost size-10 text-[#3a3542]"
//                     onClick={() => setCollapsed(!collapsed)}
//                 >
//                     <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
//                 </button>

//                 {/* Support Email & Mobile */}
//                 <div className="flex flex-col items-start gap-1 text-[10px] text-[#3a3542] md:gap-2 md:text-sm lg:flex-row lg:items-center lg:gap-5 lg:text-base">
//                     <div className="flex items-center gap-2">
//                         <Mail size={20} />
//                         <p className="-mt-0.5 text-[10px] md:text-sm lg:text-base">{supportEmail}</p>
//                     </div>
//                     {supportMobile && (
//                         <div className="flex items-center gap-2">
//                             <Phone size={20} />
//                             <p className="-mt-0.5 text-[10px] md:text-sm lg:text-base">{supportMobile}</p>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <div className="relative flex items-center gap-x-1 md:gap-x-3 lg:gap-x-3">
//                 {user?.user_type !== "provider" && hasTicketsModule && (
//                     <Button
//                         variant="gradient"
//                         className="flex items-center gap-2 rounded-full bg-[#053054] px-2 py-2 text-xs capitalize md:px-2 lg:px-3"
//                         onClick={handleHelpDeskClick}
//                     >
//                         {helpDeskMode ? <FaRev size={18} /> : <SiHelpdesk size={18} />}
//                         <span className="hidden lg:inline">{helpDeskMode ? "Home" : "Help Desk"}</span>
//                     </Button>
//                 )}

//                 <div
//                     className="relative"
//                     ref={dropdownRef}
//                 >
//                     <button
//                         onClick={handleProfileClick}
//                         className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#053054] font-bold text-white"
//                     >
//                         {profileImage ? (
//                             <img
//                                 src={profileImage}
//                                 alt="profile"
//                                 className="size-full object-cover"
//                             />
//                         ) : (
//                             <span>{firstLetter}</span>
//                         )}
//                     </button>

//                     {showDropdown && (
//                         <div className="absolute right-0 z-50 mt-2 w-52 rounded-md border border-gray-200 bg-white shadow-lg">
//                             {/* Greeting & Role Section */}
//                             <div className="bg-gradient-to-r from-blue-300 via-blue-200 to-blue-100 py-2 text-sm text-gray-700">
//                                 {(() => {
//                                     const hour = new Date().getHours();
//                                     let greeting = "🌞 Good Morning";
//                                     if (hour >= 12 && hour < 17) greeting = "☀️ Good Afternoon";
//                                     else if (hour >= 17 || hour < 4) greeting = "🌤️ Good Evening";

//                                     return (
//                                         <p className="font-medium">
//                                             <div className="text-center">{greeting}</div>
//                                             <div className="text-center font-semibold text-[#053054]">
//                                                 {user?.salutation} {user?.firstName} {user?.lastName}
//                                             </div>
//                                         </p>
//                                     );
//                                 })()}

//                                 <div className="mt-2 flex justify-center">
//                                     <span className="rounded-full bg-[#053054]/10 px-3 py-1 text-xs font-medium text-[#053054]">
//                                         {user?.role_name || "User"}
//                                     </span>
//                                 </div>
//                             </div>
//                             <button
//                                 className="flex w-full items-center gap-2 px-4 py-2 text-left text-[#3a3542] hover:bg-gray-100"
//                                 onClick={() => {
//                                     setShowDropdown(false);
//                                     navigate(`/profile/${user.id}`);
//                                 }}
//                             >
//                                 <UserRound size={18} />
//                                 Profile
//                             </button>
//                             <button
//                                 className="flex w-full items-center gap-2 px-4 py-2 text-left text-[#3a3542] hover:bg-gray-100"
//                                 onClick={() => {
//                                     setShowDropdown(false);
//                                     navigate("/forgot-password", {
//                                         state: {
//                                             emailPrefill: user?.email || "",
//                                             cameFrom: "changePassword",
//                                         },
//                                     });
//                                 }}
//                             >
//                                 <KeyRound size={18} />
//                                 Change Password
//                             </button>
//                             <hr className="my-1 border-t border-gray-200" />
//                             <button
//                                 className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-gray-100"
//                                 onClick={handleLogout}
//                             >
//                                 <LogOut size={18} />
//                                 Logout
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </header>
//     );
// };

// Header.propTypes = {
//     collapsed: PropTypes.bool,
//     setCollapsed: PropTypes.func,
//     helpDeskMode: PropTypes.bool,
//     setHelpDeskMode: PropTypes.func,
// };

import { AppWindow, ArrowRight, ChevronsLeft, Grid3X3, KeyRound, LockKeyhole, LogOut, Mail, Phone, UserRound } from "lucide-react";
import PropTypes from "prop-types";
import { Button } from "@material-tailwind/react";
import { SiHelpdesk } from "react-icons/si";
import { FaRev } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/actions/auth";
import { IMAGE_BASE_URL } from "@/utils/api";
import { getProfile } from "../redux/actions/profile";
import NotificationBell from "./NotificationBell";
import { getFutureBusinessApps, getUserBusinessApps, rememberBusinessApp } from "@/utils/businessSuite";
import { fetchPlatformConfig } from "@/utils/platformConfig";

export const Header = ({ collapsed, setCollapsed, helpDeskMode, setHelpDeskMode, activeWorkspace, setActiveWorkspace, hasCrmAccess, hasHrmsAccess }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?.id) {
            dispatch(getProfile());
        }
    }, [dispatch]);

    const { profile } = useSelector((state) => state.profile);

    const [showDropdown, setShowDropdown] = useState(false);
    const [showAppSwitcher, setShowAppSwitcher] = useState(false);
    const [, setConfigVersion] = useState(0);
    const dropdownRef = useRef();
    const appSwitcherRef = useRef();

    // ------------------ Support Info Logic ------------------
    let supportEmail = "";
    let supportMobile = "";

    if (user?.user_type === "provider" && user?.role_name === "Super Provider Admin") {
        supportEmail = user?.email || "No Email";
        supportMobile = user?.mobile || "No Mobile";
    } else if (user?.user_type === "company") {
        if (user?.role_name === "Super Admin") {
            supportEmail = user?.supportedEmail;
            supportMobile = user?.supportedMobile;
            if (!supportEmail || !supportMobile) {
                supportEmail = "Tell Your Provider to set their company, if done then signin again.";
                supportMobile = "";
            }
        } else {
            supportEmail = user?.supportedEmail;
            supportMobile = user?.supportedMobile;
            if (!supportEmail || !supportMobile) {
                supportEmail = "Tell Your Company to set their company, if done then signin again.";
                supportMobile = "";
            }
        }
    }

    const handleHelpDeskClick = () => {
        setHelpDeskMode(!helpDeskMode);
        navigate("/");
    };

    const handleProfileClick = () => {
        setShowDropdown((prev) => !prev);
        setShowAppSwitcher(false);
    };

    const handleOpenApplication = (app) => {
        setShowAppSwitcher(false);
        rememberBusinessApp(app.id);
        setActiveWorkspace(app.id);
        navigate(app.path);
    };

    const handleLogout = () => {
        setShowDropdown(false);
        dispatch(logoutUser());
        navigate("/marketing-website", {
            state: {
                snackbarMessage: "Logged out successfully!",
                snackbarSeverity: "success",
            },
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (appSwitcherRef.current && !appSwitcherRef.current.contains(event.target)) {
                setShowAppSwitcher(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const syncConfig = () => setConfigVersion((current) => current + 1);
        window.addEventListener("platformConfigUpdated", syncConfig);
        fetchPlatformConfig().finally(syncConfig);
        return () => window.removeEventListener("platformConfigUpdated", syncConfig);
    }, []);

    // ------------------ Profile Image / Avatar Logic ------------------
    const profileImage = profile?.profileImage ? `${IMAGE_BASE_URL}${profile.profileImage}` : null;
    const firstLetter = user?.firstName?.charAt(0)?.toUpperCase() || "U";

    // Check if user has 'Tickets' module
    const hasTicketsModule = user?.packageModules?.some(
        (mod) => mod.module === "Tickets"
    ) ?? false;
    const availableApps = getUserBusinessApps(user);
    const futureApps = getFutureBusinessApps();

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur-xl transition-colors sm:px-5">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10 border border-slate-200 text-slate-700 shadow-sm"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
                </button>

                {/* Support Email & Mobile */}
                <div className="hidden items-start gap-1 text-slate-600 sm:flex sm:flex-col md:gap-2 md:text-sm lg:flex-row lg:items-center lg:gap-5">
                    <div className="flex items-center gap-2">
                        <Mail size={20} />
                        <p className="-mt-0.5 text-[10px] md:text-sm lg:text-base">{supportEmail}</p>
                    </div>
                    {supportMobile && (
                        <div className="flex items-center gap-2">
                            <Phone size={20} />
                            <p className="-mt-0.5 text-[10px] md:text-sm lg:text-base">{supportMobile}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative flex items-center gap-x-1 md:gap-x-3 lg:gap-x-3">
                <div className="relative" ref={appSwitcherRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setShowAppSwitcher((current) => !current);
                            setShowDropdown(false);
                        }}
                        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
                        title="Application Launcher"
                    >
                        <Grid3X3 size={20} />
                    </button>

                    {showAppSwitcher && (
                        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
                            <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-800 px-5 py-4 text-white">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
                                        <AppWindow size={21} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-black">Applications</p>
                                        <p className="text-xs text-blue-100">CRESCO Business Suite</p>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[68vh] overflow-y-auto p-3">
                                <div className="grid gap-2">
                                    {availableApps.map((app) => {
                                        const Icon = app.icon;
                                        const isActive = activeWorkspace === app.id;
                                        return (
                                            <button
                                                key={app.id}
                                                type="button"
                                                onClick={() => handleOpenApplication(app)}
                                                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                                                    isActive ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                                                }`}
                                            >
                                                <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${app.gradient} text-white`}>
                                                    <Icon size={22} />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-black text-slate-900">{app.name}</span>
                                                    <span className="line-clamp-1 text-xs text-slate-500">{app.description}</span>
                                                </span>
                                                <ArrowRight size={16} className="text-slate-400" />
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-3 border-t border-slate-100 pt-3">
                                    <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Future Apps</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {futureApps.slice(0, 4).map((app) => {
                                            const Icon = app.icon;
                                            return (
                                                <div key={app.id} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
                                                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient} text-white`}>
                                                        <Icon size={16} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-xs font-black text-slate-700">{app.name}</span>
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                            <LockKeyhole size={10} />
                                                            Soon
                                                        </span>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAppSwitcher(false);
                                        navigate("/apps?choose=1", { state: { forceChoose: true } });
                                    }}
                                    className="mt-3 flex h-10 w-full items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                                >
                                    Open full launcher
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification Bell - Add this */}
                <NotificationBell />

                {user?.user_type !== "provider" && hasTicketsModule && (
                    <Button
                        variant="gradient"
                        className="flex items-center gap-2 rounded-full bg-[#053054] px-2 py-2 text-xs capitalize md:px-2 lg:px-3"
                        onClick={handleHelpDeskClick}
                    >
                        {helpDeskMode ? <FaRev size={18} /> : <SiHelpdesk size={18} />}
                        <span className="hidden lg:inline">{helpDeskMode ? "Home" : "Help Desk"}</span>
                    </Button>
                )}

                <div
                    className="relative"
                    ref={dropdownRef}
                >
                    <button
                        onClick={handleProfileClick}
                        className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 font-bold text-white shadow-md shadow-indigo-200 ring-2 ring-white"
                    >
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="profile"
                                className="size-full object-cover"
                            />
                        ) : (
                            <span>{firstLetter}</span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
                            {/* Greeting & Role Section */}
                            <div className="bg-gradient-to-r from-blue-300 via-blue-200 to-blue-100 py-2 text-sm text-gray-700">
                                {(() => {
                                    const hour = new Date().getHours();
                                    let greeting = "🌞 Good Morning";
                                    if (hour >= 12 && hour < 17) greeting = "☀️ Good Afternoon";
                                    else if (hour >= 17 || hour < 4) greeting = "🌤️ Good Evening";

                                    return (
                                        <p className="font-medium">
                                            <div className="text-center">{greeting}</div>
                                            <div className="text-center font-semibold text-[#053054]">
                                                {user?.salutation} {user?.firstName} {user?.lastName}
                                            </div>
                                        </p>
                                    );
                                })()}

                                <div className="mt-2 flex justify-center">
                                    <span className="rounded-full bg-[#053054]/10 px-3 py-1 text-xs font-medium text-[#053054]">
                                        {user?.role_name || "User"}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-[#3a3542] hover:bg-gray-100"
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate(`/profile/${user.id}`);
                                }}
                            >
                                <UserRound size={18} />
                                Profile
                            </button>
                            <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-[#3a3542] hover:bg-gray-100"
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate("/forgot-password", {
                                        state: {
                                            emailPrefill: user?.email || "",
                                            cameFrom: "changePassword",
                                        },
                                    });
                                }}
                            >
                                <KeyRound size={18} />
                                Change Password
                            </button>
                            <hr className="my-1 border-t border-gray-200" />
                            <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                                onClick={handleLogout}
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
    helpDeskMode: PropTypes.bool,
    setHelpDeskMode: PropTypes.func,
    activeWorkspace: PropTypes.string,
    setActiveWorkspace: PropTypes.func,
    hasCrmAccess: PropTypes.bool,
    hasHrmsAccess: PropTypes.bool,
};
