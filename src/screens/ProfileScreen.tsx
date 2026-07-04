import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressBar } from '../components/ProgressBar';
import { achievementsCatalog } from '../data/missions';
import { campaignChapters } from '../data/campaignChapters';
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
import { defaultStreakState, streakService, StreakState } from '../services/streakService';
import { defaultLocalAnalytics, localAnalyticsService, LocalAnalytics } from '../services/localAnalyticsService';
import { progressToNextLevel } from '../utils/progression';

export function ProfileScreen({ navigate, goBack }: { navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { profile, updateName } = usePlayer();
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>(defaultCampaignProgress);
  const [reviewErrors, setReviewErrors] = useState<ReviewError[]>([]);
  const [academyProgress, setAcademyProgress] = useState<AcademyProgress>(defaultAcademyProgress);
  const [arenaProgress, setArenaProgress] = useState<CodeArenaProgress>(defaultCodeArenaProgress);
  const [streak, setStreak] = useState<StreakState>(defaultStreakState);
  const [analytics, setAnalytics] = useState<LocalAnalytics>(defaultLocalAnalytics);
  const completed = Object.keys(profile.completedStages).length;
  const currentCampaignChapter = useMemo(() => {
    const unlocked = campaignChapters.filter((chapter) => campaignProgress.unlockedChapterIds.includes(chapter.id));
    return unlocked[unlocked.length - 1] ?? campaignChapters[0];
  }, [campaignProgress.unlockedChapterIds]);

  useEffect(() => {
    campaignProgressService.load().then(setCampaignProgress).catch(() => undefined);
    reviewService.load().then(setReviewErrors).catch(() => undefined);
    academyProgressService.load().then(setAcademyProgress).catch(() => undefined);
    codeArenaService.load().then(setArenaProgress).catch(() => undefined);
    streakService.load().then(setStreak).catch(() => undefined);
    localAnalyticsService.load().then(setAnalytics).catch(() => undefined);
  }, []);
  const reviewStats = reviewService.stats(reviewErrors);
  const academyStats = academyProgressService.stats(academyProgress);
  const favoritePath = academyProgress.favoritePathId ? learningPathById(academyProgress.favoritePathId)?.title : undefined;

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard style={{ borderColor: colors.primary }}>
          <View style={styles.profileTop}>
            <View style={[styles.avatar, { backgroundColor: colors.primary, borderColor: colors.glow }]}>
              <Text style={[styles.avatarText, { color: colors.onAccent }]}>{profile.avatar}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={[styles.title, { color: colors.text }]}>Perfil do jogador</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Nivel {profile.level} • {profile.coins} moedas • streak {profile.streak}</Text>
            </View>
          </View>
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

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Progresso geral</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{completed} fases concluidas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{profile.unlockedAreaIds.length} linguagens/areas desbloqueadas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{profile.answerHistory.length} respostas no historico local</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Campanha</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Capitulo atual: {currentCampaignChapter.title}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Trilha: {campaignProgress.selectedTrack ?? 'nao escolhida'}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{campaignProgress.completedMissionIds.length} missoes concluidas</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{campaignProgress.defeatedBossIds.length} bosses derrotados</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>{campaignProgress.wrongQuestions.length} erros salvos para revisao</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Laboratorio de Revisao</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Total de erros salvos: {reviewStats.totalErrors}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Erros aprendidos: {reviewStats.learnedErrors}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Taxa de melhora: {reviewStats.improvementRate}%</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Linguagens dificeis: {reviewStats.hardestLanguages.map((item) => item.label).join(', ') || 'nenhuma'}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Conceitos dificeis: {reviewStats.hardestConcepts.map((item) => item.label).join(', ') || 'nenhum'}</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Academia Dev</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Aulas concluidas: {academyStats.completedLessons}/{academyStats.totalLessons}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Trilha favorita: {favoritePath ?? 'nenhuma ainda'}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Tempo estimado estudado: {academyStats.totalMinutesStudied} min</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Melhor area: {academyStats.bestPath}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Menor progresso: {academyStats.weakestPath}</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Retencao e analytics local</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Streak atual: {streak.currentStreak} dias</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Melhor sequencia: {streak.bestStreak} dias</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Tempo estudado: {analytics.totalStudyMinutes} min</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Aulas feitas: {analytics.lessonsDone}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Desafios feitos: {analytics.challengesDone}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Erros revisados: {analytics.errorsReviewed}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Linguagem mais estudada: {localAnalyticsService.favoriteLanguage(analytics)}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Melhor combo: {analytics.bestCombo}x</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Arena de Codigo</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Desafios praticos concluidos: {arenaProgress.completedChallengeIds.length}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Para revisar: {arenaProgress.reviewChallengeIds.length}</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Combo atual: {arenaProgress.combo}x</Text>
          <Text style={[styles.metric, { color: colors.muted }]}>Medalhas: {arenaProgress.medals.join(', ') || 'nenhuma ainda'}</Text>
        </GameCard>

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conquistas</Text>
          {achievementsCatalog.map((achievement) => {
            const unlocked = profile.achievements.includes(achievement.id);
            return (
              <View key={achievement.id} style={[styles.achievement, { borderColor: colors.border, opacity: unlocked ? 1 : 0.5 }]}>
                <Text style={[styles.achievementTitle, { color: colors.text }]}>{unlocked ? '★ ' : '☆ '}{achievement.title}</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>{achievement.description}</Text>
              </View>
            );
          })}
        </GameCard>

        <GameButton title="Ir para o mapa" icon="map" onPress={() => navigate({ name: 'map' })} />
        <GameButton title="Academia Dev" icon="school" variant="secondary" onPress={() => navigate({ name: 'academy' })} />
        <GameButton title="Arena de Codigo" icon="code-slash" variant="secondary" onPress={() => navigate({ name: 'codeArena' })} />
        <GameButton title="Abrir campanha" icon="compass" variant="secondary" onPress={() => navigate({ name: 'campaign' })} />
        <GameButton title="Laboratorio de Revisao" icon="flask" variant="secondary" onPress={() => navigate({ name: 'reviewLab' })} />
      </ScrollView>
    </GradientScreen>
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
  achievement: { borderTopWidth: 1, paddingTop: 10, marginTop: 10 },
  achievementTitle: { fontWeight: '900' }
});
