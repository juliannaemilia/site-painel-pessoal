import type { Config } from "tailwindcss";

const withAlpha = (variable: string): string => `hsl(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base": withAlpha("--bg-base"),
        "bg-surface": withAlpha("--bg-surface"),
        "text-main": withAlpha("--text-main"),
        "text-muted": withAlpha("--text-muted"),
        "border-color": withAlpha("--border-color"),

        // Aliases mantidos para preservar a API visual já usada pelo projeto.
        border: withAlpha("--border-color"),
        background: withAlpha("--bg-base"),
        foreground: withAlpha("--text-main"),
        muted: {
          DEFAULT: withAlpha("--bg-muted"),
          foreground: withAlpha("--text-muted"),
        },
        card: {
          DEFAULT: withAlpha("--bg-surface"),
          foreground: withAlpha("--text-main"),
        },
        primary: {
          DEFAULT: withAlpha("--primary"),
          foreground: withAlpha("--primary-foreground"),
        },
        secondary: {
          DEFAULT: withAlpha("--bg-muted"),
          foreground: withAlpha("--text-main"),
        },
        destructive: {
          DEFAULT: withAlpha("--destructive"),
          foreground: withAlpha("--destructive-foreground"),
        },
        success: {
          DEFAULT: withAlpha("--success"),
          foreground: withAlpha("--success-foreground"),
        },
        accent: {
          DEFAULT: withAlpha("--primary"),
          foreground: withAlpha("--primary-foreground"),
        },
        brand: {
          petroleum: withAlpha("--brand-petroleum"),
          orange: withAlpha("--brand-orange"),
          pink: withAlpha("--brand-pink"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
