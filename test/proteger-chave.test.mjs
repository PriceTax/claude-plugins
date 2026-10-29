// Casos do hook que protege a chave: bloqueia o que vazaria, libera o uso certo.
import { test } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { avaliar } from "../plugins/pricetax/hooks/proteger-chave.mjs"

const SCRIPT = fileURLToPath(new URL("../plugins/pricetax/hooks/proteger-chave.mjs", import.meta.url))
const CHAVE = "ptc_5f027ad1e74d_" + "a1".repeat(32)
const escrever = (file_path, content) => ({ tool_name: "Write", tool_input: { file_path, content } })
const bash = (command) => ({ tool_name: "Bash", tool_input: { command } })
const editar = (file_path, new_string) => ({ tool_name: "Edit", tool_input: { file_path, old_string: "x", new_string } })

const bloqueia = [
  ["chave literal num .ts", escrever("/p/src/lib/pricetax.ts", `new PriceTax({ apiKey: "${CHAVE}" })`)],
  ["chave literal num componente (Edit)", editar("/p/src/App.tsx", `const k = '${CHAVE}'`)],
  ["chave literal no .env.example", escrever("/p/.env.example", `PRICETAX_API_KEY=${CHAVE}\n`)],
  ["chave literal num README", escrever("/p/README.md", `Use a chave ${CHAVE}`)],
  ["VITE_ com a chave no .env", escrever("/p/.env", `VITE_PRICETAX_API_KEY=${CHAVE}\n`)],
  ["NEXT_PUBLIC_ com valor ptc_ e outro nome", escrever("/p/.env.local", `NEXT_PUBLIC_API_KEY=${CHAVE}\n`)],
  ["VITE_ com nome de chave, valor ainda vazio", escrever("/p/.env", "VITE_PRICETAX_KEY=\n")],
  ["import.meta.env.VITE_PRICETAX_API_KEY no código", escrever("/p/src/api.ts", "const k = import.meta.env.VITE_PRICETAX_API_KEY")],
  ["process.env.NEXT_PUBLIC_PRICETAX_API_KEY", escrever("/p/app/page.tsx", "process.env.NEXT_PUBLIC_PRICETAX_API_KEY")],
  ["EXPO_PUBLIC_ com CHAVE no nome", escrever("/p/app.config.ts", "process.env.EXPO_PUBLIC_CHAVE_PRICETAX")],
  ["REACT_APP_ com SECRET", escrever("/p/src/x.js", "process.env.REACT_APP_PRICETAX_SECRET")],
  ["Bash: echo VITE_PRICETAX_API_KEY >> .env", bash(`echo "VITE_PRICETAX_API_KEY=${CHAVE}" >> .env`)],
  ["Bash: export NEXT_PUBLIC_ com valor ptc_", bash(`export NEXT_PUBLIC_TOKEN='${CHAVE}'`)],
]

const libera = [
  ["chave no .env do servidor", escrever("/p/.env", `PRICETAX_API_KEY=${CHAVE}\n`)],
  ["chave no .env.local", escrever("/p/.env.local", `PRICETAX_API_KEY=${CHAVE}\nVITE_TITULO=Painel\n`)],
  ["process.env.PRICETAX_API_KEY numa rota", escrever("/p/app/api/sessao/route.ts", "new PriceTax({ apiKey: process.env.PRICETAX_API_KEY! })")],
  ["token de sessão no navegador", escrever("/p/src/App.tsx", "new PriceTax({ sessao: token })")],
  ["URL pública da PriceTax", escrever("/p/.env", "NEXT_PUBLIC_PRICETAX_BASE_URL=https://app.pricetax.com.br/api/sdk/v1\n")],
  ["README explicando o que não fazer", escrever("/p/README.md", "Nunca use VITE_PRICETAX_API_KEY: vai para o navegador.")],
  ["prefixo da chave sem segredo", escrever("/p/src/x.ts", "if (chave.startsWith('ptc_')) {}")],
  ["Edit sem new_string", { tool_name: "Edit", tool_input: { file_path: "/p/a.ts" } }],
  ["Bash: grava PRICETAX_API_KEY no .env", bash(`echo "PRICETAX_API_KEY=${CHAVE}" >> .env`)],
  ["Bash: procura a variável errada no código", bash("grep -rn VITE_PRICETAX_API_KEY src")],
  ["Bash: comando qualquer", bash("npm install @pricetax/sdk")],
  ["outra ferramenta", { tool_name: "Read", tool_input: { file_path: "/p/.env" } }],
]

for (const [nome, entrada] of bloqueia) test(`bloqueia: ${nome}`, () => assert.ok(avaliar(entrada), "deveria bloquear"))
for (const [nome, entrada] of libera) test(`libera: ${nome}`, () => assert.equal(avaliar(entrada), null))

function rodar(stdin) {
  return spawnSync(process.execPath, [SCRIPT], { input: stdin, encoding: "utf8" })
}

test("pelo stdin: bloqueia com exit 2 e explica no stderr", () => {
  const r = rodar(JSON.stringify(escrever("/p/src/App.tsx", `apiKey: "${CHAVE}"`)))
  assert.equal(r.status, 2)
  assert.match(r.stderr, /sessoes\.criar/)
  assert.ok(!r.stderr.includes(CHAVE.slice(17)), "o motivo não repete o segredo")
})

test("pelo stdin: libera com exit 0", () => {
  assert.equal(rodar(JSON.stringify(escrever("/p/.env", `PRICETAX_API_KEY=${CHAVE}`))).status, 0)
})

test("pelo stdin: entrada malformada não bloqueia", () => {
  assert.equal(rodar("isto não é json").status, 0)
  assert.equal(rodar("").status, 0)
})
