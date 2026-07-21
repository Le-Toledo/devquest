import assert from 'node:assert/strict';
import { sanitizeProfessorByteText } from '../src/services/professorByteContext';

const sanitized = sanitizeProfessorByteText('OPENROUTER_API_KEY=sk-realmente-secreta\nExplique meu código', 200);
assert.equal(sanitized?.includes('sk-realmente-secreta'), false, 'Sanitizacao nao deve enviar segredo em contexto.');
assert(sanitized?.includes('[segredo removido]'), 'Sanitizacao deve marcar segredo removido.');

const long = sanitizeProfessorByteText('a'.repeat(2000), 120);
assert.equal(long?.length, 123, 'Contexto longo deve ser truncado com reticencias.');

console.log('Professor Byte context tests OK');
