import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

export function ProfessorByteScreen({ goBack, initialPrompt, context }: { goBack: () => void; initialPrompt?: string; context?: AiTutorContext }) {
  const { colors } = useSettings();
  const [messages, setMessages] = useState<AiTutorMessage[]>([]);
  const [input, setInput] = useState(initialPrompt ?? '');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AiTutorMode>(aiTutorService.isRemoteConfigured ? 'remote' : 'mock');
  const [warning, setWarning] = useState(aiTutorService.isRemoteConfigured ? '' : 'Modo Professor Byte offline');

  const intro = useMemo<AiTutorMessage>(() => ({
    id: 'professor-byte-intro',
    role: 'assistant',
    content: 'Oi, eu sou o Professor Byte. Posso explicar erros, revisar código, criar desafios e treinar entrevista com você.',
    createdAt: new Date().toISOString()
  }), []);

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
    setInput('');
    setLoading(true);
    const userMessage = aiTutorService.createUserMessage(content);
    const withUser = [...messages, userMessage];
    setMessages(withUser);
    const response = await aiTutorService.ask({ message: content, history: messages, context });
    const next = [...withUser, response.message];
    setMode(response.mode);
    setWarning(response.warning ?? '');
    await persist(next);
    setLoading(false);
  };

  const clear = async () => {
    await aiTutorService.clearHistory();
    setMessages([intro]);
    setWarning(aiTutorService.isRemoteConfigured ? '' : 'Modo Professor Byte offline');
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
            {warning ? <Text style={[styles.warning, { color: colors.warning }]}>{warning}</Text> : null}
          </GameCard>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
            {suggestions.map((item) => (
              <GameButton key={item} title={item} variant="secondary" onPress={() => send(item)} style={styles.suggestionButton} />
            ))}
          </ScrollView>

          {messages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble, { backgroundColor: message.role === 'user' ? colors.primary : colors.surfaceGlow, borderColor: message.role === 'user' ? colors.primary : colors.border }]}>
              <Text style={[styles.bubbleLabel, { color: message.role === 'user' ? colors.onAccent : colors.accent }]}>{message.role === 'user' ? 'Você' : 'Professor Byte'}</Text>
              <Text style={[styles.bubbleText, { color: message.role === 'user' ? colors.onAccent : colors.text }]}>{message.content}</Text>
            </View>
          ))}

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
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}
            />
            <View style={styles.actions}>
              <GameButton title="Enviar" icon="send" onPress={() => send()} loading={loading} disabled={!input.trim()} style={styles.actionButton} />
              <GameButton title="Limpar" icon="trash" variant="secondary" onPress={clear} style={styles.actionButton} />
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
  warning: { marginTop: 12, fontSize: 12, fontWeight: '900' },
  suggestions: { gap: 8 },
  suggestionButton: { minHeight: 48 },
  bubble: { borderWidth: 1, borderRadius: 16, padding: 14, maxWidth: '92%' },
  userBubble: { alignSelf: 'flex-end' },
  assistantBubble: { alignSelf: 'flex-start' },
  bubbleLabel: { fontSize: 12, fontWeight: '900', marginBottom: 6 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  input: { minHeight: 96, borderRadius: 8, borderWidth: 1, padding: 12, textAlignVertical: 'top', fontSize: 15, lineHeight: 21 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  actionButton: { flexBasis: 132, flexGrow: 1 }
});
