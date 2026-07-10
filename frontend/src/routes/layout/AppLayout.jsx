import { Outlet, useLocation } from "react-router-dom";

import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/use-click-outside";

import { Sidebar } from "@/layouts/sidebar";
import { Header } from "@/layouts/header";
import { Footer } from "@/layouts/footer";

import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";
import { getUserBusinessApps, rememberBusinessApp } from "@/utils/businessSuite";

const AppLayout = () => {
    const location = useLocation();
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    const [collapsed, setCollapsed] = useState(!isDesktopDevice);
    const isDashboardPage = location.pathname === "/";
    const isHrmsRoute = location.pathname.startsWith("/hrms");
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const availableApps = getUserBusinessApps(user);
    const hasCrmAccess = availableApps.some((app) => app.id === "crm");
    const hasHrmsAccess = availableApps.some((app) => app.id === "hrms");
    const [activeWorkspace, setActiveWorkspace] = useState(() => {
        const stored = localStorage.getItem("lastWorkspace") || localStorage.getItem("activeWorkspace");
        if (stored) return stored;
        return hasCrmAccess ? "crm" : hasHrmsAccess ? "hrms" : "crm";
    });

    // Read from localStorage or default to false
    const [helpDeskMode, setHelpDeskMode] = useState(() => {
        return localStorage.getItem("helpDeskMode") === "true";
    });

    const sidebarRef = useRef(null);

    useEffect(() => {
        setCollapsed(!isDesktopDevice);
    }, [isDesktopDevice]);

    useEffect(() => {
        const syncUser = () => setUser(JSON.parse(localStorage.getItem("user") || "{}"));
        window.addEventListener("sessionUserUpdated", syncUser);
        window.addEventListener("storage", syncUser);
        return () => {
            window.removeEventListener("sessionUserUpdated", syncUser);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    useEffect(() => {
        if (user?.user_type === "provider" && !isHrmsRoute && activeWorkspace === "hrms") {
            setActiveWorkspace("crm");
            rememberBusinessApp("crm");
            return;
        }

        if (isHrmsRoute && activeWorkspace !== "hrms") {
            setActiveWorkspace("hrms");
            rememberBusinessApp("hrms");
            return;
        }

        if (activeWorkspace === "hrms" && !hasHrmsAccess) {
            setActiveWorkspace("crm");
            rememberBusinessApp("crm");
        }
        if (activeWorkspace === "crm" && !hasCrmAccess && hasHrmsAccess) {
            setActiveWorkspace("hrms");
            rememberBusinessApp("hrms");
        }
    }, [activeWorkspace, hasCrmAccess, hasHrmsAccess, isHrmsRoute, user?.user_type]);

    const handleWorkspaceChange = (workspace) => {
        setActiveWorkspace(workspace);
        rememberBusinessApp(workspace);
    };

    useEffect(() => {
        // Sync helpDeskMode to localStorage when it changes
        localStorage.setItem("helpDeskMode", helpDeskMode);
    }, [helpDeskMode]);

    useClickOutside([sidebarRef], () => {
        if (!isDesktopDevice && !collapsed) {
            setCollapsed(true);
        }
    });

    return (
        <div className="flex min-h-screen flex-col bg-[#f5f7fb] transition-colors dark:bg-slate-950">
            <div
                className={cn(
                    "pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity",
                    !collapsed && "max-md:pointer-events-auto max-md:z-50 max-md:opacity-30",
                )}
            />
            <Sidebar
                ref={sidebarRef}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                helpDeskMode={helpDeskMode}
                activeWorkspace={activeWorkspace}
            />
            <div className={cn("flex-1 transition-[margin] duration-300", collapsed ? "md:ml-[82px]" : "md:ml-[268px]")}>
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    helpDeskMode={helpDeskMode}
                    setHelpDeskMode={setHelpDeskMode}
                    activeWorkspace={activeWorkspace}
                    setActiveWorkspace={handleWorkspaceChange}
                    hasCrmAccess={hasCrmAccess}
                    hasHrmsAccess={hasHrmsAccess}
                />
                <main
                    className={cn(
                        "overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6",
                        isDashboardPage
                            ? "h-[calc(100vh-66px)] md:h-[calc(100vh-72px)] lg:h-[calc(100vh-61px)]"
                            : "h-[calc(100vh-66px-66px)] md:h-[calc(100vh-72px-72px)] lg:h-[calc(100vh-61px-61px)]",
                    )}
                >
                    <Outlet context={{ helpDeskMode, activeWorkspace, hasCrmAccess, hasHrmsAccess, setActiveWorkspace: handleWorkspaceChange }} />
                </main>
                {!isDashboardPage && <Footer />}
            </div>
        </div>
    );
};

export default AppLayout;
