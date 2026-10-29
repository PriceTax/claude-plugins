# Plugin PriceTax para Claude Code

Ensina o Claude Code a integrar um sistema com a **API de cálculos da PriceTax** pelo pacote
[`@pricetax/sdk`](https://www.npmjs.com/package/@pricetax/sdk), e impede que a chave de API
vaze para o navegador.

## Instalar

No Claude Code:

```
/plugin marketplace add PriceTax/claude-plugins
/plugin install pricetax@pricetax
```

## O que vem no plugin

| Componente | O que faz |
| --- | --- |
| Skill `calculos` | O Claude carrega sozinho quando o assunto é PriceTax: regras de uso da API, conceitos (recorte, cenários, `_ar`/`_dr`), receitas para Next.js, Express + React (Vite) e scripts Node, erros e o catálogo de colunas, dimensões e métricas. |
| `/pricetax:integrar` | Monta a integração no projeto atual: instala o SDK, guarda a chave no servidor, escreve o acesso de leitura e confere a conexão. |
| Hook de proteção da chave | Bloqueia a gravação da chave (`ptc_…`) em código, em arquivos de exemplo ou em variáveis públicas do bundler (`VITE_`, `NEXT_PUBLIC_`, `REACT_APP_`, `EXPO_PUBLIC_`, `NUXT_PUBLIC_`, `PUBLIC_`), seja editando arquivos, seja por comando no terminal (`echo VITE_..._KEY=... >> .env`). A chave no `.env` do servidor continua permitida. Precisa do Node no `PATH`; se o hook falhar, ele não bloqueia nada. |

## Atualizar

As atualizações chegam quando a versão do plugin muda. Para recebê-las sozinho, ligue o
auto-update em `/plugin` → **Marketplaces** → `pricetax` → **Enable auto-update**. Para
atualizar à mão: `/plugin marketplace update pricetax` e depois `/reload-plugins`.

## Licença

MIT.
