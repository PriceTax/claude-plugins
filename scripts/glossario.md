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
