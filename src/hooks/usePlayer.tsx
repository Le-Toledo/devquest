import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { shopItems } from '../data/shop';
import { stages } from '../data/worlds';
import { createDefaultPlayer, storage } from '../services/storage';
import { streakService } from '../services/streakService';
import { AchievementId, AreaId, PlayerProfile, Question, ShopItem } from '../types/game';
import { AchievementDefinition, PlayerActivity, applyPlayerActivity, claimMissionReward, normalizePlayerMeta } from '../services/playerMetaService';
import { calculateLevel, starsForScore } from '../utils/progression';

type CompleteStagePayload = {
  stageId: string;
  score: number;
  maxScore: number;
  answers: { question: Question; correct: boolean }[];
};

type PlayerContextValue = {
  profile: PlayerProfile;
  loading: boolean;
  updateName: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  claimDailyReward: () => boolean;
  completeStage: (payload: CompleteStagePayload) => void;
  buyItem: (item: ShopItem) => boolean;
  awardCampaignReward: (xp: number, coins: number, achievements?: AchievementId[], activity?: PlayerActivity) => void;
  recordActivity: (activity: PlayerActivity, achievements?: AchievementId[]) => void;
  claimMission: (missionId: string) => { claimed: boolean; message: string };
  recentAchievements: AchievementDefinition[];
  clearRecentAchievements: () => void;
  resetProgress: () => Promise<void>;
  reloadProfile: () => Promise<PlayerProfile>;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(createDefaultPlayer());
  const [loading, setLoading] = useState(true);
  const [recentAchievements, setRecentAchievements] = useState<AchievementDefinition[]>([]);

  useEffect(() => {
    storage
      .loadPlayer()
      .then((loaded) => setProfile(normalizePlayerMeta(loaded)))
      .finally(() => setLoading(false));
  }, []);

  const persist = (producer: (current: PlayerProfile) => PlayerProfile) => {
    setProfile((current) => {
      const next = normalizePlayerMeta(producer(normalizePlayerMeta(current)));
      storage.savePlayer(next).catch(() => undefined);
      return next;
    });
  };

  const persistActivity = (producer: (current: PlayerProfile) => PlayerProfile, activity: PlayerActivity, achievements: AchievementId[] = []) => {
    setProfile((current) => {
      const base = normalizePlayerMeta(producer(normalizePlayerMeta(current)));
      const result = applyPlayerActivity(base, activity, achievements);
      if (result.unlocked.length) setRecentAchievements(result.unlocked.slice(0, 3));
      storage.savePlayer(result.profile).catch(() => undefined);
      return result.profile;
    });
  };

  const updateName = (name: string) => {
    persist((current) => ({ ...current, name: name.trim() || current.name }));
  };

  const updateAvatar = (avatar: string) => {
    persist((current) => ({ ...current, avatar }));
  };

  const claimDailyReward = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (profile.lastDailyReward === today) return false;
    persistActivity(
      (current) => ({
        ...current,
        coins: current.coins + 90,
        xp: current.xp + 60,
        level: calculateLevel(current.xp + 60),
        streak: current.lastDailyReward ? current.streak + 1 : 1,
        lastDailyReward: today
      }),
      { type: 'streak', xp: 60 },
      ['daily-reward']
    );
    return true;
  };

  const completeStage = ({ stageId, score, maxScore, answers }: CompleteStagePayload) => {
    persist((current) => {
      const correctCount = answers.filter((answer) => answer.correct).length;
      const bonus = correctCount === answers.length ? 80 : 0;
      const earnedXp = score + bonus;
      const earnedCoins = Math.round(score / 4) + correctCount * 8;
      const stage = stages.find((item) => item.id === stageId);
      const unlocked = new Set<AreaId>(current.unlockedAreaIds);
      if (stage) unlocked.add(stage.areaId);
      const achievements = new Set(current.achievements);
      if (Object.keys(current.completedStages).length === 0) achievements.add('first-win');
      if (correctCount >= 5) achievements.add('combo-5');
      if (stage?.areaId === 'logic' && starsForScore(score, maxScore) === 3) achievements.add('logic-master');
      if (stage?.premium) achievements.add('career-ready');

      const next = {
        ...current,
        xp: current.xp + earnedXp,
        level: calculateLevel(current.xp + earnedXp),
        coins: current.coins + earnedCoins,
        unlockedAreaIds: Array.from(unlocked),
        completedStages: {
          ...current.completedStages,
          [stageId]: {
            stars: Math.max(current.completedStages[stageId]?.stars ?? 0, starsForScore(score, maxScore)),
            bestScore: Math.max(current.completedStages[stageId]?.bestScore ?? 0, score),
            completedAt: new Date().toISOString()
          }
        },
        achievements: Array.from(achievements),
        answerHistory: [
          ...current.answerHistory,
          ...answers.map((answer) => ({
            questionId: answer.question.id,
            correct: answer.correct,
            answeredAt: new Date().toISOString()
          }))
        ].slice(-200)
      };
      const result = applyPlayerActivity(next, { type: 'challenge', xp: earnedXp, language: stage?.areaId });
      if (result.unlocked.length) setRecentAchievements(result.unlocked.slice(0, 3));
      return result.profile;
    });
  };

  const buyItem = (item: ShopItem) => {
    if (profile.ownedItems.includes(item.id) || profile.coins < item.price) return false;
    persistActivity(
      (current) => ({
        ...current,
        coins: Math.max(0, current.coins - item.price),
        ownedItems: [...current.ownedItems, item.id],
        avatar: item.category === 'avatar' ? item.preview : current.avatar,
        selectedTheme: item.id === 'theme-focus' ? 'light' : current.selectedTheme
      }),
      { type: 'shop_purchase' },
      ['shop-first-buy']
    );
    return true;
  };

  const awardCampaignReward = (xp: number, coins: number, achievements: AchievementId[] = [], activity: PlayerActivity = { type: 'xp', xp }) => {
    streakService.recordStudy(xp).catch(() => undefined);
    persistActivity(
      (current) => {
        const nextXp = current.xp + xp;
        return {
          ...current,
          xp: nextXp,
          level: calculateLevel(nextXp),
          coins: current.coins + coins,
          achievements: Array.from(new Set([...current.achievements, ...achievements]))
        };
      },
      { ...activity, xp: activity.xp ?? xp },
      achievements
    );
  };

  const recordActivity = (activity: PlayerActivity, achievements: AchievementId[] = []) => {
    persistActivity((current) => current, activity, achievements);
  };

  const claimMission = (missionId: string) => {
    const result = claimMissionReward(profile, missionId);
    if (result.claimed) {
      setProfile(result.profile);
      storage.savePlayer(result.profile).catch(() => undefined);
    }
    return { claimed: result.claimed, message: result.message };
  };

  const resetProgress = async () => {
    await storage.resetProgress();
    setRecentAchievements([]);
    setProfile(normalizePlayerMeta(createDefaultPlayer()));
  };

  const reloadProfile = async () => {
    const next = await storage.loadPlayer();
    const normalized = normalizePlayerMeta(next);
    setProfile(normalized);
    return normalized;
  };

  const clearRecentAchievements = () => setRecentAchievements([]);

  const value = {
    profile,
    loading,
    updateName,
    updateAvatar,
    claimDailyReward,
    completeStage,
    buyItem,
    awardCampaignReward,
    recordActivity,
    claimMission,
    recentAchievements,
    clearRecentAchievements,
    resetProgress,
    reloadProfile
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used inside PlayerProvider');
  }
  return context;
}

export const localRanking = (profile: PlayerProfile) => [
  { name: profile.name, xp: profile.xp, avatar: profile.avatar },
  { name: 'Maya Script', xp: Math.max(0, profile.xp - 180), avatar: 'MS' },
  { name: 'Theo Stack', xp: Math.max(0, profile.xp - 420), avatar: 'TS' },
  { name: 'Lina Query', xp: Math.max(0, profile.xp - 760), avatar: 'LQ' }
].sort((a, b) => b.xp - a.xp);

export const itemById = (id: string) => shopItems.find((item) => item.id === id);
