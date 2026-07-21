export const releaseConfig = {
  commercialFeaturesEnabled: false,
  accountDeletionFunctionName: 'delete-account'
} as const;

export const hiddenCommercialFeatures = [
  'Tela Premium',
  'atalhos para assinatura',
  'itens premium da loja',
  'mundos ou fases marcados como premium'
] as const;
