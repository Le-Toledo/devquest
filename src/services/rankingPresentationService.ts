import { LeaderboardEntry } from '../types/backend';

export type LocalRankingEntry = {
  name: string;
  avatar: string;
  xp: number;
};

export type RankingPresentationEntry = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level?: number;
};

export type RankingPresentationSource = 'online' | 'local' | 'empty';

export type RankingPresentation = {
  source: RankingPresentationSource;
  title: string;
  subtitle: string;
  entries: RankingPresentationEntry[];
  showLoading: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
};

type RankingPresentationInput = {
  onlineEnabled: boolean;
  loading: boolean;
  remoteEntries: LeaderboardEntry[];
  localEntries: LocalRankingEntry[];
  remoteFailed: boolean;
};

const toOnlineEntry = (entry: LeaderboardEntry): RankingPresentationEntry => ({
  id: entry.id,
  name: entry.displayName,
  avatar: entry.avatar,
  xp: entry.xp,
  level: entry.level
});

const toLocalEntry = (entry: LocalRankingEntry, index: number): RankingPresentationEntry => ({
  id: `local-${entry.name}-${index}`,
  name: entry.name,
  avatar: entry.avatar,
  xp: entry.xp
});

export function buildRankingPresentation({
  onlineEnabled,
  loading,
  remoteEntries,
  localEntries,
  remoteFailed
}: RankingPresentationInput): RankingPresentation {
  const onlineEntries = remoteEntries.map(toOnlineEntry);
  const localFallbackEntries = localEntries.map(toLocalEntry);
  const hasOnlineEntries = onlineEnabled && !remoteFailed && onlineEntries.length > 0;
  const shouldUseLocalFallback = !hasOnlineEntries && localFallbackEntries.length > 0 && (!onlineEnabled || loading || remoteFailed);

  if (hasOnlineEntries) {
    return {
      source: 'online',
      title: 'Ranking online',
      subtitle: 'Dados globais vindos do Supabase. Sincronize sua conta para atualizar sua posição.',
      entries: onlineEntries,
      showLoading: loading
    };
  }

  if (shouldUseLocalFallback) {
    return {
      source: 'local',
      title: 'Ranking local',
      subtitle: onlineEnabled
        ? 'Mostrando sua classificação local enquanto o ranking global é atualizado.'
        : 'Entre na conta para ativar ranking global. Este ranking continua disponível offline.',
      entries: localFallbackEntries,
      showLoading: loading
    };
  }

  return {
    source: 'empty',
    title: onlineEnabled ? 'Ranking online' : 'Ranking local',
    subtitle: onlineEnabled
      ? 'O ranking global será preenchido conforme os jogadores sincronizarem progresso.'
      : 'Entre na conta para ativar ranking global. Este ranking continua disponível offline.',
    entries: [],
    showLoading: loading,
    emptyTitle: 'Ainda não há posições no ranking',
    emptyMessage: 'Continue aprendendo e ganhando XP para aparecer por aqui.'
  };
}
