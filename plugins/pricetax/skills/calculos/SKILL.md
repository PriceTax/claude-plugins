---
name: calculos
description: Integra um sistema com a API de cálculos da PriceTax usando o pacote @pricetax/sdk — ler as linhas de um cálculo, exportar o CSV, somar por NCM, CFOP, fornecedor ou cliente, montar painel, BI ou relatório com os dados de antes e depois da reforma tributária. Use quando o usuário mencionar PriceTax, @pricetax/sdk, chave ptc_ ou token ptcs_, ou pedir dados de cálculos/simulações da reforma tributária vindos da PriceTax.
---

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
4. **Nomes de coluna, dimensão e métrica vêm do [catálogo](catalogo.md)**, nunca de cabeça.
   Um nome fora dele é `400 requisicao_invalida`. Se não conseguir abrir o catálogo, os nomes
   válidos também estão nos tipos `Dimensao`, `Metrica` e `Linha` do SDK instalado no projeto
   (`node_modules/@pricetax/sdk/dist/index.d.ts`). Para saber os **valores** de uma dimensão
   (por exemplo, quais `tipo_linha` existem), consulte agrupando por ela com a métrica `itens`.
5. **Decida pelo `erro.codigo`** de `PriceTaxErro`, nunca pela mensagem. O SDK já repete
   sozinho o que se resolve esperando (`limite_excedido`, `servico_ocupado`,
   `servico_indisponivel`, falha de rede); não embrulhe as chamadas em retry próprio. Os
   outros códigos não mudam repetindo. Veja [erros.md](erros.md).
6. **Não invente o significado fiscal de uma coluna.** Use o glossário do
   [catálogo](catalogo.md); se a coluna não estiver explicada lá, pergunte ao usuário.

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
| [conceitos.md](conceitos.md) | Para entender recorte, sentido, cenários (`base` = "Ajustado" no app), `_ar`/`_dr`, formato de datas e números, filtros e paginação. |
| [receitas.md](receitas.md) | Para montar a integração num stack: Next.js, Express + React (Vite), script Node que baixa o CSV, painel com `consultar`. |
| [erros.md](erros.md) | Para tratar erros, limites (60 chamadas/min por chave) e tokens de sessão expirados. |
| [catalogo.md](catalogo.md) | Antes de escrever qualquer nome de coluna, dimensão ou métrica; tem o glossário dos prefixos. |

Documentação completa: portal do desenvolvedor da PriceTax, seção "API de cálculos".
