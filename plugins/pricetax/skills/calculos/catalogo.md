<!-- Gerado por scripts/gerar-catalogo.mjs a partir do contrato openapi-v1.json. Não edite à mão. -->

# Catálogo da API de cálculos (v1)

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
