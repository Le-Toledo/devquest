import assert from 'node:assert/strict';
import { buildRankingPresentation, LocalRankingEntry } from '../src/services/rankingPresentationService';
import { LeaderboardEntry } from '../src/types/backend';

const remoteEntry = (id: string, xp: number): LeaderboardEntry => ({
  id,
  displayName: `Dev ${id}`,
  avatar: 'DV',
  xp,
  level: 4,
  favoriteLanguage: 'TypeScript',
  period: 'global',
  updatedAt: '2026-07-21T00:00:00.000Z'
});

const localEntries: LocalRankingEntry[] = [
  { name: 'Leandro', avatar: 'LT', xp: 1200 },
  { name: 'Maya Script', avatar: 'MS', xp: 900 }
];

const assertNoTechnicalCopy = (text: string) => {
  assert(!text.includes('Ranking online indisponível'));
  assert(!/http|stack trace|código|falha|indisponível/i.test(text));
};

const online = buildRankingPresentation({
  onlineEnabled: true,
  loading: false,
  remoteEntries: [remoteEntry('1', 2000)],
  localEntries,
  remoteFailed: false
});

assert.equal(online.source, 'online');
assert.equal(online.entries.length, 1);
assert.equal(online.entries[0].name, 'Dev 1');
assert.equal(online.title, 'Ranking online');
assertNoTechnicalCopy(`${online.title} ${online.subtitle}`);

const failedWithFallback = buildRankingPresentation({
  onlineEnabled: true,
  loading: false,
  remoteEntries: [],
  localEntries,
  remoteFailed: true
});

assert.equal(failedWithFallback.source, 'local');
assert.equal(failedWithFallback.entries.length, localEntries.length);
assert.equal(failedWithFallback.title, 'Ranking local');
assertNoTechnicalCopy(`${failedWithFallback.title} ${failedWithFallback.subtitle}`);

const offline = buildRankingPresentation({
  onlineEnabled: false,
  loading: false,
  remoteEntries: [],
  localEntries,
  remoteFailed: false
});

assert.equal(offline.source, 'local');
assert.equal(offline.entries.length, localEntries.length);
assertNoTechnicalCopy(`${offline.title} ${offline.subtitle}`);

const empty = buildRankingPresentation({
  onlineEnabled: true,
  loading: false,
  remoteEntries: [],
  localEntries: [],
  remoteFailed: false
});

assert.equal(empty.source, 'empty');
assert.equal(empty.entries.length, 0);
assert.equal(empty.emptyTitle, 'Ainda não há posições no ranking');
assert.equal(empty.emptyMessage, 'Continue aprendendo e ganhando XP para aparecer por aqui.');
assertNoTechnicalCopy(`${empty.title} ${empty.subtitle} ${empty.emptyTitle} ${empty.emptyMessage}`);

const loadingFallback = buildRankingPresentation({
  onlineEnabled: true,
  loading: true,
  remoteEntries: [],
  localEntries,
  remoteFailed: false
});

assert.equal(loadingFallback.source, 'local');
assert.equal(loadingFallback.showLoading, true);
assert.equal(loadingFallback.entries.length, localEntries.length);

const noFakeData = buildRankingPresentation({
  onlineEnabled: false,
  loading: false,
  remoteEntries: [],
  localEntries: [],
  remoteFailed: false
});

assert.equal(noFakeData.entries.length, 0);

const deterministicA = buildRankingPresentation({
  onlineEnabled: true,
  loading: false,
  remoteEntries: [remoteEntry('2', 500)],
  localEntries,
  remoteFailed: false
});
const deterministicB = buildRankingPresentation({
  onlineEnabled: true,
  loading: false,
  remoteEntries: [remoteEntry('2', 500)],
  localEntries,
  remoteFailed: false
});

assert.deepEqual(deterministicA, deterministicB);

console.log('Ranking presentation tests OK');
