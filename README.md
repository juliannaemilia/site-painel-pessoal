# Painel Pessoal

Base de código profissional em **React + TypeScript + Tailwind CSS**, migrada de um protótipo do Lovable, pronta para integração com **Supabase**.

Reproduz a estrutura original — **login**, **cadastro**, **Visão Geral**, **Links Rápidos**, **Central de Planilhas**, **Documentos & Arquivos**, **Itens Públicos** e **Configurações** — como páginas independentes, com um modal único de "Adicionar Novo Item" acessível de qualquer página do dashboard.

## Stack

- React 18 + TypeScript (modo `strict`, sem `any`)
- Vite 5
- React Router 6 (roteamento client-side)
- Tailwind CSS 3
- Supabase (`@supabase/supabase-js`) — Auth e Postgres
- lucide-react (ícones)

## Destaques do modelo de dados

- **Login sem e-mail**: o usuário só informa **usuário (username)** e senha, tanto para entrar quanto para se cadastrar em `/cadastro`. Veja a seção [Autenticação por username](#autenticação-por-username-sem-e-mail).
- **Arquivos por link, não upload**: a seção "Documentos & Arquivos" funciona como os "Links Rápidos" — o usuário cola o link de um arquivo já hospedado em outro lugar (Google Drive, OneDrive, etc.). Nada é enviado a um servidor ou bucket de storage.
- **Categorias 100% personalizadas**: cada usuário cria, renomeia e remove as próprias categorias (em Configurações ou direto no modal "Adicionar Novo Item"), em vez de escolher entre opções fixas. Renomear propaga o novo nome para todos os itens que já usavam a categoria. As cores das badges são geradas automaticamente a partir do nome da categoria.
- **Editar todos os campos de qualquer item**: cada Link Rápido, Planilha e Arquivo tem um botão de editar (ícone de lápis) que abre um modal com todos os campos do item (título/nome, URL, tipo/plataforma quando aplicável, categoria e visibilidade) — sem precisar recriar o item do zero.
- **Links, planilhas e arquivos públicos para visitantes**: ao criar ou editar qualquer um dos três tipos de item, é possível marcar "Disponibilizar para usuários visitantes" — ele passa a aparecer na página pública `/visitante`, acessível sem login.
- **Página "Itens Públicos"**: dentro do dashboard, reúne tudo que o usuário já marcou como público (links, planilhas e arquivos) em um só lugar, com atalho direto para editar ou tornar o item privado de novo.
- **Plataformas 100% personalizadas**: assim como as categorias, a "Plataforma" de cada planilha (Google Sheets, Excel, Notion...) também é livre — o usuário cria, renomeia e remove as suas em Configurações ou direto no modal de adicionar/editar planilha.
- **Configurações com formulários reais**: editar nome, trocar senha (com verificação da senha atual) e gerenciar categorias/plataformas já batem direto no Supabase (`profiles`, `auth.updateUser`, `categories`, `platforms`), com fallback simulado apenas em modo demo.
- **Navegação**: a sidebar do dashboard pode ser recolhida para modo compacto (só ícones) em telas grandes — basta clicar em qualquer área vazia dela (fora dos links) ou usar o botão dedicado no rodapé; a preferência fica salva no navegador. Um botão flutuante "voltar ao topo" aparece em páginas longas.
- **Tela de login em split-screen**: em telas grandes, a metade esquerda mostra um fundo animado de "anéis de radar/órbita" (100% CSS, sem dependências) enquanto a direita tem o formulário; em telas pequenas, colapsa para o card centralizado simples. Cadastro (`/cadastro`) e Esqueci a senha (`/esqueci-senha`) usam o outro fundo disponível, um céu estrelado com satélites cruzando a tela. Veja [Fundos decorativos animados](#fundos-decorativos-animados).

## Como rodar

```bash
npm install
cp .env.example .env      # preencha com as credenciais do seu projeto Supabase
npm run dev
```

Acesse `http://localhost:5173`. **Sem configurar o `.env`, o app roda em modo demo**: o login aceita qualquer usuário/senha e todas as telas exibem dados de exemplo (`src/features/*/mockData.ts`), para que a interface completa possa ser avaliada imediatamente.

## Autenticação por username (sem e-mail)

O Supabase Auth exige um identificador do tipo e-mail ou telefone internamente — não existe um modo "username puro" nativo. Para atender ao requisito de **não pedir e-mail ao usuário**, o app usa um padrão comum na comunidade Supabase:

1. O usuário só vê e digita **"Usuário"** e **"Senha"** — em nenhum lugar da interface aparece um campo de e-mail, nem no login nem no cadastro (`/cadastro`).
2. Nos bastidores (`src/lib/utils.ts` → `usernameToSyntheticEmail`), o username é convertido em um e-mail sintético e invisível: `usuario@my-space-pad.internal`. É esse e-mail sintético que é enviado ao `supabase.auth.signUp` / `signInWithPassword`.
3. O username real (o que o usuário de fato usa e vê) fica salvo em `profiles.username`, coluna `unique`, e é o campo lido em toda a interface (header, configurações, etc.).
4. O cadastro (`authService.signUp`) envia `username` e `full_name` como `raw_user_meta_data` — o trigger `handle_new_user` (em `supabase/schema.sql`) lê esses metadados para criar a linha em `profiles` e semear as 4 categorias padrão automaticamente.

**⚠️ Importante ao configurar o projeto Supabase**: como o e-mail é sintético (não existe uma caixa de entrada real por trás de `@my-space-pad.internal`), é necessário **desabilitar a confirmação de e-mail** em *Authentication → Providers → Email → "Confirm email"* no painel do Supabase. Caso contrário, o cadastro cria a conta mas ela nunca poderá ser confirmada, e o login falhará.

Se preferir não usar a tela de cadastro, também é possível criar contas manualmente pelo Supabase Dashboard → Authentication → Users → *Add user*, preenchendo o e-mail como `usuario@my-space-pad.internal` e definindo `raw_user_meta_data` com `{ "username": "usuario", "full_name": "Nome Completo" }`.

## Conectando ao Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql) — ele cria as tabelas (`profiles`, `categories`, `quick_links`, `spreadsheets`, `files`), o trigger de novo usuário, as políticas de **Row Level Security** (incluindo a política pública de `files.is_public`).
3. Copie a **Project URL** e a **anon public key** (em *Project Settings → API*) para o `.env`.
4. (Opcional) Gere os types reais a partir do schema:
   ```bash
   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.types.ts
   ```
5. Reinicie `npm run dev`.

## Fundos decorativos animados

Dois componentes prontos em `src/components/backgrounds/`, ambos 100% CSS (transform + opacity, sem canvas, SVG pesado ou dependências externas) e customizáveis via props:

- **`RadarOrbitBackground`** — anéis concêntricos, um feixe de varredura girando e pontos orbitando, como uma tela de radar. Usado na metade esquerda da tela de **login** (`LoginPage.tsx`), em split-screen com o formulário.
  ```tsx
  <RadarOrbitBackground
    size={420}                    // diâmetro do maior anel (px)
    ringCount={4}                  // quantos anéis concêntricos
    ringColor="rgba(165,180,252,.25)"
    sweepColor="rgba(129,140,248,.55)"
    sweepDuration={6}              // segundos por volta do feixe
    orbitCount={3}                 // quantos pontos orbitando
    orbitColor="#a5b4fc"
    orbitDurationRange={[9, 18]}   // segundos por volta orbital (sorteado por ponto)
    pingCount={2}                  // ondas expandindo do centro
    pingDuration={4}
  />
  ```
- **`StarfieldBackground`** — céu estrelado com satélites cruzando a tela em trilhas diagonais, cobrindo a página inteira (`fixed inset-0`). Usado em **`/cadastro`** e **`/esqueci-senha`**. Cada satélite sorteia uma rota nova (borda de entrada, ângulo, desvio e velocidade) toda vez que termina uma volta — usando o evento `onAnimationIteration` do CSS para trocar a trajetória exatamente no instante em que o loop reinicia — então a mesma rota nunca se repete duas vezes seguidas.
  ```tsx
  <StarfieldBackground
    starCount={120}                    // quantidade de estrelas
    satelliteCount={3}                 // satélites simultâneos
    starColor="#e2e8f0"
    satelliteColor="#a5b4fc"
    starSizeRange={[1, 2.5]}           // tamanho mín/máx das estrelas (px)
    twinkleDurationRange={[2, 5]}      // velocidade da cintilação (s)
    satelliteDurationRange={[8, 16]}   // tempo pra atravessar a tela (s)
    trailLength={140}                  // comprimento da trilha (px)
  />
  ```

Ambos respeitam `prefers-reduced-motion` (a animação é praticamente desligada para quem tem essa preferência no sistema operacional) e são puramente decorativos (`aria-hidden="true"`, `pointer-events-none`), então não atrapalham navegação por teclado nem leitores de tela.

## Scripts

| Comando            | Descrição                                  |
| ------------------- | ------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento (porta 5173)    |
| `npm run build`      | Typecheck + build de produção em `dist/`    |
| `npm run preview`    | Preview local do build de produção          |
| `npm run typecheck`  | Apenas verificação de tipos                 |
| `npm run lint`       | ESLint em todo o `src/`                     |

## Estrutura de pastas

```text
src/
├── components/
│   ├── ui/          # Botão, Input, Card, Badge, Table, Modal, Avatar, CategoryFilterTabs, ScrollToTopButton...
│   ├── layout/       # Sidebar (colapsável), Header, DashboardLayout
│   ├── modals/        # AddItemModal, EditItemModal (editar categoria/plataforma/visibilidade)
│   ├── shared/         # CategorySelect, PlatformSelect (com "+ Criar novo..."), EditableTagRow
│   └── auth/            # ProtectedRoute
├── features/          # Um módulo por funcionalidade
│   ├── auth/            # LoginForm, SignUpForm (usuário + senha, sem e-mail)
│   ├── categories/       # mockData de categorias
│   ├── platforms/        # mockData de plataformas de planilha
│   ├── quick-links/     # QuickLinkCard, QuickLinksGrid, mockData
│   ├── spreadsheets/    # SpreadsheetsTable, mockData
│   └── files/            # FileCard, FilesGrid, mockData (arquivos por link)
├── pages/              # Uma página por rota — inclui SignUpPage (/cadastro), PublicFilesPage
│                        # (/visitante, pública) e PublicItemsPage (/dashboard/publicos, privada)
├── hooks/               # useAuth, useFetchData, useCategories, usePlatforms, useQuickLinks, useSpreadsheets, useFiles, useAppData
├── services/
│   └── supabase/          # client.ts + services tipados (auth, categories, platforms, quickLinks, spreadsheets, files)
├── types/                 # Interfaces centralizadas + database.types.ts
├── context/                # AuthContext e AppDataContext (estado global)
├── lib/utils.ts             # cn(), usernameToSyntheticEmail, isValidUsername, categoryToneFor...
└── router.tsx                # Definição de rotas (inclui /cadastro e /visitante, públicas)
```

## Decisões de arquitetura

- **Estado compartilhado via Context**: `AppDataContext` centraliza Categorias, Plataformas, Links Rápidos, Planilhas e Arquivos, para que um item criado ou editado no modal global apareça imediatamente na página de listagem correspondente, sem duplicar estado.
- **Categorias e plataformas como texto livre + tabelas de apoio**: `category` e `platform` são `text` nas tabelas de conteúdo (sem enum fixo). As tabelas `categories` e `platforms` guardam a lista de nomes que cada usuário já criou — usadas para popular filtros e seletores, permitir criar um valor novo sem sair do fluxo, e para renomear (com propagação em cascata do novo nome para todos os itens que usavam o nome antigo — ver `categoriesService.rename` e `platformsService.rename`). `EditableTagRow` é o componente compartilhado por trás da UI de renomear/excluir em Configurações.
- **Editar sem recriar**: cada item tem um `update()` dedicado nos services que cobre **todos** os campos editáveis (título/nome, URL, tipo/plataforma quando aplicável, categoria e visibilidade) — não só a categoria e a visibilidade. O `EditItemModal` é `type`-aware (`"link" | "planilha" | "arquivo"`) e reaproveita os mesmos campos do `AddItemModal`, mudando apenas os rótulos por tipo. É o mesmo componente usado nas 3 listagens, na Visão Geral e na página "Itens Públicos".
- **Arquivos sem upload**: a tabela `files` guarda apenas metadados + `url` + `is_public`. Isso elimina a necessidade de um bucket de Storage, custo de armazenamento e lógica de upload/download.
- **Visibilidade pública via RLS**: a política `"Qualquer pessoa pode ver ... marcados como públicos"` libera `select` em `quick_links`, `spreadsheets` e `files` quando `is_public = true`, independentemente de autenticação — é isso que alimenta a página `/visitante`. A página `/dashboard/publicos` usa os mesmos dados já carregados no `AppDataContext`, apenas filtrados por `isPublic`, sem precisar de uma query extra.
- **Troca de senha em duas etapas**: como o Supabase não expõe um endpoint para "verificar a senha atual", `authService.updatePassword` reautentica com a senha atual informada (o que já valida se está correta) antes de aplicar a nova via `auth.updateUser`.
- **Sidebar colapsável**: o estado (expandida/recolhida) fica em `localStorage` (`my-space-pad:sidebar-collapsed`), lido de forma defensiva (`try/catch`) para não quebrar em navegação privada ou SSR. Clicar em qualquer área vazia da sidebar alterna o estado (o clique nos links faz `event.stopPropagation()` para não interferir na navegação); o botão dedicado no rodapé continua sendo o caminho acessível via teclado/leitor de tela.
- **Hooks com fallback automático**: `useFetchData` (genérico) trata `loading`/`erro`/`sucesso` e recorre a dados de demonstração quando a chamada ao Supabase falha — ideal para desenvolver a UI antes do backend estar 100% configurado.
- **Services isolam o Supabase**: nenhum componente ou hook chama `supabase` diretamente — tudo passa por `services/supabase/*.service.ts`.

## Próximos passos sugeridos

- Testes automatizados (ex: Vitest + Testing Library) para os hooks de feature e para o `AddItemModal`/`EditItemModal`.
- Reenvio de confirmação / recuperação de senha mais robustos, já que o fluxo atual de "Esqueci a senha" depende de um administrador redefinir manualmente (sem e-mail real para enviar link).
