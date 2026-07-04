import AsyncStorage from '@react-native-async-storage/async-storage';
import { questions } from '../data/questions';
import { storageKeys } from './storageKeys';
import { AnswerHistoryItem, Question, Stage } from '../types/game';
import { QuestionSeenEntry } from '../types/question';
import { parseArrayOrFallback } from '../utils/jsonStorage';
import { seededShuffle } from '../utils/shuffle';

const MAX_SEEN_HISTORY = 500;
const DEFAULT_STAGE_LIMIT = 8;

const byNewest = (a: QuestionSeenEntry, b: QuestionSeenEntry) => Date.parse(b.seenAt) - Date.parse(a.seenAt);

const loadSeenHistory = async (): Promise<QuestionSeenEntry[]> => {
  const raw = await AsyncStorage.getItem(storageKeys.questionSeenHistory);
  return parseArrayOrFallback<QuestionSeenEntry>(raw, []);
};

const saveSeenHistory = async (history: QuestionSeenEntry[]) => {
  await AsyncStorage.setItem(storageKeys.questionSeenHistory, JSON.stringify(history.sort(byNewest).slice(0, MAX_SEEN_HISTORY)));
};

const mostRecentAnswerByQuestion = (answerHistory: AnswerHistoryItem[]) => {
  const map = new Map<string, string>();
  answerHistory.forEach((entry) => {
    const current = map.get(entry.questionId);
    if (!current || Date.parse(entry.answeredAt) > Date.parse(current)) {
      map.set(entry.questionId, entry.answeredAt);
    }
  });
  return map;
};

const mostRecentSeenByQuestion = (seenHistory: QuestionSeenEntry[]) => {
  const map = new Map<string, string>();
  seenHistory.forEach((entry) => {
    const current = map.get(entry.questionId);
    if (!current || Date.parse(entry.seenAt) > Date.parse(current)) {
      map.set(entry.questionId, entry.seenAt);
    }
  });
  return map;
};

const recencyPenalty = (isoDate?: string) => {
  if (!isoDate) return 0;
  const ageMs = Date.now() - Date.parse(isoDate);
  const ageDays = ageMs / 86_400_000;
  if (ageDays < 1) return 900;
  if (ageDays < 3) return 500;
  if (ageDays < 7) return 220;
  return 40;
};

const semanticSkillTags = ['conceito', 'codigo', 'bug', 'sequencia', 'boa-pratica'];

const conceptKeyFor = (question: Question) => {
  const coreTags = question.tags.filter((tag) => {
    if (tag === question.areaId || tag === question.difficulty) return false;
    if (semanticSkillTags.includes(tag)) return false;
    if (tag.includes('-iniciante') || tag.includes('-intermediario') || tag.includes('-avancado')) return false;
    return true;
  });
  return `${question.areaId}:${coreTags.slice(0, 2).join('+') || question.kind}`;
};

const diversifyByConcept = (items: { question: Question; score: number }[], limit: number) => {
  const selected: { question: Question; score: number }[] = [];
  const usedConcepts = new Set<string>();

  items.forEach((item) => {
    if (selected.length >= limit) return;
    const key = conceptKeyFor(item.question);
    if (usedConcepts.has(key)) return;
    usedConcepts.add(key);
    selected.push(item);
  });

  items.forEach((item) => {
    if (selected.length >= limit) return;
    if (selected.some((entry) => entry.question.id === item.question.id)) return;
    selected.push(item);
  });

  return selected;
};

export const questionSelectionService = {
  async selectForStage(stage: Stage, answerHistory: AnswerHistoryItem[], limit = DEFAULT_STAGE_LIMIT): Promise<Question[]> {
    const seenHistory = await loadSeenHistory();
    const recentAnswer = mostRecentAnswerByQuestion(answerHistory);
    const recentSeen = mostRecentSeenByQuestion(seenHistory);
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const candidates = stage.questionIds.map((id) => questionById.get(id)).filter((question): question is Question => Boolean(question));

    const scored = candidates.map((question, index) => {
      const answeredAt = recentAnswer.get(question.id);
      const seenAt = recentSeen.get(question.id);
      const score =
        index +
        recencyPenalty(answeredAt) +
        recencyPenalty(seenAt) -
        (answeredAt ? 0 : 250) -
        (seenAt ? 0 : 180);
      return { question, score };
    });

    const seed = `${stage.id}-${new Date().toISOString().slice(0, 10)}-${answerHistory.length}-${seenHistory.length}`;
    const selected = diversifyByConcept(
      seededShuffle(scored, seed).sort((a, b) => a.score - b.score),
      Math.min(limit, scored.length)
    )
      .map((entry) => entry.question);

    const now = new Date().toISOString();
    const nextSeen = [
      ...selected.map((question) => ({ questionId: question.id, seenAt: now })),
      ...seenHistory
    ];
    await saveSeenHistory(nextSeen);

    return selected;
  },

  async clearSeenHistory() {
    await AsyncStorage.removeItem(storageKeys.questionSeenHistory);
  }
};
