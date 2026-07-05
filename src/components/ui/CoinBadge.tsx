import { StatBadge } from './StatBadge';
import { useSettings } from '@hooks';

export const CoinBadge = ({ value }: { value: number }) => {
  const { colors } = useSettings();
  return <StatBadge label="Moedas" value={value} color={colors.accent} />;
};
