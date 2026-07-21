import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameButton } from '../components/GameButton';
import { GameCard } from '../components/GameCard';
import { GradientScreen } from '../components/GradientScreen';
import { shopItems } from '../data/shop';
import { usePlayer } from '../hooks/usePlayer';
import { useSettings } from '../hooks/useSettings';
import { releaseConfig } from '../services/releaseConfig';

export function ShopScreen({ goBack, openPremium }: { goBack: () => void; openPremium?: () => void }) {
  const { colors } = useSettings();
  const { profile, buyItem } = usePlayer();
  const visibleItems = releaseConfig.commercialFeaturesEnabled ? shopItems : shopItems.filter((item) => !item.premium);

  return (
    <GradientScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <GameButton title="Voltar" icon="chevron-back" variant="ghost" onPress={goBack} />
        <GameCard style={{ borderColor: colors.premium }}>
          <View style={styles.shopHero}>
            <View style={[styles.walletIcon, { backgroundColor: colors.surfaceGlow, borderColor: colors.premium }]}>
              <Ionicons name="diamond" size={28} color={colors.premium} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]}>Loja</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Moedas: {profile.coins}. Use moedas ganhas no jogo para personalizar sua jornada.</Text>
            </View>
          </View>
        </GameCard>
        {openPremium ? <GameButton title="Ver CodeQuest Premium" icon="diamond" onPress={openPremium} /> : null}
        {visibleItems.map((item) => {
          const owned = profile.ownedItems.includes(item.id);
          return (
            <GameCard key={item.id}>
              <View style={styles.row}>
                <View style={[styles.preview, { backgroundColor: item.premium ? colors.accent : colors.primary, borderColor: item.premium ? colors.premium : colors.glow }]}>
                  <Text style={[styles.previewText, { color: colors.onAccent }]}>{item.preview}</Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                    <View style={[styles.badge, { backgroundColor: owned ? colors.success : item.premium ? colors.premium : colors.surfaceGlow }]}>
                      <Text style={[styles.badgeText, { color: colors.onAccent }]}>{owned ? 'Seu' : item.premium ? 'Premium' : 'Loja'}</Text>
                    </View>
                  </View>
                  <Text style={[styles.subtitle, { color: colors.muted }]}>{item.description}</Text>
                  <Text style={[styles.price, { color: colors.accent }]}>{owned ? 'Comprado' : `${item.price} moedas`}</Text>
                </View>
              </View>
              <GameButton title={owned ? 'Disponivel' : 'Comprar'} icon="cart" variant="secondary" disabled={owned || item.premium} onPress={() => buyItem(item)} />
            </GameCard>
          );
        })}
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 36 },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 13, lineHeight: 19 },
  shopHero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  walletIcon: { width: 64, height: 64, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  preview: { width: 68, height: 68, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  previewText: { fontWeight: '900', fontSize: 18 },
  info: { flex: 1 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  itemTitle: { fontWeight: '900', fontSize: 17 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  price: { marginTop: 6, fontWeight: '900' }
});
