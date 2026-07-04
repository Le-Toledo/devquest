import { useEffect, useState } from 'react';
import { academyProgressService, defaultAcademyProgress } from '../services/academyProgressService';
import { AcademyProgress } from '../types/academy';

export function useAcademy() {
  const [progress, setProgress] = useState<AcademyProgress>(defaultAcademyProgress);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    academyProgressService.load().then(setProgress).finally(() => setLoading(false));
  }, []);

  return { progress, setProgress, loading, stats: academyProgressService.stats(progress) };
}
