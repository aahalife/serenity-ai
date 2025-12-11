import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                montage: ["var(--font-montage)", "serif"],
                sacramento: ["var(--font-sacramento)", "cursive"],
            },
        },
    },
    plugins: [],
};
export default config;
