import { Character } from '../types/campaign';

export const characters: Character[] = [
  { id: 'professor-byte', name: 'Professor Byte', avatar: 'PB', role: 'mentor', color: '#49E3B3', personality: 'calmo, brilhante e provocador na medida certa', description: 'Mentor da academia e guia da jornada dev.', catchphrase: 'Todo bug e uma aula disfarçada.' },
  { id: 'syntax-bug', name: 'Bug de Sintaxe', avatar: '{}', role: 'bug', color: '#ff6b6b', personality: 'caotico e debochado', description: 'Pequeno erro que trava grandes ideias.', catchphrase: 'Faltou uma chave, sobrou desespero.' },
  { id: 'rival-ai', name: 'IA Rival', avatar: 'AI', role: 'rival', color: '#8EA7FF', personality: 'competitiva e precisa', description: 'Rival que testa clareza e velocidade.', catchphrase: 'Otimize seu raciocinio.' },
  { id: 'master-dev', name: 'Mestre Dev', avatar: 'MD', role: 'master', color: '#ffd166', personality: 'exigente, justo e experiente', description: 'Guardiao da entrevista final.', catchphrase: 'Explique o porquê, nao apenas o como.' },
  { id: 'null-pointer', name: 'Null Pointer', avatar: 'N!', role: 'boss', color: '#fb7185', personality: 'silencioso e traiçoeiro', description: 'Ataca quando dados ausentes sao ignorados.', catchphrase: 'Confie no nada e eu apareço.' },
  { id: 'infinite-loop', name: 'Loop Infinito', avatar: '∞', role: 'boss', color: '#a78bfa', personality: 'hipnotico e insistente', description: 'Prende devs que esquecem condicoes de parada.', catchphrase: 'So mais uma iteracao...' },
  { id: 'legacy-code', name: 'Legacy Code', avatar: 'LC', role: 'boss', color: '#94a3b8', personality: 'antigo, resistente e cheio de segredos', description: 'Sistema que exige coragem e testes.', catchphrase: 'Ninguem mexe em mim desde 2014.' },
  { id: 'broken-layout', name: 'Layout Quebrado', avatar: 'UI', role: 'boss', color: '#ff8fab', personality: 'dramatico e desalinhado', description: 'Distorce interfaces e hierarquia visual.', catchphrase: 'Responsivo? Nunca ouvi falar.' },
  { id: 'corrupted-api', name: 'API Corrompida', avatar: '500', role: 'boss', color: '#34d399', personality: 'instavel e imprevisivel', description: 'Quebra contratos e espalha status errados.', catchphrase: 'Hoje eu retorno qualquer coisa.' }
];

export const characterById = (id: string) => characters.find((character) => character.id === id) ?? characters[0];
