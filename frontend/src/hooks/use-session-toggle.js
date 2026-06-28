import { useEffect, useState } from "react";

export const useSessionToggle = (storageKey, defaultValue = false) => {
    const [value, setValue] = useState(() => {
        try {
            const storedValue = sessionStorage.getItem(storageKey);
            return storedValue === null ? defaultValue : storedValue === "true";
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(storageKey, String(value));
        } catch {
            // Session storage can be unavailable in restricted browsers.
        }
    }, [storageKey, value]);

    return [value, setValue];
};
