import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useSettings } from '@hooks';
import { radius, shadows, spacing, typography } from '@theme';

export function AppButton({
  title,
  icon,
  variant = 'primary',
  disabled,
  loading,
  onPress,
  style
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}) {
  const { colors } = useSettings();
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'premium' ? colors.premium : variant === 'ghost' ? 'transparent' : colors.surfaceSoft;
  const fg = variant === 'primary' || variant === 'danger' || variant === 'premium' ? colors.onAccent : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      onPress={onPress}
      hitSlop={4}
      android_ripple={{ color: colors.glow, borderless: false }}
      style={({ pressed }) => [styles.button, variant === 'primary' ? shadows.button : null, { backgroundColor: bg, borderColor: colors.border, opacity: disabled ? 0.48 : pressed ? 0.84 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }]} numberOfLines={2}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm
  },
  label: {
    ...typography.button,
    flexShrink: 1,
    textAlign: 'center'
  }
});
