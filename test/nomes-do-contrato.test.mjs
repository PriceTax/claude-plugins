// Todo nome de coluna, dimensão ou métrica citado na skill precisa existir no contrato:
// o Claude copia esses nomes para o código do usuário, e um nome inventado vira
// `400 requisicao_invalida` no app dele.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { lerContrato } from "../scripts/gerar-catalogo.mjs"

const DIR = fileURLToPath(new URL("../plugins/pricetax/skills/calculos/", import.meta.url))
const { colunas, dimensoes, metricas } = lerContrato()
const catalogo = new Set([...colunas, ...dimensoes, ...metricas])

// Termos que aparecem entre crases mas não são do catálogo: campos do contrato, valores,
// códigos de erro, opções do SDK, variáveis de ambiente, nomes do JavaScript.
const OUTROS = new Set([
  // corpo das requisições e respostas
  "recorte", "regime", "ano", "cenario_vendas", "cenario_compras", "sentido", "filtros", "excluir",
  "intervalos", "de", "ate", "limite", "cursor", "offset", "agrupar_por", "metricas", "ordenar_por",
  "metrica", "direcao", "asc", "desc", "grupos", "total_grupos", "linhas", "total_linhas",
  "proximo_cursor", "calculos", "id", "nome", "criado_em", "empresa", "cnpj", "regime_tributario",
  "processando", "periodo_meses", "regimes", "anos", "cenarios", "token", "expira_em", "calculo_id",
  "conta_servico", "chave", "prefixo", "escopos", "sessao", "erro", "codigo", "mensagem", "detalhes",
  // valores
  "simplesNacional", "lucroReal", "lucroPresumido", "base", "sem_reajuste", "entrada", "saida", "ambas",
  "true", "false", "null", "produto", "servico", "ar", "dr", "_ar", "_dr", "_entrada", "_saida", "_input",
  "icms", "icms_st", "icms_difal", "iss", "ipi", "pis_cofins", "ibs", "cbs",
  // erros
  "chave_invalida", "requer_chave", "fora_da_sessao", "requisicao_invalida", "cursor_invalido",
  "calculo_nao_encontrado", "recalcule", "limite_excedido", "servico_ocupado", "servico_indisponivel",
  "erro_interno", "falha_de_rede",
  // SDK, ambiente e JavaScript
  "apiKey", "sessao", "baseUrl", "tentativas", "timeoutMs", "fetch", "permitirChaveNoNavegador",
  "status", "message", "PRICETAX_API_KEY", "server_only",
])

// A prosa escrita à mão: os arquivos da skill (menos o catálogo gerado) e o glossário que entra nele.
const GLOSSARIO = fileURLToPath(new URL("../scripts/glossario.md", import.meta.url))
function arquivos() {
  return [...readdirSync(DIR).filter((f) => f.endsWith(".md") && f !== "catalogo.md").map((f) => DIR + f), GLOSSARIO]
}

/** Nomes citados: entre crases na prosa e como string/propriedade nos blocos de código. */
function citados(texto) {
  const nomes = []
  const blocos = [...texto.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1])
  const prosa = texto.replace(/```[a-z]*\n[\s\S]*?```/g, "")
  for (const m of prosa.matchAll(/`([^`\s]+)`/g)) nomes.push(m[1])
  for (const b of blocos) {
    for (const m of b.matchAll(/"([a-z][a-z0-9_]*)"/g)) nomes.push(m[1])
    for (const m of b.matchAll(/\b(?:linha|l|g|grupo)\.([a-z][a-z0-9_]*)/g)) nomes.push(m[1])
    for (const m of b.matchAll(/(?:filtros|excluir|intervalos):\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g)) {
      for (const k of m[1].matchAll(/([a-z][a-z0-9_]*)\s*:/g)) if (!["de", "ate"].includes(k[1])) nomes.push(k[1])
    }
  }
  // Só o que tem cara de nome do catálogo (snake_case); padrões com < > * são do glossário.
  return nomes.filter((n) => /^[a-z][a-z0-9]*(_[a-z0-9]+)*_?$/.test(n) && n.includes("_"))
}

test("todo nome citado na skill existe no contrato", () => {
  const faltando = []
  for (const f of arquivos()) {
    for (const n of citados(readFileSync(f, "utf8"))) {
      if (catalogo.has(n) || OUTROS.has(n)) continue
      // Radical do glossário (`valor_impostos_`): precisa ser começo de algum nome real.
      if (n.endsWith("_") && [...catalogo].some((c) => c.startsWith(n))) continue
      faltando.push(`${f.split("/").pop()}: ${n}`)
    }
  }
  assert.deepEqual([...new Set(faltando)], [])
})

test("métricas e dimensões nos exemplos de consulta estão no lugar certo", () => {
  const erros = []
  for (const f of arquivos()) {
    const texto = readFileSync(f, "utf8")
    for (const m of texto.matchAll(/metricas:\s*\[([^\]]*)\]/g))
      for (const n of m[1].matchAll(/"([^"]+)"/g)) if (!metricas.includes(n[1])) erros.push(`${f}: métrica ${n[1]}`)
    for (const m of texto.matchAll(/agrupar_por:\s*\[([^\]]*)\]/g))
      for (const n of m[1].matchAll(/"([^"]+)"/g)) if (!dimensoes.includes(n[1])) erros.push(`${f}: dimensão ${n[1]}`)
    for (const m of texto.matchAll(/metrica:\s*"([^"]+)"/g)) if (!metricas.includes(m[1])) erros.push(`${f}: ordenar_por ${m[1]}`)
  }
  assert.deepEqual(erros, [])
})

test("o teste pega um nome inventado", () => {
  const nomes = citados('```ts\nmetricas: ["valor_ar", "notas_distintas"]\n```\nE a coluna `valor_total_dr`.')
  assert.ok(nomes.includes("notas_distintas") && nomes.includes("valor_total_dr"))
  assert.ok(!catalogo.has("notas_distintas") && !catalogo.has("valor_total_dr"))
})
