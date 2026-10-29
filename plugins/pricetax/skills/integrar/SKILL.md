---
name: integrar
description: Monta a integração com a API de cálculos da PriceTax no projeto atual — instala o @pricetax/sdk, guarda a chave no servidor, cria o acesso de leitura e confere a conexão.
disable-model-invocation: true
argument-hint: "[o que o app vai mostrar, ex.: painel de compras por NCM]"
---
<!-- Gerado por scripts/gerar-integrar.mjs a partir de scripts/integrar.modelo.md e da skill calculos. Não edite à mão. -->

# Integrar este projeto com a PriceTax

Monte a integração passo a passo, seguindo as regras, as receitas e o catálogo que estão no
fim deste arquivo (são os da skill `pricetax:calculos`). Siga as regras de ouro, em especial: **a chave de API nunca vai para o
navegador**. Conceitos e erros, se precisar, estão em
`${CLAUDE_PLUGIN_ROOT}/skills/calculos/` (`conceitos.md`, `erros.md`).

## 1. Entender o projeto

- Leia o `package.json` (e o lockfile) para descobrir o stack: Next.js (App Router ou Pages),
  Vite + React, Express/Fastify/Hono, Remix, Astro, script Node… Se o projeto não tiver
  backend (SPA pura), diga ao usuário que é preciso um backend pequeno para guardar a chave e
  proponha o da receita 3 (Express) ou uma rota serverless do provedor que ele já usa.
- Se o usuário não disse o que o app vai mostrar, pergunte em uma frase (totais por NCM,
  linhas de vendas, CSV, comparação por ano…). Esse objetivo escolhe entre `consultar`,
  `exportar` e `linhas`.

## 2. A chave

- A chave é criada pelo usuário no app da PriceTax, em **Meus Dados → Integrações** →
  "Nova conta de serviço" → "Emitir chave". Ela aparece uma vez só.
- Peça para o usuário colocá-la ele mesmo no `.env` do servidor (`.env.local` no Next.js)
  como `PRICETAX_API_KEY=...`. **Não peça para colarem a chave na conversa** e não escreva a
  chave em nenhum arquivo.
- Confira que o `.gitignore` cobre esse arquivo; se não cobrir, acrescente a linha.
- Se existir um `.env.example`, acrescente só o nome: `PRICETAX_API_KEY=`.

## 3. Instalar e escrever o código

- Instale com o gerenciador do projeto (`npm install @pricetax/sdk`, `pnpm add`, `yarn add`).
- Crie o cliente num módulo só do servidor (no Next.js, com `import "server-only"`) e o código
  de leitura seguindo a receita do stack. Para o navegador, a rota que emite o token de
  sessão (`pricetax.sessoes.criar`) e o cliente com `new PriceTax({ sessao })`.
- O id do cálculo vem de configuração (`PRICETAX_CALCULO_ID`) ou da URL, nunca de
  `calculos[0]`.

## 4. Conferir a conexão

Com a chave no `.env`, rode um teste rápido (por exemplo, um script temporário com
`node --env-file=.env` ou `npx tsx`) que chame `pricetax.eu()` e `pricetax.calculos.listar()`:

- `eu()` respondendo: a chave funciona. `401 chave_invalida`: a chave está errada, revogada ou
  expirou; peça para o usuário conferir na tela Integrações.
- Mostre a lista de cálculos (`nome`, `empresa`, `criado_em`) e pergunte qual o app deve usar;
  grave o id escolhido em `PRICETAX_CALCULO_ID`.
- Chame `calculos.obter(id)` e ajuste o regime, o ano e o cenário do código ao que o cálculo
  tem. Apague o script temporário no fim.

## 5. Fechar

Resuma para o usuário: os arquivos criados, onde a chave fica, como rodar, e que o token de
sessão vale 1 hora. Lembre que o limite é de 60 chamadas por minuto por chave e onde o código
já guarda resultado em cache.

---

# Referência: regras da skill `pricetax:calculos`

# API de cálculos da PriceTax

A API dá **leitura** aos cálculos que a conta do usuário fez no app da PriceTax: cada linha é
um item de nota (compra ou venda) recalculado antes (`_ar`) e depois (`_dr`) da reforma
tributária. O acesso é pelo pacote `@pricetax/sdk` (Node 18+ e navegador, sem dependências).

## Regras de ouro

1. **A chave de API (`ptc_…`) fica só no servidor.** Leia de uma variável de ambiente
   **sem prefixo público** (`PRICETAX_API_KEY`). Nunca use `VITE_`, `NEXT_PUBLIC_`,
   `REACT_APP_`, `EXPO_PUBLIC_`, `NUXT_PUBLIC_` ou `PUBLIC_`: essas vão para o código do
   navegador, e a chave dá acesso a **todos** os cálculos da conta. Nunca escreva a chave
   literal no código. Para uma página web, o backend emite um **token de sessão**
   (`pricetax.sessoes.criar(calculoId)`, 1 hora, um cálculo) e a página usa
   `new PriceTax({ sessao: token })`. O SDK recusa `apiKey` no navegador de propósito: não
   contorne com `permitirChaveNoNavegador`.
2. **Escolha a leitura certa:**
   - totais, rankings, gráficos → `calculos.consultar` (a API agrega; uma chamada);
   - o recorte inteiro como arquivo → `calculos.exportar` (CSV em stream);
   - linhas no código (tabela paginada, processamento item a item) → `calculos.linhas`
     (iterador) ou `calculos.pagina` (uma página).
   **Nunca** pagine o recorte inteiro para somar no cliente: use `consultar`.
3. **Descubra antes de ler.** Regimes, anos e cenários variam por cálculo: chame
   `calculos.obter(id)` e use só o que ele devolve. Um regime, ano ou cenário que o cálculo
   não tem **não dá erro**: devolve zero linhas ou um total zerado (`itens: 0`), o que parece
   um resultado legítimo. Por isso, nunca fixe o ano ou o regime sem conferir, e não escolha o
   cálculo por posição (`calculos[0]`): o id vem do usuário ou da configuração.
4. **Nomes de coluna, dimensão e métrica vêm do [catálogo](../calculos/catalogo.md)**, nunca de cabeça.
   Um nome fora dele é `400 requisicao_invalida`. Se não conseguir abrir o catálogo, os nomes
   válidos também estão nos tipos `Dimensao`, `Metrica` e `Linha` do SDK instalado no projeto
   (`node_modules/@pricetax/sdk/dist/index.d.ts`). Para saber os **valores** de uma dimensão
   (por exemplo, quais `tipo_linha` existem), consulte agrupando por ela com a métrica `itens`.
5. **Decida pelo `erro.codigo`** de `PriceTaxErro`, nunca pela mensagem. O SDK já repete
   sozinho o que se resolve esperando (`limite_excedido`, `servico_ocupado`,
   `servico_indisponivel`, falha de rede); não embrulhe as chamadas em retry próprio. Os
   outros códigos não mudam repetindo. Veja [erros.md](../calculos/erros.md).
6. **Não invente o significado fiscal de uma coluna.** Use o glossário do
   [catálogo](../calculos/catalogo.md); se a coluna não estiver explicada lá, pergunte ao usuário.

## Fluxo mínimo

```ts
import { PriceTax } from "@pricetax/sdk"

const pricetax = new PriceTax({ apiKey: process.env.PRICETAX_API_KEY })

await pricetax.eu()                                    // confere a chave (401 = chave errada, revogada ou expirada)
const { calculos } = await pricetax.calculos.listar()  // do mais novo para o mais antigo
const calculo = await pricetax.calculos.obter(calculoId)  // o id que o usuário escolheu na lista
// calculo.regimes, calculo.anos, calculo.cenarios → montar o recorte

const recorte = { regime: "lucroReal", ano: 2027 } as const   // cenários: padrão "base"

const { grupos } = await pricetax.calculos.consultar(calculo.id, {
  recorte,
  sentido: "saida",
  agrupar_por: ["ncm"],
  metricas: ["itens", "valor_ar", "valor_dr", "carga_efetiva_ar", "carga_efetiva_dr"],
  ordenar_por: { metrica: "valor_ar", direcao: "desc" },
  limite: 20,
})
```

A chave é criada pelo usuário no app da PriceTax, em **Meus Dados → Integrações**, e aparece
uma vez só. Se o projeto ainda não tem a chave, peça ao usuário para criá-la e colocá-la no
`.env` (que deve estar no `.gitignore`); não peça para colarem a chave na conversa.

## Arquivos de apoio

Abra só o que a tarefa pedir:

| Arquivo | Quando abrir |
| --- | --- |
| [conceitos.md](../calculos/conceitos.md) | Para entender recorte, sentido, cenários (`base` = "Ajustado" no app), `_ar`/`_dr`, formato de datas e números, filtros e paginação. |
| [receitas.md](../calculos/receitas.md) | Para montar a integração num stack: Next.js, Express + React (Vite), script Node que baixa o CSV, painel com `consultar`. |
| [erros.md](../calculos/erros.md) | Para tratar erros, limites (60 chamadas/min por chave) e tokens de sessão expirados. |
| [catalogo.md](../calculos/catalogo.md) | Antes de escrever qualquer nome de coluna, dimensão ou métrica; tem o glossário dos prefixos. |

Documentação completa: portal do desenvolvedor da PriceTax, seção "API de cálculos".

---

# Referência: receitas

Todas assumem `npm install @pricetax/sdk` e a chave em `PRICETAX_API_KEY` no `.env` do servidor
(o `.env` no `.gitignore`). Ajuste regime, ano e nomes ao que `calculos.obter(id)` devolve e ao
[catálogo](../calculos/catalogo.md).

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

---

# Referência: catálogo da API de cálculos (v1)

Use só estes nomes. Qualquer outro é `400 requisicao_invalida`.

## Dimensões (27)

Valem em `agrupar_por`, `filtros`, `excluir` e `intervalos`.

`regime`, `tipo_movimentacao`, `tipo_linha`, `cnpj_outra_parte`, `regime_outra_parte`, `uf_emitente`, `cfop`, `ncm`, `cnae`, `tipo_operacao`, `segmento`, `codigo_produto`, `descricao_produto`, `descricao_item`, `descricao_anexo`, `numero_nf`, `chave_documento`, `competencia`, `data_operacao`, `cst_icms`, `cst_ipi`, `cst_pis`, `cclass_nota`, `cclass_calculado`, `cst_iva_nota`, `cst_iva_calculado`, `beneficio`

## Métricas (117)

Valem em `metricas` e `ordenar_por.metrica` da consulta.

**Gerais** (9): `itens`, `quantidade`, `valor_bruto_input`, `itens_entrada`, `quantidade_entrada`, `itens_saida`, `quantidade_saida`, `parceiros_distintos`, `produtos_distintos`

**Antes da reforma (`_ar`)** (54): `valor_ar`, `valor_impostos_ar`, `custo_ar`, `valor_sem_iva_ar`, `valor_desonerado_ar`, `credito_ar`, `debito_ar`, `valor_icms_ar`, `credito_icms_ar`, `debito_icms_ar`, `aliq_icms_ar`, `valor_icms_st_ar`, `credito_icms_st_ar`, `debito_icms_st_ar`, `aliq_icms_st_ar`, `valor_icms_difal_ar`, `credito_icms_difal_ar`, `debito_icms_difal_ar`, `aliq_icms_difal_ar`, `valor_iss_ar`, `credito_iss_ar`, `debito_iss_ar`, `aliq_iss_ar`, `valor_ipi_ar`, `credito_ipi_ar`, `debito_ipi_ar`, `aliq_ipi_ar`, `valor_pis_cofins_ar`, `credito_pis_cofins_ar`, `debito_pis_cofins_ar`, `aliq_pis_cofins_ar`, `valor_ibs_ar`, `credito_ibs_ar`, `debito_ibs_ar`, `aliq_ibs_ar`, `valor_cbs_ar`, `credito_cbs_ar`, `debito_cbs_ar`, `aliq_cbs_ar`, `valor_ar_entrada`, `valor_impostos_ar_entrada`, `custo_ar_entrada`, `valor_sem_iva_ar_entrada`, `valor_desonerado_ar_entrada`, `credito_ar_entrada`, `debito_ar_entrada`, `valor_ar_saida`, `valor_impostos_ar_saida`, `custo_ar_saida`, `valor_sem_iva_ar_saida`, `valor_desonerado_ar_saida`, `credito_ar_saida`, `debito_ar_saida`, `carga_efetiva_ar`

**Depois da reforma (`_dr`)** (54): `valor_dr`, `valor_impostos_dr`, `custo_dr`, `valor_sem_iva_dr`, `valor_desonerado_dr`, `credito_dr`, `debito_dr`, `valor_icms_dr`, `credito_icms_dr`, `debito_icms_dr`, `aliq_icms_dr`, `valor_icms_st_dr`, `credito_icms_st_dr`, `debito_icms_st_dr`, `aliq_icms_st_dr`, `valor_icms_difal_dr`, `credito_icms_difal_dr`, `debito_icms_difal_dr`, `aliq_icms_difal_dr`, `valor_iss_dr`, `credito_iss_dr`, `debito_iss_dr`, `aliq_iss_dr`, `valor_ipi_dr`, `credito_ipi_dr`, `debito_ipi_dr`, `aliq_ipi_dr`, `valor_pis_cofins_dr`, `credito_pis_cofins_dr`, `debito_pis_cofins_dr`, `aliq_pis_cofins_dr`, `valor_ibs_dr`, `credito_ibs_dr`, `debito_ibs_dr`, `aliq_ibs_dr`, `valor_cbs_dr`, `credito_cbs_dr`, `debito_cbs_dr`, `aliq_cbs_dr`, `valor_dr_entrada`, `valor_impostos_dr_entrada`, `custo_dr_entrada`, `valor_sem_iva_dr_entrada`, `valor_desonerado_dr_entrada`, `credito_dr_entrada`, `debito_dr_entrada`, `valor_dr_saida`, `valor_impostos_dr_saida`, `custo_dr_saida`, `valor_sem_iva_dr_saida`, `valor_desonerado_dr_saida`, `credito_dr_saida`, `debito_dr_saida`, `carga_efetiva_dr`

## Colunas das linhas (194)

Toda linha de `pagina`/`linhas` traz todas, nesta ordem; é também o cabeçalho do CSV de `exportar`.

**Gerais** (91): `regime`, `cenario`, `tipo_linha`, `input_id`, `tipo_movimentacao`, `data_criacao_input`, `valor_bruto_input`, `desconto`, `valor_movimentacao_contraria_input`, `valor_depreciacao`, `ncm`, `cfop`, `cnae_principal`, `tipo_operacao`, `fornecedor_industrial`, `cst_icms`, `cst_ipi`, `cst_pis`, `cst_cofins`, `cclass_nota`, `cclass_calculado`, `cst_iva_nota`, `cst_iva_calculado`, `origem`, `uf_emitente`, `aliq_icms_input`, `aliq_iss_input`, `aliq_ipi_input`, `aliq_pis_cofins_creditar_input`, `aliq_pis_cofins_desonerar_input`, `aliq_icms_st_input`, `aliq_icms_difal_input`, `valor_icms_input`, `valor_icms_st_input`, `valor_icms_difal_input`, `valor_iss_input`, `valor_ipi_input`, `valor_pis_cofins_input`, `valor_pis_cofins_desonerar_input`, `valor_icms_nota_input`, `valor_icms_st_nota_input`, `valor_icms_difal_nota_input`, `valor_ipi_nota_input`, `valor_pis_cofins_nota_input`, `beneficio`, `manter_beneficio`, `descricao_anexo`, `tipo_input`, `metodo`, `tem_credito_icms`, `tem_credito_pis_cofins`, `tem_credito_ipi`, `custo_despesa`, `cnpj_outra_parte`, `razao_social_outra_parte`, `regime_tributario_outra_parte`, `chave_validacao`, `descricao_produto`, `codigo_produto`, `q_com`, `segmento`, `data_operacao`, `estimar_ipi`, `estimou_ipi`, `estimou_icms`, `estimou_iss`, `estimou_pis_cofins`, `is_devolucao`, `descricao_atividade`, `anexo`, `prestacao`, `operacao`, `exportacao`, `tipo_servico`, `fornecedor_simples_puro`, `registro`, `nome_servico`, `valor_condominio`, `juros`, `residencial`, `condominio_embutido`, `quantidade`, `valor_venda`, `valor_aquisicao`, `novo_usado`, `tipo_imovel`, `tipo_outra_parte`, `prazo_determinado`, `regime_outra_parte`, `com_operador`, `valor_mao_obra`

**Antes da reforma (`_ar`)** (51): `valor_ar`, `valor_impostos_ar`, `porcentagem_carga_tributaria_ar`, `custo_ar`, `valor_sem_iva_ar`, `valor_ibs_ar`, `valor_cbs_ar`, `aliq_ibs_ar`, `aliq_cbs_ar`, `aliq_icms_ar`, `aliq_icms_st_ar`, `aliq_icms_difal_ar`, `aliq_iss_ar`, `aliq_ipi_ar`, `aliq_pis_cofins_ar`, `valor_icms_ar`, `valor_icms_st_ar`, `valor_icms_difal_ar`, `valor_iss_ar`, `valor_ipi_ar`, `valor_pis_cofins_ar`, `credito_ar`, `credito_icms_ar`, `credito_icms_st_ar`, `credito_icms_difal_ar`, `credito_iss_ar`, `credito_ipi_ar`, `credito_pis_cofins_ar`, `credito_ibs_ar`, `credito_cbs_ar`, `valor_desonerado_ar`, `valor_impostos_permanecer_ar`, `icms_subtrair_das_ar`, `debito_ar`, `debito_icms_ar`, `debito_icms_st_ar`, `debito_icms_difal_ar`, `debito_iss_ar`, `debito_ipi_ar`, `debito_pis_cofins_ar`, `debito_ibs_ar`, `debito_cbs_ar`, `imposto_nota_ar`, `imposto_nota_icms_ar`, `imposto_nota_icms_st_ar`, `imposto_nota_icms_difal_ar`, `imposto_nota_iss_ar`, `imposto_nota_ipi_ar`, `imposto_nota_pis_cofins_ar`, `imposto_nota_ibs_ar`, `imposto_nota_cbs_ar`

**Depois da reforma (`_dr`)** (52): `ano_dr`, `valor_dr`, `valor_impostos_dr`, `porcentagem_carga_tributaria_dr`, `custo_dr`, `valor_sem_iva_dr`, `valor_ibs_dr`, `valor_cbs_dr`, `aliq_ibs_dr`, `aliq_cbs_dr`, `aliq_icms_dr`, `aliq_icms_st_dr`, `aliq_icms_difal_dr`, `aliq_iss_dr`, `aliq_ipi_dr`, `aliq_pis_cofins_dr`, `valor_icms_dr`, `valor_icms_st_dr`, `valor_icms_difal_dr`, `valor_iss_dr`, `valor_ipi_dr`, `valor_pis_cofins_dr`, `credito_dr`, `credito_icms_dr`, `credito_icms_st_dr`, `credito_icms_difal_dr`, `credito_iss_dr`, `credito_ipi_dr`, `credito_pis_cofins_dr`, `credito_ibs_dr`, `credito_cbs_dr`, `valor_desonerado_dr`, `valor_impostos_permanecer_dr`, `icms_subtrair_das_dr`, `debito_dr`, `debito_icms_dr`, `debito_icms_st_dr`, `debito_icms_difal_dr`, `debito_iss_dr`, `debito_ipi_dr`, `debito_pis_cofins_dr`, `debito_ibs_dr`, `debito_cbs_dr`, `imposto_nota_dr`, `imposto_nota_icms_dr`, `imposto_nota_icms_st_dr`, `imposto_nota_icms_difal_dr`, `imposto_nota_iss_dr`, `imposto_nota_ipi_dr`, `imposto_nota_pis_cofins_dr`, `imposto_nota_ibs_dr`, `imposto_nota_cbs_dr`

## Glossário dos prefixos

Os nomes seguem um padrão: `<radical>[_<tributo>]_<lado>`, em que o lado é `ar` (antes da
reforma) ou `dr` (depois, no ano do recorte) e o tributo é `icms`, `icms_st`, `icms_difal`,
`iss`, `ipi`, `pis_cofins`, `ibs` ou `cbs`. Sem tributo, o radical vale para o total.

| Radical | Significado |
| --- | --- |
| `valor_` | valor do item naquele lado, com os tributos daquele lado |
| `valor_<tributo>_` | valor do tributo no item |
| `valor_impostos_` | soma dos tributos do item |
| `valor_desonerado_` | valor do item sem os tributos atuais (a base sobre a qual a reforma recalcula) |
| `valor_sem_iva_` | valor do item sem IBS e CBS |
| `aliq_<tributo>_` | alíquota do tributo, em fração (`0.18` = 18%) |
| `credito_` | crédito que a empresa toma na compra (linhas de entrada) |
| `debito_` | tributo devido na venda (linhas de saída) |
| `custo_` | custo do item para a empresa: valor menos crédito, a menos de arredondamento (só nas linhas de entrada; nas de saída vem `null`) |
| `imposto_nota_` | tributo destacado na nota de venda (no `_dr`, o que a nota passaria a destacar) |
| `porcentagem_carga_tributaria_` | tributos do item divididos pelo valor desonerado |

Colunas sem lado:

| Padrão | Significado |
| --- | --- |
| `*_input` | o valor como veio da nota ou da planilha, antes do cálculo |
| `estimou_*` | `true` quando o tributo não veio na nota e foi estimado pela PriceTax |
| `tem_credito_*` | se a operação dá direito a crédito daquele tributo |
| `*_outra_parte` | a outra parte da nota: fornecedor nas entradas, cliente nas saídas |
| `cclass_nota` / `cclass_calculado`, `cst_iva_nota` / `cst_iva_calculado` | a classificação da reforma declarada na nota × a calculada pela PriceTax |

`valor_impostos_permanecer_*` e `icms_subtrair_das_*` são valores intermediários do cálculo:
não os use sem confirmar com o usuário o que ele quer mostrar.
