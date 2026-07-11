import api from "./api";

const STORAGE_KEY = "platformConfig";
const DEFAULT_CONFIG = { hrmsEnabled: false };

export const getCachedPlatformConfig = () => {
    try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
        return DEFAULT_CONFIG;
    }
};

export const isHrmsFeatureEnabled = () => getCachedPlatformConfig().hrmsEnabled === true;

export const fetchPlatformConfig = async () => {
    try {
        const { data } = await api.get("/platform-config");
        const nextConfig = { ...DEFAULT_CONFIG, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
        window.dispatchEvent(new Event("platformConfigUpdated"));
        return nextConfig;
    } catch {
        return getCachedPlatformConfig();
    }
};
