export const hasModulePermission = (permissions, moduleName) => {
    if (!permissions || !permissions[moduleName]) return false;
    const modulePerm = permissions[moduleName];
    return Object.values(modulePerm).some((value) => value === true);
};

export const filterLinksByPermission = (links, permissions, isProviderAdmin = false, userRole = "") => {
    if (isProviderAdmin) return links; // Provider Admin sees everything

    const isSuperAdmin = userRole === "Super Admin" || userRole === "Super Provider Admin";

    return links
        .map((group) => {
            const filteredLinks = group.links
                .map((link) => {
                    const cloneLink = { ...link };

                    if (cloneLink.label === "Dashboard") return cloneLink; // always show

                    if (cloneLink.isAccordion && cloneLink.children) {
                        cloneLink.children = cloneLink.children
                            .map((child) => {
                                const cloneChild = { ...child };

                                // Nested groups (e.g., Master)
                                if (cloneChild.isGroup && cloneChild.children) {
                                    cloneChild.children = cloneChild.children.filter((sub) => {
                                        let moduleName = sub.moduleName || sub.label;
                                        if (cloneLink.label === "Settings" && cloneChild.label === "Master") {
                                            moduleName = "Master";
                                        }
                                        return hasModulePermission(permissions, moduleName);
                                    });

                                    return cloneChild.children.length > 0 ? cloneChild : null;
                                }

                                // Show Bank Details & Company Setup only for super admin
                                if (
                                    cloneLink.label === "Settings" &&
                                    (cloneChild.label === "Incentive Payment" || cloneChild.label === "Landing Setup" || cloneChild.label === "Bank Setup" || cloneChild.label === "Company Setup")
                                ) {
                                    return isSuperAdmin ? cloneChild : null;
                                }

                                // Map Master children
                                let moduleName = cloneChild.moduleName || cloneChild.label;
                                if (cloneLink.label === "Settings" && cloneChild.label === "Master") {
                                    moduleName = "Master";
                                }

                                return hasModulePermission(permissions, moduleName) ? cloneChild : null;
                            })
                            .filter(Boolean);

                        // Only show the parent accordion if it has at least 1 visible child
                        return cloneLink.children.length > 0 ? cloneLink : null;
                    }

                    return hasModulePermission(permissions, cloneLink.moduleName || cloneLink.label) ? cloneLink : null;
                })
                .filter(Boolean);

            return { ...group, links: filteredLinks };
        })
        .filter((group) => group.links.length > 0);
};
