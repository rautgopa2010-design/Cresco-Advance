import React, { forwardRef, useRef, useState, useEffect, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { adminNavbarLinks, helpDeskNavbarLinks, hrmsNavbarLinks, providerAdminNavbarLinks, providerHrmsNavbarLinks } from "@/constants";
import logo from "@/assets/logo.jpg";
import { cn } from "@/utils/cn";
import { filterLinksByPermission } from "@/utils/permissionHelper";
import { isSuperProviderUser } from "@/utils/businessSuite";
import { API_BASE_URL } from "@/utils/api";
import { getCompanySetup } from "../redux/actions/companySetup";
import { clearSnackbar } from "../redux/actions/commonActions";
import { useDispatch, useSelector } from "react-redux";
import { BarChart3, BriefcaseBusiness, ChevronDown, Circle, CreditCard, FileText, Home, Landmark, Layers3, LayoutDashboard, Mail, MessageCircle, PhoneCall, ReceiptText, Settings, Target, TrendingUp, UserRound, UsersRound } from "lucide-react";

const iconByLabel = {
    Dashboard: LayoutDashboard,
    Enquiries: UserRound,
    Leads: BarChart3,
    "API Leads": BarChart3,
    Deals: BriefcaseBusiness,
    Pipeline: BarChart3,
    Opportunities: Target,
    "Revenue Forecast": TrendingUp,
    "Lead Scoring": TrendingUp,
    Engagement: Mail,
    "Email Inbox": Mail,
    "Call Center": PhoneCall,
    WhatsApp: MessageCircle,
    Followup: Target,
    Quotations: FileText,
    Orders: BriefcaseBusiness,
    Payment: CreditCard,
    Vendor: Landmark,
    Customer: UsersRound,
    Invoice: ReceiptText,
    Reports: FileText,
    Analytics: BarChart3,
    Incentive: Target,
    Settings,
    Master: Layers3,
};

const salesLabels = new Set(["Dashboard", "Enquiries", "Leads", "Deals", "Customer", "Followup", "Quotations"]);
const engagementLabels = new Set(["Engagement"]);
const operationsLabels = new Set(["Orders", "Payment", "Vendor", "Invoice", "Reports", "Analytics", "Incentive"]);

const encodeLogoPath = (logoPath) =>
    logoPath
        .split("/")
        .map((part) => {
            if (!part) return part;
            try {
                return encodeURIComponent(decodeURIComponent(part));
            } catch {
                return encodeURIComponent(part);
            }
        })
        .join("/");

const buildCompanyLogoUrl = (logoPath) => {
    if (!logoPath) return logo;
    if (/^(https?:)?\/\//i.test(logoPath) || logoPath.startsWith("data:") || logoPath.startsWith("blob:")) {
        return logoPath;
    }
    const normalizedPath = logoPath.startsWith("/api/") ? logoPath.slice(4) : logoPath;
    const uploadPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    return `${API_BASE_URL}${encodeLogoPath(uploadPath)}`;
};

const cloneWithIcon = (item) => ({
    ...item,
    icon: iconByLabel[item.label] || item.icon || Circle,
    children: item.children?.map((child) => cloneWithIcon(child)),
});

export const Sidebar = forwardRef(({ collapsed, setCollapsed, helpDeskMode, activeWorkspace }, ref) => {
    const [tooltip, setTooltip] = useState({ label: "", x: 0, y: 0, show: false });
    const [openAccordions, setOpenAccordions] = useState({});
    const [openNestedAccordions, setOpenNestedAccordions] = useState({});
    const contentRefs = useRef({});
    const nestedContentRefs = useRef({});
    const [initialLoad, setInitialLoad] = useState(true);
    const { companySetup } = useSelector((state) => state.companySetup);

    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const currentOrgId = user?.org_id || "default";
    const [logoUrl, setLogoUrl] = useState(() => {
        const cachedLogo = localStorage.getItem(`companyLogo_${currentOrgId}`);
        return cachedLogo ? buildCompanyLogoUrl(cachedLogo) : null;
    });
    const dispatch = useDispatch();

    useEffect(() => {
        const syncUser = () => {
            setUser(JSON.parse(localStorage.getItem("user") || "{}"));
        };

        window.addEventListener("sessionUserUpdated", syncUser);
        window.addEventListener("storage", syncUser);

        return () => {
            window.removeEventListener("sessionUserUpdated", syncUser);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([dispatch(getCompanySetup())]);
            } finally {
                setInitialLoad(false);
            }
        };
        dispatch(clearSnackbar());
        fetchInitialData();
    }, [dispatch]);

    // Update logo from Redux store whenever companySetup changes
    useEffect(() => {
        if (companySetup?.companyLogo) {
            localStorage.setItem(`companyLogo_${currentOrgId}`, companySetup.companyLogo);
            setLogoUrl(buildCompanyLogoUrl(companySetup.companyLogo));
        } else {
            localStorage.removeItem(`companyLogo_${currentOrgId}`);
            setLogoUrl(initialLoad ? null : logo);
        }
    }, [companySetup, currentOrgId, initialLoad]);

    const isProviderAdmin = isSuperProviderUser(user);
    const isHrmsWorkspace = activeWorkspace === "hrms" && !helpDeskMode;
    const shouldUseCrmSections = !isProviderAdmin && !helpDeskMode && !isHrmsWorkspace;

    const linksToRender = useMemo(() => {
        let links;
        if (isHrmsWorkspace) links = isProviderAdmin ? providerHrmsNavbarLinks : hrmsNavbarLinks;
        else if (isProviderAdmin) links = providerAdminNavbarLinks;
        else if (helpDeskMode) links = helpDeskNavbarLinks;
        else links = adminNavbarLinks;
        return filterLinksByPermission(links, user.permissions, isProviderAdmin, user?.role_name);
    }, [isProviderAdmin, user, helpDeskMode, isHrmsWorkspace]);

    const shouldHideRestrictedItem = (label) =>
        (label === "Incentive Payment" ||
            label === "Landing Setup" ||
            label === "Bank Setup" ||
            label === "Company Setup" ||
            label === "Assign Incentive" ||
            label === "Landing Page" ||
            label === "Roles") &&
        !(user?.role_name === "Super Admin" || user?.role_name === "Super Provider Admin");

    const sidebarSections = useMemo(() => {
        if (!shouldUseCrmSections) {
            return linksToRender;
        }

        const sections = {
            SALES: [],
            ENGAGEMENT: [],
            OPERATIONS: [],
            MASTER: [],
            SETTINGS: [],
        };

        linksToRender.forEach((group) => {
            group.links.forEach((rawLink) => {
                const link = cloneWithIcon(rawLink);

                if (link.label === "Settings" && Array.isArray(link.children)) {
                    const settingsChildren = [];

                    link.children.forEach((child) => {
                        if (child.label === "Master" && Array.isArray(child.children)) {
                            sections.MASTER.push(
                                cloneWithIcon({
                                    ...child,
                                    isAccordion: true,
                                    isGroup: false,
                                    defaultOpen: false,
                                    showArrow: true,
                                }),
                            );
                            return;
                        }

                        if (!shouldHideRestrictedItem(child.label)) {
                            settingsChildren.push(cloneWithIcon(child));
                        }
                    });

                    if (settingsChildren.length) {
                        sections.SETTINGS.push({
                            ...link,
                            children: settingsChildren,
                            defaultOpen: false,
                            showArrow: true,
                        });
                    }
                    return;
                }

                if (salesLabels.has(link.label)) {
                    sections.SALES.push(link);
                    return;
                }

                if (engagementLabels.has(link.label)) {
                    sections.ENGAGEMENT.push(link);
                    return;
                }

                if (operationsLabels.has(link.label)) {
                    sections.OPERATIONS.push(link);
                    return;
                }

                sections.SETTINGS.push(link);
            });
        });

        return Object.entries(sections)
            .map(([title, links]) => ({ title, links }))
            .filter((section) => section.links.length > 0);
    }, [linksToRender, shouldUseCrmSections, user?.role_name]);

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "User";
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "U";

    // Initialize accordions with defaultOpen flag
    useEffect(() => {
        const initial = {};
        const nested = {};
        sidebarSections.forEach((group) => {
            group.links.forEach((link) => {
                if (link.isAccordion && link.defaultOpen) {
                    initial[link.label] = true;
                }
                if (link.children) {
                    link.children.forEach((child) => {
                        if (child.isGroup && child.defaultOpen) {
                            nested[child.label] = true;
                        }
                    });
                }
            });
        });
        setOpenAccordions(initial);
        setOpenNestedAccordions(nested);
    }, [sidebarSections]);

    const toggleAccordion = (label) => {
        setOpenAccordions((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const toggleNestedAccordion = (label) => {
        setOpenNestedAccordions((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    // Only close sidebar on mobile when actually navigating (clicking a link)
    const handleMobileNavigation = () => {
        // Only close on mobile (< 768px)
        if (window.innerWidth < 768) {
            setCollapsed(true);
        }
    };

    // Listen for logo updates from ViewCompanySetup component
    useEffect(() => {
        const handleLogoUpdate = (event) => {
            const { orgId: updatedOrgId, logo: newLogo } = event.detail;

            if (updatedOrgId === currentOrgId) {
                if (newLogo) {
                    localStorage.setItem(`companyLogo_${currentOrgId}`, newLogo);
                    setLogoUrl(buildCompanyLogoUrl(newLogo));
                } else {
                    localStorage.removeItem(`companyLogo_${currentOrgId}`);
                    setLogoUrl(logo);
                }
            }
        };

        window.addEventListener("companyLogoUpdated", handleLogoUpdate);

        return () => {
            window.removeEventListener("companyLogoUpdated", handleLogoUpdate);
        };
    }, [currentOrgId]);

    return (
        <aside
            ref={ref}
            className={cn(
                "crm-sidebar fixed z-[100] flex h-full w-[268px] flex-col overflow-x-visible border-r border-slate-200 bg-white shadow-[10px_0_30px_rgba(15,23,42,0.06)] transition-[width,left] duration-300 ease-in-out",
                collapsed ? "md:w-[82px] md:items-center" : "md:w-[268px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
            {tooltip.show && collapsed && (
                <div
                    className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded bg-black px-3 py-1 text-sm text-white shadow-lg transition-all duration-300"
                    style={{
                        top: `${tooltip.y}px`,
                        left: `${tooltip.x}px`,
                        transform: "translateY(-50%)",
                    }}
                >
                    {tooltip.label}
                </div>
            )}

            {/* Logo – close on mobile when clicked */}
            <Link
                to="/"
                onClick={handleMobileNavigation}
            >
                <div className="flex cursor-pointer items-center justify-center px-4 py-4">
                    {/* Wrapper with fixed aspect ratio for consistency */}
                    <div
                        className={cn(
                            "relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
                            collapsed
                                ? "mx-auto h-12 w-12"
                                : "mx-auto h-[58px] w-full",
                        )}
                    >
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Company Logo"
                                onError={() => setLogoUrl(logo)}
                                className={cn(
                                    "absolute inset-0 h-full w-full transition-all duration-300",
                                    collapsed ? "object-contain" : "object-contain",
                                )}
                            />
                        ) : (
                            <div className="absolute inset-0 animate-pulse bg-slate-100" />
                        )}
                    </div>
                </div>
            </Link>

            {!collapsed && (
                <div className="mx-4 mb-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-500">
                        {isHrmsWorkspace && isProviderAdmin ? "CRESCO HRMS PLATFORM" : "CRM Workspace"}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                        {isHrmsWorkspace && isProviderAdmin ? "Super Admin" : user?.role_name || (helpDeskMode ? "Helpdesk" : "Sales CRM")}
                    </p>
                </div>
            )}

            <nav className="flex w-full flex-1 flex-col gap-y-5 overflow-y-auto overflow-x-hidden px-3 pb-5 pt-2 [scrollbar-color:_#cbd5e1_transparent] [scrollbar-width:_thin]">
                {sidebarSections.map((group, gIndex) => (
                    <div
                        key={group.title || `group-${gIndex}`}
                        className={cn("sidebar-group gap-y-1.5", collapsed && "md:items-center")}
                    >
                        {!collapsed && group.title && (
                            <p className="sidebar-group-title px-3 pb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{group.title}</p>
                        )}

                        {group.links.map((link, lIndex) => {
                            if (!contentRefs.current[link.label]) {
                                contentRefs.current[link.label] = React.createRef();
                            }

                            return link.isAccordion ? (
                                <div
                                    key={link.label || `link-${lIndex}`}
                                    className="w-full"
                                >
                                    {/* Accordion header – only toggle, do NOT close sidebar */}
                                    <div
                                        className={cn(
                                            "sidebar-item group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700",
                                            collapsed && "md:h-11 md:w-11 md:justify-center md:px-0",
                                        )}
                                        onClick={() => {
                                            if (link.showArrow) toggleAccordion(link.label);
                                            // → NO handleMobileNavigation here
                                        }}
                                        onMouseEnter={(e) => {
                                            if (collapsed) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setTooltip({
                                                    label: link.label,
                                                    x: rect.right + 5,
                                                    y: rect.top + rect.height / 2,
                                                    show: true,
                                                });
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (collapsed) setTooltip({ ...tooltip, show: false });
                                        }}
                                    >
                                        <link.icon
                                            size={21}
                                            className="flex-shrink-0"
                                        />
                                        {!collapsed && <p className="whitespace-nowrap text-sm font-bold">{link.label}</p>}
                                        {!collapsed && link.showArrow && <span className="ml-auto">{openAccordions[link.label] ? "▲" : "▼"}</span>}
                                    </div>

                                    <div
                                        ref={contentRefs.current[link.label]}
                                        style={{
                                            height:
                                                openAccordions[link.label] || link.defaultOpen
                                                    ? `${contentRefs.current[link.label].current?.scrollHeight}px`
                                                    : `0px`,
                                        }}
                                        className={cn(
                                            "overflow-hidden transition-all duration-500 ease-in-out",
                                            collapsed ? "md:hidden" : "ml-5 border-l border-slate-100 pl-3",
                                        )}
                                    >
                                        <div className="flex flex-col gap-1 py-1">
                                            {link.children.map((child, cIndex) => {
                                                if (
                                                    (child.label === "Incentive Payment" ||
                                                        child.label === "Landing Setup" ||
                                                        child.label === "Bank Setup" ||
                                                        child.label === "Company Setup") &&
                                                    !(user?.role_name === "Super Admin" || user?.role_name === "Super Provider Admin")
                                                ) {
                                                    return null;
                                                }

                                                if (child.isLabel) {
                                                    return (
                                                        <p
                                                            key={child.label || `child-${cIndex}`}
                                                            className="ml-2 mt-2 text-xs font-bold uppercase text-gray-400"
                                                        >
                                                            {child.label}
                                                        </p>
                                                    );
                                                }

                                                if (child.isGroup && Array.isArray(child.children)) {
                                                    if (!nestedContentRefs.current[child.label]) {
                                                        nestedContentRefs.current[child.label] = React.createRef();
                                                    }

                                                    return (
                                                        <div
                                                            key={child.label || `groupChild-${cIndex}`}
                                                            className="ml-2 mt-1"
                                                        >
                                                            {/* Nested group header – toggle only */}
                                                            <div
                                                                className="sidebar-item flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-slate-700"
                                                                onClick={() => {
                                                                    toggleNestedAccordion(child.label);
                                                                    // → NO close here either
                                                                }}
                                                            >
                                                                <child.icon
                                                                    size={18}
                                                                    className="text-slate-500"
                                                                />
                                                                <p className="whitespace-nowrap text-sm font-bold">{child.label}</p>
                                                                <span className="ml-auto">{openNestedAccordions[child.label] ? "▼" : "▲"}</span>
                                                            </div>

                                                            <div
                                                                ref={nestedContentRefs.current[child.label]}
                                                                className="ml-4 overflow-hidden transition-all duration-500 ease-in-out"
                                                                style={{
                                                                    height: openNestedAccordions[child.label]
                                                                        ? `0px`
                                                                        : `${nestedContentRefs.current[child.label].current?.scrollHeight}px`,
                                                                }}
                                                            >
                                                                <div className="flex flex-col gap-1 py-1">
                                                                    {child.children.map((subItem, sIndex) => {
                                                                        if (
                                                                            (subItem.label === "Assign Incentive" ||
                                                                                subItem.label === "Landing Page" ||
                                                                                subItem.label === "Roles") &&
                                                                            !(
                                                                                user?.role_name === "Super Admin" ||
                                                                                user?.role_name === "Super Provider Admin"
                                                                            )
                                                                        ) {
                                                                            return null;
                                                                        }

                                                                        return (
                                                                            <NavLink
                                                                                key={subItem.label || `subItem-${sIndex}`}
                                                                                to={subItem.path}
                                                                                className={({ isActive }) =>
                                                                                    cn(
                                                                                        "sidebar-item group relative ml-1 flex items-center gap-2 rounded-xl px-3 py-2.5",
                                                                                        isActive
                                                                                            ? "active text-slate-900"
                                                                                            : "text-slate-600",
                                                                                    )
                                                                                }
                                                                                onClick={handleMobileNavigation} // ← close only here
                                                                            >
                                                                                <subItem.icon
                                                                                    size={17}
                                                                                    className="text-slate-500"
                                                                                />
                                                                                <p className="whitespace-nowrap text-sm font-semibold">{subItem.label}</p>
                                                                            </NavLink>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <NavLink
                                                        key={child.label || `child-${cIndex}`}
                                                        to={child.path}
                                                        className={({ isActive }) =>
                                                            cn(
                                                                "sidebar-item group relative ml-1 flex items-center gap-2 rounded-xl px-3 py-2.5",
                                                                isActive
                                                                    ? "active text-slate-900"
                                                                    : "text-slate-600",
                                                            )
                                                        }
                                                        onClick={handleMobileNavigation} // ← close only on navigation
                                                    >
                                                        <child.icon
                                                            size={17}
                                                            className="flex-shrink-0 text-slate-500"
                                                        />
                                                        <p className="whitespace-nowrap text-sm font-semibold">{child.label}</p>
                                                    </NavLink>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <NavLink
                                    key={link.label || `link-${lIndex}`}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        cn(
                                            "sidebar-item group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                                            collapsed && "md:h-11 md:w-11 md:justify-center md:px-0",
                                            isActive ? "active text-slate-900" : "text-slate-700",
                                        )
                                    }
                                    onClick={handleMobileNavigation} // ← close only on navigation
                                    onMouseEnter={(e) => {
                                        if (collapsed) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setTooltip({
                                                label: link.label,
                                                x: rect.right + 5,
                                                y: rect.top + rect.height / 2,
                                                show: true,
                                            });
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (collapsed) setTooltip({ ...tooltip, show: false });
                                    }}
                                >
                                    <link.icon
                                        size={21}
                                        className="flex-shrink-0"
                                    />
                                    {!collapsed && <p className="whitespace-nowrap text-sm font-bold">{link.label}</p>}
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className={cn("border-t border-slate-100 p-3", collapsed && "md:flex md:justify-center")}>
                <div
                    className={cn(
                        "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm",
                        collapsed && "md:size-12 md:justify-center md:rounded-2xl md:p-0",
                    )}
                >
                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-extrabold text-white">
                        {initials}
                        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-slate-800">{displayName}</p>
                            <p className="truncate text-xs font-semibold text-slate-500">{user?.role_name || "Online"}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
});

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
    helpDeskMode: PropTypes.bool,
    activeWorkspace: PropTypes.string,
};
