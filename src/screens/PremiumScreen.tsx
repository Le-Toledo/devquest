import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { premiumCatalog, premiumPlans } from '../data/premiumPlans';
import { useSettings } from '../hooks/useSettings';

export function PremiumScreen({ goBack }: { goBack: () => void }) {
  const { colors } = useSettings();
  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard style={{ borderColor: colors.accent }}>
          <Text style={[styles.kicker, { color: colors.accent }]}>Vitrine futura</Text>
          <Text style={[styles.title, { color: colors.text }]}>CodeQuest Premium</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Uma previa transparente dos beneficios planejados. Nenhum pagamento real esta ativo neste MVP.</Text>
        </GameCard>
        {premiumPlans.map((plan) => (
          <GameCard key={plan.id} style={{ borderColor: plan.highlighted ? colors.accent : colors.border }}>
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { color: colors.text }]}>{plan.title}</Text>
              <Text style={[styles.price, { color: plan.highlighted ? colors.accent : colors.primary }]}>{plan.priceLabel}</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{plan.description}</Text>
            {plan.benefits.map((benefit) => <Text key={benefit} style={[styles.benefit, { color: colors.text }]}>- {benefit}</Text>)}
          </GameCard>
        ))}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Loja premium futura</Text>
        {premiumCatalog.map((item) => (
          <GameCard key={item.title}>
            <Text style={[styles.planTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{item.description}</Text>
          </GameCard>
        ))}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  kicker: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { fontSize: 34, lineHeight: 38, fontWeight: '900', marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  planHeader: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  planTitle: { fontSize: 19, fontWeight: '900' },
  price: { fontSize: 18, fontWeight: '900' },
  benefit: { marginTop: 8, fontWeight: '700' },
  sectionTitle: { fontSize: 22, fontWeight: '900', marginTop: 8 }
});
