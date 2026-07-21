import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CodeBlock } from '../components/CodeBlock';
import { CodeLabEditor } from '../components/CodeLabEditor';
import { CodeLabValidationFeedback } from '../components/CodeLabValidationFeedback';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { codeLabChallengeById, codeLabChallenges } from '../data/codeLabChallenges';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { Navigate } from '../navigation/routes';
import { adaptiveLearningService } from '../services/adaptiveLearningService';
import { codeLabService, defaultCodeLabProgress } from '../services/codeLabService';
import { reviewService } from '../services/reviewService';
import { validateCodeLabSolution } from '../services/codeLabValidationService';
import {
  CodeLabSelection,
  createEditorPlaceholderState,
  findNextPlaceholderSelection,
  findPlaceholderSelection,
  hasExactPlaceholder
} from '../services/codeLabPlaceholderService';
import { CodeLabProgress, CodeLabValidationResult } from '../types/codeLab';

export function CodeLabChallengeScreen({ challengeId, navigate, goBack }: { challengeId: string; navigate: Navigate; goBack: () => void }) {
  const { colors } = useSettings();
  const { awardCampaignReward } = usePlayer();
  const [progress, setProgress] = useState<CodeLabProgress>(defaultCodeLabProgress);
  const challenge = codeLabChallengeById(challengeId);
  const savedAttempt = challenge ? progress.attemptsByChallengeId[challenge.id] : undefined;
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CodeLabValidationResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  const [editorSelection, setEditorSelection] = useState<CodeLabSelection>({ start: 0, end: 0 });
  const [userMovedCursor, setUserMovedCursor] = useState(false);
  const [pendingInitialSelection, setPendingInitialSelection] = useState<CodeLabSelection | null>(null);
  const lastSavedDraftRef = useRef('');
  const editorReadyRef = useRef(false);
  const draftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usedHints = savedAttempt?.usedHints ?? 0;
  const visibleHints = challenge?.hints.slice(0, usedHints) ?? [];
  const nextChallenge = useMemo(() => {
    if (!challenge) return undefined;
    const index = codeLabChallenges.findIndex((item) => item.id === challenge.id);
    return codeLabChallenges[index + 1] ?? codeLabChallenges[0];
  }, [challenge]);

  useEffect(() => {
    codeLabService.load().then((loaded) => {
      setProgress(loaded);
      const current = loaded.attemptsByChallengeId[challengeId];
      const editorState = createEditorPlaceholderState(current?.draftCode ?? current?.lastCode, codeLabChallengeById(challengeId)?.starterCode ?? '');
      const placeholderSelection = findPlaceholderSelection(editorState.code);
      lastSavedDraftRef.current = current?.draftCode ?? editorState.code;
      editorReadyRef.current = true;
      setCode(editorState.code);
      setEditorSelection(editorState.selection);
      setPendingInitialSelection(placeholderSelection);
      setUserMovedCursor(false);
      setResult(null);
      setShowSolution(false);
      setDraftStatus(current?.draftCode ? 'Rascunho recuperado' : '');
    }).catch(() => undefined);
  }, [challengeId]);

  useEffect(() => {
    if (!challenge || !editorReadyRef.current || code === lastSavedDraftRef.current) return undefined;
    setDraftStatus('Salvando rascunho...');
    const timeout = setTimeout(() => {
      codeLabService.load()
        .then((current) => codeLabService.saveDraft(current, challenge.id, code))
        .then((next) => {
          lastSavedDraftRef.current = code;
          setProgress(next);
          setDraftStatus('Rascunho salvo');
        })
        .catch(() => setDraftStatus('Não foi possível salvar o rascunho agora.'));
    }, 700);
    draftTimeoutRef.current = timeout;
    return () => {
      if (draftTimeoutRef.current === timeout) draftTimeoutRef.current = null;
      clearTimeout(timeout);
    };
  }, [challenge, code]);

  if (!challenge) {
    return (
      <GradientScreen>
        <GameCard>
          <Text style={{ color: colors.text }}>Desafio do laboratório não encontrado.</Text>
          <GameButton title="Voltar" onPress={goBack} />
        </GameCard>
      </GradientScreen>
    );
  }

  const validate = async () => {
    if (saving) return;
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
      draftTimeoutRef.current = null;
    }
    setSaving(true);
    try {
      const validation = validateCodeLabSolution(challenge, code);
      setResult(validation);
      const current = await codeLabService.load();
      let next = await codeLabService.recordValidation(current, {
        challengeId: challenge.id,
        code,
        score: validation.score,
        passed: validation.passed,
        passedChecks: validation.checks.filter((check) => check.passed).length,
        totalChecks: validation.checks.length
      });
      const attempt = next.attemptsByChallengeId[challenge.id];
      if (validation.passed && !attempt.rewarded) {
        awardCampaignReward(challenge.xpReward, challenge.coinReward, ['code-lab-first-valid'], { type: 'challenge', xp: challenge.xpReward, language: challenge.areaId });
        next = await codeLabService.markRewarded(next, challenge.id);
      }
      await adaptiveLearningService.recordAttempt({
        conceptId: challenge.concept,
        language: challenge.language,
        source: 'codeLab',
        difficulty: challenge.difficulty,
        correct: validation.passed,
        hintsUsed: usedHints
      }).catch(() => undefined);
      if (!validation.passed) {
        const failed = validation.checks.filter((check) => !check.passed).map((check) => check.message).join(' • ');
        await reviewService.saveCodeLabError({
          challengeId: challenge.id,
          prompt: challenge.title,
          areaId: challenge.areaId,
          concept: challenge.concept,
          difficulty: challenge.difficulty,
          selectedAnswer: code.slice(0, 1200),
          correctAnswer: 'Revise os pontos de validação antes de ver a solução comentada.',
          explanation: validation.feedback,
          hint: failed || challenge.hints[0],
          codeExample: code,
          failedValidation: failed
        });
      }
      if (validation.passed) {
        lastSavedDraftRef.current = '';
        setDraftStatus('Desafio concluído. Rascunho limpo.');
      }
      setProgress(next);
    } finally {
      setSaving(false);
    }
  };

  const showNextHint = async () => {
    if (usedHints >= challenge.hints.length) return;
    const current = await codeLabService.load();
    const next = await codeLabService.recordHint(current, challenge.id);
    setProgress(next);
  };

  const revealSolution = async () => {
    const current = await codeLabService.load();
    const next = await codeLabService.markSolutionViewed(current, challenge.id, code);
    setProgress(next);
    setShowSolution(true);
  };

  const applyCode = (nextCode: string, selection?: CodeLabSelection) => {
    setCode(nextCode);
    if (selection) setEditorSelection(selection);
    setPendingInitialSelection(null);
  };

  const applyStarterCode = async () => {
    const editorState = createEditorPlaceholderState(undefined, challenge.starterCode);
    const placeholderSelection = findPlaceholderSelection(editorState.code);
    const current = await codeLabService.load();
    const next = await codeLabService.clearDraft(current, challenge.id);
    setProgress(next);
    lastSavedDraftRef.current = editorState.code;
    setCode(editorState.code);
    setEditorSelection(editorState.selection);
    setPendingInitialSelection(placeholderSelection);
    setUserMovedCursor(false);
    setResult(null);
    setDraftStatus('Código inicial restaurado.');
  };

  const restoreStarter = () => {
    if (code !== challenge.starterCode) {
      Alert.alert('Restaurar código inicial', 'Seu código atual será substituído pelo modelo inicial.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', onPress: () => { void applyStarterCode(); } }
      ]);
      return;
    }
    void applyStarterCode();
  };

  const restoreHistoryEntry = (historyId: string, nextCode: string) => {
    Alert.alert('Restaurar tentativa', 'Seu código atual será substituído por esta tentativa salva.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Restaurar',
        onPress: () => {
          setCode(nextCode);
          setEditorSelection({ start: 0, end: 0 });
          setPendingInitialSelection(null);
          setResult(null);
          setDraftStatus('Tentativa restaurada como rascunho.');
          lastSavedDraftRef.current = '';
        }
      }
    ]);
  };

  const deleteHistoryEntry = (historyId: string) => {
    Alert.alert('Excluir tentativa', 'Esta tentativa será removida do histórico local do desafio.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          codeLabService.load()
            .then((current) => codeLabService.deleteHistoryEntry(current, challenge.id, historyId))
            .then(setProgress)
            .catch(() => undefined);
        }
      }
    ]);
  };

  const selectNextPlaceholder = () => {
    const next = findNextPlaceholderSelection(code, editorSelection.end);
    if (!next) return;
    setEditorSelection(next);
    setPendingInitialSelection(null);
    setUserMovedCursor(false);
  };

  const handleEditorSelectionChange = (selection: CodeLabSelection) => {
    setEditorSelection(selection);
    if (pendingInitialSelection && selection.start === pendingInitialSelection.start && selection.end === pendingInitialSelection.end) return;
    setUserMovedCursor(true);
    setPendingInitialSelection(null);
  };

  const handleEditorFocus = () => {
    if (!pendingInitialSelection || userMovedCursor) return;
    setEditorSelection(pendingInitialSelection);
  };

  const failedValidations = result?.checks.filter((check) => !check.passed).map((check) => check.message) ?? [];
  const history = savedAttempt?.history?.slice(0, 4) ?? [];

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
          <GameCard style={{ borderColor: colors.primary }}>
            <Text style={[styles.kicker, { color: colors.primary }]}>{challenge.language} • {challenge.difficulty}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{challenge.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{challenge.objective}</Text>
            <Text style={[styles.context, { color: colors.text }]}>{challenge.context}</Text>
            <Text style={[styles.small, { color: colors.muted }]}>Tentativas: {savedAttempt?.attempts ?? 0} • melhor pontuação {savedAttempt?.bestScore ?? 0}% • dicas usadas {usedHints}</Text>
          </GameCard>

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Editor</Text>
            <CodeLabEditor
              code={code}
              onChangeCode={applyCode}
              selection={editorSelection}
              onSelectionChange={handleEditorSelectionChange}
              onFocus={handleEditorFocus}
            />
            {draftStatus ? <Text style={[styles.draftStatus, { color: draftStatus.includes('Não foi') ? colors.warning : colors.muted }]}>{draftStatus}</Text> : null}
            <View style={styles.actions}>
              {hasExactPlaceholder(code) ? (
                <GameButton
                  title="Próxima lacuna"
                  icon="arrow-forward-circle"
                  variant="secondary"
                  onPress={selectNextPlaceholder}
                  accessibilityLabel="Ir para a próxima lacuna"
                  accessibilityHint="Seleciona o próximo espaço que precisa ser preenchido no código"
                  style={styles.actionButton}
                />
              ) : null}
              <GameButton title="Restaurar código inicial" icon="refresh" variant="secondary" onPress={restoreStarter} style={styles.actionButton} />
              <GameButton title="Validar solução" icon="checkmark" onPress={validate} loading={saving} disabled={saving} style={styles.actionButton} />
            </View>
          </GameCard>

          {history.length ? (
            <GameCard>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Histórico recente</Text>
              {history.map((entry) => (
                <View key={entry.id} style={[styles.historyRow, { borderColor: colors.border }]}>
                  <View style={styles.historyCopy}>
                    <Text style={[styles.item, { color: colors.text }]}>Tentativa {entry.attemptNumber} • {entry.score}% • {entry.passed ? 'passou' : 'revisar'}</Text>
                    <Text style={[styles.historyMeta, { color: colors.muted }]}>{new Date(entry.attemptedAt).toLocaleString('pt-BR')}</Text>
                  </View>
                  <View style={styles.historyActions}>
                    <GameButton title="Restaurar" variant="secondary" onPress={() => restoreHistoryEntry(entry.id, entry.code)} style={styles.historyButton} />
                    <GameButton title="Excluir" variant="ghost" onPress={() => deleteHistoryEntry(entry.id)} style={styles.historyButton} />
                  </View>
                </View>
              ))}
            </GameCard>
          ) : null}

          {result ? <CodeLabValidationFeedback result={result} /> : null}

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ajuda progressiva</Text>
            {visibleHints.length ? visibleHints.map((hint, index) => <Text key={hint} style={[styles.item, { color: colors.muted }]}>Dica {index + 1}: {hint}</Text>) : <Text style={[styles.subtitle, { color: colors.muted }]}>Use uma dica por vez quando travar.</Text>}
            <View style={styles.actions}>
              <GameButton title="Ver dica" icon="bulb" variant="secondary" onPress={showNextHint} disabled={usedHints >= challenge.hints.length} style={styles.actionButton} />
              <GameButton title="Ver solução comentada" icon="book" variant="secondary" onPress={revealSolution} style={styles.actionButton} />
            </View>
          </GameCard>

          {showSolution ? (
            <GameCard style={{ borderColor: colors.secondary }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Solução comentada</Text>
              <CodeBlock code={challenge.solution} />
              <Text style={[styles.subtitle, { color: colors.muted }]}>{challenge.solutionExplanation}</Text>
            </GameCard>
          ) : null}

          <GameButton
            title="Perguntar ao Professor Byte"
            icon="chatbubbles"
            variant="secondary"
            onPress={() =>
              navigate({
                name: 'professorByte',
                initialPrompt: 'Dê apenas uma dica para meu desafio do Laboratório de Código',
                context: {
                  source: 'codeLab',
                  topic: challenge.title,
                  language: challenge.language,
                  concept: challenge.concept,
                  code,
                  failedValidations,
                  usedHints,
                  challengePrompt: challenge.objective
                },
                returnTo: { name: 'codeLabChallenge', challengeId: challenge.id }
              })
            }
          />

          {nextChallenge ? <GameButton title="Próximo exercício" icon="arrow-forward" onPress={() => navigate({ name: 'codeLabChallenge', challengeId: nextChallenge.id })} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 28, lineHeight: 32, fontWeight: '900', marginTop: 4 },
  sectionTitle: { fontSize: 20, lineHeight: 24, fontWeight: '900', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  context: { fontSize: 15, lineHeight: 22, marginTop: 12 },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '800', marginTop: 12 },
  item: { fontSize: 13, lineHeight: 19, marginTop: 6, fontWeight: '800' },
  draftStatus: { fontSize: 12, lineHeight: 16, fontWeight: '800', marginTop: 8 },
  historyRow: { borderWidth: 1, borderRadius: 10, padding: 10, gap: 8, marginTop: 8 },
  historyCopy: { gap: 2 },
  historyMeta: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  historyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyButton: { flexBasis: 112, flexGrow: 1, minHeight: 40 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  actionButton: { flexBasis: 150, flexGrow: 1 }
});
