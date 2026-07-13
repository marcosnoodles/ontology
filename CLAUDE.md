# CLAUDE.md — Moonrite Compêndio

Lido automaticamente pelo Claude Code ao abrir o projeto. Leia por completo antes de agir.

## Divisão de trabalho (importante)

Este projeto é iterado em DOIS lugares:
- **Claude no chat (claude.ai)** — onde o Marcos decide DESIGN: ontologia, modelagem, o que é
  cada entidade e como se relacionam. As mudanças de modelo nascem lá e chegam aqui como briefing.
- **Você (Claude Code, PC dedicado)** — onde o código vira commit e deploy: aplicar mudanças,
  validar, commitar, publicar. Você também faz trabalho puro de código (bug, refactor, CSS).

Se o Marcos pedir uma mudança que altera a ONTOLOGIA (o que é uma entidade, que tipos existem,
como se relacionam), não improvise: aplique o que estiver no briefing. Se não houver briefing e a
mudança for estrutural, diga a ele que vale decidir isso no chat de design primeiro.

## Contexto

*Moonrite*: jogo survival-crafting whimsical, demo pública set/2026. Haki Studios (Marcos = CEO).
Este app é a **ontologia do jogo como livro navegável** + autoria + análise.

NÃO é ferramenta de produção. Status, esforço, responsáveis, "não iniciado" **não entram aqui** —
isso vive só no Notion do time. Aqui é entidades, economia, progressão.

Marcos trabalha em português, não é confortável com terminal. **Rode os comandos você mesmo**;
não peça pra ele digitar. Confirme antes de qualquer push.

## Arquitetura

- `index.html` — shell + todo o CSS. Carrega `<script src="app.js">`.
- `app.js` — todo o modelo + lógica. Modelo padrão em `defaultModel()`.
- Site estático puro: sem build, sem framework, sem dependências de runtime.
  (`node_modules/` só existe pra testes jsdom; está no .gitignore.)
- Estado do usuário: `localStorage` (chave `mr_model`). Export/Import JSON no rodapé.
- Há migração automática no fim do `app.js` (`modelIsCurrent`) que recria o modelo quando a
  taxonomia muda. **Se você mudar a taxonomia, atualize esse guard**, senão usuários antigos
  ficam presos no modelo velho.

## A ONTOLOGIA (o coração — leia com atenção)

Dois eixos independentes. NÃO colapse os dois numa lista plana de categorias (erro já cometido).

### Eixo 1 — o que a entidade É (taxonomia com HERANÇA)

Cinco supertipos. Cada categoria pertence a um supertipo (campo `super` em `CATEGORIES`):

- **Item** — tudo que entra no inventário. É o SUPERSET.
  Subtipos: `Raw Resource`, `Component`, `Tool`, `Weapon`, `Equipment`, `Consumable`.
- **WorldObject** — existe no mundo, NÃO entra no inventário.
  Subtipos: `Gatherable`, `Station`, `Buildable`.
- **Actor** — vivo/agente. Subtipos: `Player`, `Spirit`, `Creature`, `Enemy`.
- **System** — abstração de regras. Subtipos: `System`, `System State`.
- **Local** — os lugares. Categoria única `Local`, com campo `level` (Bioma/POI/Sub-área).

### Regras duras da ontologia (violá-las é bug de modelagem)

1. **Item é o conjunto maior**: qualquer coisa que caiba no inventário É um Item. Raw Resource,
   equipamento, drop de monstro, drop de gatherable — todos herdam de Item.
2. **Gatherable NÃO é um item.** É um prop no mundo (árvore, Boulders, moita) que **dropa** itens.
   O prop é a FONTE; o item que cai é o Raw Resource. Ex: Regular Tree (Gatherable) dropa Log
   (Raw Resource). Boulders dropa Stone.
3. **Raw Resource nunca é craftado.** Só se obtém no mundo. É folha do grafo de craft.
4. **pickable NÃO é um tipo** — é uma forma de obtenção (verbo/relação). Vai em campo, não em categoria.
5. **Buildable nasce no mundo**, não passa pelo inventário. Por isso é WorldObject, não Item.
   O tipo de peça (foundation/wall/roof/stair/opening) é um CAMPO (`pieceType`), não uma categoria.
6. **Local é eixo próprio**, não um WorldObject. Um Local não *está* no mundo — ele *é* o mundo.
   Aninha via campo `parent` (Bioma ⊃ POI ⊃ Sub-área) e lista conteúdo via campo `contains`.

### Eixo 2 — relações (as arestas)

`dropsItem` (Gatherable/Actor → Item), `craftedAt` (Item+Item → Station → Item), `refinedFrom`,
`feeds` (Item → System State), `unlocks`, `gates` (chave → Local/State), `contains` (Local → tudo),
`parent` (Local → Local), `commands` (Player → Spirit), `build` (recursos → Buildable).

## Schema

Entidade: `{name, category, path, nature, description, fields{}}`
- `path` ∈ `critico` | `estendido` | `opcional`
  (crítico = esqueleto mínimo até o boss final; estendido = extrapolação; opcional = ramo lateral)
- `fields` são específicos por categoria (definidos em `CATEGORIES[cat].fields`)

Fluxo: `{id, name, kind, station, inputs{}, out{}, path}`
- `kind` ∈ `craft` | `refino` | `cozinha` | `feed` | `coleta` | `build`
- **coleta e feed NÃO contam como craft** na análise de órfãos (drop ≠ craft).
- craft-like (contam): craft, refino, cozinha, build.

Gate: `{id, name, key, unlocks, path}`

Combos (brainstorm): `model.combos[key] = {marked, note}`

## Estado atual do modelo padrão

**57 entidades · 29 fluxos · 7 gates · 5 eixos.** Zero órfãos, zero refs quebradas.
Fluxos por tipo: coleta 6, craft 8, refino 4, cozinha 4, feed 4, build 3.

## As 6 abas

1. **Compêndio** — o livro. Nav agrupada por SUPERTIPO → categoria. Página de entidade mostra
   badge de supertipo, glossário da categoria, stats, e relações clicáveis (produzido por / usado
   em / é chave para / estados / contém / dentro de / encontrado em).
2. **Autoria** — formulários de entidade/fluxo/gate, campos específicos por categoria.
3. **Fluxos** — economia agrupada por kind + seção "Análise" (órfãos: craftáveis sem receita,
   raws fora de fluxo, ghost refs).
4. **Chave & Cadeado** — progressão em 3 trilhas coloridas (crítico/estendido/opcional).
5. **Combinações** — gerador de combinações de 1/2/3 Items COM repetição. Usa só o supertipo Item
   (exclui Gatherable/Buildable/Station/Actor). Marca ideia (★), anota tema, promove a receita.
   Teto de 400 combinações na tela; o ideal é marcar 5–8 itens por vez.
6. **Ontologia** — diagrama abstrato dos 5 eixos (SVG inline) + glossário rigoroso de cada tipo.

## Git / Deploy

- Repo: https://github.com/marcosnoodles/ontology
- Netlify (site `ontologyhaki`) publica da **master**. Publish dir = raiz (`.`), sem build command.
- `index.html` DEVE ficar na raiz do repo (404 anterior foi por arquivo aninhado).
- Deploy = push na master → Netlify republica sozinho (~1min).
- Marcos quer **escolher branch vs master a cada vez**. SEMPRE pergunte antes do push.
- Histórico: branch com pontos no nome (`v.26.07.02.01.01`) já quebrou o deploy
  ("git ref does not exist"). Prefira `main`/master + tags pra versionar.

## Validação obrigatória antes de commitar

```
node -c app.js
```
E cheque a integridade do modelo: zero refs fantasma (nome citado em fluxo que não existe como
entidade) e zero craftáveis sem receita. Se mudar a taxonomia, rode um boot headless (jsdom) pra
garantir que as abas renderizam.

Não introduza status/esforço/produção no modelo.

## Decisões em aberto (NÃO resolver sozinho — perguntar ao Marcos)

- **Devourer vs Aquiles**: aqui o boss final do 1º bioma é o **Devourer**, com Aquiles como
  sub-boss. O time no Notion ainda modela Aquiles como boss único. Marcos precisa alinhar com o
  time. NÃO "corrija" o modelo de volta pro Aquiles.
- **Campo `level` do Local**: hoje é texto livre (Bioma/POI/Sub-área). Marcos considerou virar um
  seletor fechado. Não decidido.
- **Juntar index.html + app.js num arquivo só**: considerado, não decidido.
