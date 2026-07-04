import { ReactNode } from 'react';
import { useSettings } from '@hooks';
import { AppCard } from './AppCard';

export function FloatingActionCard({ children }: { children: ReactNode }) {
  const { colors } = useSettings();
  return <AppCard style={{ borderColor: colors.primary }}>{children}</AppCard>;
}
