# App Privacy Labels - Rascunho Operacional

Status: rascunho técnico. O preenchimento final deve ser feito no App Store Connect com base no build real, URLs públicas e ambiente de produção.

## Tabela de classificação

| Categoria Apple | Coletado? | Vinculado ao usuário? | Tracking? | Finalidade | Armazenamento/terceiro | Exclusão | Evidência |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Contact Info / Email Address | Sim | Sim | Não | Login, cadastro, recuperação de conta | Supabase Auth | Pela exclusão de conta | `useAuth`, `LoginScreen`, Supabase Auth |
| User ID | Sim | Sim | Não | Identificar progresso e sessão | Supabase Auth, `player_progress.user_id` | Pela exclusão de conta | `syncService`, `docs/supabase-schema.sql` |
| Product Interaction | Sim | Sim quando sincronizado | Não | Salvar progresso, XP, aulas, desafios, streak, conquistas | AsyncStorage e Supabase `player_progress` | Reset de progresso e exclusão de conta | `syncService`, services de progresso |
| Other User Content | Sim, quando o usuário envia | Sim | Não | Professor Byte e feedback voluntário | Edge Function Supabase; OpenRouter via servidor; feedback local | Feedback local removível via app/local; remoto se `feedback_reports` existir | `ProfessorByteScreen`, `professorByteAi`, `feedbackService` |
| Usage Data | Sim | Sim quando sincronizado | Não | Progresso educacional, ranking, analytics local | AsyncStorage; Supabase para progresso/ranking | Reset/exclusão | `localAnalyticsService`, `leaderboardService`, `syncService` |
| Diagnostics | Não identificado como coleta própria | Não confirmado | Não | Não há SDK de crash/analytics externo identificado | N/A | N/A | Dependências e código atual |
| Purchases | Não nesta versão | Não | Não | Premium oculto; sem StoreKit/IAP ativo | N/A | N/A | `releaseConfig.commercialFeaturesEnabled=false`, `ShopScreen` |
| Location | Não | Não | Não | O app não solicita localização | N/A | N/A | Sem permissões de localização identificadas |
| Identifiers / Device ID | Não identificado como coleta própria | Não confirmado | Não | Sem SDK de anúncios/tracking nesta versão | N/A | N/A | Dependências atuais; sem ads SDK |
| Search History | Não | Não | Não | Não existe busca rastreada | N/A | N/A | Código atual |
| Browsing History | Não | Não | Não | Não existe web browsing tracking | N/A | N/A | Código atual |
| Financial Info | Não | Não | Não | Sem pagamentos reais | N/A | N/A | Premium oculto |
| Sensitive Info | Não coletar | N/A | Não | App orienta não enviar senhas/tokens ao Professor Byte | N/A | N/A | `ProfessorByteScreen`, `professorByteContext` |

## Instruções para App Store Connect

- Não marcar "Data Not Collected", porque há Supabase Auth, progresso sincronizado, ranking e Professor Byte.
- Marcar tracking como "Não", salvo se SDKs de anúncios/analytics cross-app forem adicionados.
- Declarar e-mail e user ID como vinculados ao usuário.
- Declarar interações/progresso como vinculados quando sincronizados com Supabase.
- Declarar conteúdo enviado ao Professor Byte como conteúdo do usuário enviado a serviço terceiro via servidor.
- Não declarar compras enquanto Premium/IAP estiver oculto e sem StoreKit.
- Revalidar após qualquer SDK novo, principalmente analytics, crash reporting, ads ou pagamento.

## Pontos pendentes

- Confirmar no App Store Connect se Apple exige classificação adicional para logs automáticos do EAS/Expo no binário final.
- Confirmar se a política pública publicada descreve OpenRouter, Supabase e exclusão de conta com o mesmo escopo.
- Confirmar `PrivacyInfo.xcprivacy` no Xcode/Archive antes do upload.
