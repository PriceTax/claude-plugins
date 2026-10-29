# Receitas

Todas assumem `npm install @pricetax/sdk` e a chave em `PRICETAX_API_KEY` no `.env` do servidor
(o `.env` no `.gitignore`). Ajuste regime, ano e nomes ao que `calculos.obter(id)` devolve e ao
[catálogo](catalogo.md).

## 1. Next.js (App Router): página que lê no servidor

O caminho mais simples: um Server Component chama o SDK no servidor e entrega à página só o
resultado. A chave nunca sai do servidor.

`lib/pricetax.ts`:

```ts
import "server-only"   // falha o build se este arquivo for importado num Client Component
import { PriceTax } from "@pricetax/sdk"

export const pricetax = new PriceTax({ apiKey: process.env.PRICETAX_API_KEY! })

// Cache em memória no servidor: poupa o limite de 60 chamadas/min por chave.
const cache = new Map<string, { expira: number; valor: Promise<unknown> }>()
export function emCache<T>(chave: string, segundos: number, buscar: () => Promise<T>): Promise<T> {
  const atual = cache.get(chave)
  if (atual && atual.expira > Date.now()) return atual.valor as Promise<T>
  const valor = buscar().catch((e) => { cache.delete(chave); throw e })
  cache.set(chave, { expira: Date.now() + segundos * 1000, valor })
  return valor
}
```

`app/compras-por-ncm/page.tsx`:

```tsx
import { pricetax, emCache } from "@/lib/pricetax"

// Renderiza a cada requisição, não no build: assim o build não depende da API nem da chave.
export const dynamic = "force-dynamic"

export default async function Page() {
  const calculoId = process.env.PRICETAX_CALCULO_ID!
  const { grupos } = await emCache(`ncm:${calculoId}`, 300, () =>
    pricetax.calculos.consultar(calculoId, {
      recorte: { regime: "lucroReal", ano: 2027 },
      sentido: "entrada",
      agrupar_por: ["ncm"],
      metricas: ["itens", "valor_ar", "valor_dr"],
      ordenar_por: { metrica: "valor_ar", direcao: "desc" },
      limite: 20,
    }),
  )
  return (
    <table>
      <thead><tr><th>NCM</th><th>Itens</th><th>Antes</th><th>Depois</th></tr></thead>
      <tbody>
        {grupos.map((g) => (
          <tr key={String(g.ncm)}>
            <td>{g.ncm ?? "—"}</td><td>{g.itens}</td><td>{g.valor_ar}</td><td>{g.valor_dr}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- **Qual cálculo:** o painel quase sempre é de um cálculo específico, então o id vem de
  configuração (`PRICETAX_CALCULO_ID`) ou da URL. **Não** use `calculos[0]` às cegas: o mais
  novo pode estar sem dados (`409 recalcule`) ou sendo refeito (`processando: true`). Para
  descobrir o id, liste os cálculos uma vez (`calculos.listar()`) e mostre ao usuário
  `nome`, `empresa` e `criado_em` para ele escolher.
- **Não pré-renderize no build** uma página que chama a API (`revalidate` sozinho faz o Next
  chamar a API durante o `next build`): uma chave ausente no CI ou um cálculo sem dados
  derruba o build.
- `npm install server-only` se o projeto ainda não tiver o pacote.

## 2. Next.js: componente no navegador com token de sessão

Quando a página precisa chamar a API do navegador (filtros interativos, paginação na tela).

`app/api/pricetax/sessao/route.ts`:

```ts
import { pricetax } from "@/lib/pricetax"

export async function POST(req: Request) {
  const { calculoId } = await req.json()
  // Confira aqui, com a autenticação do SEU app, se este usuário pode ver este cálculo.
  const sessao = await pricetax.sessoes.criar(calculoId)
  return Response.json(sessao, { headers: { "cache-control": "no-store" } })
}
```

`app/linhas/Linhas.tsx`:

```tsx
"use client"
import { useEffect, useState } from "react"
import { PriceTax, type Linha } from "@pricetax/sdk"

async function novoCliente(calculoId: string) {
  const r = await fetch("/api/pricetax/sessao", { method: "POST", body: JSON.stringify({ calculoId }) })
  const { token } = await r.json()
  return new PriceTax({ sessao: token })
}

export function Linhas({ calculoId }: { calculoId: string }) {
  const [linhas, setLinhas] = useState<Linha[]>([])
  useEffect(() => {
    novoCliente(calculoId)
      .then((pt) => pt.calculos.pagina(calculoId, { recorte: { regime: "lucroReal", ano: 2027 }, sentido: "saida", limite: 100 }))
      .then((p) => setLinhas(p.linhas))
  }, [calculoId])
  return <ul>{linhas.map((l) => <li key={String(l.input_id)}>{l.descricao_produto}: {l.valor_ar} → {l.valor_dr}</li>)}</ul>
}
```

O token vale 1 hora: guarde o `expira_em` e peça outro antes de vencer ou ao receber `401`.

## 3. Express + React (Vite)

O Vite expõe ao navegador toda variável `VITE_*`: a chave **não** pode estar numa delas. Um
servidor Express pequeno guarda a chave e expõe só o que a tela precisa.

`server/index.ts`:

```ts
import "dotenv/config"
import express from "express"
import { PriceTax, PriceTaxErro } from "@pricetax/sdk"

const pricetax = new PriceTax({ apiKey: process.env.PRICETAX_API_KEY! })
const app = express()
app.use(express.json())

app.get("/api/calculos", async (_req, res, next) => {
  try { res.json(await pricetax.calculos.listar()) } catch (e) { next(e) }
})

app.post("/api/calculos/:id/consulta", async (req, res, next) => {
  try { res.json(await pricetax.calculos.consultar(req.params.id, req.body)) } catch (e) { next(e) }
})

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof PriceTaxErro) return res.status(err.status || 502).json({ codigo: err.codigo, mensagem: err.message })
  res.status(500).json({ codigo: "erro_interno" })
})

app.listen(3001)
```

`vite.config.ts` (o front chama `/api/...` e o Vite repassa ao Express em desenvolvimento):

```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:3001" } },
})
```

Se o Express repassa o corpo da consulta direto, como acima, ele deve validar o que o
navegador manda (pelo menos o `id`, se o usuário pode ver aquele cálculo). Se a tela precisa
de acesso direto do navegador, use o token de sessão como na receita 2.

## 4. Script Node: baixar o CSV de um recorte

```ts
import { createWriteStream } from "node:fs"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"
import { PriceTax } from "@pricetax/sdk"

const pricetax = new PriceTax({ apiKey: process.env.PRICETAX_API_KEY! })
const [calculoId] = process.argv.slice(2)

const csv = await pricetax.calculos.exportar(calculoId, {
  recorte: { regime: "lucroReal", ano: 2026 },
  sentido: "saida",
})
await pipeline(Readable.fromWeb(csv as any), createWriteStream("vendas-lucro-real-2026.csv"))
```

Rodar com `node --env-file=.env exportar.mjs <id>` (Node 20.6+) ou `tsx`. O CSV abre direto no
Excel (UTF-8 com BOM, `;`, decimal com vírgula). Para ler o CSV em código, use um parser de
CSV de verdade com `delimiter: ";"`; nunca `split(";")`.

## 5. Painel: evolução ano a ano

Uma consulta por ano, sem `agrupar_por` (um total por recorte):

```ts
const calculo = await pricetax.calculos.obter(calculoId)
const regime = calculo.regimes[0]

const serie = []
for (const ano of calculo.anos) {
  const { grupos } = await pricetax.calculos.consultar(calculoId, {
    recorte: { regime, ano },
    sentido: "ambas",
    metricas: ["valor_ar_saida", "valor_dr_saida", "valor_ar_entrada", "valor_dr_entrada", "carga_efetiva_ar", "carga_efetiva_dr"],
  })
  serie.push({ ano, ...grupos[0] })
}
```

São `calculo.anos.length` chamadas (até 9): cabe no limite, mas guarde o resultado em cache
no backend em vez de refazer a cada visita.

## 6. Ranking de fornecedores

```ts
const { grupos, total_grupos } = await pricetax.calculos.consultar(calculoId, {
  recorte: { regime: "lucroReal", ano: 2027 },
  sentido: "entrada",
  agrupar_por: ["cnpj_outra_parte"],
  metricas: ["itens", "valor_ar", "valor_dr", "credito_dr"],
  ordenar_por: { metrica: "valor_ar", direcao: "desc" },
  limite: 50,
})
```

A razão social não é dimensão, então a consulta devolve só o CNPJ. Para mostrar o nome, monte
uma vez um mapa CNPJ → `razao_social_outra_parte` a partir do `exportar` do mesmo recorte e
sentido, e guarde em cache no backend. **Não** faça uma chamada por CNPJ: 50 fornecedores
seriam 50 chamadas e estourariam o limite de 60 por minuto.
