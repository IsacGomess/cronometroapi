# Cronômetro API

Cronômetro com sinal sonoro a cada minuto e botão **História**, que consulta
eventos históricos em inglês relacionados à data atual.

## Consulta histórica

O botão usa `https://history.muffinlabs.com/date`, com suporte a HTTPS e CORS.
Cada clique seleciona um evento e mostra seu ano e texto em inglês. Falhas de
rede, respostas inválidas e requisições que excedem oito segundos mostram uma
mensagem para tentar novamente.

Este repositório contém o site React já compilado para o GitHub Pages, sem o
projeto original de compilação. O código da consulta foi recuperado do source
map e está em `components/api.js`. A correção também foi aplicada ao JavaScript
publicado em `static/js`, com atualização do source map e das referências em
`index.html` e `asset-manifest.json`.

## Testes

Com Node.js 22 ou superior, sem instalar dependências:

```sh
node --test tests/api.test.mjs
```

Alterar apenas `components/api.js` não atualiza o site compilado. Para futuras
compilações completas, será necessário recuperar o projeto React original.
