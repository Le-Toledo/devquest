import { DialogueSequence } from '../types/campaign';

export const mentorDialogues: DialogueSequence[] = [
  {
    id: 'campaign-intro',
    dialogues: [
      { id: 'intro-1', characterId: 'professor-byte', text: 'Bem-vindo a CodeQuest Academy. Aqui, cada linha de codigo vira progresso real.', mood: 'happy' },
      { id: 'intro-2', characterId: 'professor-byte', text: 'Os sistemas da academia foram corrompidos. Para restaura-los, voce vai aprender, praticar e revisar como um dev profissional.', mood: 'warning' },
      { id: 'intro-3', characterId: 'syntax-bug', text: 'Hehehe... quero ver voce compilar coragem sem esquecer uma chave.', mood: 'warning' },
      { id: 'intro-4', characterId: 'professor-byte', text: 'Errou? Excelente. Bugs sao mapas: eles mostram exatamente onde seu entendimento vai evoluir.', mood: 'calm' }
    ]
  },
  { id: 'mission-start-default', dialogues: [{ id: 'msd-1', characterId: 'professor-byte', text: 'Leia como engenheiro: entrada, regra, saida. Depois ataque uma parte por vez.', mood: 'calm' }] },
  { id: 'mission-end-default', dialogues: [{ id: 'med-1', characterId: 'professor-byte', text: 'Boa entrega. Voce acabou de converter incerteza em habilidade reutilizavel.', mood: 'victory' }] },
  { id: 'mistake-review', dialogues: [{ id: 'mr-1', characterId: 'syntax-bug', text: 'Esse erro veio com tempero extra.' }, { id: 'mr-2', characterId: 'professor-byte', text: 'Sem drama. Revise a dica, entenda a causa e salve para praticar depois.', mood: 'calm' }] },
  { id: 'combo-feedback', dialogues: [{ id: 'cf-1', characterId: 'professor-byte', text: 'Voce esta ficando bom nisso. Agora vamos encarar algo mais dificil.', mood: 'happy' }] },
  { id: 'boss-warning', dialogues: [{ id: 'bw-1', characterId: 'professor-byte', text: 'Boss a frente. Codigo limpo nao e luxo: e o equipamento que te mantem vivo.', mood: 'warning' }] },
  { id: 'chapter-complete', dialogues: [{ id: 'cc-1', characterId: 'professor-byte', text: 'Capitulo restaurado. A academia registrou sua evolucao no nucleo principal.', mood: 'victory' }] },
  { id: 'track-frontend', dialogues: [{ id: 'tf-1', characterId: 'professor-byte', text: 'Front-end escolhido. Interfaces claras sao pontes entre pessoas e sistemas.', mood: 'happy' }] },
  { id: 'track-backend', dialogues: [{ id: 'tb-1', characterId: 'professor-byte', text: 'Back-end escolhido. Voce vai proteger regras, dados e APIs como uma fortaleza.', mood: 'happy' }] },
  { id: 'track-mobile-kotlin', dialogues: [{ id: 'tmk-1', characterId: 'professor-byte', text: 'Mobile Kotlin escolhido. Null safety e boas arquiteturas serao seus escudos.', mood: 'happy' }] },
  { id: 'track-mobile-react-native', dialogues: [{ id: 'tmr-1', characterId: 'professor-byte', text: 'Mobile React Native escolhido. Uma base, muitas plataformas, muita responsabilidade.', mood: 'happy' }] },
  { id: 'track-fullstack', dialogues: [{ id: 'tfs-1', characterId: 'professor-byte', text: 'Full Stack escolhido. Voce vai enxergar o produto de ponta a ponta.', mood: 'happy' }] },
  { id: 'boss-syntax-intro', dialogues: [{ id: 'bsi-1', characterId: 'syntax-bug', text: 'Faltou ponto, sobrou chave, perdeu a paz!' }, { id: 'bsi-2', characterId: 'professor-byte', text: 'Observe os detalhes. Sintaxe e a porta de entrada para a logica.', mood: 'warning' }] },
  { id: 'boss-syntax-win', dialogues: [{ id: 'bsw-1', characterId: 'professor-byte', text: 'Voce derrotou o Bug de Sintaxe. O primeiro sistema voltou ao ar.', mood: 'victory' }] },
  { id: 'boss-layout-intro', dialogues: [{ id: 'bli-1', characterId: 'broken-layout', text: 'Nada alinha, tudo quebra, e o botao foge!' }] },
  { id: 'boss-layout-win', dialogues: [{ id: 'blw-1', characterId: 'professor-byte', text: 'Heroi do Front-end. Agora a interface conversa com o usuario.', mood: 'victory' }] },
  { id: 'boss-api-intro', dialogues: [{ id: 'bai-1', characterId: 'corrupted-api', text: '500 para todos. Contrato? Nunca ouvi falar.' }] },
  { id: 'boss-api-win', dialogues: [{ id: 'baw-1', characterId: 'professor-byte', text: 'Guardiao do Back-end. A API voltou previsivel e segura.', mood: 'victory' }] },
  { id: 'boss-null-intro', dialogues: [{ id: 'bni-1', characterId: 'null-pointer', text: 'Eu apareco quando voce confia demais no nada.' }] },
  { id: 'boss-null-win', dialogues: [{ id: 'bnw-1', characterId: 'professor-byte', text: 'Guerreiro Kotlin. Null safety salvou a academia mobile.', mood: 'victory' }] },
  { id: 'boss-legacy-intro', dialogues: [{ id: 'blei-1', characterId: 'legacy-code', text: 'Ninguem testa, ninguem mexe, todos temem.' }] },
  { id: 'boss-legacy-win', dialogues: [{ id: 'blew-1', characterId: 'professor-byte', text: 'Sobrevivente do Legacy Code. Refatorar com cuidado tambem e coragem.', mood: 'victory' }] },
  { id: 'boss-master-intro', dialogues: [{ id: 'bmi-1', characterId: 'master-dev', text: 'Mostre raciocinio, clareza e calma. A entrevista final comeca agora.' }] },
  { id: 'boss-master-win', dialogues: [{ id: 'bmw-1', characterId: 'professor-byte', text: 'Aprovado na Entrevista Final. Voce nao decorou: voce evoluiu.', mood: 'victory' }] }
];

export const dialogueById = (id: string) => mentorDialogues.find((sequence) => sequence.id === id) ?? mentorDialogues[1];
