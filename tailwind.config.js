
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
                "primary": "#30e87a",
                "background-light": "#f6f8f7",
                "background-dark": "#112117",
                "surface-dark": "#1a2e21",
                "border-dark": "#253f2f",
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
