import AsyncStorage from '@react-native-async-storage/async-storage';
import { leaderboardConsentStorageKey } from './storageKeys';

export type LeaderboardConsentStatus = 'unknown' | 'accepted' | 'declined';

const isStatus = (value: string | null): value is LeaderboardConsentStatus =>
  value === 'accepted' || value === 'declined';

export const leaderboardConsentService = {
  async get(userId: string): Promise<LeaderboardConsentStatus> {
    const value = await AsyncStorage.getItem(leaderboardConsentStorageKey(userId));
    return isStatus(value) ? value : 'unknown';
  },

  async set(userId: string, status: Exclude<LeaderboardConsentStatus, 'unknown'>) {
    await AsyncStorage.setItem(leaderboardConsentStorageKey(userId), status);
  },

  async hasAccepted(userId: string) {
    return (await this.get(userId)) === 'accepted';
  },

  async clear(userId: string) {
    await AsyncStorage.removeItem(leaderboardConsentStorageKey(userId));
  }
};
