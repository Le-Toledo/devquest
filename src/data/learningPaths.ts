import { LearningPath } from '../types/academy';

export const learningPaths: LearningPath[] = [
  { id: 'logic-path', title: 'Lógica de Programação', description: 'Base para resolver problemas, modelar regras e pensar como dev antes da sintaxe.', icon: 'git-branch', recommendedLevel: 1, areaIds: ['logic'], color: '#49E3B3' },
  { id: 'html-path', title: 'HTML', description: 'Estrutura, semântica, formulários, acessibilidade e documentos prontos para web real.', icon: 'document-text', recommendedLevel: 1, areaIds: ['html'], color: '#f97316' },
  { id: 'css-path', title: 'CSS', description: 'Cascata, layout, responsividade, design system, animações e interfaces consistentes.', icon: 'color-palette', recommendedLevel: 1, areaIds: ['css'], color: '#38bdf8' },
  { id: 'javascript-path', title: 'JavaScript', description: 'Linguagem, DOM, coleções, funções, assincronia e comportamento de aplicações.', icon: 'logo-javascript', recommendedLevel: 2, areaIds: ['javascript'], color: '#facc15' },
  { id: 'typescript-path', title: 'TypeScript', description: 'Tipos, contratos, unions, generics e segurança para escalar código JavaScript.', icon: 'shield-checkmark', recommendedLevel: 3, areaIds: ['typescript'], color: '#60a5fa' },
  { id: 'react-path', title: 'React', description: 'Componentes, props, estado, efeitos, listas, performance e arquitetura de UI.', icon: 'logo-react', recommendedLevel: 3, areaIds: ['react'], color: '#22d3ee' },
  { id: 'react-native-path', title: 'React Native', description: 'Apps mobile com componentes nativos, navegação, persistência, UX e publicação.', icon: 'phone-portrait', recommendedLevel: 4, areaIds: ['react', 'typescript'], color: '#34d399' },
  { id: 'node-path', title: 'Node.js', description: 'Runtime, npm, módulos, Express, middlewares, erros, segurança e observabilidade.', icon: 'server', recommendedLevel: 3, areaIds: ['node'], color: '#84cc16' },
  { id: 'api-path', title: 'APIs REST', description: 'HTTP, recursos, contratos, autenticação, paginação, versão e design de APIs.', icon: 'cloud', recommendedLevel: 3, areaIds: ['rest'], color: '#8EA7FF' },
  { id: 'sql-path', title: 'SQL', description: 'Consultas, filtros, JOINs, agregações, índices, transações e segurança de dados.', icon: 'file-tray-stacked', recommendedLevel: 2, areaIds: ['sql'], color: '#ffd166' },
  { id: 'git-path', title: 'Git e GitHub', description: 'Histórico, branches, commits, PRs, conflitos, CI e colaboração profissional.', icon: 'git-commit', recommendedLevel: 1, areaIds: ['git'], color: '#fb7185' },
  { id: 'python-path', title: 'Python', description: 'Sintaxe clara, coleções, funções, arquivos, pacotes, automação e código legível.', icon: 'terminal', recommendedLevel: 1, areaIds: ['python'], color: '#a78bfa' },
  { id: 'java-path', title: 'Java', description: 'Classes, objetos, coleções, exceções, generics, JVM e fundamentos corporativos.', icon: 'cafe', recommendedLevel: 3, areaIds: ['java'], color: '#f87171' },
  { id: 'kotlin-path', title: 'Kotlin', description: 'Null safety, data classes, coleções, coroutines, sealed states e Android moderno.', icon: 'logo-android', recommendedLevel: 3, areaIds: ['kotlin'], color: '#c084fc' },
  { id: 'csharp-path', title: 'C#', description: '.NET, classes, LINQ, async/await, nullable references e APIs profissionais.', icon: 'code-working', recommendedLevel: 3, areaIds: ['csharp'], color: '#818cf8' },
  { id: 'career-path', title: 'Carreira Dev', description: 'Portfólio, rotina de estudo, primeiro emprego, comunicação e crescimento sustentável.', icon: 'briefcase', recommendedLevel: 1, areaIds: ['git', 'logic'], color: '#a3e635' },
  { id: 'interview-path', title: 'Entrevista Técnica', description: 'Raciocínio, algoritmos, debugging, trade-offs, system design e comunicação técnica.', icon: 'mic', recommendedLevel: 4, areaIds: ['interview', 'logic'], color: '#fb923c' }
];

export const learningPathById = (pathId: string) => learningPaths.find((path) => path.id === pathId);
