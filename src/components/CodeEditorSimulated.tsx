import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { CodeChallenge } from '../types/codeArena';

export function CodeEditorSimulated({
  challenge,
  selected,
  onSelect
}: {
  challenge: CodeChallenge;
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const { colors } = useSettings();
  const lines = challenge.code.split('\n');

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.kind, { color: colors.accent }]}>{challenge.kind} • {challenge.language}</Text>
      <View style={[styles.editor, { backgroundColor: colors.surfaceSoft }]}>
        {lines.map((line, index) => (
          <View key={`${line}-${index}`} style={styles.line}>
            <Text style={[styles.lineNo, { color: colors.muted }]}>{index + 1}</Text>
            <Text style={[styles.code, { color: colors.text }]}>{line}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.hint, { color: colors.muted }]}>Professor Byte: {challenge.hint}</Text>
      <View style={styles.options}>
        {challenge.options.map((option, index) => {
          const correct = selected !== null && index === challenge.correctIndex;
          const wrong = selected === index && !correct;
          return (
            <Pressable key={option} onPress={() => onSelect(index)} disabled={selected !== null} style={[styles.option, { borderColor: colors.border, backgroundColor: correct ? colors.success : wrong ? colors.danger : colors.surface }]}>
              <Text style={[styles.optionText, { color: correct || wrong ? colors.onAccent : colors.text }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 8, padding: 14, gap: 12 },
  kind: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  editor: { borderRadius: 8, padding: 12, gap: 4 },
  line: { flexDirection: 'row', gap: 10 },
  lineNo: { width: 22, fontFamily: 'Courier', fontSize: 13 },
  code: { flex: 1, fontFamily: 'Courier', fontSize: 13, lineHeight: 19 },
  hint: { fontSize: 13, lineHeight: 18 },
  options: { gap: 10 },
  option: { borderWidth: 1, borderRadius: 8, padding: 12 },
  optionText: { fontWeight: '800' }
});
