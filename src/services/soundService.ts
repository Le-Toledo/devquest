import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseJsonOrFallback } from '../utils/jsonStorage';
import { storageKeys } from './storageKeys';

type SoundSettings = {
  enabled: boolean;
};

const defaultSettings: SoundSettings = { enabled: true };

const playPlaceholder = async () => {
  const settings = await soundService.getSoundSettings();
  if (!settings.enabled) return;
  // Placeholder seguro: sons reais podem ser ligados aqui com expo-av em uma build futura.
};

export const soundService = {
  async getSoundSettings(): Promise<SoundSettings> {
    const raw = await AsyncStorage.getItem(storageKeys.soundSettings);
    return parseJsonOrFallback(raw, defaultSettings);
  },
  async setSoundEnabled(enabled: boolean) {
    await AsyncStorage.setItem(storageKeys.soundSettings, JSON.stringify({ enabled }));
  },
  playClick: playPlaceholder,
  playSuccess: playPlaceholder,
  playError: playPlaceholder,
  playLevelUp: playPlaceholder,
  playReward: playPlaceholder,
  playBoss: playPlaceholder,
  playVictory: playPlaceholder,
  playDefeat: playPlaceholder
};
