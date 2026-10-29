# Erros e limites

Toda falha do SDK é um `PriceTaxErro` com `status` (HTTP; `0` em falha de rede), `codigo`
(estável: decida por ele), `message` (para uma pessoa ler) e `detalhes` (em
`requisicao_invalida`, os campos com problema).

```ts
import { PriceTax, PriceTaxErro } from "@pricetax/sdk"

try {
  const calculo = await pricetax.calculos.obter(id)
} catch (err) {
  if (err instanceof PriceTaxErro) {
    switch (err.codigo) {
      case "calculo_nao_encontrado": /* id errado ou de outra conta */ break
      case "recalcule":              /* pedir ao usuário para refazer o cálculo no app */ break
      default: throw err
    }
  }
  throw err
}
```

| HTTP | `codigo` | Quando | O que o código deve fazer |
| --- | --- | --- | --- |
| 400 | `requisicao_invalida` | corpo fora do contrato (nome fora do catálogo, ano fora de 2025-2033, `ordenar_por` com métrica que não está em `metricas`…) | corrigir a chamada; ver `detalhes` |
| 400 | `cursor_invalido` | cursor de outra seleção | recomeçar sem `cursor` |
| 401 | `chave_invalida` | credencial ausente, errada, revogada ou expirada; conta de serviço desativada; dono sem acesso ao app | parar e avisar: o usuário confere ou emite outra chave em Meus Dados → Integrações |
| 403 | `requer_chave` | token de sessão numa rota que exige a chave (`calculos.listar`, `sessoes.criar`) | fazer essa chamada no backend, com a chave |
| 403 | `fora_da_sessao` | token de sessão usado em outro cálculo | emitir um token para esse cálculo |
| 404 | `calculo_nao_encontrado` | o cálculo não existe ou é de outra conta | conferir o `id` em `calculos.listar()` |
| 409 | `recalcule` | os dados do cálculo não estão disponíveis (cálculo antigo ou incompleto) | mostrar ao usuário que o cálculo precisa ser refeito no app; não repetir |
| 409 | `cursor_invalido` | o cálculo foi refeito durante a paginação | recomeçar sem `cursor` |
| 429 | `limite_excedido` | passou de 60 chamadas/min na chave | o SDK já espera o `Retry-After` e repete |
| 502 | `servico_indisponivel` | falha temporária da PriceTax | o SDK já repete |
| 503 | `servico_ocupado` | muitas consultas ao mesmo tempo | o SDK já repete |
| 500 | `erro_interno` | falha da PriceTax | não é repetido pelo SDK; se persistir, falar com a PriceTax |
| 0 | `falha_de_rede` | a chamada não teve resposta (só no SDK) | o SDK já repete |

O `401` é igual em todos os casos de propósito: a resposta não diz se a chave existe, foi
revogada ou expirou. O estado de cada chave aparece na tela Integrações do app.

## Novas tentativas

O SDK repete `limite_excedido`, `servico_ocupado`, `servico_indisponivel` e `falha_de_rede`,
com `tentativas` (padrão 3) e espera crescente (ou o `Retry-After`, até 60 s). **Não**
acrescente retry próprio por cima: multiplica as chamadas e piora o limite. Para mais
tolerância, aumente `tentativas` no construtor.

## Limites

- **60 chamadas por minuto por chave**, todas as rotas somadas. As chamadas feitas com tokens
  de sessão contam no limite da chave que os emitiu.
- Respostas bem-sucedidas trazem `X-RateLimit-Remaining`.
- Para não gastar o limite: use `consultar` para totais e `exportar` para o recorte inteiro;
  guarde em cache no seu backend o que não muda (a lista de cálculos, o `obter`); use
  `limite: 500` ao paginar.

## Token de sessão

- Vale 1 hora (`expira_em`, ISO 8601) e um cálculo só.
- Expirado ou com a chave revogada → `401 chave_invalida`. A página deve pedir um token novo
  ao backend perto do `expira_em`, ou ao receber 401, e repetir a chamada uma vez.
- Revogar a chave ou desativar a conta de serviço derruba na hora os tokens emitidos por ela.
