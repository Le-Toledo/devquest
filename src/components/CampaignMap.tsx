import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { campaignBosses } from '../data/campaignBosses';
import { campaignChapters } from '../data/campaignChapters';
import { missionsByChapter } from '../data/campaignMissions';
import { useSettings } from '../hooks/useSettings';
import { CampaignChapter, CampaignProgress } from '../types/campaign';
import { GameButton } from './GameButton';
import { GameCard } from './GameCard';
import { ProgressBar } from './ProgressBar';

export function CampaignMap({ progress, onOpenChapter }: { progress: CampaignProgress; onOpenChapter: (chapter: CampaignChapter) => void }) {
  const { colors } = useSettings();

  return (
    <View style={styles.wrap}>
      {campaignChapters.map((chapter, index) => {
        const missions = missionsByChapter(chapter.id);
        const completed = missions.filter((mission) => progress.completedMissionIds.includes(mission.id)).length;
        const boss = campaignBosses.find((item) => item.id === chapter.bossId);
        const bossDefeated = boss ? progress.defeatedBossIds.includes(boss.id) : false;
        const unlocked = progress.unlockedChapterIds.includes(chapter.id);
        const done = completed === missions.length && bossDefeated;

        return (
          <View key={chapter.id}>
            {index > 0 ? (
              <View style={styles.pathWrap}>
                <View style={[styles.path, { backgroundColor: colors.border }]} />
                <View style={[styles.pathDot, { backgroundColor: unlocked ? chapter.visualTheme : colors.border }]} />
              </View>
            ) : null}
            <GameCard style={{ borderColor: chapter.visualTheme, opacity: unlocked ? 1 : 0.55 }}>
              <View style={styles.header}>
                <View style={[styles.chapterIcon, { backgroundColor: chapter.visualTheme, borderColor: colors.glow }]}>
                  <Ionicons name={done ? 'medal' : unlocked ? chapter.icon : 'lock-closed'} size={28} color={colors.onAccent} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.kicker, { color: chapter.visualTheme }]}>Capitulo {chapter.order}</Text>
                  <Text style={[styles.title, { color: colors.text }]}>{chapter.title}</Text>
                  <Text style={[styles.description, { color: colors.muted }]}>{chapter.description}</Text>
                </View>
              </View>
              <View style={styles.progressRow}>
                <Text style={[styles.meta, { color: colors.muted }]}>{completed}/{missions.length} missoes</Text>
                <View style={[styles.bossPill, { backgroundColor: colors.surfaceGlow, borderColor: done ? colors.success : colors.accent }]}>
                  <Ionicons name={done ? 'ribbon' : 'skull'} size={13} color={done ? colors.success : colors.accent} />
                  <Text style={[styles.meta, { color: done ? colors.success : colors.accent }]}>{done ? 'Medalha conquistada' : `Boss: ${boss?.name ?? 'Final'}`}</Text>
                </View>
              </View>
              <ProgressBar value={(completed + (bossDefeated ? 1 : 0)) / (missions.length + 1)} color={chapter.visualTheme} />
              <GameButton title={unlocked ? 'Abrir capitulo' : 'Bloqueado'} icon="map" variant={unlocked ? 'secondary' : 'ghost'} disabled={!unlocked} onPress={() => onOpenChapter(chapter)} style={styles.button} />
            </GameCard>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  pathWrap: { alignItems: 'center', justifyContent: 'center', height: 30 },
  path: { width: 4, height: 30, alignSelf: 'center', opacity: 0.8 },
  pathDot: { position: 'absolute', width: 12, height: 12, borderRadius: 999 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  chapterIcon: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 19, fontWeight: '900' },
  description: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  progressRow: { marginTop: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  bossPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  meta: { fontSize: 12, fontWeight: '800' },
  button: { marginTop: 12 }
});
