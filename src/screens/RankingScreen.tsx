import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useAuth } from '../hooks/useAuth';
import { localRanking, usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { leaderboardService } from '../services/leaderboardService';
import { leaderboardConsentService, LeaderboardConsentStatus } from '../services/leaderboardConsentService';
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
  const [consent, setConsent] = useState<LeaderboardConsentStatus>('unknown');
  const [consentLoaded, setConsentLoaded] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const onlineEnabled = Boolean(configured && user && consent === 'accepted');
  const presentation = buildRankingPresentation({
    onlineEnabled,
    loading,
    remoteEntries: entries,
    localEntries: ranking,
    remoteFailed
  });

  useEffect(() => {
    if (!user) {
      setConsent('unknown');
      setConsentLoaded(true);
      return;
    }
    setConsentLoaded(false);
    leaderboardConsentService.get(user.id).then((status) => {
      setConsent(status);
      setShowConsent(status === 'unknown');
    }).finally(() => setConsentLoaded(true));
  }, [user]);

  const chooseConsent = async (status: 'accepted' | 'declined') => {
    if (!user) return;
    await leaderboardConsentService.set(user.id, status);
    setConsent(status);
    setShowConsent(false);
    if (status === 'accepted') {
      const result = await leaderboardService.publish(user.id, profile);
      if (result.error) setRemoteFailed(true);
    }
  };

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

        {user && consentLoaded && consent !== 'accepted' ? (
          <GameCard>
            <Text style={[styles.name, { color: colors.text }]}>Ranking Global opcional</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>Seu progresso continua local e privado até você escolher participar.</Text>
            <View style={styles.cardAction}>
              <GameButton title="Escolher participação" icon="shield-checkmark" onPress={() => setShowConsent(true)} />
            </View>
          </GameCard>
        ) : null}

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
      <Modal visible={showConsent} transparent animationType="fade" onRequestClose={() => chooseConsent('declined')}>
        <View style={styles.modalBackdrop}>
          <GameCard style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Participar do Ranking Global?</Text>
            <Text style={[styles.modalText, { color: colors.muted }]}>Para participar do Ranking Global do CodeQuest, seu nome de perfil e sua pontuação serão enviados e armazenados em nossos servidores e poderão aparecer para outros jogadores.{`\n\n`}A participação é opcional. Você poderá alterar essa escolha posteriormente nas Configurações.</Text>
            <View style={styles.modalActions}>
              <GameButton title="Agora não" icon="close" variant="secondary" onPress={() => chooseConsent('declined')} style={styles.modalButton} />
              <GameButton title="Participar" icon="podium" onPress={() => chooseConsent('accepted')} style={styles.modalButton} />
            </View>
          </GameCard>
        </View>
      </Modal>
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
  meta: { fontSize: 13, marginTop: 2 },
  cardAction: { marginTop: 12 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.72)' },
  modalCard: { width: '100%', maxWidth: 620, alignSelf: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  modalText: { fontSize: 15, lineHeight: 22 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalButton: { flex: 1 }
});
