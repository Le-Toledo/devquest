import { ThemeMode } from '../types/game';

export const palettes = {
  dark: {
    mode: 'dark' as ThemeMode,
    background: '#080A0F',
    surface: '#12161D',
    surfaceSoft: '#1B222C',
    surfaceGlow: '#202A38',
    text: '#F6F7FB',
    muted: '#AEB8C8',
    primary: '#49E3B3',
    secondary: '#8EA7FF',
    accent: '#FFD166',
    danger: '#ff6b6b',
    success: '#4ade80',
    border: '#2B3340',
    glow: '#49E3B333',
    warning: '#f59e0b',
    premium: '#f8c76b',
    overlay: '#080A0FCC',
    onAccent: '#081019'
  },
  light: {
    mode: 'light' as ThemeMode,
    background: '#F6F8FB',
    surface: '#FFFFFF',
    surfaceSoft: '#EEF3F8',
    surfaceGlow: '#E3ECF6',
    text: '#111827',
    muted: '#5C6675',
    primary: '#0D9F80',
    secondary: '#365FE8',
    accent: '#B97800',
    danger: '#D94848',
    success: '#188A45',
    border: '#D8E0EA',
    glow: '#0D9F8029',
    warning: '#B7791F',
    premium: '#B98214',
    overlay: '#FFFFFFCC',
    onAccent: '#07111F'
  }
};

export type AppColors = typeof palettes.dark;
