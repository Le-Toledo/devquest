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
import { LeaderboardEntry } from '../types/backend';

export function RankingScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useSettings();
  const { user, configured } = useAuth();
  const { profile } = usePlayer();
  const ranking = localRanking(profile);
  const [period, setPeriod] = useState<'global' | 'weekly'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const onlineEnabled = Boolean(configured && user);

  useEffect(() => {
    if (!onlineEnabled) return;
    setLoading(true);
    setError('');
    leaderboardService
      .list(period)
      .then((result) => {
        setEntries(result.entries);
        setError(result.error ?? '');
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Nao foi possivel carregar o ranking online.'))
      .finally(() => setLoading(false));
  }, [onlineEnabled, period]);

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <Text style={[styles.title, { color: colors.text }]}>{onlineEnabled ? 'Ranking online' : 'Ranking local'}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {onlineEnabled ? 'Dados globais vindos do Supabase. Sincronize sua conta para atualizar sua posicao.' : 'Entre na conta para ativar ranking global. Este ranking continua disponivel offline.'}
        </Text>

        {onlineEnabled ? (
          <View style={styles.filters}>
            <GameButton title="Global" icon="earth" variant={period === 'global' ? 'primary' : 'secondary'} onPress={() => setPeriod('global')} style={styles.filterButton} />
            <GameButton title="Semanal" icon="calendar" variant={period === 'weekly' ? 'primary' : 'secondary'} onPress={() => setPeriod('weekly')} style={styles.filterButton} />
          </View>
        ) : null}

        {loading ? (
          <GameCard>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.centerText, { color: colors.muted }]}>Carregando ranking online...</Text>
          </GameCard>
        ) : null}

        {error ? (
          <GameCard style={{ borderColor: colors.warning }}>
            <Text style={[styles.name, { color: colors.text }]}>Ranking online indisponivel</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>{error}</Text>
          </GameCard>
        ) : null}

        {onlineEnabled && !loading && !error && entries.length === 0 ? (
          <GameCard>
            <Text style={[styles.name, { color: colors.text }]}>Nenhum dev no ranking ainda</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>Sincronize sua conta para inaugurar a tabela.</Text>
          </GameCard>
        ) : null}

        {onlineEnabled && !error
          ? entries.map((entry, index) => (
              <RankingCard key={entry.id} place={index + 1} avatar={entry.avatar} name={entry.displayName} xp={entry.xp} level={entry.level} />
            ))
          : ranking.map((player, index) => <RankingCard key={player.name} place={index + 1} avatar={player.avatar} name={player.name} xp={player.xp} />)}
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
          <Text style={[styles.meta, { color: colors.muted }]}>{xp} XP acumulado{level ? ` • Nivel ${level}` : ''}</Text>
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
