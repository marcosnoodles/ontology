# CLAUDE.md — Moonrite Compêndio

Este arquivo é lido automaticamente pelo Claude Code ao abrir o projeto.
É o contexto de handoff de uma sessão anterior (feita no chat). Leia por completo antes de agir.

## O que é este projeto

Ferramenta de **design** de *Moonrite* (jogo survival-crafting whimsical, demo pública set/2026).
É a "ontologia" do jogo renderizada como um **livro navegável** + área de autoria.
NÃO é ferramenta de produção: status, esforço, responsáveis e "não iniciado" **não entram aqui** —
isso vive só no Notion do time. Este app é puramente entidades, economia e progressão.

Dono: Marcos (CEO, Haki Studios). Trabalha em português, prefere entregas diretas e objetivas.
Marcos NÃO é confortável com terminal — o motivo de estarmos migrando pro Claude Code é
automatizar Git/deploy pra ele não fazer upload manual no GitHub. Ao guiá-lo, evite jargão de
terminal; prefira "eu faço por você" a instruções de linha de comando.

## Arquitetura (2 arquivos, sem build)

- `index.html` — shell HTML + todo o CSS. Carrega `<script src="app.js">`.
- `app.js` — todo o modelo + lógica. O modelo padrão está em `defaultModel()`.
- Site estático puro. Sem build step, sem framework, sem dependências de runtime.
  (`node_modules/` existe só porque usei jsdom pra testar; está no .gitignore, ignore.)
- Persistência do usuário final: `localStorage` (chave `mr_model`). Export/Import JSON no rodapé.
- Há uma função de migração no fim do `app.js` que detecta modelo antigo e recria o novo.

### O modelo (ontologia stricto sensu)
Cada entidade: `{name, category, path, nature, description, fields{}}`.
- `category` ∈ Player, Raw Resource, Item, Weapon/Tool, Consumable, Equipment, Station,
  System, System State, Spirit, Creature, Enemy, Gatherable, Area. Cada uma tem campos
  próprios definidos em `CATEGORIES`.
- `path` ∈ `critico` | `estendido` | `opcional` (três trilhas).
  - crítico = esqueleto mínimo até o boss final
  - estendido = extrapolação do crítico (o jogador quase sempre faz, mas não é obrigatório)
  - opcional = ramos laterais
- **Raw Resource** = só obtido no mundo (gather/pickable/drop), NUNCA craftado. Folha do grafo.
- **Item** = não-vivo, craftável OU obtível no mundo.
- **System** = sistema-mãe (ex: Loop do Cauldron) com **System State** como sub-entidades
  (Cauldron Lv1..Lv4). Relações sistema↔estado e estação↔sistema via campos.

Fluxos: `{id, name, kind, station, inputs{}, out{}, path}`.
`kind` ∈ craft | refino | cozinha | feed | coleta. (coleta/feed NÃO contam como craft na
análise de órfãos — drop de monstro é coleta, não craft.)

Gates (chave & cadeado): `{id, name, key, unlocks, path}`.

Estado atual do modelo padrão: **50 entidades, 24 fluxos, 7 gates**. Zero órfãos, zero refs quebradas.

### As 4 abas
1. **Compêndio** — o livro. Nav por categoria + página rica por entidade (relações clicáveis).
   Player é uma página aqui também.
2. **Autoria** — formulários que criam entidades/fluxos/gates; alimentam as outras abas.
3. **Fluxos** — economia agrupada por kind, filtro por caminho/tipo. Tem seção "Análise" que
   lista entidades fora dos fluxos de craft (órfãos).
4. **Chave & Cadeado** — progressão em 3 trilhas coloridas.

Ícones: emoji placeholder por entidade (`ENTITY_ICON`) com fallback por categoria (`CAT_ICON`).

## Git / Deploy

- Repo: https://github.com/marcosnoodles/ontology
- Host: Netlify (site `ontologyhaki`), conectado ao repo via Git. **Publica da branch de
  produção** — CONFIRMAR com Marcos se é `main`, `master` ou `v.26.07.02.01.01`.
- Netlify: publish directory = raiz (`.`), sem build command (site estático).
  `index.html` DEVE estar na raiz do repo — 404 anterior foi por arquivo aninhado.
- Deploy = push na branch de produção → Netlify republica sozinho em ~1min.
- Histórico de dor: nome de branch com pontos (`v.26.07.02.01.01`) causou falha de deploy
  ("git ref does not exist"). Se reincidir, considere usar `main` como branch de produção e
  marcar versões com **tags** em vez de branches.

## Tarefa imediata (o que Marcos quer agora)

1. Conectar este repositório ao Git localmente e fazer o deploy fácil, SEM ele mexer em terminal.
   Você (Claude Code) faz commit/push por ele. Confirme a branch de produção antes do push.
2. Garantir que `index.html` + `app.js` atualizados subam (os desta pasta são os corretos/finais).

## Decisões em aberto (não resolver sozinho — perguntar a Marcos)

- **Devourer vs Aquiles**: nesta ferramenta o boss final do 1º bioma é o **Devourer**, com
  Aquiles como sub-boss. O time no Notion AINDA modela Aquiles como boss único. Marcos precisa
  alinhar isso com o time; não "corrija" o modelo pra voltar ao Aquiles.
- **Juntar num arquivo só**: Marcos considerou fundir index.html+app.js num único arquivo pra
  virar upload único. Não decidido. Se ele topar, dá pra inline o app.js dentro do index.html.
- **Coleta vs craft**: "Loot do Boar" e "Capturar Sapo" estão modelados como fluxos `kind:coleta`.
  Modelagem intencional (drop ≠ craft). Só mexer se ele pedir.

## Como validar antes de commitar

Sempre rode um syntax check no app.js e cheque a integridade do modelo:
```
node -c app.js
```
E um teste rápido de integridade (órfãos + refs quebradas) — o modelo deve manter
zero refs fantasma e zero craftáveis sem receita. Não introduza status/esforço/produção no modelo.
