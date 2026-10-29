---
type: llm
focus: trace
---

PASS se a chave de API da PriceTax (PRICETAX_API_KEY) só é lida em código que roda no servidor (um backend Node/Express, uma rota de API ou similar) e o código React que roda no navegador NUNCA recebe nem lê a chave (nem por import.meta.env, nem por variável VITE_, nem escrita no código). Usar um token de sessão emitido pelo backend no navegador é aceitável. FAIL se a chave chega ao navegador de qualquer forma, ou se o código instancia PriceTax com apiKey dentro de componentes React.
