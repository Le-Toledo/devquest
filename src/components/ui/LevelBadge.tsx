import { StatBadge } from './StatBadge';
import { useSettings } from '@hooks';

export const LevelBadge = ({ value }: { value: number }) => {
  const { colors } = useSettings();
  return <StatBadge label="Nível" value={value} color={colors.secondary} />;
};
