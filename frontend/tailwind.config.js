/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--pa-r-lg)',
  			md: 'var(--pa-r-md)',
  			sm: 'var(--pa-r-sm)',
  			xl: 'var(--pa-r-xl)',
  			full: 'var(--pa-r-full)',
  		},
  		colors: {
  			pa: {
  				ink: 'rgb(15 23 42 / <alpha-value>)',
  				'soft-ink': 'rgb(30 41 59 / <alpha-value>)',
  				muted: 'rgb(71 85 105 / <alpha-value>)',
  				surface: 'rgb(248 250 252 / <alpha-value>)',
  				'surface-2': 'rgb(241 245 249 / <alpha-value>)',
  				panel: 'rgb(255 255 255 / <alpha-value>)',
  				brand: 'rgb(79 70 229 / <alpha-value>)',
  				'brand-deep': 'rgb(67 56 202 / <alpha-value>)',
  				interactive: 'rgb(59 130 246 / <alpha-value>)',
  				highlight: 'rgb(124 58 237 / <alpha-value>)',
  				success: 'rgb(22 163 74 / <alpha-value>)',
  				warning: 'rgb(217 119 6 / <alpha-value>)',
  				error: 'rgb(220 38 38 / <alpha-value>)',
  				green: 'rgb(79 70 229 / <alpha-value>)',
  				'green-deep': 'rgb(67 56 202 / <alpha-value>)',
  				'on-green': 'rgb(255 255 255 / <alpha-value>)',
  				'on-brand': 'rgb(255 255 255 / <alpha-value>)',
  				'on-ink': 'rgb(248 250 252 / <alpha-value>)',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		transitionTimingFunction: {
  			pa: 'var(--pa-ease)',
  		},
  		transitionDuration: {
  			pa: '220ms',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};