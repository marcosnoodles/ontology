# Briefing — versão "Ontologia rigorosa" (a aplicar)

Cole isto no Claude Code (sessão remota) para ele aplicar e publicar.

## O que mudou nesta versão

Reconstrução da taxonomia. O modelo antigo tratava categorias como lista plana, misturando
"o que a coisa é" com "de onde ela vem". Agora há **herança de tipos em 5 eixos**.

### 1. Item virou SUPERTIPO
Tudo que entra no inventário É um Item. Subtipos: Raw Resource, Component, Tool, Weapon,
Equipment, Consumable. Antes "Item" era uma categoria irmã de Equipment — errado.
- `Weapon/Tool` foi separado em `Weapon` e `Tool`.
- Os antigos "Item" intermediários (Stick, Stone Blade, Bone Blade, Leather) viraram `Component`.

### 2. Gatherable deixou de ser item
Gatherable é um **prop no mundo** que DROPA itens; não vai ao inventário. Criados:
- `Regular Tree` (Gatherable) → dropa `Log` (Raw Resource)
- `Boulders` (Gatherable) → dropa `Stone`
- `Light Flower Bush` (Gatherable) → dropa `Light Flower`
Antes Boulders/Light Flower eram tratados como coletáveis-item. Corrigido.

### 3. Buildable (sistema de construção granular)
Nova categoria `Buildable` (WorldObject — **nasce no mundo, NÃO passa pelo inventário**).
O tipo de peça é um CAMPO `pieceType` (foundation/wall/roof/stair/opening), não uma categoria.
Novo `kind: build` nos fluxos. Novo sistema `Sistema de Construção`.
Peças de exemplo: Wooden Foundation, Wooden Wall, Wooden Floor.

### 4. Local virou eixo próprio
`Area` saiu de WorldObject e virou o supertipo **Local** (categoria única `Local`).
Campos: `level` (Bioma/POI/Sub-área), `parent` (aninhamento), `contains`.
Hierarquia modelada: Primeiro Bioma ⊃ POI Inicial / Overworld ⊃ POIs de boss / Clareira.

### 5. Nova aba Ontologia
Diagrama abstrato dos 5 eixos (SVG inline) + glossário rigoroso de cada tipo.
Nav do Compêndio agora agrupa por supertipo. Página de entidade mostra badge de supertipo +
glossário da categoria.

### 6. Aba Combinações (de uma leva anterior, já incluída)
Gerador de combinações de 1/2/3 Items COM repetição. Usa só o supertipo Item — exclui
Gatherable/Buildable/Station/Actor automaticamente. Marca ★, anota tema, promove a receita.

## Arquivos alterados
Só `index.html` e `app.js`.

## Modelo resultante
57 entidades · 29 fluxos · 7 gates · 5 eixos. Zero órfãos, zero refs quebradas.

## Migração
O guard `modelIsCurrent()` em app.js foi atualizado para detectar a categoria `Local` e
`Buildable`. Usuários com modelo antigo no localStorage recebem o novo automaticamente.

## O que fazer

1. Aplique os arquivos `index.html` e `app.js` atualizados.
2. Valide: `node -c app.js` + confira zero refs fantasma e zero craftáveis sem receita.
3. Me mostre o diff.
4. Pergunte se subo em branch ou na master. **Não faça push sem confirmação.**
5. Mensagem de commit sugerida:
   `Ontologia rigorosa: 5 eixos (Item supertipo, Local, Buildable), aba Ontologia e Combinações`
