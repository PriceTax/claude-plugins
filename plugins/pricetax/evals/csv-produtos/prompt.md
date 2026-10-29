---
description: Script que baixa o CSV de produtos vendidos — exportar, sentido saida, filtro tipo_linha produto, sem paginar.
max_turns: 20
allowed_tools: [Read, Glob, Grep, Write, Edit, Skill]
runs: 2
---

Escreve um script Node (scripts/baixar-produtos.ts) que baixa pra um arquivo CSV os produtos
vendidos no lucro real em 2026 do meu cálculo da PriceTax (7c1e2f4a-5b6d-4e8f-9a0b-1c2d3e4f5a6b). Usa o @pricetax/sdk; a chave
está em PRICETAX_API_KEY. Só escreve o script.
