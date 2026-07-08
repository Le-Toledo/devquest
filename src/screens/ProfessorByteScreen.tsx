import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionStateCard } from '../components/ActionStateCard';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useSettings } from '../hooks/useSettings';
import { aiTutorService } from '../services/aiTutorService';
import { AiTutorContext, AiTutorMessage, AiTutorMode } from '../types/aiTutor';

const suggestions = [
  'Explique meu erro',
  'Me ensine Kotlin null safety',
  'Crie um desafio de JavaScript',
  'Analise meu código',
  'Me ajude na entrevista'
];

const quickActions = [
  { title: 'Explicar mais simples', icon: 'accessibility' as const, prompt: 'Explique a resposta anterior de um jeito mais simples, como se eu estivesse começando agora.' },
  { title: 'Só uma dica', icon: 'bulb' as const, prompt: 'Me dê apenas uma dica curta, sem entregar a resposta completa.' },
  { title: 'Criar exemplo', icon: 'code-slash' as const, prompt: 'Crie um exemplo prático em código, com nomes em português e explicação curta.' },
  { title: 'Mini desafio', icon: 'fitness' as const, prompt: 'Crie um mini desafio rápido para eu praticar esse conceito agora.' }
];

export function ProfessorByteScreen({ goBack, initialPrompt, context }: { goBack: () => void; initialPrompt?: string; context?: AiTutorContext }) {
  const { colors } = useSettings();
  const [messages, setMessages] = useState<AiTutorMessage[]>([]);
  const [input, setInput] = useState(initialPrompt ?? '');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AiTutorMode>(aiTutorService.isRemoteConfigured ? 'remote' : 'mock');
  const [warning, setWarning] = useState(aiTutorService.isRemoteConfigured ? '' : 'Modo Professor Byte offline');
  const [lastPrompt, setLastPrompt] = useState(initialPrompt ?? '');

  const intro = useMemo<AiTutorMessage>(() => ({
    id: 'professor-byte-intro',
    role: 'assistant',
    content: 'Oi, eu sou o Professor Byte. Posso explicar erros, revisar código, criar desafios e treinar entrevista com você.',
    createdAt: new Date().toISOString()
  }), []);
  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant' && message.id !== intro.id),
    [intro.id, messages]
  );

  useEffect(() => {
    aiTutorService.loadHistory().then((history) => setMessages(history.length ? history : [intro])).catch(() => setMessages([intro]));
  }, [intro]);

  const persist = async (next: AiTutorMessage[]) => {
    setMessages(next);
    await aiTutorService.saveHistory(next.filter((item) => item.id !== intro.id));
  };

  const send = async (text = input) => {
    const content = text.trim();
    if (!content || loading) return;
    if (__DEV__) console.log('[ProfessorByteAI] Botão clicado');
    setInput('');
    setLoading(true);
    setLastPrompt(content);
    const userMessage = aiTutorService.createUserMessage(content);
    const withUser = [...messages, userMessage];
    setMessages(withUser);
    try {
      const response = await aiTutorService.ask({ message: content, history: messages, context });
      const next = [...withUser, response.message];
      setMode(response.mode);
      setWarning(response.warning ?? '');
      await persist(next);
    } catch {
      setMode('mock');
      setWarning('Não consegui falar com a IA real agora. Você pode continuar com ajuda local ou tentar novamente.');
      await persist([
        ...withUser,
        {
          id: `professor-byte-error-${Date.now()}`,
          role: 'assistant',
          content: 'Tive uma falha de conexão, mas seu estudo não precisa parar. Tente reenviar a pergunta ou continue no modo offline.',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    await aiTutorService.clearHistory();
    setMessages([intro]);
    setWarning(aiTutorService.isRemoteConfigured ? '' : 'Modo Professor Byte offline');
    setLastPrompt('');
  };

  const sendQuickAction = (prompt: string) => {
    const contextText = lastAssistantMessage?.content ? `\n\nContexto da última resposta:\n${lastAssistantMessage.content.slice(0, 900)}` : '';
    send(`${prompt}${contextText}`).catch(() => undefined);
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
          <GameCard style={{ borderColor: mode === 'remote' ? colors.primary : colors.warning }}>
            <View style={styles.heroRow}>
              <View style={[styles.byteAvatar, { backgroundColor: colors.surfaceGlow, borderColor: mode === 'remote' ? colors.primary : colors.warning }]}>
                <Ionicons name="hardware-chip" size={30} color={mode === 'remote' ? colors.primary : colors.warning} />
                <Text style={[styles.byteInitials, { color: colors.text }]}>PB</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.kicker, { color: mode === 'remote' ? colors.primary : colors.warning }]}>Professor Byte</Text>
                <Text style={[styles.title, { color: colors.text }]}>Tutor inteligente de código.</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Pergunte sobre erros, linguagens, carreira ou cole código para uma revisão didática.</Text>
              </View>
            </View>
          </GameCard>

          {warning ? (
            <ActionStateCard
              title={mode === 'remote' ? 'Aviso do Professor Byte' : 'Professor Byte em modo offline'}
              message={`${warning}. O chat continua funcionando com respostas locais para você não perder o ritmo.`}
              icon="cloud-offline"
              tone="warning"
              primaryAction={lastPrompt ? { title: 'Tentar novamente', icon: 'refresh', onPress: () => send(lastPrompt), loading, disabled: loading } : undefined}
              secondaryAction={{ title: 'Continuar offline', icon: 'phone-portrait', onPress: () => setWarning(''), variant: 'secondary' }}
            />
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
            {suggestions.map((item) => (
              <GameButton key={item} title={item} variant="secondary" onPress={() => send(item)} disabled={loading} style={styles.suggestionButton} />
            ))}
          </ScrollView>

          {messages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble, { backgroundColor: message.role === 'user' ? colors.primary : colors.surfaceGlow, borderColor: message.role === 'user' ? colors.primary : colors.border }]}>
              <Text style={[styles.bubbleLabel, { color: message.role === 'user' ? colors.onAccent : colors.accent }]}>{message.role === 'user' ? 'Você' : 'Professor Byte'}</Text>
              <Text style={[styles.bubbleText, { color: message.role === 'user' ? colors.onAccent : colors.text }]}>{message.content}</Text>
            </View>
          ))}

          {lastAssistantMessage && !loading ? (
            <GameCard>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Ações rápidas</Text>
              <Text style={[styles.quickSubtitle, { color: colors.muted }]}>Use a última resposta como contexto para continuar estudando.</Text>
              <View style={styles.quickGrid}>
                {quickActions.map((action) => (
                  <GameButton key={action.title} title={action.title} icon={action.icon} variant="secondary" onPress={() => sendQuickAction(action.prompt)} style={styles.quickButton} />
                ))}
              </View>
            </GameCard>
          ) : null}

          {loading ? (
            <GameCard>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Professor Byte está pensando...</Text>
            </GameCard>
          ) : null}

          <GameCard>
            <TextInput
              multiline
              placeholder="Digite sua dúvida ou cole um trecho de código..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              maxLength={1600}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}
            />
            <Text style={[styles.inputHint, { color: colors.muted }]}>{input.trim().length}/1600 caracteres. Perguntas menores recebem respostas melhores.</Text>
            <View style={styles.actions}>
              <GameButton title="Enviar" icon="send" onPress={() => send()} loading={loading} disabled={!input.trim() || loading} style={styles.actionButton} />
              <GameButton title="Limpar" icon="trash" variant="secondary" onPress={clear} disabled={loading} style={styles.actionButton} />
            </View>
          </GameCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroCopy: { flex: 1 },
  byteAvatar: { width: 70, height: 70, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  byteInitials: { fontSize: 12, fontWeight: '900', marginTop: 2 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  suggestions: { gap: 8 },
  suggestionButton: { minHeight: 48 },
  bubble: { borderWidth: 1, borderRadius: 16, padding: 14, maxWidth: '92%' },
  userBubble: { alignSelf: 'flex-end' },
  assistantBubble: { alignSelf: 'flex-start' },
  bubbleLabel: { fontSize: 12, fontWeight: '900', marginBottom: 6 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  quickTitle: { fontSize: 17, lineHeight: 22, fontWeight: '900' },
  quickSubtitle: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  quickButton: { flexBasis: 136, flexGrow: 1, minHeight: 48 },
  input: { minHeight: 96, borderRadius: 8, borderWidth: 1, padding: 12, textAlignVertical: 'top', fontSize: 15, lineHeight: 21 },
  inputHint: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  actionButton: { flexBasis: 132, flexGrow: 1 }
});
