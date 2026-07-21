# Checklist de QA Mobile - CodeQuest Academy

Use este roteiro antes de gerar build beta/TestFlight. Ele complementa `npm run lint`, `npm run typecheck`, `npm test` e auditorias de conteúdo.

## Autenticação e sessão

- Abrir o app sem sessão e confirmar que a tela de Entrar/Criar conta aparece.
- Entrar com conta real Supabase e confirmar navegação para o Hub.
- Fechar e reabrir o app para validar persistência da sessão.
- Fazer logout pelo Perfil e confirmar retorno para autenticação.
- Tentar login com senha errada e validar erro amigável.

## Sync e progresso

- Concluir uma missão e verificar XP/moedas localmente.
- Confirmar no Supabase que `player_progress` recebeu o progresso atualizado.
- Desligar internet, concluir uma ação local e confirmar que o app não trava.
- Reabrir com internet e validar status de sincronização.
- Resetar progresso e confirmar reset local e remoto.

## Academia Dev

- Abrir uma trilha bloqueada e validar que não pula etapas.
- Concluir um desafio rápido correto e confirmar liberação da próxima aula.
- Errar um desafio rápido e confirmar explicação curta sem avanço indevido.
- Sair e voltar para confirmar progresso persistido.

## Arena e Ranking

- Abrir Arena em tela pequena e confirmar filtros horizontais acessíveis.
- Responder desafio correto e errado, validando feedback e registro de revisão.
- Abrir Ranking vazio ou offline e confirmar mensagem clara com ação de retorno/tentativa.

## Code Lab

- Abrir um desafio e confirmar que a primeira lacuna fica selecionada.
- Digitar parte da solução, sair e voltar para validar rascunho recuperado.
- Validar solução incorreta e confirmar histórico de tentativas.
- Restaurar tentativa do histórico e confirmar que vira rascunho editável.
- Excluir uma tentativa do histórico e confirmar que o desafio continua funcional.
- Concluir desafio e confirmar recompensa única, rascunho limpo e progresso salvo.

## Professor Byte

- Abrir Professor Byte pelo Hub e pelo Code Lab.
- Usar ações rápidas: "Explique mais simples", "Só uma dica", "Mostre onde errei", "Crie um exemplo" e "Mini desafio".
- No modo dica, confirmar que a resposta correta não é revelada diretamente.
- Testar sem Supabase/OpenRouter e confirmar fallback amigável sem travar.
- Confirmar que nenhum segredo aparece em logs ou payloads.

## Safe Area e responsividade

- Testar iPhone SE, iPhone 14 Pro Max e Android pequeno.
- Confirmar que não há faixas brancas atrás da Dynamic Island ou Home Indicator.
- Abrir teclado em autenticação, Professor Byte e Code Lab.
- Confirmar botões com área de toque confortável e textos sem sobreposição.
