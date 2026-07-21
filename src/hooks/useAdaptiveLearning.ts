import { useEffect, useState } from 'react';
import { adaptiveLearningService, createDefaultAdaptiveLearningState } from '../services/adaptiveLearningService';
import { AdaptiveLearningState } from '../types/adaptiveLearning';

export function useAdaptiveLearning() {
  const [state, setState] = useState<AdaptiveLearningState>(createDefaultAdaptiveLearningState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adaptiveLearningService.load().then(setState).finally(() => setLoading(false));
  }, []);

  return { state, setState, loading };
}
