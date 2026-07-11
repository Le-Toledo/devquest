import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { radius, shadows, spacing, typography } from '../theme';
import { soundService } from '../services/soundService';

type Props = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function GameButton({ title, icon, variant = 'primary', onPress, disabled, loading, style, accessibilityLabel, accessibilityHint }: Props) {
  const { colors } = useSettings();
  const background =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'ghost' ? 'transparent' : colors.surfaceGlow;
  const foreground = variant === 'primary' || variant === 'danger' ? colors.onAccent : colors.text;

  const handlePress = () => {
    soundService.playClick().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      onPress={handlePress}
      disabled={disabled || loading}
      hitSlop={4}
      android_ripple={{ color: colors.glow, borderless: false }}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? shadows.button : null,
        {
          backgroundColor: background,
          borderColor: variant === 'primary' ? colors.primary : colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }]
        },
        style
      ]}
    >
      {loading ? <ActivityIndicator color={foreground} /> : icon ? <Ionicons name={icon} size={18} color={foreground} /> : null}
      <Text style={[styles.label, { color: foreground }]} numberOfLines={2}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.lg,
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
