import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CampaignMap } from '../components/CampaignMap';
import { DialogueBox } from '../components/DialogueBox';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { MissionCard } from '../components/MissionCard';
import { bossById } from '../data/campaignBosses';
import { campaignChapters } from '../data/campaignChapters';
import { missionsByChapter } from '../data/campaignMissions';
import { dialogueById } from '../data/mentorDialogues';
import { useCampaign } from '../hooks/useCampaign';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';
import { campaignProgressService } from '../services/campaignProgressService';
import { reviewService } from '../services/reviewService';
import { localAnalyticsService } from '../services/localAnalyticsService';
import { CampaignChapter, CampaignMission, CampaignTrack } from '../types/campaign';
import { BossIntroScreen } from './BossIntroScreen';
import { CampaignIntroScreen } from './CampaignIntroScreen';
import { CampaignMissionScreen } from './CampaignMissionScreen';
import { MissionResultScreen } from './MissionResultScreen';

const trackOptions: { id: CampaignTrack; title: string; description: string; dialogueId: string }[] = [
  { id: 'frontend', title: 'Front-end', description: 'Interfaces, HTML, CSS, JavaScript e React.', dialogueId: 'track-frontend' },
  { id: 'backend', title: 'Back-end', description: 'APIs, Node.js, SQL e arquitetura.', dialogueId: 'track-backend' },
  { id: 'mobile-kotlin', title: 'Mobile Kotlin', description: 'Android, Kotlin, Java e null safety.', dialogueId: 'track-mobile-kotlin' },
  { id: 'mobile-react-native', title: 'Mobile React Native', description: 'Apps multiplataforma com React.', dialogueId: 'track-mobile-react-native' },
  { id: 'fullstack', title: 'Full Stack', description: 'Produto de ponta a ponta.', dialogueId: 'track-fullstack' }
];

type Mode =
  | { name: 'map' }
  | { name: 'chapter'; chapter: CampaignChapter }
  | { name: 'mission'; mission: CampaignMission }
  | { name: 'result'; mission: CampaignMission; victory: boolean }
  | { name: 'boss'; chapter: CampaignChapter };

export function CampaignScreen({ goBack }: { navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { awardCampaignReward } = usePlayer();
  const { progress, setProgress, loading } = useCampaign();
  const [mode, setMode] = useState<Mode>({ name: 'map' });
  const [trackDialogueId, setTrackDialogueId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const unlockedChapters = campaignChapters.filter((chapter) => progress.unlockedChapterIds.includes(chapter.id));
    const currentChapter = unlockedChapters[unlockedChapters.length - 1] ?? campaignChapters[0];
    return {
      currentChapter,
      missionsDone: progress.completedMissionIds.length,
      bossesDone: progress.defeatedBossIds.length
    };
  }, [progress]);

  if (loading) {
    return (
      <GradientScreen>
        <View style={styles.center}><Text style={[styles.subtitle, { color: colors.text }]}>Carregando campanha...</Text></View>
      </GradientScreen>
    );
  }

  if (!progress.introSeen) {
    return <CampaignIntroScreen progress={progress} onProgress={setProgress} onDone={() => setMode({ name: 'map' })} />;
  }

  const chooseTrack = async (track: CampaignTrack, dialogueId: string) => {
    const next = await campaignProgressService.chooseTrack(progress, track);
    setProgress(next);
    setTrackDialogueId(dialogueId);
  };

  const completeMission = async (mission: CampaignMission, victory: boolean) => {
    if (!victory) {
      const next = await campaignProgressService.saveWrongQuestion(progress, {
        missionId: mission.id,
        prompt: mission.title,
        hint: `Revise ${mission.concept} antes de tentar novamente.`,
        savedAt: new Date().toISOString()
      });
      await reviewService.saveCampaignError({
        missionId: mission.id,
        prompt: mission.title,
        areaId: mission.areaId ?? 'logic',
        concept: mission.concept,
        explanation: `Esta missão trabalha ${mission.concept}. Releia o objetivo, identifique a regra principal e tente resolver em passos menores.`,
        hint: `Revise ${mission.concept} antes de tentar novamente.`
      });
      setProgress(next);
      setMode({ name: 'result', mission, victory: false });
      return;
    }
    const rewardId = `mission-${mission.id}`;
    const latestProgress = await campaignProgressService.load();
    const alreadyCompleted = latestProgress.completedMissionIds.includes(mission.id);
    const alreadyRewarded = latestProgress.collectedRewardIds.includes(rewardId);
    const completedProgress = alreadyCompleted ? latestProgress : await campaignProgressService.completeMission(latestProgress, mission.id);
    const rewardedProgress = alreadyRewarded ? completedProgress : await campaignProgressService.collectReward(completedProgress, rewardId);
    setProgress(rewardedProgress);
    if (!alreadyRewarded) {
      awardCampaignReward(mission.rewardXp, mission.rewardCoins, ['campaign-first-step'], { type: 'campaign_mission', xp: mission.rewardXp, language: mission.areaId });
      localAnalyticsService.recordActivity({ campaign: true, areaId: mission.areaId }).catch(() => undefined);
    }
    setMode({ name: 'result', mission, victory: true });
  };

  const defeatBoss = async (chapter: CampaignChapter) => {
    const boss = bossById(chapter.bossId);
    if (!boss) return;
    const next = await campaignProgressService.defeatBoss(progress, boss.id);
    setProgress(next);
    const achievements = ['campaign-first-step'];
    if (boss.id === 'boss-syntax') achievements.push('campaign-syntax-bug');
    if (boss.id === 'boss-layout') achievements.push('campaign-frontend-hero');
    if (boss.id === 'boss-api') achievements.push('campaign-backend-guardian');
    if (boss.id === 'boss-null') achievements.push('campaign-kotlin-warrior');
    if (boss.id === 'boss-legacy') achievements.push('campaign-legacy-survivor');
    if (boss.id === 'boss-master') achievements.push('campaign-final-interview');
    awardCampaignReward(boss.rewardXp, boss.rewardCoins, achievements, { type: 'challenge', xp: boss.rewardXp });
    const mission = missionsByChapter(chapter.id).at(-1);
    if (mission) setMode({ name: 'result', mission, victory: true });
    else setMode({ name: 'map' });
  };

  if (mode.name === 'mission') {
    return (
      <CampaignMissionScreen
        mission={mode.mission}
        onBack={() => setMode({ name: 'chapter', chapter: campaignChapters.find((chapter) => chapter.id === mode.mission.chapterId) ?? campaignChapters[0] })}
        onFinish={completeMission}
      />
    );
  }

  if (mode.name === 'result') {
    return <MissionResultScreen mission={mode.mission} victory={mode.victory} onRetry={() => setMode({ name: 'mission', mission: mode.mission })} onContinue={() => setMode({ name: 'chapter', chapter: campaignChapters.find((chapter) => chapter.id === mode.mission.chapterId) ?? campaignChapters[0] })} />;
  }

  if (mode.name === 'boss') {
    const boss = bossById(mode.chapter.bossId);
    if (boss) return <BossIntroScreen boss={boss} onFight={() => defeatBoss(mode.chapter)} onBack={() => setMode({ name: 'chapter', chapter: mode.chapter })} />;
  }

  if (mode.name === 'chapter') {
    const missions = missionsByChapter(mode.chapter.id);
    const boss = bossById(mode.chapter.bossId);
    const allMissionsDone = missions.every((mission) => progress.completedMissionIds.includes(mission.id));
    const bossDefeated = boss ? progress.defeatedBossIds.includes(boss.id) : false;
    return (
      <GradientScreen>
        <ScrollView contentContainerStyle={styles.container}>
          <GameButton title="Voltar ao mapa" icon="chevron-back" variant="ghost" onPress={() => setMode({ name: 'map' })} />
          <GameCard style={{ borderColor: mode.chapter.visualTheme }}>
            <Text style={[styles.kicker, { color: mode.chapter.visualTheme }]}>Capítulo {mode.chapter.order}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{mode.chapter.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{mode.chapter.description}</Text>
          </GameCard>
          {missions.map((mission) => {
            const completed = progress.completedMissionIds.includes(mission.id);
            const locked = Boolean(mission.requiredMissionId && !progress.completedMissionIds.includes(mission.requiredMissionId));
            return <MissionCard key={mission.id} mission={mission} completed={completed} locked={locked} selectedTrack={progress.selectedTrack} onStart={() => setMode({ name: 'mission', mission })} />;
          })}
          <GameCard style={{ borderColor: colors.danger }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Boss final: {boss?.name}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{boss?.description}</Text>
            <GameButton title={bossDefeated ? 'Boss derrotado' : 'Enfrentar boss'} icon="flash" disabled={!allMissionsDone || bossDefeated} variant={bossDefeated ? 'ghost' : 'secondary'} onPress={() => setMode({ name: 'boss', chapter: mode.chapter })} />
          </GameCard>
        </ScrollView>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard>
          <Text style={[styles.kicker, { color: colors.accent }]}>Modo Campanha</Text>
          <Text style={[styles.title, { color: colors.text }]}>A Jornada do Desenvolvedor</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Capítulo atual: {stats.currentChapter.title} • {stats.missionsDone} missões • {stats.bossesDone} chefes</Text>
        </GameCard>

        {!progress.selectedTrack ? (
          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolha sua trilha inicial</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>A trilha personaliza falas e destaca missões, mas não bloqueia conteúdo.</Text>
            {trackOptions.map((track) => (
              <GameButton key={track.id} title={track.title} icon="compass" variant="secondary" onPress={() => chooseTrack(track.id, track.dialogueId)} style={styles.trackButton} />
            ))}
          </GameCard>
        ) : null}

        {trackDialogueId ? <DialogueBox sequence={dialogueById(trackDialogueId)} onDone={() => setTrackDialogueId(null)} /> : null}
        <CampaignMap progress={progress} onOpenChapter={(chapter) => setMode({ name: 'chapter', chapter })} />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  reward: { marginTop: 14, fontWeight: '900' },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  trackButton: { marginTop: 10 },
  inlineButton: { marginTop: 14 }
});
