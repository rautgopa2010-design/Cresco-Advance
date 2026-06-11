
// Helper to parse common date string formats into 'YYYY-MM-DD'
const parseDateString = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;

    dateStr = dateStr.trim();

    // Try common formats
    const formats = [
        '%Y-%m-%d',   // 2025-12-13
        '%d/%m/%Y',   // 13/12/2025
        '%d-%m-%Y',   // 13-12-2025
        '%m/%d/%Y',   // 12/13/2025 (less common in your region)
        '%m-%d-%Y',   // 12-13-2025
    ];

    for (const fmt of formats) {
        try {
            // Manual parsing to avoid external libs
            let day, month, year;

            if (fmt === '%Y-%m-%d') {
                [year, month, day] = dateStr.split('-').map(Number);
            } else if (fmt === '%d/%m/%Y' || fmt === '%d-%m-%Y') {
                const parts = dateStr.split(fmt.includes('/') ? '/' : '-');
                day = Number(parts[0]);
                month = Number(parts[1]);
                year = Number(parts[2]);
            } else if (fmt === '%m/%d/%Y' || fmt === '%m-%d-%Y') {
                const parts = dateStr.split(fmt.includes('/') ? '/' : '-');
                month = Number(parts[0]);
                day = Number(parts[1]);
                year = Number(parts[2]);
            }

            if (year && month && day && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                // Pad month and day
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        } catch (e) {
            continue;
        }
    }

    return null; // Could not parse
}

// Safe JSON parser with fallback
const parseJSON = (value, fallback) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    }
    return fallback;
};

module.exports = { parseDateString, parseJSON };