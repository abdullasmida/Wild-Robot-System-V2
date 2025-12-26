/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#10b77f",
                "background-light": "#f6f8f7",
                "background-dark": "#10221c",
                "branch-ajman": "#ec4899", // Pink
                "branch-sharjah": "#3b82f6", // Blue
            },
            fontFamily: { "display": ["Lexend", "sans-serif"] }
        },
    },
    plugins: [],
}
