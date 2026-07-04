import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { CampaignMission, CampaignTrack } from '../types/campaign';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';
import { useSettings } from '../hooks/useSettings';

export function MissionCard({
  mission,
  locked,
  completed,
  selectedTrack,
  onStart
}: {
  mission: CampaignMission;
  locked: boolean;
  completed: boolean;
  selectedTrack?: CampaignTrack;
  onStart: () => void;
}) {
  const { colors } = useSettings();
  const highlighted = selectedTrack ? mission.highlightedTracks?.includes(selectedTrack) : false;

  return (
    <GameCard style={{ borderColor: highlighted ? colors.accent : colors.border, opacity: locked ? 0.55 : 1 }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: completed ? colors.success : highlighted ? colors.accent : colors.secondary }]}>
          <Ionicons name={completed ? 'checkmark' : locked ? 'lock-closed' : 'flag'} size={18} color={colors.onAccent} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{mission.title}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>{mission.concept} • {mission.type}</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{mission.description}</Text>
        </View>
      </View>
      <GameButton title={completed ? 'Concluida' : locked ? 'Bloqueada' : 'Iniciar missao'} icon="play" variant={completed ? 'ghost' : 'secondary'} disabled={locked || completed} onPress={onStart} />
    </GameCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  icon: { width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '900' },
  meta: { fontSize: 12, fontWeight: '800', marginTop: 3, textTransform: 'uppercase' },
  description: { fontSize: 13, lineHeight: 18, marginTop: 5 }
});
