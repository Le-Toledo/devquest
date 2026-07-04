import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { supabase } from '../services/supabaseClient';

type Props = {
  goBack: () => void;
  openRegister: () => void;
  openAccount: () => void;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function LoginScreen({ goBack, openRegister, openAccount }: Props) {
  const { colors } = useSettings();
  const { configured, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'error' | 'success' | 'info'>('error');
  const [errors, setErrors] = useState<FieldErrors>({});

  const busy = loading || submitting || recovering;
  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0 && !busy, [busy, email, password]);

  const validate = () => {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Informe seu e-mail.';
    else if (!isValidEmail(email)) next.email = 'Digite um e-mail válido.';
    if (!password) next.password = 'Informe sua senha.';
    else if (password.length < 6) next.password = 'A senha precisa ter pelo menos 6 caracteres.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setMessage('');
    setMessageTone('error');
    if (!validate()) return;

    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) {
      setMessage(result.error);
      setMessageTone('error');
      return;
    }
    openAccount();
  };

  const recoverPassword = async () => {
    setMessage('');
    setMessageTone('info');
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Informe seu e-mail para recuperar a senha.';
    else if (!isValidEmail(email)) next.email = 'Digite um e-mail válido para recuperar a senha.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!configured || !supabase) {
      setMessage('A recuperação de senha fica disponível quando a nuvem estiver configurada. Seu progresso local continua salvo.');
      setMessageTone('info');
      return;
    }

    setRecovering(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setRecovering(false);
    if (error) {
      setMessage('Não foi possível enviar a recuperação agora. Verifique o e-mail e tente novamente.');
      setMessageTone('error');
      return;
    }
    setMessage('Enviamos as instruções de recuperação para o seu e-mail.');
    setMessageTone('success');
  };

  const messageColor = messageTone === 'success' ? colors.success : messageTone === 'info' ? colors.secondary : colors.danger;

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} hitSlop={8} style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.72 : 1 }]}>
            <Ionicons name="chevron-back" size={18} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Voltar</Text>
          </Pressable>

          <View style={styles.hero}>
            <View style={[styles.logoMark, { backgroundColor: colors.surfaceGlow, borderColor: colors.primary }]}>
              <Ionicons name="terminal" size={28} color={colors.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.brand, { color: colors.primary }]}>CodeQuest Academy</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Aprenda programação jogando.</Text>
              <Text style={[styles.heroSubtitle, { color: colors.muted }]}>Entre para salvar progresso, sincronizar conquistas e continuar sua jornada dev.</Text>
            </View>
          </View>

          {!configured ? (
            <GameCard style={{ ...styles.noticeCard, borderColor: colors.warning }}>
              <View style={styles.noticeHeader}>
                <Ionicons name="cloud-offline" size={18} color={colors.warning} />
                <Text style={[styles.noticeTitle, { color: colors.text }]}>Nuvem ainda não ativada</Text>
              </View>
              <Text style={[styles.noticeCopy, { color: colors.muted }]}>O app segue funcionando offline. Quando o backend estiver configurado, login, recuperação e sync aparecem aqui automaticamente.</Text>
              <GameButton title="Continuar offline" icon="game-controller" variant="secondary" onPress={goBack} style={styles.offlineButton} />
            </GameCard>
          ) : (
            <GameCard style={{ ...styles.loginCard, borderColor: colors.primary }}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Entrar na sua conta</Text>
                <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Use o mesmo e-mail do seu progresso na nuvem.</Text>
              </View>

              <View style={styles.form}>
                <FieldLabel label="E-mail" error={errors.email} />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="voce@exemplo.com"
                  accessibilityLabel="Campo de e-mail"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                  }}
                  style={[styles.input, { backgroundColor: colors.surfaceSoft, borderColor: errors.email ? colors.danger : colors.border, color: colors.text }]}
                />
                {errors.email ? <Text style={[styles.fieldError, { color: colors.danger }]}>{errors.email}</Text> : null}

                <FieldLabel label="Senha" error={errors.password} />
                <View style={[styles.passwordWrap, { backgroundColor: colors.surfaceSoft, borderColor: errors.password ? colors.danger : colors.border }]}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect={false}
                    placeholder="Sua senha"
                    accessibilityLabel="Campo de senha"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
                    }}
                    style={[styles.passwordInput, { color: colors.text }]}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onPress={() => setShowPassword((current) => !current)}
                    hitSlop={8}
                    style={styles.eyeButton}
                  >
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
                  </Pressable>
                </View>
                {errors.password ? <Text style={[styles.fieldError, { color: colors.danger }]}>{errors.password}</Text> : null}

                <View style={styles.formLinks}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Esqueci minha senha" onPress={recoverPassword} disabled={busy} hitSlop={8}>
                    <Text style={[styles.linkText, { color: colors.secondary, opacity: busy ? 0.5 : 1 }]}>Esqueci minha senha</Text>
                  </Pressable>
                </View>

                {message ? (
                  <View style={[styles.messageBox, { borderColor: messageColor, backgroundColor: colors.surfaceSoft }]}>
                    <Ionicons name={messageTone === 'success' ? 'checkmark-circle' : messageTone === 'info' ? 'information-circle' : 'alert-circle'} size={17} color={messageColor} />
                    <Text style={[styles.messageText, { color: messageColor }]}>{message}</Text>
                  </View>
                ) : null}

                <GameButton title="Entrar" icon="log-in" onPress={submit} loading={loading || submitting} disabled={!canSubmit} />

                <View style={styles.registerRow}>
                  <Text style={[styles.registerCopy, { color: colors.muted }]}>Ainda não tem conta?</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Criar conta" onPress={openRegister} disabled={busy} hitSlop={8}>
                    <Text style={[styles.registerLink, { color: colors.primary, opacity: busy ? 0.5 : 1 }]}>Criar conta</Text>
                  </Pressable>
                </View>
              </View>
            </GameCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

function FieldLabel({ label, error }: { label: string; error?: string }) {
  const { colors } = useSettings();
  return (
    <Text style={[styles.label, { color: error ? colors.danger : colors.text }]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 18, gap: 14 },
  backButton: { minHeight: 40, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 12 },
  backText: { fontSize: 14, fontWeight: '900' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  brand: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  heroTitle: { fontSize: 25, lineHeight: 29, fontWeight: '900', marginTop: 2 },
  heroSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  loginCard: { padding: 16 },
  cardHeader: { marginBottom: 14 },
  cardTitle: { fontSize: 21, lineHeight: 25, fontWeight: '900' },
  cardSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  form: { gap: 8 },
  label: { fontSize: 13, fontWeight: '900', marginTop: 2 },
  input: { minHeight: 50, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  passwordWrap: { minHeight: 50, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, minHeight: 48, paddingHorizontal: 14, fontSize: 15 },
  eyeButton: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  fieldError: { fontSize: 12, lineHeight: 16, fontWeight: '800' },
  formLinks: { alignItems: 'flex-end', marginTop: 2 },
  linkText: { fontSize: 13, fontWeight: '900' },
  messageBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 2 },
  messageText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 4 },
  registerCopy: { fontSize: 13, fontWeight: '700' },
  registerLink: { fontSize: 13, fontWeight: '900' },
  noticeCard: { padding: 16 },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noticeTitle: { fontSize: 18, fontWeight: '900' },
  noticeCopy: { marginTop: 8, fontSize: 13, lineHeight: 19 },
  offlineButton: { marginTop: 14 }
});
