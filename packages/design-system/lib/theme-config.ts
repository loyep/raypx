import { IconDeviceLaptop, IconMoon, IconSun } from "@tabler/icons-react";
import type { TablerIconComponent } from "../components/icon";

export type ThemeKey = "light" | "dark" | "system";

export type ThemeIcon = TablerIconComponent;

export const themeIcons: Record<ThemeKey, ThemeIcon> = {
  light: IconSun,
  dark: IconMoon,
  system: IconDeviceLaptop,
} as const;

export type ThemeConfig = {
  value: ThemeKey;
  label: string;
  icon: (typeof themeIcons)[keyof typeof themeIcons];
};

export const themeConfig: readonly ThemeConfig[] = [
  { value: "light", label: "Light", icon: themeIcons.light },
  { value: "dark", label: "Dark", icon: themeIcons.dark },
  { value: "system", label: "System", icon: themeIcons.system },
] as const;
