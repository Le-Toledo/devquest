import { AchievementId, PlayerActivityType, PlayerMissionState, PlayerProfile, PlayerStats } from '../types/game';
import { calculateLevel } from '../utils/progression';

export type Reward = { xp?: number; coins?: number };

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  reward?: Reward;
  progress: (profile: PlayerProfile) => { current: number; goal: number };
};

export type MissionDefinition = {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  goal: number;
  reward: Required<Reward>;
};

export type PlayerActivity = {
  type: PlayerActivityType;
  xp?: number;
  language?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const dateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const startOfWeekKey = (date = new Date()) => {
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() - day + 1);
  return current.toISOString().slice(0, 10);
};

const nextDayIso = () => new Date(Date.now() + DAY_MS).toISOString();

const nextWeekIso = () => {
  const start = new Date(`${startOfWeekKey()}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() + 7);
  return start.toISOString();
};

const unlockedProgress = (id: string) => (profile: PlayerProfile) => ({ current: profile.achievements.includes(id) ? 1 : 0, goal: 1 });

export const achievementDefinitions: AchievementDefinition[] = [
  { id: 'first-win', title: 'Primeira Missão', description: 'Conclua sua primeira fase ou missão.', icon: '🏁', reward: { xp: 25 }, progress: (profile) => ({ current: totalMissions(profile), goal: 1 }) },
  { id: 'missions-5', title: 'Ritmo de Jornada', description: 'Conclua 5 missões ou fases.', icon: '🧭', reward: { coins: 40 }, progress: (profile) => ({ current: totalMissions(profile), goal: 5 }) },
  { id: 'missions-10', title: 'Dev Persistente', description: 'Conclua 10 missões ou fases.', icon: '⚡', reward: { coins: 80 }, progress: (profile) => ({ current: totalMissions(profile), goal: 10 }) },
  { id: 'missions-25', title: 'Explorador de Sistemas', description: 'Conclua 25 missões ou fases.', icon: '🛰️', reward: { xp: 150, coins: 120 }, progress: (profile) => ({ current: totalMissions(profile), goal: 25 }) },
  { id: 'missions-50', title: 'Lenda da Jornada', description: 'Conclua 50 missões ou fases.', icon: '🏆', reward: { xp: 300, coins: 250 }, progress: (profile) => ({ current: totalMissions(profile), goal: 50 }) },
  { id: 'arena-first-challenge', title: 'Primeiro Duelo na Arena', description: 'Conclua seu primeiro desafio da Arena.', icon: '💻', reward: { coins: 35 }, progress: (profile) => ({ current: profile.stats?.arenaChallengesCompleted ?? 0, goal: 1 }) },
  { id: 'academy-first-lesson', title: 'Primeira Aula', description: 'Conclua sua primeira aula da Academia Dev.', icon: '📘', reward: { xp: 20 }, progress: (profile) => ({ current: profile.stats?.academyLessonsCompleted ?? 0, goal: 1 }) },
  { id: 'shop-first-buy', title: 'Primeira Compra', description: 'Compre seu primeiro item na Loja.', icon: '🛒', reward: { xp: 20 }, progress: (profile) => ({ current: profile.stats?.shopPurchases ?? 0, goal: 1 }) },
  { id: 'streak-1', title: 'Voltei Hoje', description: 'Mantenha 1 dia de sequência.', icon: '🔥', reward: { coins: 20 }, progress: (profile) => ({ current: profile.streak, goal: 1 }) },
  { id: 'streak-3', title: 'Três Dias de Foco', description: 'Mantenha 3 dias de sequência.', icon: '🔥', reward: { coins: 60 }, progress: (profile) => ({ current: profile.streak, goal: 3 }) },
  { id: 'streak-7', title: 'Semana de Código', description: 'Mantenha 7 dias de sequência.', icon: '🔥', reward: { xp: 100, coins: 100 }, progress: (profile) => ({ current: profile.streak, goal: 7 }) },
  { id: 'streak-30', title: 'Hábito de Dev', description: 'Mantenha 30 dias de sequência.', icon: '🔥', reward: { xp: 500, coins: 400 }, progress: (profile) => ({ current: profile.streak, goal: 30 }) },
  { id: 'level-5', title: 'Nível 5', description: 'Alcance o nível 5.', icon: '⭐', reward: { coins: 75 }, progress: (profile) => ({ current: profile.level, goal: 5 }) },
  { id: 'level-10', title: 'Nível 10', description: 'Alcance o nível 10.', icon: '🌟', reward: { coins: 150 }, progress: (profile) => ({ current: profile.level, goal: 10 }) },
  { id: 'level-25', title: 'Nível 25', description: 'Alcance o nível 25.', icon: '💎', reward: { xp: 250, coins: 300 }, progress: (profile) => ({ current: profile.level, goal: 25 }) },
  { id: 'xp-1000', title: '1.000 XP', description: 'Acumule 1.000 XP.', icon: '✨', reward: { coins: 80 }, progress: (profile) => ({ current: profile.xp, goal: 1000 }) },
  { id: 'xp-5000', title: '5.000 XP', description: 'Acumule 5.000 XP.', icon: '🚀', reward: { coins: 200 }, progress: (profile) => ({ current: profile.xp, goal: 5000 }) },
  { id: 'xp-10000', title: '10.000 XP', description: 'Acumule 10.000 XP.', icon: '👑', reward: { coins: 500 }, progress: (profile) => ({ current: profile.xp, goal: 10000 }) },
  { id: 'coins-1000', title: 'Reserva de 1.000 Moedas', description: 'Acumule 1.000 moedas.', icon: '🪙', reward: { xp: 120 }, progress: (profile) => ({ current: profile.coins, goal: 1000 }) },
  { id: 'campaign-first-step', title: 'Primeiro Passo na Jornada', description: 'Complete sua primeira missão da campanha.', icon: '🗺️', progress: (profile) => ({ current: profile.stats?.campaignMissionsCompleted ?? 0, goal: 1 }) },
  { id: 'academy-10-lessons', title: '10 Aulas Concluídas', description: 'Complete dez aulas da Academia Dev.', icon: '📚', progress: (profile) => ({ current: profile.stats?.academyLessonsCompleted ?? 0, goal: 10 }) },
  { id: 'academy-dedicated-student', title: 'Estudante Dedicado', description: 'Conclua 25 aulas da Academia Dev.', icon: '🎓', progress: (profile) => ({ current: profile.stats?.academyLessonsCompleted ?? 0, goal: 25 }) },
  { id: 'code-arena-pro', title: 'Arena Pro', description: 'Conclua muitos desafios práticos na Arena de Código.', icon: '🧪', progress: (profile) => ({ current: profile.stats?.arenaChallengesCompleted ?? 0, goal: 20 }) },
  { id: 'combo-5', title: 'Combo 5x', description: 'Acerte cinco perguntas seguidas.', icon: '🎯', progress: unlockedProgress('combo-5') },
  { id: 'logic-master', title: 'Mente Lógica', description: 'Ganhe 3 estrelas em Lógica.', icon: '🧠', progress: unlockedProgress('logic-master') },
  { id: 'career-ready', title: 'Carreira Dev', description: 'Complete um desafio profissional.', icon: '💼', progress: unlockedProgress('career-ready') },
  { id: 'campaign-syntax-bug', title: 'Derrotou o Bug de Sintaxe', description: 'Vença o primeiro boss da jornada.', icon: '🧯', progress: unlockedProgress('campaign-syntax-bug') },
  { id: 'campaign-frontend-hero', title: 'Herói do Front-end', description: 'Restaure a Cidade do Front-end.', icon: '🎨', progress: unlockedProgress('campaign-frontend-hero') },
  { id: 'campaign-backend-guardian', title: 'Guardião do Back-end', description: 'Proteja a Fortaleza Back-end.', icon: '🛡️', progress: unlockedProgress('campaign-backend-guardian') },
  { id: 'campaign-kotlin-warrior', title: 'Guerreiro Kotlin', description: 'Vença o Null Pointer na Academia Mobile.', icon: '📱', progress: unlockedProgress('campaign-kotlin-warrior') },
  { id: 'campaign-legacy-survivor', title: 'Sobrevivente do Legacy Code', description: 'Refatore sem derrubar a Empresa dos Devs.', icon: '🧰', progress: unlockedProgress('campaign-legacy-survivor') },
  { id: 'campaign-final-interview', title: 'Aprovado na Entrevista Final', description: 'Conclua a Jornada do Desenvolvedor.', icon: '🎤', progress: unlockedProgress('campaign-final-interview') },
  { id: 'review-learned-bug', title: 'Aprendi com o Bug', description: 'Conclua uma revisão no laboratório.', icon: '🔁', progress: unlockedProgress('review-learned-bug') },
  { id: 'review-perfect', title: 'Revisão Perfeita', description: 'Acerte várias revisões do mesmo erro.', icon: '✅', progress: unlockedProgress('review-perfect') },
  { id: 'review-10-fixed', title: '10 Erros Corrigidos', description: 'Marque dez erros como aprendidos.', icon: '🧹', progress: unlockedProgress('review-10-fixed') },
  { id: 'review-persistence-master', title: 'Mestre da Persistência', description: 'Leve um erro até o intervalo de 7 dias.', icon: '⏳', progress: unlockedProgress('review-persistence-master') },
  { id: 'review-never-give-up', title: 'Nunca Desisto', description: 'Erre uma revisão e continue praticando.', icon: '💪', progress: unlockedProgress('review-never-give-up') },
  { id: 'academy-master', title: 'Mestre da Academia', description: 'Complete todas as mini-aulas iniciais.', icon: '🏫', progress: unlockedProgress('academy-master') },
  { id: 'academy-fullstack-training', title: 'Full Stack em Treinamento', description: 'Estude trilhas de front-end ou back-end.', icon: '🧩', progress: unlockedProgress('academy-fullstack-training') },
  { id: 'academy-kotlin-scholar', title: 'Kotlin Scholar', description: 'Conclua uma aula da trilha Kotlin.', icon: '📲', progress: unlockedProgress('academy-kotlin-scholar') },
  { id: 'academy-git-guardian', title: 'Guardião do Git', description: 'Conclua uma aula de Git e GitHub.', icon: '🌿', progress: unlockedProgress('academy-git-guardian') },
  { id: 'daily-reward', title: 'Voltei Hoje', description: 'Colete uma recompensa diária.', icon: '🎁', progress: unlockedProgress('daily-reward') }
];

export const dailyMissionDefinitions: MissionDefinition[] = [
  { id: 'daily-login', type: 'daily', title: 'Entrar no app', description: 'Abra o app hoje para manter o ritmo.', goal: 1, reward: { xp: 20, coins: 20 } },
  { id: 'daily-challenge', type: 'daily', title: 'Concluir 1 desafio', description: 'Complete qualquer desafio ou missão.', goal: 1, reward: { xp: 35, coins: 30 } },
  { id: 'daily-xp-50', type: 'daily', title: 'Ganhar 50 XP', description: 'Some 50 XP estudando ou jogando.', goal: 50, reward: { xp: 25, coins: 45 } },
  { id: 'daily-lesson', type: 'daily', title: 'Estudar 1 aula', description: 'Conclua uma aula da Academia Dev.', goal: 1, reward: { xp: 30, coins: 35 } },
  { id: 'daily-arena', type: 'daily', title: 'Jogar Arena uma vez', description: 'Resolva um desafio da Arena de Código.', goal: 1, reward: { xp: 30, coins: 35 } }
];

export const weeklyMissionDefinitions: MissionDefinition[] = [
  { id: 'weekly-10-challenges', type: 'weekly', title: 'Concluir 10 desafios', description: 'Complete 10 desafios ou missões na semana.', goal: 10, reward: { xp: 120, coins: 160 } },
  { id: 'weekly-xp-500', type: 'weekly', title: 'Ganhar 500 XP', description: 'Some 500 XP nesta semana.', goal: 500, reward: { xp: 100, coins: 140 } },
  { id: 'weekly-3-lessons', type: 'weekly', title: 'Concluir 3 aulas', description: 'Finalize 3 aulas da Academia Dev.', goal: 3, reward: { xp: 100, coins: 120 } },
  { id: 'weekly-streak-3', type: 'weekly', title: 'Manter streak por 3 dias', description: 'Estude em 3 dias da semana.', goal: 3, reward: { xp: 120, coins: 120 } },
  { id: 'weekly-2-languages', type: 'weekly', title: 'Treinar 2 linguagens', description: 'Conclua desafios em 2 linguagens diferentes.', goal: 2, reward: { xp: 130, coins: 150 } }
];

const allMissionDefinitions = [...dailyMissionDefinitions, ...weeklyMissionDefinitions];

const totalMissions = (profile: PlayerProfile) =>
  Object.keys(profile.completedStages).length + (profile.stats?.campaignMissionsCompleted ?? 0);

const defaultStats = (): PlayerStats => ({
  totalChallengesCompleted: 0,
  campaignMissionsCompleted: 0,
  academyLessonsCompleted: 0,
  arenaChallengesCompleted: 0,
  shopPurchases: 0,
  dailyLoginCount: 0,
  xpEarnedToday: 0,
  xpEarnedThisWeek: 0,
  studiedLanguagesThisWeek: [],
  lastDailyReset: dateKey(),
  lastWeeklyReset: startOfWeekKey()
});

const createMissionState = (definition: MissionDefinition): PlayerMissionState => ({
  id: definition.id,
  type: definition.type,
  progress: 0,
  goal: definition.goal,
  completed: false,
  claimed: false,
  resetAt: definition.type === 'daily' ? nextDayIso() : nextWeekIso()
});

const normalizeMissionSet = (saved: Record<string, PlayerMissionState> | undefined, definitions: MissionDefinition[]) =>
  definitions.reduce<Record<string, PlayerMissionState>>((acc, definition) => {
    const current = saved?.[definition.id];
    acc[definition.id] = current
      ? {
          ...createMissionState(definition),
          ...current,
          goal: definition.goal,
          type: definition.type,
          completed: current.progress >= definition.goal || current.completed
        }
      : createMissionState(definition);
    return acc;
  }, {});

export const normalizePlayerMeta = (profile: PlayerProfile): PlayerProfile => {
  const today = dateKey();
  const week = startOfWeekKey();
  const stats = { ...defaultStats(), ...(profile.stats ?? {}) };
  let dailyMissions = normalizeMissionSet(profile.dailyMissions, dailyMissionDefinitions);
  let weeklyMissions = normalizeMissionSet(profile.weeklyMissions, weeklyMissionDefinitions);

  if (stats.lastDailyReset !== today) {
    stats.lastDailyReset = today;
    stats.dailyLoginCount = 0;
    stats.xpEarnedToday = 0;
    dailyMissions = normalizeMissionSet(undefined, dailyMissionDefinitions);
  }

  if (stats.lastWeeklyReset !== week) {
    stats.lastWeeklyReset = week;
    stats.xpEarnedThisWeek = 0;
    stats.studiedLanguagesThisWeek = [];
    weeklyMissions = normalizeMissionSet(undefined, weeklyMissionDefinitions);
  }

  const achievements = Array.from(new Set(profile.achievements ?? []));
  const achievementUnlocks = achievements.reduce<Record<string, { id: string; unlockedAt: string }>>((acc, id) => {
    acc[id] = profile.achievementUnlocks?.[id] ?? { id, unlockedAt: new Date().toISOString() };
    return acc;
  }, { ...(profile.achievementUnlocks ?? {}) });

  return {
    ...profile,
    level: calculateLevel(profile.xp),
    coins: Math.max(0, profile.coins),
    achievements,
    achievementUnlocks,
    dailyMissions,
    weeklyMissions,
    claimedRewards: Array.from(new Set(profile.claimedRewards ?? [])),
    stats
  };
};

const bumpMission = (mission: PlayerMissionState, amount: number) => {
  if (mission.claimed) return mission;
  const progress = Math.min(mission.goal, mission.progress + amount);
  return { ...mission, progress, completed: progress >= mission.goal };
};

const updateMissions = (profile: PlayerProfile, activity: PlayerActivity) => {
  const daily = { ...(profile.dailyMissions ?? {}) };
  const weekly = { ...(profile.weeklyMissions ?? {}) };
  const bump = (id: string, amount = 1) => {
    if (daily[id]) daily[id] = bumpMission(daily[id], amount);
    if (weekly[id]) weekly[id] = bumpMission(weekly[id], amount);
  };

  if (activity.type === 'login') bump('daily-login');
  if (['challenge', 'campaign_mission', 'arena_challenge'].includes(activity.type)) {
    bump('daily-challenge');
    bump('weekly-10-challenges');
  }
  if (activity.type === 'academy_lesson') {
    bump('daily-lesson');
    bump('weekly-3-lessons');
  }
  if (activity.type === 'arena_challenge') bump('daily-arena');
  if (activity.xp) {
    bump('daily-xp-50', activity.xp);
    bump('weekly-xp-500', activity.xp);
  }
  if (activity.type === 'streak') bump('weekly-streak-3');
  if (activity.language) {
    const count = profile.stats?.studiedLanguagesThisWeek.length ?? 0;
    if (weekly['weekly-2-languages']) weekly['weekly-2-languages'] = { ...weekly['weekly-2-languages'], progress: Math.min(2, count), completed: count >= 2 };
  }

  return { daily, weekly };
};

const updateStats = (profile: PlayerProfile, activity: PlayerActivity) => {
  const stats = { ...defaultStats(), ...(profile.stats ?? {}) };
  if (activity.type === 'login' && stats.lastLoginDate !== dateKey()) {
    stats.lastLoginDate = dateKey();
    stats.dailyLoginCount += 1;
  }
  if (activity.type === 'challenge') stats.totalChallengesCompleted += 1;
  if (activity.type === 'campaign_mission') {
    stats.campaignMissionsCompleted += 1;
    stats.totalChallengesCompleted += 1;
  }
  if (activity.type === 'academy_lesson') stats.academyLessonsCompleted += 1;
  if (activity.type === 'arena_challenge') {
    stats.arenaChallengesCompleted += 1;
    stats.totalChallengesCompleted += 1;
  }
  if (activity.type === 'shop_purchase') stats.shopPurchases += 1;
  if (activity.xp) {
    stats.xpEarnedToday += activity.xp;
    stats.xpEarnedThisWeek += activity.xp;
  }
  if (activity.language) stats.studiedLanguagesThisWeek = Array.from(new Set([...stats.studiedLanguagesThisWeek, activity.language]));
  return stats;
};

export const applyPlayerActivity = (profile: PlayerProfile, activity: PlayerActivity, explicitAchievements: string[] = []) => {
  const normalized = normalizePlayerMeta(profile);
  const stats = updateStats(normalized, activity);
  const withStats = { ...normalized, stats };
  const { daily, weekly } = updateMissions(withStats, activity);
  let next: PlayerProfile = { ...withStats, dailyMissions: daily, weeklyMissions: weekly };
  const unlocked: AchievementDefinition[] = [];
  const ids = new Set([...(next.achievements ?? []), ...explicitAchievements]);

  for (const definition of achievementDefinitions) {
    const progress = definition.progress(next);
    if (progress.current >= progress.goal) ids.add(definition.id);
  }

  const previous = new Set(next.achievements);
  const achievementUnlocks = { ...(next.achievementUnlocks ?? {}) };
  let rewardXp = 0;
  let rewardCoins = 0;
  ids.forEach((id) => {
    if (!previous.has(id)) {
      const definition = achievementDefinitions.find((item) => item.id === id);
      if (definition) {
        unlocked.push(definition);
        achievementUnlocks[id] = { id, unlockedAt: new Date().toISOString() };
        rewardXp += definition.reward?.xp ?? 0;
        rewardCoins += definition.reward?.coins ?? 0;
      }
    }
  });

  const xp = next.xp + rewardXp;
  next = {
    ...next,
    xp,
    level: calculateLevel(xp),
    coins: Math.max(0, next.coins + rewardCoins),
    achievements: Array.from(ids),
    achievementUnlocks
  };

  return { profile: normalizePlayerMeta(next), unlocked };
};

export const claimMissionReward = (profile: PlayerProfile, missionId: string) => {
  const normalized = normalizePlayerMeta(profile);
  const definition = allMissionDefinitions.find((item) => item.id === missionId);
  if (!definition) return { profile: normalized, claimed: false, message: 'Missão não encontrada.' };

  const setKey = definition.type === 'daily' ? 'dailyMissions' : 'weeklyMissions';
  const missions = { ...(normalized[setKey] ?? {}) };
  const mission = missions[missionId];
  if (!mission?.completed) return { profile: normalized, claimed: false, message: 'Conclua a missão antes de resgatar.' };
  if (mission.claimed || normalized.claimedRewards?.includes(missionId)) return { profile: normalized, claimed: false, message: 'Recompensa já resgatada.' };

  missions[missionId] = { ...mission, claimed: true };
  const xp = normalized.xp + definition.reward.xp;
  const next = normalizePlayerMeta({
    ...normalized,
    [setKey]: missions,
    xp,
    level: calculateLevel(xp),
    coins: Math.max(0, normalized.coins + definition.reward.coins),
    claimedRewards: Array.from(new Set([...(normalized.claimedRewards ?? []), missionId]))
  });

  return { profile: next, claimed: true, message: `Recompensa resgatada: +${definition.reward.xp} XP e +${definition.reward.coins} moedas.` };
};
