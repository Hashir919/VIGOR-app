
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "rgb(var(--color-primary) / <alpha-value>)",
                "background": "rgb(var(--bg-main) / <alpha-value>)",
                "surface": "rgb(var(--bg-surface) / <alpha-value>)",
                "surface-highlight": "rgb(var(--bg-highlight) / <alpha-value>)",
                "text-main": "rgb(var(--text-main) / <alpha-value>)",
                "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
                "border": "rgb(var(--border-main) / <alpha-value>)",
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"],
                "sans": ["Lexend", "sans-serif"],
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
        },
    },
    plugins: [],
}
