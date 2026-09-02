import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#2FB7A4",
        teal: "#0F8074",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"PingFang TC"',
          '"Microsoft JhengHei"',
          '"Noto Sans TC"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
