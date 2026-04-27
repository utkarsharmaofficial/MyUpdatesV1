import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-light':   'var(--brand-light)',
        'brand-mid':     'var(--brand-mid)',
        'brand-strong':  'var(--brand-strong)',
        'surface':       'var(--surface)',
        'border':        'var(--border)',
        'border-strong': 'var(--border-strong)',
        'app-text':      '#1A0A06',
        'app-muted':     '#8A6560',
        'empty':         'var(--empty)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
