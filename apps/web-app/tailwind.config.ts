import type { Config } from "tailwindcss";

const color = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          base: color("--color-primary-base"),
          dark: color("--color-primary-dark"),
          light: color("--color-primary-light"),
        },
        secondary: {
          base: color("--color-secondary-base"),
          dark: color("--color-secondary-dark"),
          light: color("--color-secondary-light"),
          lightest: color("--color-secondary-lightest"),
        },
        fill: {
          primary: color("--color-fill-primary"),
          secondary: color("--color-fill-secondary"),
          tertiary: color("--color-fill-tertiary"),
          quarternary: color("--color-fill-quarternary"),
        },
        separator: {
          primary: color("--color-separator-primary"),
          secondary: color("--color-separator-secondary"),
          tertiary: color("--color-separator-tertiary"),
          quarternary: color("--color-separator-quarternary"),
        },
        card: {
          primary: color("--color-card-primary"),
          secondary: color("--color-card-secondary"),
          tertiary: color("--color-card-tertiary"),
        },
        success: {
          base: color("--color-success-base"),
          dark: color("--color-success-dark"),
          light: color("--color-success-light"),
        },
        warning: {
          base: color("--color-warning-base"),
          dark: color("--color-warning-dark"),
          light: color("--color-warning-light"),
        },
        danger: {
          base: color("--color-danger-base"),
          dark: color("--color-danger-dark"),
          light: color("--color-danger-light"),
        },
        info: {
          base: color("--color-info-base"),
          dark: color("--color-info-dark"),
          light: color("--color-info-light"),
        },
        title: color("--color-title"),
        content: color("--color-content"),
        placeholder: color("--color-placeholder"),
        disabled: color("--color-disabled"),
      },
    },
  },
} satisfies Config;
