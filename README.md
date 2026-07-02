# Moonrite — Fluxos & Progressão

Ferramenta de design para visualizar e iterar a economia e a progressão de *Moonrite*.
É um **modelo de design puro** (ontologia stricto sensu): entidades, relações de economia
e o sistema de **chave & cadeado**. Sem status de produção, esforço ou responsáveis —
isso vive no Notion do time.

## O que tem

- **Chave & Cadeado** — a progressão como gates: cada trava (🔒) exige uma chave (🔑)
  para abrir. Duas colunas: progressão central (crítico) e ramos opcionais. Clique
  numa trava para editar; use "+ Novo gate" para introduzir novas travas.
- **Fluxos de economia** — todas as receitas (craft / refino / drop / feed) como
  insumos → produto. Filtrável por caminho. Clique para editar; "+ Nova receita" cria fluxos novos.
- **Explorer** — clique em qualquer entidade e veja suas relações nas duas direções:
  produzida por, usada em, e para quais gates ela é a chave. Navega entre entidades e fluxos.

Tudo é editável. O modelo é salvo no navegador (localStorage) e pode ser exportado/importado
como JSON — é assim que você versiona no git ou compartilha cenários com o time.

## Rodar localmente

É um único arquivo estático. Basta abrir `index.html` no navegador, ou servir:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Colocar no ar

Qualquer host de site estático serve. Duas opções rápidas:

**GitHub Pages** (junto do repo):
1. Faça push deste repo pro GitHub (veja abaixo).
2. Settings → Pages → Source: branch `main`, pasta `/root`.
3. A URL sai em `https://<usuario>.github.io/<repo>/`.

**Netlify Drop** (sem repo): arraste `index.html` para https://app.netlify.com/drop.

## Versionar no git

```bash
cd moonrite-flows
git init
git add .
git commit -m "Moonrite: ferramenta de fluxos e progressão"
git branch -M main
git remote add origin git@github.com:<usuario>/moonrite-flows.git
git push -u origin main
```

Para compartilhar um cenário de balanceamento específico com o time, use **Exportar modelo**
no rodapé da ferramenta e comite o `moonrite-modelo.json` no repo, ou mande no chat.
Quem recebe usa **Importar modelo**.
