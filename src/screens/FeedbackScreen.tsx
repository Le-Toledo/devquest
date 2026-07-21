import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionStateCard } from '../components/ActionStateCard';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useSettings } from '../hooks/useSettings';
import {
  feedbackLocalSavedMessage,
  feedbackMaxMessageLength,
  feedbackMinMessageLength,
  feedbackService,
  isDuplicateFeedbackTap,
  validateFeedbackMessage
} from '../services/feedbackService';
import { FeedbackVisualCategory } from '../types/feedback';

const categoryOptions: {
  id: FeedbackVisualCategory;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'bug_report', title: 'Reportar um bug', icon: 'bug' },
  { id: 'confusing_content', title: 'Aula ou conteúdo confuso', icon: 'school' },
  { id: 'bad_professor_byte_response', title: 'Professor Byte respondeu mal', icon: 'hardware-chip' },
  { id: 'visual_issue', title: 'Problema visual', icon: 'color-palette' },
  { id: 'suggestion', title: 'Enviar uma sugestão', icon: 'bulb' },
  { id: 'other', title: 'Outro', icon: 'chatbubble-ellipses' }
];

export function FeedbackScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useSettings();
  const [category, setCategory] = useState<FeedbackVisualCategory>('bug_report');
  const [message, setMessage] = useState('');
  const [screen, setScreen] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [queueSize, setQueueSize] = useState<number | null>(null);
  const lastSubmitAt = useRef(0);
  const trimmedMessage = message.trim();

  const validationError = useMemo(() => validateFeedbackMessage(message), [message]);
  const canSave = !validationError && !saving;

  const resetForm = () => {
    setMessage('');
    setScreen('');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const saveFeedback = async () => {
    const now = Date.now();
    if (!canSave || isDuplicateFeedbackTap(lastSubmitAt.current, now)) return;
    lastSubmitAt.current = now;
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const result = await feedbackService.saveLocalFeedback({
        visualCategory: category,
        message: trimmedMessage,
        screen,
        appVersion: Constants.expoConfig?.version,
        platform: Platform.OS
      });
      setSuccessMessage(result.message);
      setQueueSize(result.queueSize);
      setMessage('');
      setScreen('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar agora. Seu texto continua na tela.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />

          <GameCard style={{ borderColor: colors.primary }}>
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: colors.surfaceGlow, borderColor: colors.primary }]}>
                <Ionicons name="chatbubbles" size={28} color={colors.primary} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={[styles.kicker, { color: colors.primary }]}>Feedback do beta</Text>
                <Text style={[styles.title, { color: colors.text }]}>Ajude a melhorar o CodeQuest.</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Reporte um problema ou envie uma sugestão. Nesta etapa, tudo fica salvo apenas neste aparelho.</Text>
              </View>
            </View>
          </GameCard>

          {successMessage ? (
            <ActionStateCard
              title="Feedback salvo localmente"
              message={`${successMessage}${queueSize ? ` Há ${queueSize} registro${queueSize > 1 ? 's' : ''} pendente${queueSize > 1 ? 's' : ''} neste aparelho.` : ''}`}
              icon="checkmark-circle"
              tone="success"
              primaryAction={{ title: 'Escrever outro feedback', icon: 'create', onPress: resetForm }}
              secondaryAction={{ title: 'Voltar', icon: 'chevron-back', onPress: goBack, variant: 'secondary' }}
            />
          ) : null}

          {errorMessage ? (
            <ActionStateCard
              title="Não deu para salvar"
              message={errorMessage}
              icon="warning"
              tone="error"
            />
          ) : null}

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tipo de feedback</Text>
            <View style={styles.categoryGrid}>
              {categoryOptions.map((item) => (
                <GameButton
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  variant={category === item.id ? 'primary' : 'secondary'}
                  onPress={() => setCategory(item.id)}
                  disabled={saving}
                  style={styles.categoryButton}
                />
              ))}
            </View>
          </GameCard>

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Descrição</Text>
            <TextInput
              multiline
              value={message}
              onChangeText={setMessage}
              placeholder="Ex.: Na Academia Dev, a explicação de condicionais ficou confusa depois do exemplo..."
              placeholderTextColor={colors.muted}
              maxLength={feedbackMaxMessageLength}
              editable={!saving}
              textAlignVertical="top"
              accessibilityLabel="Descrição do feedback"
              style={[
                styles.messageInput,
                {
                  color: colors.text,
                  borderColor: validationError && message ? colors.warning : colors.border,
                  backgroundColor: colors.surfaceSoft
                }
              ]}
            />
            <View style={styles.inputFooter}>
              <Text style={[styles.helper, { color: validationError ? colors.warning : colors.muted }]}>
                {validationError || 'Seja específico: tela, ação e o que você esperava ajudam muito.'}
              </Text>
              <Text style={[styles.counter, { color: colors.muted }]}>{trimmedMessage.length}/{feedbackMaxMessageLength}</Text>
            </View>
          </GameCard>

          <GameCard>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tela ou área opcional</Text>
            <TextInput
              value={screen}
              onChangeText={setScreen}
              placeholder="Ex.: Arena de Código, Perfil, Professor Byte..."
              placeholderTextColor={colors.muted}
              editable={!saving}
              maxLength={80}
              accessibilityLabel="Tela ou área relacionada ao feedback"
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}
            />
            <Text style={[styles.helper, { color: colors.muted }]}>Não inclua senha, token, chave, e-mail ou dados pessoais.</Text>
          </GameCard>

          <ActionStateCard
            title="Salvamento local"
            message={feedbackLocalSavedMessage}
            icon="phone-portrait"
            tone="info"
            embedded
          />

          <GameButton
            title="Salvar feedback"
            icon="save"
            onPress={saveFeedback}
            loading={saving}
            disabled={!canSave}
            accessibilityHint={`A mensagem precisa ter entre ${feedbackMinMessageLength} e ${feedbackMaxMessageLength} caracteres.`}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 14, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: { width: 58, height: 58, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  kicker: { fontSize: 12, lineHeight: 16, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 25, lineHeight: 30, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  sectionTitle: { fontSize: 18, lineHeight: 23, fontWeight: '900', marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: { flexBasis: 142, flexGrow: 1, minHeight: 48 },
  messageInput: { minHeight: 150, borderRadius: 8, borderWidth: 1, padding: 12, fontSize: 15, lineHeight: 21 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },
  inputFooter: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginTop: 8 },
  helper: { flex: 1, fontSize: 12, lineHeight: 18 },
  counter: { fontSize: 12, lineHeight: 18, fontWeight: '900' }
});
