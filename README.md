# TerraSanta.App – Catálogo Mobile de Dioceses, Paróquias & Comunidades

## Visão Geral

O TerraSanta.App é um catálogo digital mobile-first que oferece, para cada nível da hierarquia eclesial (Diocese → Paróquia → Comunidade), uma página dedicada com contatos, mídias, horários, equipes, ministérios e links sociais. A experiência é otimizada **apenas para celular**, utilizando componentes de Vuetify e rotas claras.

## Hierarquia de Navegação

1. **Tela inicial – Lista de Dioceses**
   - Exibe todas as dioceses cadastradas (cards/lista).
   - Cada card mostra: nome da diocese, estado ou região, mini-imagem.
   - Campo de busca ou filtro (“Buscar diocese”, “Filtrar por UF”).
   - Tocar em uma diocese → navega para a tela da diocese.

2. **Tela da Diocese** (`/d/[slug-diocese]`)
   - Mostra dados da diocese: nome, imagem capa, bispo, contatos.
   - Lista de paróquias vinculadas à diocese (cards com nome, cidade/UF, foto capa).
   - Busca interna por paróquia.
   - Navegação “Voltar” para home.

3. **Tela da Paróquia** (`/p/[slug-paroquia]`)
   - Cabeçalho: nome, cidade/UF, foto capa.
   - Seção “Informações”: endereço, telefone/WhatsApp/Instagram (com consentimento), clero/pároco.
   - Seção “Horários e Serviços”: secretaria paroquial, missas, confissões, adoração, festa do padroeiro.
   - Seção “Comunidades/Grupos”: lista de comunidades vinculadas (cards com nome, ícone/foto breve).
   - Tocar em comunidade → tela da comunidade.

4. **Tela da Comunidade / Grupo** (`/c/[slug-comunidade]`)
   - Cabeçalho: nome, capela ou local de encontro, foto.
   - Seção “Descrição”: missão, coordenador(es), redes sociais.
   - Seção “Equipes/Ministérios”: lista de times (ex.: Catequese, Ministério de Música, Terço dos Homens) com nome, responsável, mini-foto.
   - Seção “Próximos Eventos / Agenda” da comunidade.
   - Ações rápidas: WhatsApp, Instagram do coordenador.

## Padrões de Navegação Mobile

- Usar `v-app-bar` no topo com logo “TerraSanta.App”, ícone de busca, perfil/usuário.
- Usar `v-bottom-navigation` no rodapé com **quatro botões principais** (ver detalhe abaixo).
- Listas em formato de cards ou linhas expansíveis – adequada para escaneabilidade em mobile.
- Em cada tela, mostrar **breadcrumb ou botão “Voltar”** para garantir que o usuário sabe em que nível está.
- Campo de busca no topo das listas para permitir encontrar entidades diretamente.

## Rotas e Estrutura

- `/d/[slug-diocese]` → página da diocese.
- `/p/[slug-paroquia]` → página da paróquia.
- `/c/[slug-comunidade]` → página da comunidade.

> Exemplo: `/d/salgueiro/p/imaculada-conceicao/c/capela-sao-jose`

Boa observação — ótimo que você destaque que o ícone central muda conforme o nível (diocese, paróquia, comunidade) e que os botões são “Agenda”, “Mapa”, “Notícias/Time” (ou “Equipe”). Vamos refinar o bloco **Footer – 4 Botões Inteligentes** com essa variação de ícone central e com nomenclatura adaptada: “Notícias” em vez de “Equipe/Mais”, “Time” ou “Equipe”.

![Image](https://i.ytimg.com/vi/_ScUHm1p70U/maxresdefault.jpg)

![Image](https://miro.medium.com/v2/resize%3Afit%3A1400/1%2AM_O4Ifns0far8YFEhLPpeg.png)

![Image](https://ps.w.org/mobile-bottom-menu-for-wp/assets/banner-1544x500.png?rev=2878652)

![Image](https://assets.justinmind.com/wp-content/uploads/2021/02/bottom-nav-bar.png)

---

### Footer – 4 Botões Inteligentes (visíveis em todos os níveis)

Para consistência e usabilidade em dispositivos móveis, o rodapé apresentará **quatro botões estáveis**, e o **ícone central muda** conforme o nível hierárquico da navegação (diocese → paróquia → comunidade). Isso permite que o usuário identifique rapidamente o contexto atual e tenha acesso direto à “home” desse nível.

| Botão       | Ícone sugerido                  | Rótulo          | Funcionalidade                                                                                                                                                                                                                                                                                                                                                                |
| ----------- | ------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mapa        | 🏠 (casa)                       | Mapa            | Mostra como chegar endereco e etc                                                                                                                                                                                                                                                                                                                                             |
| Agenda      | 📅 (calendário/relógio)         | Agenda          | Exibe os horários/agenda do **nível atual** (diocese, paróquia ou comunidade).                                                                                                                                                                                                                                                                                                |
| **Central** | (varia conforme nível)          | Local / Mapa\*  | Leva à página inicial da navegação: se no nível comunidade → retorna à paróquia; se em paróquia → à diocese; se em diocese → ao hub de dioceses. No nível Diocese: o ícone poderia ser um mapa de paróquias; <br>nível Paróquia: pin de capelas/locais; <br>nível Comunidade: local da capela ou “detalhes da comunidade”. Tocar leva à página “home” desse nível específico. |
| Notícias    | 📰 (ou pessoas/ícone de equipe) | Notícias / Time | Exibe “Notícias e Equipe” ou “Time / Ministérios” relativas ao nível atual.                                                                                                                                                                                                                                                                                                   |

---

### Detalhes de comportamento

- O botão central é **contextual**: muda visualmente (ícone) e funcionalmente de acordo com o nível hierárquico, reforçando qual “home” está sendo acessado.
- Os outros três botões mantêm função consistente em todos os níveis (Início, Agenda, Notícias/Time).
- Cada botão deve ter **ícone + rótulo curto** (1 palavra) para clareza em mobile.
- O rodapé permanece fixo no mobile, permitindo acesso rápido, com área de toque recomendada (mínimo ~44×44 dp) para operabilidade com o polegar. ([Medium][1])
- A bandeira “ativo/inativo” deve ser claramente visível: ícone preenchido ou cor destacada para o botão selecionado. ([Medium][1])

### Por que quatro botões?

- Design de navegação de fundo (bottom navigation) recomenda **3 a 5 destinos principais** para evitar confusão. ([Medium][1])
- Manter os botões fixos em todos os níveis melhora a previsibilidade e facilita o uso com o polegar em smartphones de tela grande. ([AppMySite][2])
- Adaptação dos ícones ao contexto garante que mesmo sendo os mesmos botões visuais, a ação que realizam é relevante para o nível em que o usuário está.

## Especificações Técnicas

- **Front-end**: Nuxt 4 + Vuetify 3.9
- **Backend**: Directus 20 (API REST ou GraphQL)
- **URLs**: rotas slug-based conforme hierarquia acima
- **Coleções do backend**: dioceses, paróquias, comunidades, pessoas, clero, horários (agenda)
- **Permissões**:
  - Editor de paróquia: editar apenas sua paróquia e suas comunidades/horários
  - Coordenador de comunidade: editar apenas sua comunidade
  - Leitura pública: acesso somente leitura às entidades públicas

- **Modelagem de dados**: cada entidade tem slug, imagem capa, contatos, redes sociais, vínculo hierárquico (ex.: paróquia → diocese), lista de filhos (ex.: comunidades)
- **Exibição de agenda**: cada página de entidade deve exibir agenda atual e próximos eventos baseado em sua coleção de horários vinculados

## Métricas de Sucesso

- Tempo para encontrar o próximo horário de missa ≤ 15 segundos
- Taxa de clique em WhatsApp / Instagram / YouTube por entidade
- Percentual de agendas com próxima ocorrência calculada corretamente ≥ 95%
- Tempo médio de atualização de conteúdo (edição → publicação) ≤ 1 hora
