// tailwind.config.js
const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}", // ✅ для Next.js App Router
        "./pages/**/*.{js,ts,jsx,tsx}", // ✅ если используешь pages/
        "./components/**/*.{js,ts,jsx,tsx}", // ✅ твои собственные UI-компоненты
        "./node_modules/@heroui/theme/dist/components/button.js",
        "./node_modules/@heroui/theme/dist/components/**/*.{js,ts,jsx,tsx}", // ✅ HeroUI компоненты
    ],
    theme: {
        extend: {},
    },
    darkMode: "class",
    plugins: [heroui()],
};
