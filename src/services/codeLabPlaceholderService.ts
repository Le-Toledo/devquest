export type CodeLabSelection = { start: number; end: number };

const placeholder = '____';

const clampIndex = (code: string, index: number) => Math.max(0, Math.min(code.length, index));

const isExactPlaceholderAt = (code: string, index: number) =>
  code.slice(index, index + placeholder.length) === placeholder &&
  code[index - 1] !== '_' &&
  code[index + placeholder.length] !== '_';

export const findPlaceholderSelection = (code: string, fromIndex = 0): CodeLabSelection | null => {
  let cursor = clampIndex(code, fromIndex);
  while (cursor < code.length) {
    const index = code.indexOf(placeholder, cursor);
    if (index < 0) return null;
    if (isExactPlaceholderAt(code, index)) return { start: index, end: index + placeholder.length };
    cursor = index + 1;
  }
  return null;
};

export const findNextPlaceholderSelection = (code: string, cursorIndex = 0) =>
  findPlaceholderSelection(code, cursorIndex) ?? findPlaceholderSelection(code, 0);

export const hasExactPlaceholder = (code: string) => Boolean(findPlaceholderSelection(code));

export const countExactPlaceholders = (code: string) => {
  let count = 0;
  let cursor = 0;
  while (cursor < code.length) {
    const next = findPlaceholderSelection(code, cursor);
    if (!next) return count;
    count += 1;
    cursor = next.end;
  }
  return count;
};

export const hasInvalidUnderscorePlaceholder = (code: string) => /_{5,}/.test(code);

export const createEditorPlaceholderState = (savedCode: string | undefined, starterCode: string) => {
  const code = savedCode || starterCode;
  return {
    code,
    selection: findPlaceholderSelection(code) ?? { start: 0, end: 0 }
  };
};

export const replaceSelection = (code: string, selection: CodeLabSelection, value: string) => ({
  code: `${code.slice(0, selection.start)}${value}${code.slice(selection.end)}`,
  selection: { start: selection.start + value.length, end: selection.start + value.length }
});

export const normalizePlaceholderInsertion = (previousCode: string, nextCode: string, selection: CodeLabSelection | null) => {
  if (!selection || previousCode.slice(selection.start, selection.end) !== placeholder) return null;
  const before = previousCode.slice(0, selection.start);
  const after = previousCode.slice(selection.end);
  if (!nextCode.startsWith(before) || !nextCode.endsWith(after)) return null;

  const insertedWithPossiblePlaceholder = nextCode.slice(before.length, nextCode.length - after.length);
  if (!insertedWithPossiblePlaceholder.endsWith(placeholder)) return null;

  const inserted = insertedWithPossiblePlaceholder.slice(0, -placeholder.length);
  if (!inserted) return null;
  return replaceSelection(previousCode, selection, inserted);
};

export const selectionAfterPlaceholderReplacement = (previousCode: string, nextCode: string, selection: CodeLabSelection | null) => {
  if (!selection || previousCode.slice(selection.start, selection.end) !== placeholder) return null;
  const before = previousCode.slice(0, selection.start);
  const after = previousCode.slice(selection.end);
  if (!nextCode.startsWith(before) || !nextCode.endsWith(after)) return null;

  const inserted = nextCode.slice(before.length, nextCode.length - after.length);
  if (!inserted || inserted.includes(placeholder)) return null;
  return { start: selection.start + inserted.length, end: selection.start + inserted.length };
};
