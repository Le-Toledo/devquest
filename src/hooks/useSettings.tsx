import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { palettes } from '../theme/colors';
import { ThemeMode } from '../types/game';
import { storage } from '../services/storage';

type SettingsContextValue = {
  theme: ThemeMode;
  colors: typeof palettes.dark;
  toggleTheme: () => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    storage.loadTheme().then(setTheme).catch(() => setTheme('dark'));
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      storage.saveTheme(next).catch(() => undefined);
      return next;
    });
  };

  const value = useMemo(() => ({ theme, colors: palettes[theme], toggleTheme }), [theme]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return context;
}
