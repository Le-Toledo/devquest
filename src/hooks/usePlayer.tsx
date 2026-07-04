import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { shopItems } from '../data/shop';
import { stages } from '../data/worlds';
import { createDefaultPlayer, storage } from '../services/storage';
import { streakService } from '../services/streakService';
import { AreaId, PlayerProfile, Question, ShopItem } from '../types/game';
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
  awardCampaignReward: (xp: number, coins: number, achievements?: string[]) => void;
  resetProgress: () => Promise<void>;
  reloadProfile: () => Promise<PlayerProfile>;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(createDefaultPlayer());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage
      .loadPlayer()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const persist = (producer: (current: PlayerProfile) => PlayerProfile) => {
    setProfile((current) => {
      const next = producer(current);
      storage.savePlayer(next).catch(() => undefined);
      return next;
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
    persist((current) => ({
      ...current,
      coins: current.coins + 90,
      xp: current.xp + 60,
      level: calculateLevel(current.xp + 60),
      streak: current.lastDailyReward ? current.streak + 1 : 1,
      lastDailyReward: today
    }));
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

      return {
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
    });
  };

  const buyItem = (item: ShopItem) => {
    if (profile.ownedItems.includes(item.id) || profile.coins < item.price) return false;
    persist((current) => ({
      ...current,
      coins: current.coins - item.price,
      ownedItems: [...current.ownedItems, item.id],
      avatar: item.category === 'avatar' ? item.preview : current.avatar,
      selectedTheme: item.id === 'theme-focus' ? 'light' : current.selectedTheme
    }));
    return true;
  };

  const awardCampaignReward = (xp: number, coins: number, achievements: string[] = []) => {
    streakService.recordStudy(xp).catch(() => undefined);
    persist((current) => {
      const nextXp = current.xp + xp;
      return {
        ...current,
        xp: nextXp,
        level: calculateLevel(nextXp),
        coins: current.coins + coins,
        achievements: Array.from(new Set([...current.achievements, ...achievements]))
      };
    });
  };

  const resetProgress = async () => {
    await storage.resetProgress();
    setProfile(createDefaultPlayer());
  };

  const reloadProfile = async () => {
    const next = await storage.loadPlayer();
    setProfile(next);
    return next;
  };

  const value = { profile, loading, updateName, updateAvatar, claimDailyReward, completeStage, buyItem, awardCampaignReward, resetProgress, reloadProfile };

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
