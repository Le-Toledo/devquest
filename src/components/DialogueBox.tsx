import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { characterById } from '../data/characters';
import { useSettings } from '../hooks/useSettings';
import { DialogueSequence } from '../types/campaign';
import { GameButton } from './GameButton';

export function DialogueBox({
  sequence,
  onDone,
  skippable = true,
  finalLabel = 'Continuar Jornada'
}: {
  sequence: DialogueSequence;
  onDone: () => void;
  skippable?: boolean;
  finalLabel?: string;
}) {
  const { colors } = useSettings();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const current = sequence.dialogues[index];
  const character = characterById(current.characterId);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [fade, index]);

  const next = () => {
    if (index + 1 >= sequence.dialogues.length) onDone();
    else setIndex((value) => value + 1);
  };

  return (
    <Animated.View style={[styles.wrap, { opacity: fade, backgroundColor: colors.surface, borderColor: character.color }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: character.color }]}>
          <Text style={[styles.avatarText, { color: colors.onAccent }]}>{character.avatar}</Text>
        </View>
        <View style={styles.nameWrap}>
          <Text style={[styles.name, { color: colors.text }]}>{character.name}</Text>
          <Text style={[styles.role, { color: colors.muted }]}>Professor Byte e aliados da jornada</Text>
        </View>
      </View>
      <Text style={[styles.text, { color: colors.text }]}>{current.text}</Text>
      <View style={styles.actions}>
        {skippable ? <GameButton title="Pular" variant="ghost" onPress={onDone} style={styles.button} /> : null}
        <GameButton title={index + 1 >= sequence.dialogues.length ? finalLabel : 'Continuar'} icon="chatbubble" onPress={next} style={styles.button} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 8, padding: 16, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '900' },
  nameWrap: { flex: 1 },
  name: { fontSize: 18, fontWeight: '900' },
  role: { fontSize: 12, marginTop: 2 },
  text: { fontSize: 18, lineHeight: 25, fontWeight: '800' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: { flexBasis: 120, flexGrow: 1, minHeight: 48 }
});
