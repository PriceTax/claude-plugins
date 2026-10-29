# Conceitos da API de cálculos

## Cálculo

Uma simulação feita no app da PriceTax para uma empresa: as notas de compra e de venda de um
período, recalculadas antes e depois da reforma tributária, em cada regime simulado e em cada
ano da transição.

`calculos.listar()` devolve `{ calculos: [...] }`, cada um com `id`, `nome`, `criado_em`,
`empresa`, `cnpj`, `regime_tributario` (o regime **atual** da empresa) e `processando`.

`calculos.obter(id)` acrescenta o que existe para ler:

```json
{
  "id": "7c1e2f4a-5b6d-4e8f-9a0b-1c2d3e4f5a6b",
  "nome": "Exemplo — 1º semestre",
  "empresa": "EXEMPLO INDÚSTRIA LTDA",
  "regime_tributario": "lucroPresumido",
  "periodo_meses": 6,
  "total_linhas": 430000,
  "regimes": ["lucroPresumido", "lucroReal", "simplesNacional"],
  "anos": [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],
  "cenarios": [
    { "id": "base", "nome": "Ajustado" },
    { "id": "sem_reajuste", "nome": "Sem Reajuste" }
  ]
}
```

`regimes` são os regimes **simulados**, não o atual. `total_linhas` soma todos os recortes.

## Recorte

Toda leitura é feita sobre um recorte: um regime, um ano e um cenário por sentido.

```ts
const recorte = { regime: "lucroReal", ano: 2027, cenario_vendas: "base", cenario_compras: "base" } as const
```

| Campo | Valores |
| --- | --- |
| `regime` | `simplesNacional`, `lucroReal` ou `lucroPresumido` (um de `calculo.regimes`) |
| `ano` | inteiro de 2025 a 2033 (um de `calculo.anos`) |
| `cenario_vendas` | cenário das linhas de saída; opcional, padrão `base` |
| `cenario_compras` | cenário das linhas de entrada; opcional, padrão `base` |

Para comparar anos ou regimes, faça uma chamada por recorte (por exemplo, um `consultar` por
ano) e junte no código.

## Cenários

Os mesmos cenários de margem de lucro do app. Mostre ao usuário o `nome`, não o `id`:

- `base` — no app, **"Ajustado"**: o preço de venda é recalculado para manter a margem de
  lucro de hoje; mostra qual deveria ser o novo preço para não perder nem ganhar.
- `sem_reajuste` — no app, **"Sem Reajuste"**: nas vendas, o preço não é reajustado e a
  empresa absorve o impacto; nas compras, é o pior cenário (o fornecedor repassa os novos
  tributos sobre o valor cheio).
- um uuid — uma margem criada no app (como o Preço Alvo); o nome está em `calculo.cenarios`.

Vendas e compras têm cenários independentes porque um recorte reúne as duas pontas.

## Sentido

`sentido`: `"entrada"` (compras), `"saida"` (vendas) ou `"ambas"` (padrão). Cada linha traz o
próprio sentido na coluna `tipo_movimentacao` (`entrada` ou `saida`).

## Tipo de linha

A coluna e dimensão `tipo_linha` diz o que o item é:

| Valor | O que é |
| --- | --- |
| `produto` | mercadoria (é a planilha "produtos" do app) |
| `servico` | serviço (a planilha "serviços") |
| `locacaoBensMoveis` | locação de bens móveis |
| `locacaoBensImoveis` | locação de imóveis |
| `compraVendaBensImoveis` | compra e venda de imóveis |

Para "só produtos" ou "só serviços", filtre: `filtros: { tipo_linha: ["produto"] }`.

## Antes e depois da reforma

- colunas terminadas em **`_ar`**: antes da reforma, no sistema atual (ICMS, ISS, IPI,
  PIS/COFINS);
- colunas terminadas em **`_dr`**: depois da reforma, no `ano` do recorte (IBS, CBS e o que
  ainda resta dos tributos atuais na transição);
- colunas sem sufixo descrevem o item e a nota (NCM, CFOP, parte, descrição, quantidade);
- colunas terminadas em `_input` são os valores como vieram da nota ou da planilha.

`valor_ar` × `valor_dr` é a comparação mais comum. O glossário dos prefixos está no
[catálogo](catalogo.md).

## Valores e tipos

- Números vêm como número JSON; colunas sem valor vêm `null` (trate `null` como "sem dado",
  não como zero, ao exibir).
- Datas vêm como texto: `AAAA-MM-DD`, ou `AAAA-MM-DD hh:mm:ss` nas que têm hora. Não são ISO
  com `T`: para `new Date()`, troque o espaço por `T`.
- Alíquotas e cargas vêm como fração (`0.27` = 27%).
- Cada linha traz as 194 colunas do catálogo, sempre todas.

## Filtros (valem em `linhas`, `pagina`, `exportar` e `consultar`)

```ts
{
  recorte,
  filtros: { ncm: ["84212300", "84213100"], uf_emitente: ["SP"] },   // só estes valores
  excluir: { cfop: ["5949"] },                                       // menos estes
  intervalos: { data_operacao: { de: "2025-01-01", ate: "2025-03-31" } },
}
```

- As chaves são **dimensões** do catálogo. Dimensões diferentes se combinam com E.
- `null` dentro da lista inclui as linhas sem valor na dimensão.
- `intervalos` é faixa fechada (`de`, `ate` ou os dois), comparada como texto; datas em
  `AAAA-MM-DD`. Linhas sem valor ficam de fora.
- Até 2.000 valores por lista.

## Paginação de linhas

`calculos.pagina(id, { ...selecao, limite })` devolve `{ linhas, total_linhas, proximo_cursor }`;
`limite` vai até 500 (padrão 100). Para a página seguinte, repita **o mesmo corpo** com
`cursor: proximo_cursor`; na última, `proximo_cursor` é `null`. O iterador
`calculos.linhas(id, selecao)` faz isso sozinho.

O cursor é opaco e vale só para a mesma seleção e a mesma versão do cálculo: com outra
seleção, `400 cursor_invalido`; se o cálculo foi refeito no meio, `409 cursor_invalido`. Nos
dois casos, recomece sem cursor.

## Consulta agregada

`calculos.consultar(id, entrada)`:

| Campo | Regra |
| --- | --- |
| `agrupar_por` | até 4 dimensões, sem repetir; sem ele, um único total |
| `metricas` | de 1 a 80 métricas |
| `ordenar_por` | `{ metrica, direcao }`; a métrica precisa estar em `metricas`; `direcao` padrão `desc` |
| `limite`, `offset` | até 500 grupos por página (padrão 100); `offset` até 100.000 |

Resposta: `{ grupos: [{ <dimensões>, <métricas> }], total_grupos }`.

Como as métricas são calculadas:

- somas (`valor_*`, `credito_*`, `debito_*`, `custo_*`, `valor_impostos_*`…): soma da coluna de
  mesmo nome no grupo;
- `itens`: número de linhas; `quantidade`: soma das quantidades;
- variantes `_entrada` e `_saida` (`valor_ar_entrada`, `itens_saida`…): a mesma métrica só nas
  linhas daquele sentido — para comparar compras e vendas numa consulta só, com
  `sentido: "ambas"`;
- alíquotas (`aliq_*`): alíquota **efetiva** do grupo, ponderada pela base (não é média
  simples);
- `carga_efetiva_ar` / `carga_efetiva_dr`: soma dos impostos dividida pela soma dos valores;
- `parceiros_distintos`, `produtos_distintos`: contagens sem repetição;
- métrica de razão num grupo sem base vem `null`.

## Export em CSV

`calculos.exportar(id, selecao)` devolve um `ReadableStream` com **todas** as linhas da seleção
(o corpo é o de `pagina`, sem `limite` e `cursor`). Formato das planilhas do app: UTF-8 com
BOM, separador `;`, decimal com vírgula, cabeçalho com as colunas do catálogo. É uma chamada
só, em vez de uma por página.

## Quando o cálculo é refeito

Os dados trocam de uma vez para a nova versão. Enquanto isso, `processando` vem `true`.
Paginações em andamento recebem `cursor_invalido` e recomeçam.
