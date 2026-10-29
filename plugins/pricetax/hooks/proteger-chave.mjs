#!/usr/bin/env node
// Hook PreToolUse (Write|Edit|Bash) do plugin pricetax: impede o Claude de gravar a chave de API da
// PriceTax onde ela vazaria para o navegador ou para o repositório.
//
// Bloqueia (exit 2, motivo no stderr, que chega ao Claude):
//   1. a chave literal (ptc_<12hex>_<64hex>) em qualquer arquivo que não seja um .env local;
//   2. uma variável pública (VITE_, NEXT_PUBLIC_, REACT_APP_, EXPO_PUBLIC_, NUXT_PUBLIC_,
//      PUBLIC_) com a chave: definida no .env com um valor ptc_, ou com nome de chave da
//      PriceTax (ex.: VITE_PRICETAX_API_KEY) definida ou lida no código.
// No Bash, só a atribuição a uma variável pública (`echo VITE_..._KEY=... >> .env`, `export`):
// gravar PRICETAX_API_KEY no .env pelo terminal continua permitido.
// Qualquer falha do próprio hook libera a ação (exit 0): um hook quebrado não pode travar o
// trabalho do usuário.
import { realpathSync } from "node:fs"
import { basename } from "node:path"
import { fileURLToPath } from "node:url"

const CHAVE_LITERAL = /ptc_[0-9a-f]{12}_[0-9a-f]{64}/
const PUBLICO = String.raw`(?:VITE|NEXT_PUBLIC|REACT_APP|EXPO_PUBLIC|NUXT_PUBLIC|PUBLIC)_`
// Nome público que é a chave da PriceTax: PRICETAX + KEY/CHAVE/SECRET, em qualquer ordem.
const NOME_PUBLICO_DE_CHAVE = new RegExp(
  String.raw`\b${PUBLICO}\w*(?:PRICETAX\w*(?:KEY|CHAVE|SECRET)|(?:KEY|CHAVE|SECRET)\w*PRICETAX)\w*`,
)
// No .env: qualquer variável pública recebendo um valor ptc_.
const PUBLICO_COM_VALOR_PTC = new RegExp(String.raw`^\s*(?:export\s+)?(${PUBLICO}\w*)\s*=\s*["']?ptc_`, "m")

const COMO_FAZER =
  "A chave de API da PriceTax dá acesso a todos os cálculos da conta e só pode ficar no servidor: " +
  "leia de process.env.PRICETAX_API_KEY (sem prefixo público) num backend, rota de API ou Server Component. " +
  "Para a página web, o backend emite um token de sessão com pricetax.sessoes.criar(calculoId) e o navegador usa " +
  "new PriceTax({ sessao: token }). Veja a skill pricetax:calculos (receitas.md)."

// Atribuição no shell: NOME_PUBLICO=..., ou variável pública recebendo ptc_.
const ATRIBUICAO_NO_SHELL = new RegExp(
  String.raw`${NOME_PUBLICO_DE_CHAVE.source}\s*=|\b(${PUBLICO}\w*)\s*=\s*["']?ptc_`,
)

/** .env local do servidor (pode guardar a chave); exemplos e modelos vão para o git e não podem. */
function ehEnvLocal(caminho) {
  const nome = basename(caminho)
  return /^\.env(\.|$)/.test(nome) && !/(example|sample|template|dist|defaults)/i.test(nome)
}
const ehDocumentacao = (caminho) => /\.(md|mdx|txt)$/i.test(caminho)

/** Devolve o motivo do bloqueio, ou null para liberar. */
export function avaliar(entrada) {
  const { tool_name: ferramenta, tool_input: e = {} } = entrada ?? {}
  if (ferramenta === "Bash") {
    const atribuicao = typeof e.command === "string" && e.command.match(ATRIBUICAO_NO_SHELL)
    return atribuicao
      ? `Bloqueado: o comando põe a chave de API da PriceTax numa variável pública (${atribuicao[0].replace(/\s*=.*$/, "")}), que o bundler embute no código do navegador. Use PRICETAX_API_KEY, sem prefixo público. ${COMO_FAZER}`
      : null
  }
  if (ferramenta !== "Write" && ferramenta !== "Edit") return null
  const caminho = typeof e.file_path === "string" ? e.file_path : ""
  const texto = ferramenta === "Write" ? e.content : e.new_string
  if (typeof texto !== "string" || !caminho) return null

  if (ehEnvLocal(caminho)) {
    const publico = texto.match(PUBLICO_COM_VALOR_PTC) ?? texto.match(NOME_PUBLICO_DE_CHAVE)
    if (publico) {
      const nome = publico[1] ?? publico[0]
      return `Bloqueado: ${nome} é uma variável pública (o bundler a embute no código do navegador) e receberia a chave de API da PriceTax. Use PRICETAX_API_KEY, sem prefixo público. ${COMO_FAZER}`
    }
    return null
  }

  if (CHAVE_LITERAL.test(texto)) {
    return `Bloqueado: a chave de API da PriceTax (ptc_...) apareceria escrita em ${basename(caminho)}, que vai para o repositório ou para o navegador. Guarde a chave só no .env do servidor (no .gitignore) e leia de process.env.PRICETAX_API_KEY. ${COMO_FAZER}`
  }

  if (!ehDocumentacao(caminho)) {
    const publico = texto.match(NOME_PUBLICO_DE_CHAVE)
    if (publico) {
      return `Bloqueado: ${publico[0]} é uma variável pública: o que estiver nela vai para o código do navegador, e a chave de API da PriceTax não pode ir. ${COMO_FAZER}`
    }
  }
  return null
}

async function main() {
  let bruto = ""
  for await (const pedaco of process.stdin) bruto += pedaco
  const motivo = avaliar(JSON.parse(bruto))
  if (motivo) {
    process.stderr.write(motivo + "\n")
    process.exit(2)
  }
}

function rodandoDireto() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (rodandoDireto()) main().catch(() => process.exit(0))
