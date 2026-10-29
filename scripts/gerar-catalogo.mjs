#!/usr/bin/env node
// Gera skills/calculos/catalogo.md a partir do contrato (contrato/openapi-v1.json) e do
// glossário escrito à mão (scripts/glossario.md). Nunca edite o catalogo.md direto.
//
//   node scripts/gerar-catalogo.mjs            → regera
//   node scripts/gerar-catalogo.mjs --conferir → falha se o arquivo estiver desatualizado (CI)
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const raiz = new URL("..", import.meta.url)
const caminho = (p) => fileURLToPath(new URL(p, raiz))
const DESTINO = caminho("plugins/pricetax/skills/calculos/catalogo.md")

export function lerContrato() {
  const s = JSON.parse(readFileSync(caminho("contrato/openapi-v1.json"), "utf8")).components.schemas
  return {
    colunas: Object.keys(s.Linha.properties),
    dimensoes: s.Dimensao.enum,
    metricas: s.Metrica.enum,
  }
}

const lado = (n) => (/_ar(_entrada|_saida)?$/.test(n) ? "ar" : /_dr(_entrada|_saida)?$/.test(n) ? "dr" : "geral")
const lista = (nomes) => nomes.map((n) => `\`${n}\``).join(", ")

function porLado(nomes) {
  return [
    ["Gerais", nomes.filter((n) => lado(n) === "geral")],
    ["Antes da reforma (`_ar`)", nomes.filter((n) => lado(n) === "ar")],
    ["Depois da reforma (`_dr`)", nomes.filter((n) => lado(n) === "dr")],
  ]
    .filter(([, itens]) => itens.length)
    .map(([titulo, itens]) => `**${titulo}** (${itens.length}): ${lista(itens)}`)
    .join("\n\n")
}

export function gerar() {
  const { colunas, dimensoes, metricas } = lerContrato()
  return `<!-- Gerado por scripts/gerar-catalogo.mjs a partir do contrato openapi-v1.json. Não edite à mão. -->

# Catálogo da API de cálculos (v1)

Use só estes nomes. Qualquer outro é \`400 requisicao_invalida\`.

## Dimensões (${dimensoes.length})

Valem em \`agrupar_por\`, \`filtros\`, \`excluir\` e \`intervalos\`.

${lista(dimensoes)}

## Métricas (${metricas.length})

Valem em \`metricas\` e \`ordenar_por.metrica\` da consulta.

${porLado(metricas)}

## Colunas das linhas (${colunas.length})

Toda linha de \`pagina\`/\`linhas\` traz todas, nesta ordem; é também o cabeçalho do CSV de \`exportar\`.

${porLado(colunas)}

${readFileSync(caminho("scripts/glossario.md"), "utf8").trim()}
`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const novo = gerar()
  if (process.argv.includes("--conferir")) {
    const atual = readFileSync(DESTINO, "utf8")
    if (atual !== novo) {
      console.error("catalogo.md desatualizado: rode `npm run gerar-catalogo`.")
      process.exit(1)
    }
    console.log("catalogo.md em dia.")
  } else {
    writeFileSync(DESTINO, novo)
    console.log(`catalogo.md gerado.`)
  }
}
