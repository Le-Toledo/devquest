import { useEffect, useMemo, useState } from 'react';
import { codeLabService, defaultCodeLabProgress } from '../services/codeLabService';
import { CodeLabProgress } from '../types/codeLab';

export function useCodeLab() {
  const [progress, setProgress] = useState<CodeLabProgress>(defaultCodeLabProgress);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    codeLabService.load().then(setProgress).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => codeLabService.stats(progress), [progress]);
  return { progress, setProgress, loading, stats };
}
