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
        'brand-light':   '#FBA98E',
        'brand-mid':     '#F86A3A',
        'brand-strong':  '#F64409',
        'surface':       '#FFF8F6',
        'border':        '#F0E8E5',
        'border-strong': '#E8D5CF',
        'app-text':      '#1A0A06',
        'app-muted':     '#8A6560',
        'empty':         '#F5EDE9',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
