import assert from 'node:assert/strict';
import {
  countExactPlaceholders,
  createEditorPlaceholderState,
  findNextPlaceholderSelection,
  findPlaceholderSelection,
  hasInvalidUnderscorePlaceholder,
  normalizePlaceholderInsertion,
  replaceSelection,
  selectionAfterPlaceholderReplacement
} from '../src/services/codeLabPlaceholderService';

assert.equal(findPlaceholderSelection('const nome = "Ana";'), null, 'Codigo sem lacuna nao deve selecionar nada.');
assert.deepEqual(findPlaceholderSelection('____();'), { start: 0, end: 4 }, 'Lacuna no começo deve selecionar 0..4.');
assert.deepEqual(findPlaceholderSelection('usuarios.____((usuario) => usuario.ativo)'), { start: 9, end: 13 }, 'Lacuna no meio deve calcular start/end corretos.');
assert.deepEqual(findPlaceholderSelection('return ____'), { start: 7, end: 11 }, 'Lacuna no final deve calcular start/end corretos.');
assert.deepEqual(findPlaceholderSelection('a.___ b.__ c._'), null, 'Um, dois ou tres underscores nao sao lacunas.');
assert.deepEqual(findPlaceholderSelection('nome_usuario = 1'), null, 'Identificador com underscore legitimo nao deve ser lacuna.');
assert.deepEqual(findPlaceholderSelection('def __init__(self): pass'), null, '__init__ nao deve ser lacuna.');
assert.equal(hasInvalidUnderscorePlaceholder('valor = _____'), true, 'Cinco underscores devem ser detectados como invalido.');

const twoBlanks = 'usuarios.____((usuario) => usuario.____)';
assert.equal(countExactPlaceholders(twoBlanks), 2, 'Deve contar multiplas lacunas validas.');
assert.deepEqual(findPlaceholderSelection(twoBlanks), { start: 9, end: 13 }, 'Ao abrir, seleciona a primeira lacuna.');
assert.deepEqual(findNextPlaceholderSelection(twoBlanks, 13), { start: 35, end: 39 }, 'Proxima lacuna deve buscar depois do cursor.');
assert.deepEqual(findNextPlaceholderSelection(twoBlanks, 38), { start: 9, end: 13 }, 'Busca deve reiniciar do começo quando chega ao fim.');

const firstSelection = findPlaceholderSelection('usuarios.____((usuario) => usuario.ativo)');
assert(firstSelection);
assert.deepEqual(replaceSelection('usuarios.____((usuario) => usuario.ativo)', firstSelection, 'f'), {
  code: 'usuarios.f((usuario) => usuario.ativo)',
  selection: { start: 10, end: 10 }
}, 'Substituicao deve trocar exatamente quatro underscores pela primeira letra.');
assert.deepEqual(selectionAfterPlaceholderReplacement('usuarios.____((usuario) => usuario.ativo)', 'usuarios.f((usuario) => usuario.ativo)', firstSelection), { start: 10, end: 10 }, 'Substituicao nativa deve posicionar cursor apos texto inserido.');
assert.deepEqual(normalizePlaceholderInsertion('usuarios.____((usuario) => usuario.ativo)', 'usuarios.f____((usuario) => usuario.ativo)', firstSelection), {
  code: 'usuarios.f((usuario) => usuario.ativo)',
  selection: { start: 10, end: 10 }
}, 'Fallback deve remover placeholder que a plataforma nao substituiu.');
assert.equal(normalizePlaceholderInsertion('usuarios.____((usuario) => usuario.ativo)', 'usuarios.f____((usuario) => usuario.ativo)', { start: 0, end: 0 }), null, 'Fallback nao deve rodar quando usuario selecionou outro trecho.');

const continued = 'usuarios.filter((usuario) => usuario.ativo)';
assert.equal(findPlaceholderSelection(continued), null, 'Continuacao da digitacao nao deve reposicionar cursor na lacuna preenchida.');

const pasted = normalizePlaceholderInsertion('return ____;', 'return get____;', { start: 7, end: 11 });
assert.deepEqual(pasted, { code: 'return get;', selection: { start: 10, end: 10 } }, 'Colar texto sobre lacuna deve substituir apenas intervalo selecionado.');

assert.deepEqual(createEditorPlaceholderState(undefined, 'return ____;'), { code: 'return ____;', selection: { start: 7, end: 11 } }, 'Restauracao do starter deve selecionar primeira lacuna.');
assert.deepEqual(createEditorPlaceholderState('return valor;', 'return ____;'), { code: 'return valor;', selection: { start: 0, end: 0 } }, 'Codigo salvo sem lacuna deve ser preservado sem reposicionar cursor.');
assert.deepEqual(createEditorPlaceholderState('return ____;', 'return valor;'), { code: 'return ____;', selection: { start: 7, end: 11 } }, 'Codigo salvo com lacuna deve selecionar lacuna salva.');

const completedChallengeState = createEditorPlaceholderState('const ok = true;', 'const ok = ____;');
assert.deepEqual(completedChallengeState, { code: 'const ok = true;', selection: { start: 0, end: 0 } }, 'Desafio ja concluido com codigo salvo nao deve voltar ao starter.');

console.log('Code Lab placeholder tests OK');
