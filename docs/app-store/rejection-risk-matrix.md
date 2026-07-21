# Matriz de risco de rejeição - Code Quest

| Requisito | Estado atual | Evidência | Risco | Correção necessária | Local | Mac | ASC | Supabase | Autorização | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Crash/testes automatizados | Testes passam no Windows | `npm test`, lint e typecheck | Médio | QA físico em iPhone | Parcial | Sim | Não | Não | Não | MÉDIO |
| Login/cadastro | Supabase Auth real | `useAuth`, `LoginScreen` | Médio | Testar conta produção/TestFlight | Não | Sim | Sim | Sim | Sim | MÉDIO |
| Logout | Existe em Perfil | `ProfileScreen` | Baixo | QA físico | Não | Sim | Não | Não | Não | BAIXO |
| Exclusão de conta | UI e service preparados; função não implantada | `ProfileScreen`, `accountDeletionService`, `supabase/functions/delete-account` | Crítico | Implantar e validar Edge Function | Parcial | Não | Não | Sim | Sim | BLOQUEADOR |
| Política de privacidade | Rascunho criado; falta URL pública | `privacy-policy-pt-BR.md` | Crítico | Hospedar URL pública | Não | Não | Sim | Não | Sim | BLOQUEADOR |
| Suporte | Rascunho criado; falta URL pública/contato | `support-page-content-pt-BR.md` | Crítico | Hospedar página e contato | Não | Não | Sim | Não | Sim | BLOQUEADOR |
| Termos | Rascunho criado | `terms-of-use-pt-BR.md` | Médio | Hospedar se informado no ASC | Não | Não | Sim | Não | Sim | ALTO |
| App Privacy | Rascunho criado | `app-privacy-questionnaire.md` | Alto | Preencher ASC coerente com build | Não | Não | Sim | Não | Sim | ALTO |
| Premium/IAP | Comercial incompleto oculto por flag | `releaseConfig.commercialFeaturesEnabled=false` | Alto reduzido | Manter oculto ou integrar StoreKit real | Sim | Sim | Sim | Não | Sim | MÉDIO |
| Loja | Apenas itens com moedas internas visíveis | `ShopScreen` filtra `premium` | Médio | QA para garantir sem pagamento | Sim | Sim | Não | Não | Não | MÉDIO |
| Botões comerciais | Premium oculto do Hub/Loja | `HomeDashboard`, `AppNavigator` | Baixo | QA visual | Sim | Sim | Não | Não | Não | BAIXO |
| Professor Byte | Aviso de IA e feedback adicionados | `ProfessorByteScreen` | Médio | QA online/offline e revisar Edge Function | Sim | Sim | Não | Sim | Sim | MÉDIO |
| Feedback | Local e honesto | `FeedbackScreen`, `feedbackService` | Baixo | Não declarar como suporte oficial | Sim | Sim | Sim | Não | Não | BAIXO |
| Conteúdo educacional | Audits passam com avisos | `audit:content`, `audit:academy` | Médio | QA amostral físico | Sim | Sim | Não | Não | Não | MÉDIO |
| Offline | Progresso local e fallback existem | services locais | Médio | Teste físico sem rede | Não | Sim | Não | Não | Não | MÉDIO |
| Acessibilidade | Labels em botões principais; não auditado em VoiceOver | componentes | Médio | Teste VoiceOver real | Parcial | Sim | Não | Não | Não | MÉDIO |
| Privacy manifest | Existe, mas precisa conferência final no Mac | `ios/CodeQuest/PrivacyInfo.xcprivacy` | Alto | Validar com Xcode e App Store Connect | Não | Sim | Sim | Não | Sim | ALTO |
| Build iOS | Não validado no Windows | `ios/`, `eas.json` | Crítico | Archive/TestFlight no Mac/EAS | Não | Sim | Sim | Não | Sim | BLOQUEADOR |
| Screenshots | Plano criado; sem captura real | `screenshot-plan.md` | Crítico | Capturar telas reais | Não | Sim | Sim | Não | Sim | BLOQUEADOR |
| Conta demo | Checklist criado; conta não criada | `demo-account-checklist.md` | Crítico | Criar conta e informar no ASC | Não | Não | Sim | Sim | Sim | BLOQUEADOR |
| Export compliance | Rascunho criado | `export-compliance.md` | Médio | Confirmar no ASC | Não | Não | Sim | Não | Sim | ALTO |
| Links quebrados | URLs públicas ainda pendentes | docs com marcadores | Crítico | Publicar URLs reais | Não | Não | Sim | Não | Sim | BLOQUEADOR |
| Ambiente produção | Variáveis Supabase locais válidas; EAS precisa conferir secrets | `check:supabase` | Alto | Confirmar EAS secrets/prod | Não | Não | Sim | Sim | Sim | ALTO |
