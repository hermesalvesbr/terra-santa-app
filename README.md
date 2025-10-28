# Terra Santa - Catálogo Diocesano Digital

**Projeto:** Terra Santa (terrasanta.app)

# 1) Objetivos e critérios de sucesso

**Objetivo principal:** catálogo diocesano navegável e confiável, com uma página dedicada para cada entidade e agendas sempre atualizadas.

**KPIs práticos**

- Tempo para encontrar um horário de missa ≤ 15s (via busca + filtros).
- Taxa de clique em WhatsApp/Instagram/YouTube por entidade.
- % de agendas com próxima ocorrência calculada corretamente (meta ≥ 95%).
- Tempo médio de atualização de conteúdo (da edição à publicação) ≤ 1h.

**Requisitos não-funcionais**

- **Disponibilidade:** 99,9% (páginas estáticas + cache ISR/SWR).
- **Desempenho:** TTFB < 300ms em páginas mais acessadas.
- **Acessibilidade:** WCAG AA (contraste, navegação por teclado e textos alternativos).
- **Privacidade:** exibir telefone/WhatsApp apenas com consentimento do responsável.

---

# 2) Arquitetura de informação (IA)

**Hierarquia oficial (navegação top-down e busca global):**

- **Diocese** → lista de **Paróquias** (por cidade/UF) → lista de **Capelas** → lista de **Comunidades/Grupos**.
- **Atalhos por intenção:** “Missas hoje”, “Terço dos Homens perto de mim”, “Por cidade”, “Por dia da semana”.

**Páginas (todas com breadcrumbs, agenda e contatos):**

1. **Diocese** (Visão geral + mapa de paróquias + eventos diocesanos).
2. **Paróquia** (perfil, matriz, lista de capelas, agenda, mídias).
3. **Capela** (localização, responsável, comunidades, agenda, mídias).
4. **Comunidade/Grupo** (responsável, descrição, agenda, canais).
5. **Busca/Explorar** (filtros por cidade, dia da semana, faixa de horário, tipo de evento).
6. **Página de evento (opcional)** para destaques (ex.: festa do padroeiro).

**Navegações complementares**

- **Mapa interativo** (paróquias/capelas).
- **Calendário** (visual mensal/semanal) + **lista da “próxima ocorrência”** por entidade.
- **Diretório de responsáveis** (com opt-in para WhatsApp).

---

# 3) Modelo de dados (Directus) — coleções e relações

> Sem código, apenas definição de **entidades** e **campos-chave**. Tudo com **status** (rascunho/publicado) e **slug** único para URL.

**Entidades principais**

- **Dioceses**
  - Identidade: nome, slug, história/descrição, foto de capa.
  - Contatos: site, Instagram, YouTube, WhatsApp institucional.
  - Bispo (pessoa).

- **Paróquias**
  - Identidade: nome, slug, cidade, UF, endereço, foto de capa.
  - Relações: diocese (M2O), pároco (pessoa), lista de capelas (O2M).
  - Canais: site, Instagram, YouTube, WhatsApp institucional.

- **Capelas**
  - Identidade: nome, slug, endereço, geolocalização (lat/lng), foto de capa.
  - Relações: paróquia (M2O), responsável (pessoa), comunidades (O2M).
  - Canais: Instagram, YouTube (se houver), WhatsApp do responsável (opt-in).

- **Comunidades/Grupos**
  - Identidade: nome, slug, descrição curta.
  - Relações: capela (M2O), coordenador (pessoa).
  - Canais: Instagram, WhatsApp do coordenador (opt-in).

- **Pessoas**
  - Nome, função (pároco, diácono, coordenador etc.), foto, e-mail, telefone, WhatsApp, Instagram.
  - **Privacidade por campo** (exibir/ocultar no site).

- **Eventos (Agenda unificada)**
  - Título (ex.: Missa Dominical, Terço dos Homens), descrição (opcional).
  - **Âncora de entidade**: `entidade_tipo` (diocese | paroquia | capela | comunidade) e `entidade_id`.
  - **Recorrência** (mínimo viável e robusto):
    - `semanal`: dia_da_semana (dom..sáb), hora.
    - `mensal`: “n-ésima semana + dia da semana” (ex.: 1ª sexta, 3º domingo) + hora.
    - `único`: data e hora específicas.

  - **Janela de validade**: data_inicio (obrigatória para recorrentes), data_fim (opcional).
  - **Exceções**: coleção **eventos_excecoes** (data específica marcada como cancelada/alterada, com observação).
  - **Metadados**: tipo (missa, terço, catequese, confissão…), acessibilidade (ex.: com intérprete de Libras), idioma.

**Mídias**

- **Arquivos** (imagens/vídeos) associados às entidades; **alt text** obrigatório.
- **Galerias** por entidade (ordenação manual).

**Observações de modelagem**

- **Slugs imutáveis** (ou com redirecionamentos se mudarem).
- **Campos sociais validados** (formato wa.me/55…, @handle no Instagram).
- **Consentimento**: flags “exibir_whatsapp_publicamente” por pessoa/entidade.

---

# 4) Estrutura de URLs (SEO e previsibilidade)

**Domínio:** terrasanta.app

- Diocese: `/d/[slug]`
- Paróquia: `/[uf]/[cidade]/[paroquia]`
- Capela: `/[uf]/[cidade]/[paroquia]/[capela]`
- Comunidade: `/[uf]/[cidade]/[paroquia]/[capela]/[comunidade]`

**Boas práticas**

- Slugs minúsculos, sem acentos, hifens entre palavras.
- **Breadcrumbs** coerentes com a hierarquia.
- **Canonical** quando houver múltiplos caminhos (evitar conteúdo duplicado).
- Redirecionamentos 301 ao renomear slugs.

---

# 5) Experiência do usuário (UX) e design (Vuetify MD3 Expressive)

**Componentes essenciais**

- **Card de entidade** (capa, nome, cidade, CTA para WhatsApp/Instagram/YouTube se aplicável).
- **Schedule/Agenda**: lista por “próxima ocorrência” + visão semanal/mensal.
- **SocialLinks**: ícones padronizados com rótulos (acessibilidade).
- **Mapa**: embed com marcador e link “Rotas”.
- **Breadcrumbs** e **CTA primário** (ex.: “Falar com a paróquia”).
- **Estado vazio**: mensagens claras (“Horários ainda não cadastrados”).

**Fluxos críticos**

- **Encontrar missa hoje**: Home → filtro “Hoje” → cidade → paróquia/capela → horário → CTA “Como chegar”.
- **Terço dos Homens**: Busca por comunidade → filtro “quarta-feira à noite” → capela → WhatsApp do coordenador.
- **Acesso mobile**: ícones grandes, atalhos para “Hoje/Esta semana”, CTA fixo inferior (WhatsApp).

---

# 6) Busca e filtros (sem expor implementação)

**Facetas**

- Localidade (UF, cidade), tipo (missa/terço/catequese/…),
- Dia da semana, faixa de horário (manhã/tarde/noite),
- Acessibilidade (rampa, intérprete, ar-condicionado),
- Entidade (paróquia/capela/comunidade).

**Regras de ordenação**

- Próximas ocorrências primeiro.
- Preferir resultados da **cidade do usuário** (se consentir localização) ou configurar **padrão diocesano**.

---

# 7) Governança de conteúdo (Directus) e papéis

**Papéis e permissões**

- **Administrador Diocesano:** tudo (estrutura, usuários, aprovação).
- **Editor de Paróquia:** edita sua paróquia, suas capelas, agendas locais.
- **Editor de Capela:** edita a capela e comunidades subordinadas.
- **Coordenador de Comunidade:** edita dados e agenda da própria comunidade.
- **Leitor/Visitante:** acesso somente leitura via site.

**Fluxo editorial**

1. Rascunho → Revisão (opcional) → Publicado.
2. **Publicar/Despublicar** por entidade e por evento.
3. **Logs** de alterações (quem editou o quê/quando).
4. **Notificações** (ex.: alteração de horário demanda aprovação do nível superior).

**Qualidade dos dados**

- Campos obrigatórios: nome, slug, cidade/UF (paroquia), endereço (capela), ao menos 1 canal de contato.
- Foto de capa ≥ 1600px (horizontal), com alt text significativo.
- Agendas recorrentes **sempre** com data_inicio e hora.
- Exceções registradas com antecedência (ex.: feriados, Semana Santa).

---

# 8) Agenda e recorrências: regras de negócio

**Cálculo de “próxima ocorrência” (timezone America/Recife)**

- Para **semanal**: próximo dia_da_semana ≥ hoje; se hoje e hora já passou, rola para a próxima semana.
- Para **mensal (n-ésima semana + dia)**: ancorar no mês corrente; se já passou, avançar mês.
- Para **único**: filtrar por data ≥ agora.
- **Exceções**: se existir exceção “cancelado” na data calculada, buscar próxima válida; se “alterado”, usar horário/local observados.
- **Janela de validade**: respeitar data_inicio/data_fim.

**Exibição**

- Lista de próximas 3–5 ocorrências por entidade.
- Calendário semanal/mensal com avisos das exceções.
- Destaque para **hoje** e **agora** (chip/etiqueta).

---

# 9) SEO, descoberta e interoperabilidade

**SEO on-page**

- Títulos e descrições únicos por entidade.
- Conteúdo estruturado (resumo histórico + serviços/agenda).
- Imagens com alt text e dimensões adequadas (evitar CLS).

**Dados estruturados (schema.org)**

- `Organization`/`CatholicChurch` para paróquias/capelas.
- `Event` para cada ocorrência próxima (mínimo: name, startDate, location).
- `BreadcrumbList` por página.

**Sitemap e feeds**

- Sitemap dinâmico com todas as entidades publicadas.
- **Feed iCal (ICS)** por entidade (assinável em calendários pessoais).
- RSS/Atom (opcional) para destaques diocesanos.

---

# 10) Desempenho & cache

**Cache em camadas**

- CDN/ISR para páginas públicas (expiração curta 1–5 min; invalidação automática em publicação no CMS).
- SWR de 60–120s para listas de agendas (o site nunca “quebra” em horário de pico).
- Imagens com transformação on-the-fly (qualidade e tamanhos responsivos).

**Escalabilidade**

- Páginas de listagem paginadas e facetadas.
- Limitar payload (carregar agenda “próximos 30 dias” por padrão).
- Telas longas com “load more” e placeholders skeleton.

---

# 11) Privacidade, segurança e legal

- **WhatsApp e telefone**: exibir apenas com consentimento explícito; alternativa: formulário de contato.
- **Ocultar dados pessoais sensíveis** por padrão (endereços residenciais, e-mails pessoais).
- **Política de uso de imagem** para fotos em galerias (consentimento).
- **Auditoria**: trilha de alterações por usuário/entidade.
- **Backups** regulares do CMS e versão dos conteúdos críticos.

---

# 12) Observabilidade e qualidade

- **Analytics** (páginas mais vistas, pesquisas internas, CTAs de WhatsApp/Instagram/YouTube).
- **Sentry/Logrocket** (opcional) para erros de UI.
- **Relatórios mensais**: conteúdos desatualizados (ex.: eventos sem ocorrência futura), entidades sem foto/contato.

---

# 13) Roadmap por fases

**Fase 1 — MVP (2–3 semanas)**

- Estrutura de dados mínima (diocese, paróquias, capelas, comunidades, pessoas, eventos).
- Páginas por entidade com listas de próximas ocorrências.
- Busca básica (cidade + tipo + dia da semana).
- Sitemap e metas SEO básicos.

**Fase 2 — Engajamento**

- Calendário semanal/mensal nas páginas.
- Feeds ICS por entidade.
- Mapa interativo e rotas.
- Painel editorial com relatórios de qualidade (conteúdo faltante).

**Fase 3 — Experiência avançada**

- Exceções de eventos + destaques diocesanos.
- Filtros por acessibilidade e faixa de horário.
- Importador CSV para agendas.
- Notificações (e-mail/WhatsApp interno) para alterações críticas.

---

# 14) Aceite: checklist de validação

- [ ] Toda entidade publicada possui **foto de capa**, **slug** e **canais**.
- [ ] Cada paróquia tem ao menos uma **capela** vinculada (a matriz).
- [ ] Ao menos 1 **evento recorrente** por paróquia/capela/comunidade.
- [ ] “Próxima ocorrência” confere em **America/Recife**.
- [ ] **Breadcrumbs** e **canonical** corretos em todas as páginas.
- [ ] **Sitemap** lista 100% das entidades publicadas.
- [ ] **Feed ICS** entregue por entidade e importável.
- [ ] Métricas de **cliques** em WhatsApp/Instagram ativas.
- [ ] Acessibilidade AA (labels, alt text, foco visível).

---

## Como isso atende às suas expectativas

- **“Uma página para tudo da Diocese / Igreja / Capelas / Comunidades”**: cada nível tem página própria com **agenda, fotos, links e contatos**; navegação por breadcrumbs e por filtros.
- **Horários confiáveis**: modelagem de **recorrência + exceções**, cálculo de **próxima ocorrência** e janela de validade; visão **hoje/esta semana**.
- **Canais de contato**: WhatsApp/Instagram/YouTube por entidade e por responsável (com **consentimento** e visibilidade controlada).
- **Escalável e governável**: papéis e permissões por nível (diocese, paróquia, capela, comunidade); fluxo de publicação; relatórios de qualidade.
- **Rápido e estável**: cache em camadas, imagens otimizadas, páginas estáticas onde possível.
- **Descoberta e SEO**: URLs previsíveis, dados estruturados, sitemap e feeds.
