import AsyncStorage from '@react-native-async-storage/async-storage';
import { campaignChapters } from '../data/campaignChapters';
import { campaignMissions, missionsByChapter } from '../data/campaignMissions';
import { CampaignProgress, CampaignTrack, WrongCampaignQuestion } from '../types/campaign';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';

export const defaultCampaignProgress: CampaignProgress = {
  introSeen: false,
  unlockedChapterIds: ['chapter-1'],
  completedMissionIds: [],
  defeatedBossIds: [],
  seenDialogueIds: [],
  collectedRewardIds: [],
  wrongQuestions: []
};

const nextChapterAfter = (chapterId: string) => {
  const chapter = campaignChapters.find((item) => item.id === chapterId);
  return campaignChapters.find((item) => item.order === (chapter?.order ?? 0) + 1);
};

export const campaignProgressService = {
  async load(): Promise<CampaignProgress> {
    const raw = await AsyncStorage.getItem(storageKeys.campaignProgress);
    return parseJsonOrFallback(raw, defaultCampaignProgress);
  },
  async save(progress: CampaignProgress) {
    await AsyncStorage.setItem(storageKeys.campaignProgress, JSON.stringify(progress));
  },
  async markIntroSeen(progress: CampaignProgress) {
    const next = { ...progress, introSeen: true };
    await this.save(next);
    return next;
  },
  async chooseTrack(progress: CampaignProgress, selectedTrack: CampaignTrack) {
    const next = { ...progress, selectedTrack };
    await this.save(next);
    return next;
  },
  async completeMission(progress: CampaignProgress, missionId: string) {
    const completedMissionIds = Array.from(new Set([...progress.completedMissionIds, missionId]));
    const mission = campaignMissions.find((item) => item.id === missionId);
    const chapterMissions = mission ? missionsByChapter(mission.chapterId) : [];
    const chapterComplete = chapterMissions.every((item) => completedMissionIds.includes(item.id));
    const unlockedChapterIds = new Set(progress.unlockedChapterIds);
    if (mission && chapterComplete) {
      const nextChapter = nextChapterAfter(mission.chapterId);
      if (nextChapter) unlockedChapterIds.add(nextChapter.id);
    }
    const next = { ...progress, completedMissionIds, unlockedChapterIds: Array.from(unlockedChapterIds) };
    await this.save(next);
    return next;
  },
  async defeatBoss(progress: CampaignProgress, bossId: string) {
    const next = { ...progress, defeatedBossIds: Array.from(new Set([...progress.defeatedBossIds, bossId])) };
    await this.save(next);
    return next;
  },
  async collectReward(progress: CampaignProgress, rewardId: string) {
    const next = { ...progress, collectedRewardIds: Array.from(new Set([...progress.collectedRewardIds, rewardId])) };
    await this.save(next);
    return next;
  },
  async saveWrongQuestion(progress: CampaignProgress, question: WrongCampaignQuestion) {
    const next = { ...progress, wrongQuestions: [question, ...progress.wrongQuestions].slice(0, 50) };
    await this.save(next);
    return next;
  },
  async reset() {
    await AsyncStorage.removeItem(storageKeys.campaignProgress);
  }
};
