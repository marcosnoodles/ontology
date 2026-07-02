# Moonrite — Compêndio

Ferramenta de design para *Moonrite*: um **livro navegável** onde se aprende cada
entidade do jogo, com uma **área de autoria** que alimenta o livro automaticamente.
É um modelo de design puro (ontologia stricto sensu) — sem status de produção,
esforço ou responsáveis. Isso vive no Notion do time.

Um único modelo compartilhado (JSON) alimenta quatro abas:

- **Compêndio** — o livro. Navegação por categoria e uma página rica por entidade:
  natureza, descrição, stats específicos do tipo, e relações clicáveis
  (produzido por / usado em / é chave para). O **Player** é uma página aqui também,
  com seus stats e os verbos que executa.
- **Autoria** — formulários para criar/editar entidades, receitas e gates. Cada tipo
  de entidade tem seus próprios campos (arma tem dano; espírito tem comando e
  expiração; área tem conteúdo). O que você cria aqui aparece na hora nas outras abas.
- **Fluxos** — a economia como insumos → produto, por caminho (crítico/opcional).
- **Chave & Cadeado** — a progressão como gates: cada trava exige uma chave.
  Duas colunas: progressão central e ramos opcionais.

Tudo editável. O modelo é salvo no navegador (localStorage) e pode ser
exportado/importado como JSON — é assim que você versiona no git ou compartilha
cenários com o time.

## Arquivos

- `index.html` — estrutura + estilos
- `app.js` — toda a lógica e o modelo padrão
- `README.md`, `.gitignore`

`index.html` e `app.js` precisam ficar **na mesma pasta** (o HTML carrega
`<script src="app.js">`).

## Rodar localmente

Precisa ser servido (o `file://` bloqueia o carregamento do `app.js` em alguns navegadores):

```bash
cd moonrite-flows
python3 -m http.server 8000
# abra http://localhost:8000
```

## Colocar no ar

Host de site estático qualquer serve. **Importante:** o `index.html` tem que ficar
na **raiz** do que for publicado — foi provavelmente isso que quebrou o deploy
anterior (arquivo aninhado numa subpasta -> 404).

**GitHub Pages:**
1. Push do repo pro GitHub (abaixo).
2. Settings -> Pages -> Source: branch `main`, pasta `/root`.
3. URL: `https://<usuario>.github.io/<repo>/`.

**Netlify Drop** (sem repo): arraste os **dois arquivos** (`index.html` + `app.js`)
juntos -- ou a pasta, contanto que o `index.html` fique na raiz -- para
https://app.netlify.com/drop.

## Versionar no git

```bash
cd moonrite-flows
git init
git add .
git commit -m "Moonrite: compendio de design"
git branch -M main
git remote add origin git@github.com:<usuario>/moonrite-flows.git
git push -u origin main
```

Para compartilhar um cenário específico com o time, use **Exportar modelo** e comite
o `moonrite-modelo.json`, ou mande no chat. Quem recebe usa **Importar modelo**.
