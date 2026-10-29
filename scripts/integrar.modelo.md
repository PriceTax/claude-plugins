---
name: integrar
description: Monta a integração com a API de cálculos da PriceTax no projeto atual — instala o @pricetax/sdk, guarda a chave no servidor, cria o acesso de leitura e confere a conexão.
disable-model-invocation: true
argument-hint: "[o que o app vai mostrar, ex.: painel de compras por NCM]"
---

# Integrar este projeto com a PriceTax

Monte a integração passo a passo, seguindo as regras, as receitas e o catálogo que estão no
fim deste arquivo (são os da skill `pricetax:calculos`). Siga as regras de ouro, em especial: **a chave de API nunca vai para o
navegador**. Conceitos e erros, se precisar, estão em
`${CLAUDE_PLUGIN_ROOT}/skills/calculos/` (`conceitos.md`, `erros.md`).

## 1. Entender o projeto

- Leia o `package.json` (e o lockfile) para descobrir o stack: Next.js (App Router ou Pages),
  Vite + React, Express/Fastify/Hono, Remix, Astro, script Node… Se o projeto não tiver
  backend (SPA pura), diga ao usuário que é preciso um backend pequeno para guardar a chave e
  proponha o da receita 3 (Express) ou uma rota serverless do provedor que ele já usa.
- Se o usuário não disse o que o app vai mostrar, pergunte em uma frase (totais por NCM,
  linhas de vendas, CSV, comparação por ano…). Esse objetivo escolhe entre `consultar`,
  `exportar` e `linhas`.

## 2. A chave

- A chave é criada pelo usuário no app da PriceTax, em **Meus Dados → Integrações** →
  "Nova conta de serviço" → "Emitir chave". Ela aparece uma vez só.
- Peça para o usuário colocá-la ele mesmo no `.env` do servidor (`.env.local` no Next.js)
  como `PRICETAX_API_KEY=...`. **Não peça para colarem a chave na conversa** e não escreva a
  chave em nenhum arquivo.
- Confira que o `.gitignore` cobre esse arquivo; se não cobrir, acrescente a linha.
- Se existir um `.env.example`, acrescente só o nome: `PRICETAX_API_KEY=`.

## 3. Instalar e escrever o código

- Instale com o gerenciador do projeto (`npm install @pricetax/sdk`, `pnpm add`, `yarn add`).
- Crie o cliente num módulo só do servidor (no Next.js, com `import "server-only"`) e o código
  de leitura seguindo a receita do stack. Para o navegador, a rota que emite o token de
  sessão (`pricetax.sessoes.criar`) e o cliente com `new PriceTax({ sessao })`.
- O id do cálculo vem de configuração (`PRICETAX_CALCULO_ID`) ou da URL, nunca de
  `calculos[0]`.

## 4. Conferir a conexão

Com a chave no `.env`, rode um teste rápido (por exemplo, um script temporário com
`node --env-file=.env` ou `npx tsx`) que chame `pricetax.eu()` e `pricetax.calculos.listar()`:

- `eu()` respondendo: a chave funciona. `401 chave_invalida`: a chave está errada, revogada ou
  expirou; peça para o usuário conferir na tela Integrações.
- Mostre a lista de cálculos (`nome`, `empresa`, `criado_em`) e pergunte qual o app deve usar;
  grave o id escolhido em `PRICETAX_CALCULO_ID`.
- Chame `calculos.obter(id)` e ajuste o regime, o ano e o cenário do código ao que o cálculo
  tem. Apague o script temporário no fim.

## 5. Fechar

Resuma para o usuário: os arquivos criados, onde a chave fica, como rodar, e que o token de
sessão vale 1 hora. Lembre que o limite é de 60 chamadas por minuto por chave e onde o código
já guarda resultado em cache.
