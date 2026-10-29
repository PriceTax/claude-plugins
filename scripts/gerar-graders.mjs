#!/usr/bin/env node
// Gera os graders regex das avaliações. Eles olham SÓ o que o Claude gravou (entrada das
// ferramentas Write/Edit na transcrição): a transcrição também traz os arquivos da skill que
// ele leu, cheios de exemplos, e um regex na transcrição inteira acharia o exemplo, não o código.
import { mkdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const EVALS = fileURLToPath(new URL("../plugins/pricetax/evals/", import.meta.url))
// Conteúdo gravado: "content" do Write ou "new_string" do Edit (strings JSON escapadas).
const GRAVADO = String.raw`"name":"(?:Write|Edit)","input":\{"file_path":"[^"]*",(?:"content"|"old_string":"(?:[^"\\]|\\.)*","new_string"):"(?:[^"\\]|\\.)*?`
const Q = String.raw`\\?["']`   // aspas dentro do JSON escapado

const graders = {
  "painel-next-ncm": {
    "usa-consultar": ["contains", String.raw`calculos\.consultar\(`, "Usa a consulta agregada para os totais."],
    "nao-pagina": ["not_contains", String.raw`calculos\.(linhas|pagina)\(`, "Não pagina as linhas para somar no cliente."],
    "sentido-entrada": ["contains", String.raw`sentido${Q}?\s*:\s*${Q}entrada`, "Restringe às compras."],
    "chave-nao-publica": ["not_contains", String.raw`NEXT_PUBLIC_\w*(PRICETAX|API_KEY|CHAVE)`, "A chave não vai para variável NEXT_PUBLIC_."],
  },
  "react-vite-linhas": {
    "sem-vite-chave": ["not_contains", String.raw`VITE_\w*(PRICETAX|API_KEY|CHAVE)`, "A chave não vai para variável VITE_ (o Vite a embute no bundle)."],
    "nao-contorna": ["not_contains", String.raw`permitirChaveNoNavegador\s*:\s*true`, "Não contorna a proteção do SDK."],
    "tem-backend": ["contains", String.raw`sessoes\.criar|express\(|createServer|fastify\(|new Hono|app\.(get|post)\(`, "Cria um backend que guarda a chave, ou emite token de sessão."],
  },
  "csv-produtos": {
    "usa-exportar": ["contains", String.raw`calculos\.exportar\(`, "Usa o export em CSV da API."],
    "nao-monta-csv": ["not_contains", String.raw`calculos\.(linhas|pagina)\(|join\(${Q};`, "Não pagina as linhas nem monta o CSV à mão."],
    "filtra-produto": ["contains", String.raw`tipo_linha${Q}?\s*:\s*\[\s*${Q}produto`, "Filtra só produtos com o valor certo de tipo_linha."],
    "sentido-saida": ["contains", String.raw`sentido${Q}?\s*:\s*${Q}saida`, "Só as vendas."],
  },
}

for (const [caso, gs] of Object.entries(graders)) {
  mkdirSync(`${EVALS}${caso}/graders`, { recursive: true })
  for (const [nome, [match, padrao, texto]] of Object.entries(gs)) {
    const yaml = `---\ntype: regex\ntarget: trace\nmatch: ${match}\npattern: ${JSON.stringify(GRAVADO + "(?:" + padrao + ")")}\n---\n\n${texto}\n`
    writeFileSync(`${EVALS}${caso}/graders/${nome}.md`, yaml)
  }
}
console.log("graders gerados")
