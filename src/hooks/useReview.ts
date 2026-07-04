import { useEffect, useMemo, useState } from 'react';
import { reviewService } from '../services/reviewService';
import { ReviewError } from '../types/review';

export function useReview() {
  const [errors, setErrors] = useState<ReviewError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService.load().then(setErrors).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => reviewService.stats(errors), [errors]);
  return { errors, setErrors, stats, loading };
}
