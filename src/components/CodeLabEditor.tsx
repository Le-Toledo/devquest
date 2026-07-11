import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { CodeLabSelection, normalizePlaceholderInsertion, selectionAfterPlaceholderReplacement } from '../services/codeLabPlaceholderService';

export function CodeLabEditor({
  code,
  onChangeCode,
  selection,
  onSelectionChange,
  onFocus
}: {
  code: string;
  onChangeCode: (value: string, selection?: CodeLabSelection) => void;
  selection: CodeLabSelection;
  onSelectionChange: (selection: CodeLabSelection) => void;
  onFocus?: () => void;
}) {
  const { colors } = useSettings();
  const lineCount = Math.max(6, code.split('\n').length);
  const handleChangeText = (nextCode: string) => {
    const normalized = normalizePlaceholderInsertion(code, nextCode, selection);
    if (normalized) {
      onChangeCode(normalized.code, normalized.selection);
      return;
    }
    onChangeCode(nextCode, selectionAfterPlaceholderReplacement(code, nextCode, selection) ?? undefined);
  };

  return (
    <View style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}>
      <View style={[styles.lines, { borderRightColor: colors.border }]}>
        {Array.from({ length: lineCount }, (_, index) => (
          <Text key={index} style={[styles.lineNumber, { color: colors.muted }]}>{index + 1}</Text>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Editor do Laboratório de Código"
        accessibilityHint="Digite sua solução. Os números das linhas ficam fora do conteúdo."
        multiline
        value={code}
        onChangeText={handleChangeText}
        selection={selection}
        onSelectionChange={(event) => onSelectionChange(event.nativeEvent.selection)}
        onFocus={onFocus}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        textAlignVertical="top"
        style={[styles.input, { color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { minHeight: 220, maxHeight: 420, borderWidth: 1, borderRadius: 8, flexDirection: 'row', overflow: 'hidden' },
  lines: { width: 42, borderRightWidth: 1, paddingTop: 12, alignItems: 'flex-end', paddingRight: 8 },
  lineNumber: { height: 20, fontFamily: 'Courier', fontSize: 12 },
  input: { flex: 1, minHeight: 220, padding: 12, fontFamily: 'Courier', fontSize: 13, lineHeight: 20 }
});
