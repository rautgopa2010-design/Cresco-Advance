import { useCallback, useRef, useState } from "react";

export const usePincodeLookup = (onResolved) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const requestRef = useRef(0);

    const lookup = useCallback(
        async (pincode) => {
            const normalized = String(pincode || "").replace(/\D/g, "").slice(0, 6);
            if (normalized.length !== 6) {
                setError("");
                return;
            }

            const requestId = ++requestRef.current;
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${normalized}`);
                if (!response.ok) throw new Error("Location service unavailable");
                const payload = await response.json();
                const postOffice = payload?.[0]?.PostOffice?.[0];
                if (!postOffice) throw new Error("PIN code not found");
                if (requestId === requestRef.current) {
                    onResolved({ city: postOffice.District, state: postOffice.State, country: postOffice.Country || "India" });
                }
            } catch (lookupError) {
                if (requestId === requestRef.current) setError(lookupError.message || "Unable to find this PIN code");
            } finally {
                if (requestId === requestRef.current) setLoading(false);
            }
        },
        [onResolved],
    );

    return { lookup, loading, error };
};
