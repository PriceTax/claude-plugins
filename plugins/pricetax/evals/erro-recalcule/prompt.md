---
description: Diagnóstico do 409 recalcule — explicar a causa e não sugerir retry.
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
runs: 2
---

Meu app chama `pricetax.calculos.obter(id)` do @pricetax/sdk e agora toda chamada dá
PriceTaxErro com status 409 e codigo "recalcule". O que está acontecendo? Devo colocar um
retry com backoff?
