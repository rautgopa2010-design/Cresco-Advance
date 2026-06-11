import React, { forwardRef, useRef, useState, useEffect, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { adminNavbarLinks, helpDeskNavbarLinks, providerAdminNavbarLinks } from "@/constants";
import logo from "@/assets/logo.jpg";
import { cn } from "@/utils/cn";
import { filterLinksByPermission } from "@/utils/permissionHelper";
import { IMAGE_BASE_URL } from "@/utils/api";
import { getCompanySetup } from "../redux/actions/companySetup";
import { clearSnackbar } from "../redux/actions/commonActions";
import { useDispatch, useSelector } from "react-redux";

export const Sidebar = forwardRef(({ collapsed, setCollapsed, helpDeskMode }, ref) => {
    const [tooltip, setTooltip] = useState({ label: "", x: 0, y: 0, show: false });
    const [openAccordions, setOpenAccordions] = useState({});
    const [openNestedAccordions, setOpenNestedAccordions] = useState({});
    const contentRefs = useRef({});
    const nestedContentRefs = useRef({});
    const [initialLoad, setInitialLoad] = useState(true);
    const { companySetup } = useSelector((state) => state.companySetup);
    const [logoUrl, setLogoUrl] = useState(logo);

    const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
    const dispatch = useDispatch();

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
            setLogoUrl(`${IMAGE_BASE_URL}${companySetup.companyLogo}`);
        } else {
            setLogoUrl(logo);
        }
    }, [companySetup]);

    const linksToRender = useMemo(() => {
        const isProviderAdmin = user?.user_type === "provider";
        let links;
        if (isProviderAdmin) links = providerAdminNavbarLinks;
        else links = helpDeskMode ? helpDeskNavbarLinks : adminNavbarLinks;
        return filterLinksByPermission(links, user.permissions, isProviderAdmin, user?.role_name);
    }, [user, helpDeskMode]);

    // Initialize accordions with defaultOpen flag
    useEffect(() => {
        const initial = {};
        const nested = {};
        linksToRender.forEach((group) => {
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
    }, [linksToRender]);

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
            const currentOrgId = user?.org_id || "default";

            if (updatedOrgId === currentOrgId) {
                if (newLogo) {
                    setLogoUrl(`${IMAGE_BASE_URL}${newLogo}`);
                } else {
                    setLogoUrl(logo);
                }
            }
        };

        window.addEventListener("companyLogoUpdated", handleLogoUpdate);

        return () => {
            window.removeEventListener("companyLogoUpdated", handleLogoUpdate);
        };
    }, [user]);

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-visible border-r border-slate-300 bg-white",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
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
                <div className="flex cursor-pointer items-center justify-center">
                    {/* Wrapper with fixed aspect ratio for consistency */}
                    <div
                        className={cn(
                            "relative overflow-hidden rounded-lg bg-gray-50", // optional: subtle bg + rounding
                            collapsed
                                ? "mx-auto mt-4 h-12 w-16" // collapsed: small square-ish
                                : "mx-auto mt-2 h-[60px] w-80", // expanded: wider rectangle
                        )}
                    >
                        <img
                            src={logoUrl}
                            alt="Company Logo"
                            className={cn(
                                "absolute inset-0 h-full w-full transition-all duration-300",
                                collapsed ? "object-contain" : "object-contain",
                            )}
                        />
                    </div>
                </div>
            </Link>

            <nav className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {linksToRender.map((group, gIndex) => (
                    <div
                        key={group.title || `group-${gIndex}`}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                        {!collapsed && group.title && (
                            <p className="sidebar-group-title px-2 text-xs font-bold uppercase text-gray-400">{group.title}</p>
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
                                            "sidebar-item group relative flex cursor-pointer items-center gap-2 rounded bg-gradient-to-r p-2 text-[#433C50] hover:from-violet-100 hover:to-violet-300",
                                            collapsed && "md:w-[45px]",
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
                                            size={22}
                                            className="flex-shrink-0"
                                        />
                                        {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
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
                                        className="ml-6 overflow-hidden transition-all duration-500 ease-in-out"
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
                                                                className="flex cursor-pointer items-center gap-2 bg-gradient-to-r p-2 text-[#433C50] hover:from-violet-100 hover:to-violet-300"
                                                                onClick={() => {
                                                                    toggleNestedAccordion(child.label);
                                                                    // → NO close here either
                                                                }}
                                                            >
                                                                <child.icon
                                                                    size={20}
                                                                    className="text-slate-500"
                                                                />
                                                                <p className="whitespace-nowrap">{child.label}</p>
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
                                                                                        "sidebar-item group relative ml-2 flex items-center gap-2 rounded bg-gradient-to-r p-2 hover:from-violet-100 hover:to-violet-300",
                                                                                        isActive
                                                                                            ? "bg-gradient-to-r from-violet-100 to-violet-300 text-[#433C50]"
                                                                                            : "text-[#433C50]",
                                                                                    )
                                                                                }
                                                                                onClick={handleMobileNavigation} // ← close only here
                                                                            >
                                                                                <subItem.icon
                                                                                    size={18}
                                                                                    className="text-slate-500"
                                                                                />
                                                                                <p className="whitespace-nowrap">{subItem.label}</p>
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
                                                                "sidebar-item group relative ml-2 flex items-center gap-2 rounded bg-gradient-to-r p-2 hover:from-violet-100 hover:to-violet-300",
                                                                isActive
                                                                    ? "bg-gradient-to-r from-violet-100 to-violet-300 text-[#433C50]"
                                                                    : "text-[#433C50]",
                                                            )
                                                        }
                                                        onClick={handleMobileNavigation} // ← close only on navigation
                                                    >
                                                        <child.icon
                                                            size={20}
                                                            className="flex-shrink-0 text-slate-500"
                                                        />
                                                        <p className="whitespace-nowrap">{child.label}</p>
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
                                            "sidebar-item group relative flex items-center gap-2 rounded bg-gradient-to-r p-2 hover:from-violet-100 hover:to-violet-300",
                                            collapsed && "md:w-[45px]",
                                            isActive ? "bg-gradient-to-r from-violet-100 to-violet-300 text-[#433C50]" : "text-[#433C50]",
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
                                        size={22}
                                        className="flex-shrink-0"
                                    />
                                    {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
});

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
    helpDeskMode: PropTypes.bool,
};
