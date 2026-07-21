import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useAuth } from '../hooks/useAuth';
import { localRanking, usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { leaderboardService } from '../services/leaderboardService';
import { buildRankingPresentation } from '../services/rankingPresentationService';
import { LeaderboardEntry } from '../types/backend';

export function RankingScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useSettings();
  const { user, configured } = useAuth();
  const { profile } = usePlayer();
  const ranking = localRanking(profile);
  const [period, setPeriod] = useState<'global' | 'weekly'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [remoteFailed, setRemoteFailed] = useState(false);
  const onlineEnabled = Boolean(configured && user);
  const presentation = buildRankingPresentation({
    onlineEnabled,
    loading,
    remoteEntries: entries,
    localEntries: ranking,
    remoteFailed
  });

  useEffect(() => {
    if (!onlineEnabled) {
      setEntries([]);
      setRemoteFailed(false);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setRemoteFailed(false);
    setEntries([]);

    leaderboardService
      .list(period)
      .then((result) => {
        if (!active) return;
        setEntries(result.entries);
        setRemoteFailed(Boolean(result.error || result.disabled));
      })
      .catch((err: unknown) => {
        if (!active) return;
        setRemoteFailed(true);
        if (__DEV__) {
          const reason = err instanceof Error ? err.name : 'UnknownError';
          console.warn('Ranking remoto falhou; fallback local preservado.', { reason });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [onlineEnabled, period]);

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <Text style={[styles.title, { color: colors.text }]}>{presentation.title}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{presentation.subtitle}</Text>

        {onlineEnabled ? (
          <View style={styles.filters}>
            <GameButton title="Global" icon="earth" variant={period === 'global' ? 'primary' : 'secondary'} onPress={() => setPeriod('global')} style={styles.filterButton} />
            <GameButton title="Semanal" icon="calendar" variant={period === 'weekly' ? 'primary' : 'secondary'} onPress={() => setPeriod('weekly')} style={styles.filterButton} />
          </View>
        ) : null}

        {presentation.showLoading ? (
          <GameCard>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.centerText, { color: colors.muted }]}>Atualizando ranking...</Text>
          </GameCard>
        ) : null}

        {presentation.source === 'empty' && !presentation.showLoading ? (
          <GameCard>
            <Text style={[styles.name, { color: colors.text }]}>{presentation.emptyTitle}</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>{presentation.emptyMessage}</Text>
          </GameCard>
        ) : null}

        {presentation.entries.map((entry, index) => (
          <RankingCard key={entry.id} place={index + 1} avatar={entry.avatar} name={entry.name} xp={entry.xp} level={entry.level} />
        ))}
      </ScrollView>
    </GradientScreen>
  );
}

function RankingCard({ place, avatar, name, xp, level }: { place: number; avatar: string; name: string; xp: number; level?: number }) {
  const { colors } = useSettings();
  const podiumColor = place === 1 ? colors.premium : place === 2 ? colors.secondary : place === 3 ? colors.accent : colors.border;
  const topThree = place <= 3;
  return (
    <GameCard style={{ borderColor: podiumColor }}>
      <View style={styles.row}>
        <View style={[styles.placeBadge, { backgroundColor: topThree ? podiumColor : colors.surfaceGlow, borderColor: podiumColor }]}>
          <Ionicons name={place === 1 ? 'trophy' : topThree ? 'ribbon' : 'stats-chart'} size={16} color={topThree ? colors.onAccent : colors.muted} />
          <Text style={[styles.place, { color: topThree ? colors.onAccent : colors.muted }]}>#{place}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: topThree ? podiumColor : colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.onAccent }]}>{avatar}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>{xp} XP acumulado{level ? ` • Nível ${level}` : ''}</Text>
        </View>
      </View>
    </GameCard>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  filters: { flexDirection: 'row', gap: 10 },
  filterButton: { flex: 1 },
  centerText: { textAlign: 'center', marginTop: 10, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  placeBadge: { width: 58, minHeight: 44, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 2 },
  place: { fontSize: 13, fontWeight: '900' },
  avatar: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '900' },
  info: { flex: 1 },
  name: { fontWeight: '900', fontSize: 16 },
  meta: { fontSize: 13, marginTop: 2 }
});
