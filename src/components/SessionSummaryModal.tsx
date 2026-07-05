import { Modal, StyleSheet, Text, View } from 'react-native';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';
import { useSettings } from '../hooks/useSettings';
import { StatBadge } from './ui/StatBadge';

export function SessionSummaryModal({
  visible,
  xp,
  coins,
  lessons,
  challenges,
  reviews,
  streak,
  nextRecommendation,
  onClose
}: {
  visible: boolean;
  xp: number;
  coins: number;
  lessons: number;
  challenges: number;
  reviews: number;
  streak: number;
  nextRecommendation: string;
  onClose: () => void;
}) {
  const { colors } = useSettings();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <GameCard style={styles.card}>
          <Text style={[styles.kicker, { color: colors.accent }]}>Resumo da sessão</Text>
          <Text style={[styles.title, { color: colors.text }]}>Boa run, dev.</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Seu progresso foi salvo. A próxima missão já está esperando.</Text>
          <View style={styles.grid}>
            <StatBadge label="XP" value={xp} />
            <StatBadge label="Moedas" value={coins} color={colors.accent} />
            <StatBadge label="Aulas" value={lessons} color={colors.primary} />
            <StatBadge label="Desafios" value={challenges} color={colors.secondary} />
            <StatBadge label="Revisões" value={reviews} color={colors.success} />
            <StatBadge label="Streak" value={`${streak}d`} color={colors.premium} />
          </View>
          <Text style={[styles.next, { color: colors.text }]}>Próxima recomendação: {nextRecommendation}</Text>
          <GameButton title="Continuar jornada" icon="arrow-forward" onPress={onClose} />
        </GameCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: 20 },
  card: { gap: 14 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  next: { fontWeight: '900', fontSize: 15 }
});
