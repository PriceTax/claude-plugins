#!/usr/bin/env node
// Copia o contrato congelado da API (pricetax) para contrato/openapi-v1.json.
// Origem padrão: o checkout vizinho ../pricetax; outra com PRICETAX_REPO=/caminho.
import { copyFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { join, resolve } from "node:path"

const raiz = fileURLToPath(new URL("..", import.meta.url))
const repo = resolve(process.env.PRICETAX_REPO ?? join(raiz, "../pricetax"))
const origem = join(repo, "projeto-contab-01/src/http/sdk/v1/contrato/openapi-v1.json")
copyFileSync(origem, join(raiz, "contrato/openapi-v1.json"))
console.log(`contrato copiado de ${origem}`)
