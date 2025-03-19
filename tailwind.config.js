/** @type {import('tailwindcss').Config} */
export default {
	content: [
	  "./index.html",
	  "./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
	  extend: {
		colors: {
		  primary: {
			50: '#eef2ff',
			100: '#e0e7ff',
			500: '#6366f1',
			600: '#4f46e5',
			700: '#4338ca',
		  },
		  secondary: {
			500: '#10b981',
			600: '#059669',
		  },
		  gray: {
			100: '#f3f4f6',
			200: '#e5e7eb',
			300: '#d1d5db',
			500: '#6b7280',
			800: '#1f2937',
			900: '#111827',
		  }
		}
	  },
	},
	plugins: [],
  }