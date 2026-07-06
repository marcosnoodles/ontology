# Como publicar (guia sem terminal)

Este guia é pra você, Marcos. A ideia: você NÃO digita comando nenhum.
Você abre o Claude Code nesta pasta e pede em português. O Claude Code faz o Git por você.

## Primeira vez (setup, uma vez só)

1. Abra o Claude Code na pasta deste projeto (a pasta que tem `index.html`, `app.js`, `CLAUDE.md`).
2. Cole isto no Claude Code:

   > Leia o CLAUDE.md. Este projeto já tem um repositório remoto no GitHub
   > (https://github.com/marcosnoodles/ontology). Conecte esta pasta a esse repositório,
   > me diga qual é a branch de produção que o Netlify publica, e não faça push ainda —
   > só me mostre o que vai subir.

3. Ele vai te dizer a branch e o que mudou. Se pedir login do GitHub, ele te guia
   (é um passo de autorização no navegador, não é terminal).

## Toda vez que quiser publicar (a rotina)

Cole no Claude Code:

   > Suba os arquivos atualizados pro GitHub na branch de produção e confirme comigo
   > antes de dar push. Depois me diga quando o Netlify terminar de publicar.

Só isso. Ele mostra o que vai subir, você diz "pode", ele faz. O Netlify republica sozinho.

## Quando o Claude (no chat) me entregar arquivos novos

1. Baixe os arquivos que o Claude te deu no chat (`index.html` e/ou `app.js`).
2. Coloque eles nesta pasta, por cima dos antigos (substituindo).
3. Peça a rotina de publicar acima.

## Se der 404 no site depois de publicar

Diga ao Claude Code:

   > O site deu 404. Confirme que index.html está na raiz do repositório e que o Netlify
   > está publicando da branch certa, com publish directory na raiz.

## Regras que o Claude Code deve respeitar (ele lê no CLAUDE.md)

- Este app é design puro. NÃO adicionar status/esforço/produção — isso é do Notion do time.
- Confirmar a branch de produção antes de qualquer push.
- Não trocar Devourer de volta por Aquiles sem eu pedir.
