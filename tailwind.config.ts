import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/assets/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/design-system/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        fontFamily: {
            sans: ["var(--font-plex-sans)"],
            serif: ["var(--font-plex-serif)"],
        },
        colors: {
            transparent: "transparent",
            white: "#FFFFFF",
            grey: "#666",
            black: "#1F1F1F",
            interactive: "#393939",
            "static-border": "#F0F0F0",
            "surface-static-secondary": "#FAFAFA",
            "surface-static-emphasised": "#E12A26",
            "chips-border": "rgba(22, 22, 22, 0.15)",
            footer: "#1C1C1C",
            "light-grey": "#B3B3B3",
            primary: "#212121",
            "primary-hover": "#292929",
            "primary-disabled": "#F5F5F5",
            "primary-emphasised-disabled": "#1616161A",
            secondary: "#F7F7F7",
            "secondary-hover": "#F0F0F0",
            "secondary-disabled": "#F5F5F5",
            "secondary-emphasised-border": "#1616161A",
            "tertiary-emphasised": "#1616160D",
            "tertiary-emphasised-hover": "#1616161A",
            "tertiary-surface": "#F5F5F5",
            "ghost-hover": "#1616160D",
            "ghost-disabled": "#16161600",
            "semantic-error": "#DA1E28",
            "semantic-correct": "#0F62FE",
        },
        extend: {
            boxShadow: {
                tiny: "0px 1px 1px 0px rgba(0, 0, 0, 0.10)",
            },
            borderRadius: {
                "4xl": "2rem",
            },
            borderWidth: {
                thin: "0.006rem",
            },
            maxWidth: {
                custom: "99rem",
            },
        },
    },
    plugins: [],
};
export default config;
