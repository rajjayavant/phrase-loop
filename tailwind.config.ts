import type { Config } from "tailwindcss";

/**
 * Tailwind is wired to consume the design tokens declared in
 * `src/styles/tokens.css`. Components should reference these semantic
 * utilities (e.g. `bg-surface`, `text-secondary`) rather than raw colors.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        subtle: "var(--color-subtle)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "accent-pressed": "var(--color-accent-pressed)",
        "accent-contrast": "var(--color-accent-contrast)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        destructive: "var(--color-destructive)",
        "focus-ring": "var(--color-focus-ring)",
        "timeline-track": "var(--color-timeline-track)",
        "timeline-buffer": "var(--color-timeline-buffer)",
        "loop-region": "var(--color-loop-region)",
        "marker-a": "var(--color-marker-a)",
        "marker-b": "var(--color-marker-b)",
        "accent-soft": "var(--color-accent-soft)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        display: "var(--font-display)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        display: [
          "var(--font-size-display)",
          { lineHeight: "0.98", letterSpacing: "-0.035em", fontWeight: "700" },
        ],
        "page-title": [
          "var(--font-size-page-title)",
          { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        "section-title": [
          "var(--font-size-section-title)",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        body: ["var(--font-size-body)", { lineHeight: "1.55" }],
        "small-body": ["var(--font-size-small-body)", { lineHeight: "1.5" }],
        label: [
          "var(--font-size-label)",
          { lineHeight: "1.2", letterSpacing: "0.01em", fontWeight: "500" },
        ],
        numeric: [
          "var(--font-size-numeric)",
          { lineHeight: "1", letterSpacing: "0" },
        ],
        timestamp: [
          "var(--font-size-timestamp)",
          { lineHeight: "1", letterSpacing: "0.01em" },
        ],
        helper: ["var(--font-size-helper)", { lineHeight: "1.4" }],
      },
      spacing: {
        "0.5": "var(--space-0-5)",
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "8": "var(--space-8)",
        "10": "var(--space-10)",
        "12": "var(--space-12)",
        "16": "var(--space-16)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        menu: "var(--elevation-menu)",
        dialog: "var(--elevation-dialog)",
        tooltip: "var(--elevation-tooltip)",
        floating: "var(--elevation-floating)",
        faceplate: "var(--elevation-faceplate)",
      },
      backgroundImage: {
        glow: "var(--glow-accent)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasized: "var(--ease-emphasized)",
      },
      transitionDuration: {
        hover: "var(--duration-hover)",
        press: "var(--duration-press)",
        menu: "var(--duration-menu)",
        dialog: "var(--duration-dialog)",
      },
      ringColor: {
        focus: "var(--color-focus-ring)",
      },
    },
  },
  plugins: [],
};

export default config;
