import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '@hooks';

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  const { colors } = useSettings();
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary} />
      <Text style={{ color: colors.muted }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }
});
