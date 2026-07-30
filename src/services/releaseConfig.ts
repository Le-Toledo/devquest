export const releaseConfig = {
  commercialFeaturesEnabled: false,
  accountDeletionFunctionName: 'delete-account',
  privacyPolicyUrl: (() => {
    const value = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim();
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? value : null;
    } catch {
      return null;
    }
  })()
} as const;

export const hiddenCommercialFeatures = [
  'Tela Premium',
  'atalhos para assinatura',
  'itens premium da loja',
  'mundos ou fases marcados como premium'
] as const;
