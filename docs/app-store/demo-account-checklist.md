# Conta de Demonstração para Apple Review

Não salvar senha no Git, em Markdown, em issue pública, em commit ou em print.

## Criar

- Criar uma conta exclusiva para Apple Review no ambiente de produção.
- Usar e-mail descartável/controlado, sem dados pessoais do proprietário.
- Confirmar o e-mail antes de enviar o app para análise.
- Não ativar MFA, login por código temporário ou qualquer fluxo que dependa de receber e-mail durante a revisão.
- Guardar a senha em gerenciador de senhas, não no projeto.

## Preparar progresso

- Fazer login com a conta demo.
- Concluir pelo menos uma missão da Campanha.
- Abrir uma aula da Academia Dev.
- Resolver um desafio da Arena ou Code Lab.
- Gerar um pequeno progresso de XP/moedas.
- Testar Professor Byte com uma pergunta simples.
- Enviar um feedback de teste se a Central de Feedback estiver visível.
- Confirmar que Premium continua oculto.

## Validar antes de inserir no App Store Connect

- Login funciona em instalação limpa.
- Sessão persiste após fechar e abrir.
- Logout volta para autenticação.
- Recuperação de senha funciona ou exibe fluxo real.
- Ranking não mostra e-mail.
- Perfil não mostra dado pessoal além do e-mail da conta demo.
- Exclusão de conta não deve ser testada nessa conta; usar outra conta descartável para QA de exclusão.

## Inserir no App Store Connect

- Informar e-mail e senha somente no campo apropriado de review credentials.
- Nas notas de revisão, indicar:
  - entrar com a conta demo;
  - testar Hub, Campanha, Academia, Arena, Code Lab, Professor Byte e Perfil;
  - Premium não está disponível nesta versão;
  - exclusão de conta fica em Perfil > Segurança.

## Manter ativa

- Manter a conta disponível até o fim da revisão.
- Não resetar senha durante a revisão.
- Não apagar a conta demo enquanto o build estiver em análise.
