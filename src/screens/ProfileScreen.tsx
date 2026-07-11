import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressBar } from '../components/ProgressBar';
import { campaignChapters } from '../data/campaignChapters';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';
import { campaignProgressService, defaultCampaignProgress } from '../services/campaignProgressService';
import { reviewService } from '../services/reviewService';
import { academyProgressService, defaultAcademyProgress } from '../services/academyProgressService';
import { learningPathById } from '../data/learningPaths';
import { CampaignProgress } from '../types/campaign';
import { ReviewError } from '../types/review';
import { AcademyProgress } from '../types/academy';
import { codeArenaService, defaultCodeArenaProgress } from '../services/codeArenaService';
import { CodeArenaProgress } from '../types/codeArena';
import { codeLabService, defaultCodeLabProgress } from '../services/codeLabService';
import { CodeLabProgress } from '../types/codeLab';
import { defaultStreakState, streakService, StreakState } from '../services/streakService';
import { defaultLocalAnalytics, localAnalyticsService, LocalAnalytics } from '../services/localAnalyticsService';
import { syncService } from '../services/syncService';
import { achievementDefinitions } from '../services/playerMetaService';
import { CloudProgress, SyncResult } from '../types/backend';
import { progressToNextLevel } from '../utils/progression';

export function ProfileScreen({ navigate, goBack, initialSection }: { navigate: Navigate; goBack: () => void; initialSection?: 'account' }) {
  const { colors } = useSettings();
  const { profile, resetProgress, updateName } = usePlayer();
  const { configured, signOut, user } = useAuth();
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>(defaultCampaignProgress);
  const [reviewErrors, setReviewErrors] = useState<ReviewError[]>([]);
  const [academyProgress, setAcademyProgress] = useState<AcademyProgress>(defaultAcademyProgress);
  const [arenaProgress, setArenaProgress] = useState<CodeArenaProgress>(defaultCodeArenaProgress);
  const [codeLabProgress, setCodeLabProgress] = useState<CodeLabProgress>(defaultCodeLabProgress);
  const [streak, setStreak] = useState<StreakState>(defaultStreakState);
  const [analytics, setAnalytics] = useState<LocalAnalytics>(defaultLocalAnalytics);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [localProgress, setLocalProgress] = useState<CloudProgress | null>(null);
  const [resetting, setResetting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const autoSyncedUserId = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const accountSectionY = useRef(0);
  const completed = Object.keys(profile.completedStages).length;
  const currentCampaignChapter = useMemo(() => {
    const unlocked = campaignChapters.filter((chapter) => campaignProgress.unlockedChapterIds.includes(chapter.id));
    return unlocked[unlocked.length - 1] ?? campaignChapters[0];
  }, [campaignProgress.unlockedChapterIds]);

  const refreshLocalSummary = useCallback(() => {
    if (!user) {
      setLocalProgress(null);
      return;
    }
    syncService.buildLocalProgress(user).then(setLocalProgress).catch(() => undefined);
  }, [user]);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      const next = await syncService.syncNow(user);
      setSyncResult(next);
      refreshLocalSummary();
    } finally {
      setSyncing(false);
    }
  }, [refreshLocalSummary, user]);

  const resetProgressState = () => {
    setCampaignProgress(defaultCampaignProgress);
    setReviewErrors([]);
    setAcademyProgress(defaultAcademyProgress);
    setArenaProgress(defaultCodeArenaProgress);
    setCodeLabProgress(defaultCodeLabProgress);
    setStreak(defaultStreakState);
    setAnalytics(defaultLocalAnalytics);
    setSyncResult(null);
    refreshLocalSummary();
  };

  const confirmResetProgress = () => {
    Alert.alert(
      'Resetar progresso',
      'Tem certeza que deseja resetar todo o seu progresso? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await resetProgress();
              resetProgressState();
              const cloudReset = await syncService.resetCloudProgress(user);
              setSyncResult(cloudReset);
              Alert.alert(
                'Progresso resetado',
                cloudReset.status === 'synced'
                  ? 'Seu progresso local e da nuvem voltou ao início. Sua conta continua conectada.'
                  : 'Seu progresso local voltou ao início. Não foi possível atualizar a nuvem agora; tente sincronizar novamente.'
              );
            } finally {
              setResetting(false);
            }
          }
        }
      ]
    );
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair da conta',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            const response = await signOut();
            if (response.error) {
              setSigningOut(false);
              Alert.alert('Não foi possível sair', response.error);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    campaignProgressService.load().then(setCampaignProgress).catch(() => undefined);
    reviewService.load().then(setReviewErrors).catch(() => undefined);
    academyProgressService.load().then(setAcademyProgress).catch(() => undefined);
    codeArenaService.load().then(setArenaProgress).catch(() => undefined);
    codeLabService.load().then(setCodeLabProgress).catch(() => undefined);
    streakService.load().then(setStreak).catch(() => undefined);
    localAnalyticsService.load().then(setAnalytics).catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshLocalSummary();
  }, [refreshLocalSummary]);

  useEffect(() => {
    if (!user || !configured || autoSyncedUserId.current === user.id) return;
    autoSyncedUserId.current = user.id;
    syncNow().catch(() => undefined);
  }, [configured, syncNow, user]);

  useEffect(() => {
    if (initialSection !== 'account') return;
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, accountSectionY.current - 12), animated: true });
    }, 120);
    return () => clearTimeout(timeout);
  }, [initialSection]);

  const reviewStats = reviewService.stats(reviewErrors);
  const academyStats = academyProgressService.stats(academyProgress);
  const codeLabStats = codeLabService.stats(codeLabProgress);
  const favoritePath = academyProgress.favoritePathId ? learningPathById(academyProgress.favoritePathId)?.title : undefined;
  const syncStatus = syncResult?.message ?? (user ? 'Pronto para sincronizar.' : 'Sessão necessária para backup e ranking online.');

  return (
    <GradientScreen>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard style={{ borderColor: colors.primary }}>
          <View style={styles.profileTop}>
            <View style={[styles.avatar, { backgroundColor: colors.primary, borderColor: colors.glow }]}>
              <Text style={[styles.avatarText, { color: colors.onAccent }]}>{profile.avatar}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={[styles.title, { color: colors.text }]}>Perfil do jogador</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Nível {profile.level} • {profile.coins} moedas • sequência {profile.streak}</Text>
            </View>
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Jogador</Text>
          <View style={styles.profileChips}>
            <View style={[styles.chip, { backgroundColor: colors.surfaceGlow, borderColor: colors.border }]}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={[styles.chipText, { color: colors.text }]}>{profile.xp} XP</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.surfaceGlow, borderColor: colors.border }]}>
              <Ionicons name="medal" size={14} color={colors.primary} />
              <Text style={[styles.chipText, { color: colors.text }]}>{profile.achievements.length} conquistas</Text>
            </View>
          </View>
          <TextInput
            defaultValue={profile.name}
            onSubmitEditing={(event) => updateName(event.nativeEvent.text)}
            placeholder="Nome do jogador"
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}
          />
          <ProgressBar value={progressToNextLevel(profile)} />
        </GameCard>

        <View onLayout={(event) => { accountSectionY.current = event.nativeEvent.layout.y; }}>
          <GameCard style={{ borderColor: user ? colors.success : colors.warning }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Conta</Text>
            <View style={styles.statusHeader}>
              <View style={[styles.statusDot, { backgroundColor: user ? colors.success : colors.warning }]} />
              <View style={styles.statusCopy}>
                <Text style={[styles.metricStrong, { color: colors.text }]}>{user ? 'Conta conectada' : 'Conta desconectada'}</Text>
                <Text style={[styles.metric, { color: colors.muted }]}>{user?.email ?? 'Entre novamente para sincronizar progresso.'}</Text>
              </View>
            </View>
            {!configured ? <Text style={[styles.metric, { color: colors.warning }]}>Supabase ainda não está configurado neste build.</Text> : null}
            <View style={styles.cardAction}>
              <GameButton title="Sair da conta" icon="log-out" variant="secondary" onPress={confirmSignOut} loading={signingOut} disabled={!user || signingOut || resetting} />
            </View>
          </GameCard>
        </View>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sincronização</Text>
          <Text style={[styles.metric, { color: syncResult?.status === 'error' ? colors.danger : colors.primary }]}>{syncStatus}</Text>
          {syncResult?.lastSyncAt ? <Text style={[styles.metric, { color: colors.muted }]}>Última sincronização: {new Date(syncResult.lastSyncAt).toLocaleString()}</Text> : null}
          <View style={styles.summaryGrid}>
            <ProfileMetric label="XP" value={localProgress?.player?.xp ?? profile.xp} />
            <ProfileMetric label="Nível" value={localProgress?.player?.level ?? profile.level} />
            <ProfileMetric label="Missões" value={localProgress?.campaign?.completedMissionIds.length ?? campaignProgress.completedMissionIds.length} />
            <ProfileMetric label="Aulas" value={localProgress?.academy?.completedLessonIds.length ?? academyProgress.completedLessonIds.length} />
            <ProfileMetric label="Arena" value={localProgress?.arena?.completedChallengeIds.length ?? arenaProgress.completedChallengeIds.length} />
            <ProfileMetric label="Lab Código" value={localProgress?.codeLab?.completedChallengeIds.length ?? codeLabProgress.completedChallengeIds.length} />
            <ProfileMetric label="Revisões" value={localProgress?.reviewErrors?.length ?? reviewErrors.length} />
          </View>
          <View style={styles.cardAction}>
            <GameButton title="Sincronizar agora" icon="sync" onPress={syncNow} loading={syncing} disabled={!configured || !user || syncing} />
          </View>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estatísticas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{completed} fases concluídas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{profile.unlockedAreaIds.length} linguagens/áreas desbloqueadas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{profile.answerHistory.length} respostas no histórico local</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Progresso</Text>
          <Text style={[styles.metricStrong, { color: colors.text }]}>Campanha</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Capítulo atual: {currentCampaignChapter.title}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Trilha: {campaignProgress.selectedTrack ?? 'não escolhida'}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{campaignProgress.completedMissionIds.length} missões concluídas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{campaignProgress.defeatedBossIds.length} chefes derrotados</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{campaignProgress.wrongQuestions.length} erros salvos para revisão</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Laboratório de Revisão</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Total de erros salvos: {reviewStats.totalErrors}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Erros aprendidos: {reviewStats.learnedErrors}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Taxa de melhora: {reviewStats.improvementRate}%</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Linguagens dificeis: {reviewStats.hardestLanguages.map((item) => item.label).join(', ') || 'nenhuma'}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Conceitos dificeis: {reviewStats.hardestConcepts.map((item) => item.label).join(', ') || 'nenhum'}</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Academia Dev</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Aulas concluídas: {academyStats.completedLessons}/{academyStats.totalLessons}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Trilha favorita: {favoritePath ?? 'nenhuma ainda'}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Tempo estimado estudado: {academyStats.totalMinutesStudied} min</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Melhor área: {academyStats.bestPath}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Menor progresso: {academyStats.weakestPath}</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Retenção e analytics local</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Streak atual: {streak.currentStreak} dias</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Melhor sequência: {streak.bestStreak} dias</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Tempo estudado: {analytics.totalStudyMinutes} min</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Aulas feitas: {analytics.lessonsDone}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Desafios feitos: {analytics.challengesDone}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Erros revisados: {analytics.errorsReviewed}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Linguagem mais estudada: {localAnalyticsService.favoriteLanguage(analytics)}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Melhor combo: {analytics.bestCombo}x</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Laboratório de Código</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Desafios concluídos: {codeLabStats.completed}/{codeLabStats.total}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Linguagem mais praticada: {codeLabProgress.favoriteLanguage ?? 'nenhuma ainda'}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Taxa de conclusão: {Math.round(codeLabStats.ratio * 100)}%</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Melhor sequência: {codeLabProgress.bestStreak}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Minutos praticados: {codeLabProgress.totalPracticeMinutes}</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Arena de Código</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Desafios práticos concluídos: {arenaProgress.completedChallengeIds.length}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Para revisar: {arenaProgress.reviewChallengeIds.length}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Combo atual: {arenaProgress.combo}x</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Medalhas: {arenaProgress.medals.join(', ') || 'nenhuma ainda'}</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conquistas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>
            {profile.achievements.length}/{achievementDefinitions.length} conquistas liberadas. Veja detalhes e missões no Hub em Conquistas.
          </Text>
          {achievementDefinitions.slice(0, 8).map((achievement) => {
            const unlocked = profile.achievements.includes(achievement.id);
            return (
              <View key={achievement.id} style={[styles.achievement, { borderColor: colors.border, opacity: unlocked ? 1 : 0.5 }]}>
                <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.icon} {unlocked ? 'Liberada: ' : 'Bloqueada: '}{achievement.title}</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>{achievement.description}</Text>
              </View>
            );
          })}
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Segurança</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Sair da conta fica na seção Conta. A ação encerra apenas a sessão desta conta, e seu progresso local permanece salvo.</Text>
        </GameCard>

        <GameCard style={{ borderColor: colors.danger }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ações perigosas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Resetar progresso apaga XP, moedas, campanha, aulas, arena, streak, conquistas e revisões locais. Sua conta continua conectada.</Text>
          <View style={styles.cardAction}>
            <GameButton title="Resetar progresso" icon="refresh" variant="danger" onPress={confirmResetProgress} loading={resetting} disabled={resetting || signingOut} />
          </View>
        </GameCard>

        <GameButton title="Ir para o mapa" icon="map" onPress={() => navigate({ name: 'map' })} />
        <GameButton title="Academia Dev" icon="school" variant="secondary" onPress={() => navigate({ name: 'academy' })} />
        <GameButton title="Arena de Código" icon="code-slash" variant="secondary" onPress={() => navigate({ name: 'codeArena' })} />
        <GameButton title="Laboratório de Código" icon="terminal" variant="secondary" onPress={() => navigate({ name: 'codeLab' })} />
        <GameButton title="Abrir campanha" icon="compass" variant="secondary" onPress={() => navigate({ name: 'campaign' })} />
        <GameButton title="Laboratório de Revisão" icon="flask" variant="secondary" onPress={() => navigate({ name: 'reviewLab' })} />
      </ScrollView>
    </GradientScreen>
  );
}

function ProfileMetric({ label, value }: { label: string; value: number }) {
  const { colors } = useSettings();
  return (
    <View style={[styles.metricBox, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  profileTop: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  avatar: { width: 68, height: 68, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900' },
  profileText: { flex: 1 },
  profileChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: '900' },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 13, lineHeight: 19 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, fontWeight: '800' },
  sectionTitle: { fontSize: 19, fontWeight: '900', marginBottom: 8 },
  metric: { fontSize: 14, marginTop: 6 },
  metricStrong: { fontSize: 14, marginTop: 6, fontWeight: '900' },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusCopy: { flex: 1 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  metricBox: { borderRadius: 8, borderWidth: 1, padding: 10, flexBasis: '47%', flexGrow: 1 },
  metricValue: { fontSize: 18, fontWeight: '900' },
  metricLabel: { marginTop: 2, fontSize: 11, fontWeight: '800' },
  cardAction: { marginTop: 14 },
  achievement: { borderTopWidth: 1, paddingTop: 10, marginTop: 10 },
  achievementTitle: { fontWeight: '900' }
});
