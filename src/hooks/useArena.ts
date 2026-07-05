import { useEffect, useState } from 'react';
import { codeArenaService, defaultCodeArenaProgress } from '../services/codeArenaService';
import { CodeArenaProgress } from '../types/codeArena';

export function useArena() {
  const [progress, setProgress] = useState<CodeArenaProgress>(defaultCodeArenaProgress);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    codeArenaService.load().then(setProgress).finally(() => setLoading(false));
  }, []);

  return { progress, setProgress, loading };
}
