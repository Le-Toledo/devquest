import { StyleSheet, Text } from 'react-native';
import { useSettings } from '@hooks';
import { AppCard } from './AppCard';

export function GameToast({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' | 'info' }) {
  const { colors } = useSettings();
  const color = tone === 'success' ? colors.success : tone === 'error' ? colors.danger : colors.secondary;
  return (
    <AppCard style={{ borderColor: color }}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  text: { fontWeight: '900', fontSize: 14 }
});
