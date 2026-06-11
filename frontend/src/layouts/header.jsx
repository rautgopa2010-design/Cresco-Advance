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

import { ChevronsLeft, Mail, Phone, UserRound, LogOut, KeyRound } from "lucide-react";
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

export const Header = ({ collapsed, setCollapsed, helpDeskMode, setHelpDeskMode }) => {
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
    const dropdownRef = useRef();

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
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ------------------ Profile Image / Avatar Logic ------------------
    const profileImage = profile?.profileImage ? `${IMAGE_BASE_URL}${profile.profileImage}` : null;
    const firstLetter = user?.firstName?.charAt(0)?.toUpperCase() || "U";

    // Check if user has 'Tickets' module
    const hasTicketsModule = user?.packageModules?.some(
        (mod) => mod.module === "Tickets"
    ) ?? false;

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10 text-[#3a3542]"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
                </button>

                {/* Support Email & Mobile */}
                <div className="flex flex-col items-start gap-1 text-[10px] text-[#3a3542] md:gap-2 md:text-sm lg:flex-row lg:items-center lg:gap-5 lg:text-base">
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
                        className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#053054] font-bold text-white"
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
                        <div className="absolute right-0 z-50 mt-2 w-52 rounded-md border border-gray-200 bg-white shadow-lg">
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
};