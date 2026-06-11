/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: '#5044e5',         // Your main violet-purple
                'primary-light': '#7e72f2',  // Lighter shade for hovers/backgrounds
                'primary-dark': '#3d35c8',   // Darker for depth/shadows

                // Semantic accents (keep meaningful distinctions)
                success: '#10b981',         // Emerald green for revenue/orders/growth
                warning: '#f59e0b',         // Amber for follow-ups/overdue
                danger: '#ef4444',          // Red for alerts
                info: '#3b82f6',            // Blue for enquiries/leads

                // Neutral backgrounds
                'bg-light': '#f8fafc',      // Very light gray-blue for page bg
                'card-bg': '#ffffff',
            },
        },
    },
    plugins: [],
};