import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressBar } from '../components/ProgressBar';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { achievementDefinitions, dailyMissionDefinitions, weeklyMissionDefinitions } from '../services/playerMetaService';
import { PlayerMissionState } from '../types/game';

export function AchievementsScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useSettings();
  const { profile, claimMission } = usePlayer();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const unlockedCount = achievementDefinitions.filter((item) => profile.achievements.includes(item.id)).length;
  const totalCount = achievementDefinitions.length;
  const percent = totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const missionGroups = useMemo(
    () => [
      { title: 'Missões diárias', definitions: dailyMissionDefinitions, states: profile.dailyMissions ?? {} },
      { title: 'Missões semanais', definitions: weeklyMissionDefinitions, states: profile.weeklyMissions ?? {} }
    ],
    [profile.dailyMissions, profile.weeklyMissions]
  );

  const handleClaim = (missionId: string) => {
    if (claimingId) return;
    setClaimingId(missionId);
    const result = claimMission(missionId);
    setClaimingId(null);
    Alert.alert(result.claimed ? 'Recompensa resgatada' : 'Ainda não disponível', result.message);
  };

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />

        <GameCard style={{ borderColor: colors.primary }}>
          <Text style={[styles.kicker, { color: colors.primary }]}>Progresso do jogador</Text>
          <Text style={[styles.title, { color: colors.text }]}>Conquistas e missões</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {unlockedCount}/{totalCount} conquistas desbloqueadas • {percent}% completo
          </Text>
          <ProgressBar value={totalCount ? unlockedCount / totalCount : 0} color={colors.primary} />
        </GameCard>

        {missionGroups.map((group) => (
          <GameCard key={group.title}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{group.title}</Text>
            {group.definitions.map((mission) => (
              <MissionRow
                key={mission.id}
                state={group.states[mission.id]}
                title={mission.title}
                description={mission.description}
                reward={`+${mission.reward.xp} XP • +${mission.reward.coins} moedas`}
                claiming={claimingId === mission.id}
                onClaim={() => handleClaim(mission.id)}
              />
            ))}
          </GameCard>
        ))}

        <GameCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conquistas</Text>
          {achievementDefinitions.map((achievement) => {
            const progress = achievement.progress(profile);
            const unlocked = profile.achievements.includes(achievement.id);
            const unlockDate = profile.achievementUnlocks?.[achievement.id]?.unlockedAt;
            return (
              <View key={achievement.id} style={[styles.achievementRow, { borderColor: colors.border, opacity: unlocked ? 1 : 0.62 }]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementCopy}>
                  <View style={styles.rowHeader}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{achievement.title}</Text>
                    <Text style={[styles.status, { color: unlocked ? colors.success : colors.muted }]}>{unlocked ? 'Liberada' : 'Bloqueada'}</Text>
                  </View>
                  <Text style={[styles.subtitle, { color: colors.muted }]}>{achievement.description}</Text>
                  <ProgressBar value={Math.min(1, progress.current / progress.goal)} color={unlocked ? colors.success : colors.secondary} />
                  <Text style={[styles.meta, { color: colors.muted }]}>
                    {Math.min(progress.current, progress.goal)}/{progress.goal}
                    {unlockDate ? ` • ${new Date(unlockDate).toLocaleDateString()}` : ''}
                    {achievement.reward ? ` • recompensa ${achievement.reward.xp ?? 0} XP / ${achievement.reward.coins ?? 0} moedas` : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </GameCard>
      </ScrollView>
    </GradientScreen>
  );
}

function MissionRow({
  state,
  title,
  description,
  reward,
  claiming,
  onClaim
}: {
  state?: PlayerMissionState;
  title: string;
  description: string;
  reward: string;
  claiming: boolean;
  onClaim: () => void;
}) {
  const { colors } = useSettings();
  const progress = state ? Math.min(1, state.progress / state.goal) : 0;
  const canClaim = Boolean(state?.completed && !state.claimed);
  return (
    <View style={[styles.missionRow, { borderColor: colors.border }]}>
      <View style={styles.rowHeader}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.status, { color: state?.claimed ? colors.success : canClaim ? colors.accent : colors.muted }]}>
          {state?.claimed ? 'Resgatada' : canClaim ? 'Pronta' : `${state?.progress ?? 0}/${state?.goal ?? 1}`}
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{description}</Text>
      <ProgressBar value={progress} color={state?.claimed ? colors.success : colors.accent} />
      <Text style={[styles.meta, { color: colors.muted }]}>{reward}</Text>
      <GameButton
        title={state?.claimed ? 'Já resgatada' : 'Resgatar recompensa'}
        icon="gift"
        variant="secondary"
        onPress={onClaim}
        disabled={!canClaim || claiming}
        loading={claiming}
        style={styles.claimButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  meta: { fontSize: 12, lineHeight: 17, marginTop: 8, fontWeight: '800' },
  missionRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 12 },
  achievementRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 12, flexDirection: 'row', gap: 12 },
  achievementIcon: { fontSize: 24, lineHeight: 30 },
  achievementCopy: { flex: 1 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  itemTitle: { flex: 1, fontSize: 15, lineHeight: 19, fontWeight: '900' },
  status: { fontSize: 11, lineHeight: 15, fontWeight: '900', textTransform: 'uppercase' },
  claimButton: { minHeight: 44, marginTop: 10 }
});
