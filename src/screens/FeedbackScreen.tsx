import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionStateCard } from '../components/ActionStateCard';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { feedbackService } from '../services/feedbackService';
import { FeedbackCategory } from '../types/backend';

const categories: { id: FeedbackCategory; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'bug', title: 'Bug', icon: 'bug' },
  { id: 'idea', title: 'Ideia', icon: 'bulb' },
  { id: 'content', title: 'Conteúdo', icon: 'school' },
  { id: 'ux', title: 'Experiência', icon: 'sparkles' },
  { id: 'other', title: 'Outro', icon: 'chatbubble-ellipses' }
];

const minMessageLength = 10;
const maxMessageLength = 1500;

export function FeedbackScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useSettings();
  const { user } = useAuth();
  const { profile } = usePlayer();
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'warning' | 'error'; title: string; message: string } | null>(null);
  const [localCount, setLocalCount] = useState(0);

  useEffect(() => {
    feedbackService.loadLocalReports().then((reports) => setLocalCount(reports.length)).catch(() => undefined);
  }, []);

  const trimmedMessage = message.trim();
  const validationError = useMemo(() => {
    if (!trimmedMessage) return 'Descreva rapidamente o que aconteceu ou o que você gostaria de melhorar.';
    if (trimmedMessage.length < minMessageLength) return `Escreva pelo menos ${minMessageLength} caracteres para eu entender melhor.`;
    if (trimmedMessage.length > maxMessageLength) return `Use até ${maxMessageLength} caracteres.`;
    return '';
  }, [trimmedMessage]);

  const submit = async () => {
    if (validationError || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const response = await feedbackService.submit({ category, message: trimmedMessage, contactEmail, user, profile });
      setResult({
        tone: response.status === 'synced' ? 'success' : 'warning',
        title: response.status === 'synced' ? 'Feedback enviado' : 'Feedback salvo localmente',
        message: response.message
      });
      if (response.status === 'local') setLocalCount((current) => current + 1);
      setMessage('');
    } catch {
      setResult({
        tone: 'error',
        title: 'Não deu para registrar agora',
        message: 'Tente novamente em instantes. Seu texto continua na tela para você não perder o relato.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />

          <GameCard style={{ borderColor: colors.primary }}>
            <View style={styles.heroRow}>
              <View style={[styles.heroIcon, { backgroundColor: colors.surfaceGlow, borderColor: colors.primary }]}>
                <Ionicons name="chatbubbles" size={30} color={colors.primary} />
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.kicker, { color: colors.primary }]}>Beta do CodeQuest</Text>
                <Text style={[styles.title, { color: colors.text }]}>Ajude a melhorar o app.</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Reporte bugs, ideias ou pontos confusos. Eu envio junto dados técnicos básicos para facilitar a correção.</Text>
              </View>
            </View>
          </GameCard>

          {localCount > 0 ? (
            <ActionStateCard
              title="Feedbacks salvos no aparelho"
              message={`${localCount} relato${localCount > 1 ? 's' : ''} aguardando uma nuvem configurada ou disponível. Nada foi perdido.`}
              icon="phone-portrait"
              tone="warning"
            />
          ) : null}

          {result ? (
            <ActionStateCard
              title={result.title}
              message={result.message}
              icon={result.tone === 'success' ? 'checkmark-circle' : result.tone === 'warning' ? 'cloud-offline' : 'warning'}
              tone={result.tone}
              primaryAction={{ title: 'Escrever outro', icon: 'create', onPress: () => setResult(null) }}
              secondaryAction={{ title: 'Voltar', icon: 'chevron-back', onPress: goBack, variant: 'secondary' }}
            />
          ) : null}

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tipo de feedback</Text>
            <View style={styles.categoryGrid}>
              {categories.map((item) => (
                <GameButton
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  variant={category === item.id ? 'primary' : 'secondary'}
                  onPress={() => setCategory(item.id)}
                  disabled={submitting}
                  style={styles.categoryButton}
                />
              ))}
            </View>
          </GameCard>

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Conte o que aconteceu</Text>
            <TextInput
              multiline
              value={message}
              onChangeText={setMessage}
              placeholder="Ex.: Na Arena de Código, acertei a pergunta mas o botão demorou para avançar..."
              placeholderTextColor={colors.muted}
              maxLength={maxMessageLength}
              style={[styles.messageInput, { color: colors.text, borderColor: validationError && message ? colors.warning : colors.border, backgroundColor: colors.surfaceSoft }]}
              editable={!submitting}
              textAlignVertical="top"
            />
            <View style={styles.inputFooter}>
              <Text style={[styles.helper, { color: validationError ? colors.warning : colors.muted }]}>{validationError || 'Quanto mais específico, mais rápido eu consigo corrigir.'}</Text>
              <Text style={[styles.counter, { color: colors.muted }]}>{trimmedMessage.length}/{maxMessageLength}</Text>
            </View>
          </GameCard>

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contato opcional</Text>
            <TextInput
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!submitting}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}
            />
            <Text style={[styles.helper, { color: colors.muted }]}>Se estiver logado, seu ID de usuário e versão do app vão junto para diagnóstico. Senhas e chaves nunca são enviadas.</Text>
          </GameCard>

          <GameButton title="Enviar feedback" icon="send" onPress={submit} loading={submitting} disabled={Boolean(validationError) || submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcon: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 28, lineHeight: 33, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: { flexBasis: 132, flexGrow: 1, minHeight: 48 },
  messageInput: { minHeight: 142, borderRadius: 8, borderWidth: 1, padding: 12, fontSize: 15, lineHeight: 21 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },
  inputFooter: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginTop: 8 },
  helper: { flex: 1, fontSize: 12, lineHeight: 18 },
  counter: { fontSize: 12, fontWeight: '900' }
});
