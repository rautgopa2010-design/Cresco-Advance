import { Outlet } from "react-router-dom";

import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/use-click-outside";

import { Sidebar } from "@/layouts/sidebar";
import { Header } from "@/layouts/header";
import { Footer } from "@/layouts/footer";

import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

const AppLayout = () => {
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    const [collapsed, setCollapsed] = useState(!isDesktopDevice);

    // Read from localStorage or default to false
    const [helpDeskMode, setHelpDeskMode] = useState(() => {
        return localStorage.getItem("helpDeskMode") === "true";
    });

    const sidebarRef = useRef(null);

    useEffect(() => {
        setCollapsed(!isDesktopDevice);
    }, [isDesktopDevice]);

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
            />
            <div className={cn("flex-1 transition-[margin] duration-300", collapsed ? "md:ml-[82px]" : "md:ml-[268px]")}>
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    helpDeskMode={helpDeskMode}
                    setHelpDeskMode={setHelpDeskMode}
                />
                <main className="h-[calc(100vh-66px-66px)] overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:h-[calc(100vh-72px-72px)] lg:h-[calc(100vh-61px-61px)] lg:p-6">
                    <Outlet context={{ helpDeskMode }} />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default AppLayout;
