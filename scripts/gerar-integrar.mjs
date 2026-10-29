#!/usr/bin/env node
// Gera skills/integrar/SKILL.md: o modelo (scripts/integrar.modelo.md) seguido da referência
// da skill calculos e das receitas, copiadas aqui no build. Uma skill não consegue ler arquivos
// fora do projeto do usuário sem pedir permissão (Read e `!cat` são barrados lá), então o
// /pricetax:integrar já chega com o que precisa. Nunca edite o SKILL.md gerado.
//
//   node scripts/gerar-integrar.mjs            → regera
//   node scripts/gerar-integrar.mjs --conferir → falha se estiver desatualizado (CI)
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const caminho = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const DESTINO = caminho("plugins/pricetax/skills/integrar/SKILL.md")
const ler = (p) => readFileSync(caminho(p), "utf8")
const semFrontmatter = (md) => md.replace(/^---\n[\s\S]*?\n---\n/, "").trim()
// Os links relativos da skill calculos (conceitos.md…) apontam para a pasta dela.
const linksParaCalculos = (md) => md.replace(/\]\(((?:conceitos|receitas|erros|catalogo)\.md[^)]*)\)/g, "](../calculos/$1)")

export function gerar() {
  const modelo = ler("scripts/integrar.modelo.md").trim()
  const [cabeca, ...resto] = modelo.split("\n---\n")
  return `${cabeca}\n---\n<!-- Gerado por scripts/gerar-integrar.mjs a partir de scripts/integrar.modelo.md e da skill calculos. Não edite à mão. -->\n${resto.join("\n---\n")}

---

# Referência: regras da skill \`pricetax:calculos\`

${linksParaCalculos(semFrontmatter(ler("plugins/pricetax/skills/calculos/SKILL.md")))}

---

${linksParaCalculos(semFrontmatter(ler("plugins/pricetax/skills/calculos/receitas.md")).replace(/^# Receitas/, "# Referência: receitas"))}

---

${ler("plugins/pricetax/skills/calculos/catalogo.md").replace(/^<!--.*-->\n\n/, "").replace(/^# Catálogo/m, "# Referência: catálogo").trim()}
`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const novo = gerar()
  if (process.argv.includes("--conferir")) {
    if (readFileSync(DESTINO, "utf8") !== novo) {
      console.error("integrar/SKILL.md desatualizado: rode `npm run gerar`.")
      process.exit(1)
    }
    console.log("integrar/SKILL.md em dia.")
  } else {
    writeFileSync(DESTINO, novo)
    console.log("integrar/SKILL.md gerado.")
  }
}
