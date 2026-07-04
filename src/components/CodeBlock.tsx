import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSettings } from '../hooks/useSettings';

export function CodeBlock({ code }: { code: string }) {
  const { colors } = useSettings();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.wrap, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
      <Text style={[styles.code, { color: colors.text }]}>{code}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12
  },
  code: {
    padding: 14,
    fontFamily: 'Courier',
    fontSize: 13,
    lineHeight: 19
  }
});
