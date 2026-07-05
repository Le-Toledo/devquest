import { PlayerProfile } from '../types/game';

export const xpForLevel = (level: number) => 220 + (level - 1) * 120;

export const calculateLevel = (xp: number) => {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return level;
};

export const progressToNextLevel = (profile: PlayerProfile) => {
  let spent = 0;
  for (let level = 1; level < profile.level; level += 1) {
    spent += xpForLevel(level);
  }
  const current = profile.xp - spent;
  const needed = xpForLevel(profile.level);
  return Math.min(1, current / needed);
};

export const starsForScore = (score: number, maxScore: number) => {
  if (maxScore <= 0) return 0;
  const ratio = score / maxScore;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.65) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
};
