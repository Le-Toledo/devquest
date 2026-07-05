import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

type Props = {
  goBack: () => void;
  openLogin: () => void;
  openAccount: () => void;
};

export function RegisterScreen({ goBack, openLogin, openAccount }: Props) {
  const { colors } = useSettings();
  const { configured, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    setSubmitting(true);
    setMessage('');
    const result = await signUp(email, password);
    setSubmitting(false);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage('Conta criada. Se o Supabase exigir confirmação, confira seu e-mail antes de entrar.');
    openAccount();
  };

  return (
    <GradientScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
          <Text style={[styles.title, { color: colors.text }]}>Crie sua conta dev</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Seu progresso continua no aparelho e ganha backup quando a nuvem estiver ativa.</Text>

          {!configured ? (
            <GameCard style={{ borderColor: colors.warning }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Modo offline ativo</Text>
              <Text style={[styles.copy, { color: colors.muted }]}>Cadastro fica indisponível até a nuvem ser configurada. Seus saves locais continuam protegidos no aparelho.</Text>
            </GameCard>
          ) : (
            <GameCard>
              <View style={styles.form}>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="email@exemplo.com"
                  accessibilityLabel="E-mail"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.input, { backgroundColor: colors.surfaceSoft, borderColor: colors.border, color: colors.text }]}
                />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="password"
                  placeholder="Senha com pelo menos 6 caracteres"
                  accessibilityLabel="Senha"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, { backgroundColor: colors.surfaceSoft, borderColor: colors.border, color: colors.text }]}
                />
                {message ? <Text style={[styles.message, { color: message.includes('criada') ? colors.success : colors.danger }]}>{message}</Text> : null}
                <GameButton title="Criar minha conta" icon="person-add" onPress={submit} loading={submitting} disabled={!email || password.length < 6} />
                <GameButton title="Já tenho conta" icon="log-in" variant="secondary" onPress={openLogin} />
              </View>
            </GameCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 15, lineHeight: 21 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  copy: { marginTop: 8, lineHeight: 20 },
  form: { gap: 12 },
  input: { minHeight: 52, borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, fontSize: 16 },
  message: { fontWeight: '800', lineHeight: 20 }
});
