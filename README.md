# Plugins da PriceTax para Claude Code

Marketplace de plugins do Claude Code da [PriceTax](https://app.pricetax.com.br).

```
/plugin marketplace add PriceTax/claude-plugins
/plugin install pricetax@pricetax
```

Guia completo (o que o plugin faz, a proteção da chave, como atualizar e o `llms.txt` para
outras ferramentas): portal do desenvolvedor da PriceTax, página **Desenvolvendo com IA**.

| Plugin | O que faz |
| --- | --- |
| [`pricetax`](plugins/pricetax/) | Integração com a API de cálculos pelo `@pricetax/sdk`, com proteção da chave de API. |

## Desenvolvimento

```bash
npm test                     # hook, nomes citados × contrato e catálogo em dia
npm run sincronizar          # copia o contrato do ../pricetax e regera catálogo e integrar
claude plugin validate . --strict
claude --plugin-dir plugins/pricetax          # testar numa sessão sem instalar
cd plugins/pricetax && claude plugin eval . --scaffold --allow-tools Write Edit --no-publish
```

- `skills/integrar/SKILL.md` é gerado (`scripts/gerar-integrar.mjs`) a partir de
  `scripts/integrar.modelo.md` + regras, receitas e catálogo da skill `calculos`: uma skill
  não consegue ler arquivos fora do projeto do usuário sem pedir permissão (`Read` e `!cat`
  são barrados), então o comando já chega com tudo. Edite o modelo, não o gerado.
- `skills/calculos/catalogo.md` é gerado (`scripts/gerar-catalogo.mjs`); o glossário dos
  prefixos fica em `scripts/glossario.md`. Não edite o catálogo à mão.
- Os graders regex das avaliações são gerados por `scripts/gerar-graders.mjs` e olham só o
  que o Claude gravou (Write/Edit), não a transcrição inteira.
- Release: suba `version` em `plugins/pricetax/.claude-plugin/plugin.json` (sem isso o
  usuário não recebe a atualização).
