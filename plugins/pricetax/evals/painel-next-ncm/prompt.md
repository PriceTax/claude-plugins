---
description: Painel Next.js com compras por NCM — chave no servidor, consultar em vez de paginar, nomes do catálogo.
max_turns: 25
allowed_tools: [Read, Glob, Grep, Write, Edit, Skill]
runs: 2
---

No meu app Next.js, cria uma página /compras-por-ncm que mostra o total de compras por NCM
(antes e depois da reforma) do meu cálculo da PriceTax, id 7c1e2f4a-5b6d-4e8f-9a0b-1c2d3e4f5a6b, no lucro real em 2027.
Usa o pacote @pricetax/sdk, que já está instalado. A chave da API está no .env.local como
PRICETAX_API_KEY. Só escreve o código, não precisa rodar.
