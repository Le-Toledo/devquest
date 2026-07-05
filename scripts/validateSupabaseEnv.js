const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];

const clean = (value = '') => value.trim().replace(/^["']|["']$/g, '');

const readEnv = () => {
  if (!fs.existsSync(envPath)) return {};
  return fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!match) return acc;
    acc[match[1].trim()] = clean(match[2]);
    return acc;
  }, {});
};

const isSupabaseUrl = (value) => {
  if (!value || value.includes('your-project-ref') || value.includes('seu-projeto')) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
};

const isPublicKey = (value) => {
  if (!value || value.includes('your-public-anon-key') || value.includes('sua-chave-publica')) return false;
  if (value.startsWith('sb_publishable_')) return value.length > 30;
  if (value.startsWith('eyJ')) return value.split('.').length === 3 && value.length > 80;
  return false;
};

const env = readEnv();
const errors = [];

for (const name of required) {
  if (!env[name]) errors.push(`${name} nao encontrado no .env`);
}

if (env.EXPO_PUBLIC_SUPABASE_URL && !isSupabaseUrl(env.EXPO_PUBLIC_SUPABASE_URL)) {
  errors.push('EXPO_PUBLIC_SUPABASE_URL deve ser uma URL https://*.supabase.co');
}

if (env.EXPO_PUBLIC_SUPABASE_ANON_KEY && !isPublicKey(env.EXPO_PUBLIC_SUPABASE_ANON_KEY)) {
  errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY deve ser uma anon public key ou publishable key publica do Supabase');
}

if (env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.toLowerCase().includes('service_role')) {
  errors.push('Nunca use service_role_key no app mobile');
}

if (errors.length > 0) {
  console.error('Configuracao Supabase invalida:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Supabase configurado para Expo: URL publica valida e chave publica presente.');
