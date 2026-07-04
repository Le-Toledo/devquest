import { useEffect, useState } from 'react';
import { campaignProgressService, defaultCampaignProgress } from '../services/campaignProgressService';
import { CampaignProgress } from '../types/campaign';

export function useCampaign() {
  const [progress, setProgress] = useState<CampaignProgress>(defaultCampaignProgress);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignProgressService.load().then(setProgress).finally(() => setLoading(false));
  }, []);

  return { progress, setProgress, loading };
}
