import { StyleSheet, Text, View } from 'react-native';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { progressToNextLevel } from '../utils/progression';
import { ProgressBar } from './ProgressBar';

export function ProfileHeader() {
  const { profile } = usePlayer();
  const { colors } = useSettings();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.avatarText, { color: colors.onAccent }]}>{profile.avatar}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{profile.name}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>Nivel {profile.level} • {profile.xp} XP • {profile.coins} moedas</Text>
        <ProgressBar value={progressToNextLevel(profile)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontWeight: '900'
  },
  info: {
    flex: 1,
    gap: 5
  },
  name: {
    fontSize: 17,
    fontWeight: '900'
  },
  meta: {
    fontSize: 12,
    fontWeight: '700'
  }
});
