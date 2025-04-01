
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				poa: {
					blue: {
						50: '#f0f7ff',
						100: '#deeeff',
						200: '#b6ddff',
						300: '#75c5ff',
						400: '#38a8ff',
						500: '#0b8aff',
						600: '#006be0',
						700: '#0054b3',
						800: '#004895',
						900: '#003e7c',
					},
					gray: {
						50: '#f8f9fa',
						100: '#f1f3f5',
						200: '#e9ecef',
						300: '#dee2e6',
						400: '#ced4da',
						500: '#adb5bd',
						600: '#868e96',
						700: '#495057',
						800: '#343a40',
						900: '#212529',
					},
					green: {
						50: '#e6f7ec',
						100: '#d0f0de',
						200: '#a0e2be',
						300: '#53c98b',
						400: '#2eb06d',
						500: '#1e874a',
						600: '#186c3c',
						700: '#155d34',
						800: '#11472a',
						900: '#0e3a22',
					},
					red: {
						50: '#ffeaea',
						100: '#ffd5d5',
						200: '#ffabab',
						300: '#ff8282',
						400: '#ff5858',
						500: '#ff2e2e',
						600: '#e50000',
						700: '#b80000',
						800: '#9a0000',
						900: '#7d0000',
					},
					yellow: {
						50: '#fff9e6',
						100: '#fff3cc',
						200: '#ffe799',
						300: '#ffdb66',
						400: '#ffcf33',
						500: '#ffc300',
						600: '#cca000',
						700: '#997800',
						800: '#7a6000',
						900: '#664f00',
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
} satisfies Config;
