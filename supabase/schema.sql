-- =============================================================================
-- Painel Pessoal — Schema SQL sugerido para o Supabase
-- =============================================================================
-- Como usar:
--   1. Abra o SQL Editor do seu projeto em https://app.supabase.com
--   2. Cole e rode este arquivo inteiro (ou via `supabase db push` com a CLI)
--   3. Depois disso, gere os types atualizados com:
--        npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.types.ts
--
-- Sobre autenticação por usuário (sem e-mail):
--   O app não pede e-mail para o usuário final — apenas "usuário" (username) e
--   senha. Como o Supabase Auth exige um identificador do tipo e-mail/telefone
--   internamente, ao criar cada conta (pelo Dashboard, API admin ou uma tela de
--   cadastro futura) use um e-mail sintético `usuario@my-space-pad.internal`
--   (ver src/lib/utils.ts -> usernameToSyntheticEmail) e grave o username real
--   em profiles.username, que é o único identificador exposto na interface.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- profiles — dados públicos do usuário (identificado por username, não e-mail)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_.-]{3,32}$'),
  constraint profiles_full_name_length check (char_length(btrim(full_name)) between 1 and 120)
);

comment on table public.profiles is 'Dados de perfil exibidos no painel (username, nome, avatar) — sem e-mail.';
comment on column public.profiles.username is 'Identificador único usado para login. O e-mail do auth.users é sintético e nunca exposto ao usuário.';

-- Cria automaticamente um profile ao registrar um novo usuário no Supabase Auth.
-- Espera que `raw_user_meta_data` contenha { "username": "...", "full_name": "..." }
-- (ex: enviado pela tela de cadastro futura ou pelo Dashboard do Supabase).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)))),
    btrim(coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  );

  -- Semeia categorias padrão para todo novo usuário (ele pode editar/remover depois).
  insert into public.categories (user_id, name)
  values
    (new.id, 'Trabalho'),
    (new.id, 'Estudos'),
    (new.id, 'Ferramentas'),
    (new.id, 'Pessoal');

  -- Semeia plataformas padrão de planilhas (ele pode editar/remover depois).
  insert into public.platforms (user_id, name)
  values
    (new.id, 'Google Sheets'),
    (new.id, 'Excel'),
    (new.id, 'Notion');

  return new;
end;
$$;

-- O trigger precisa executar esta função, mas ela não deve ser exposta como uma
-- RPC pública via PostgREST.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- categories — categorias 100% personalizadas, criadas livremente por cada usuário
-- -----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create unique index profiles_username_lower_uidx on public.profiles (lower(username));

create index categories_user_id_idx on public.categories (user_id);

comment on table public.categories is 'Categorias criadas livremente por cada usuário para organizar links, planilhas e arquivos.';

-- -----------------------------------------------------------------------------
-- platforms — plataformas 100% personalizadas, usadas nas planilhas do usuário
-- -----------------------------------------------------------------------------
create table public.platforms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index platforms_user_id_idx on public.platforms (user_id);

comment on table public.platforms is 'Plataformas (Google Sheets, Excel, Notion...) criadas livremente por cada usuário para suas planilhas.';

-- -----------------------------------------------------------------------------
-- quick_links — seção "Links Rápidos"
-- -----------------------------------------------------------------------------
create table public.quick_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url text not null,
  domain text not null,
  category text not null,
  -- Quando true, o link aparece na página pública (/visitante) para
  -- qualquer pessoa, mesmo sem estar autenticada.
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quick_links_user_id_idx on public.quick_links (user_id);
create index quick_links_is_public_idx on public.quick_links (is_public) where is_public = true;

-- -----------------------------------------------------------------------------
-- spreadsheets — seção "Central de Planilhas"
-- -----------------------------------------------------------------------------
create table public.spreadsheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform text not null,
  url text not null,
  category text not null,
  -- Quando true, a planilha aparece na página pública (/visitante) para
  -- qualquer pessoa, mesmo sem estar autenticada.
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index spreadsheets_user_id_idx on public.spreadsheets (user_id);
create index spreadsheets_is_public_idx on public.spreadsheets (is_public) where is_public = true;

-- -----------------------------------------------------------------------------
-- files — seção "Arquivos & Documentos"
-- -----------------------------------------------------------------------------
-- IMPORTANTE: arquivos são representados por um LINK externo (Google Drive,
-- OneDrive, etc.) — nada é enviado a um bucket de Storage. Isso mantém o app
-- simples e sem custos de armazenamento próprio.
create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  file_type text not null check (file_type in ('PDF', 'DOC', 'Imagem', 'Planilha', 'Outro')),
  url text not null,
  category text not null,
  -- Quando true, o arquivo aparece na página pública (/visitante) para
  -- qualquer pessoa, mesmo sem estar autenticada.
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index files_user_id_idx on public.files (user_id);
create index files_is_public_idx on public.files (is_public) where is_public = true;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.platforms enable row level security;
alter table public.quick_links enable row level security;
alter table public.spreadsheets enable row level security;
alter table public.files enable row level security;

-- Princípio do menor privilégio: o cliente usa apenas leitura pública para os
-- itens explicitamente publicados e CRUD para os próprios registros.
revoke all on table public.profiles, public.categories, public.platforms,
  public.quick_links, public.spreadsheets, public.files from anon;
revoke all on table public.profiles, public.categories, public.platforms,
  public.quick_links, public.spreadsheets, public.files from authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.platforms to authenticated;
grant select, insert, update, delete on public.quick_links to authenticated;
grant select, insert, update, delete on public.spreadsheets to authenticated;
grant select, insert, update, delete on public.files to authenticated;

-- Visitantes anônimos só precisam ler registros explicitamente públicos.
grant select on public.quick_links, public.spreadsheets, public.files to anon;

-- profiles: o usuário só vê e edita o próprio perfil
create policy "Usuários podem ver o próprio perfil"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Usuários podem atualizar o próprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- categories: CRUD restrito ao dono do registro
create policy "Usuários podem ver as próprias categorias"
  on public.categories for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem criar as próprias categorias"
  on public.categories for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar as próprias categorias"
  on public.categories for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem excluir as próprias categorias"
  on public.categories for delete
  to authenticated
  using (auth.uid() = user_id);

-- platforms: CRUD restrito ao dono do registro
create policy "Usuários podem ver as próprias plataformas"
  on public.platforms for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem criar as próprias plataformas"
  on public.platforms for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar as próprias plataformas"
  on public.platforms for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem excluir as próprias plataformas"
  on public.platforms for delete
  to authenticated
  using (auth.uid() = user_id);

-- quick_links: CRUD restrito ao dono do registro
create policy "Usuários podem ver os próprios links"
  on public.quick_links for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem criar os próprios links"
  on public.quick_links for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar os próprios links"
  on public.quick_links for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem excluir os próprios links"
  on public.quick_links for delete
  to authenticated
  using (auth.uid() = user_id);

-- ...e QUALQUER PESSOA (inclusive visitantes não autenticados) pode ler os
-- links marcados como públicos.
create policy "Qualquer pessoa pode ver links marcados como públicos"
  on public.quick_links for select
  to anon
  using (is_public = true);

-- spreadsheets: CRUD restrito ao dono do registro
create policy "Usuários podem ver as próprias planilhas"
  on public.spreadsheets for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem criar as próprias planilhas"
  on public.spreadsheets for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar as próprias planilhas"
  on public.spreadsheets for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem excluir as próprias planilhas"
  on public.spreadsheets for delete
  to authenticated
  using (auth.uid() = user_id);

-- ...e QUALQUER PESSOA (inclusive visitantes não autenticados) pode ler as
-- planilhas marcadas como públicas.
create policy "Qualquer pessoa pode ver planilhas marcadas como públicas"
  on public.spreadsheets for select
  to anon
  using (is_public = true);

-- files: dono tem CRUD completo...
create policy "Usuários podem ver os próprios arquivos"
  on public.files for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem criar os próprios arquivos"
  on public.files for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar os próprios arquivos"
  on public.files for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários podem excluir os próprios arquivos"
  on public.files for delete
  to authenticated
  using (auth.uid() = user_id);

-- ...e QUALQUER PESSOA (inclusive visitantes não autenticados) pode ler os
-- arquivos marcados como públicos — é o que alimenta a página /visitante.
create policy "Qualquer pessoa pode ver arquivos marcados como públicos"
  on public.files for select
  to anon
  using (is_public = true);
