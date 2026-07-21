export const sanitizeProfessorByteText = (value?: string, max = 1600) => {
  if (!value) return undefined;
  const clean = value
    .replace(/(?:service_role|OPENROUTER_API_KEY|SUPABASE_[A-Z_]*KEY)\s*[:=]\s*["']?[\w.-]+/gi, '[segredo removido]')
    .replace(/\s+\n/g, '\n')
    .trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
};

export const sanitizeProfessorByteList = (items?: string[], maxItems = 6) =>
  items?.slice(0, maxItems).map((item) => sanitizeProfessorByteText(item, 240)).filter(Boolean) as string[] | undefined;
