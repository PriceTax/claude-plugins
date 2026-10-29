---
type: regex
target: trace
match: not_contains
pattern: "\"name\":\"(?:Write|Edit)\",\"input\":\\{\"file_path\":\"[^\"]*\",(?:\"content\"|\"old_string\":\"(?:[^\"\\\\]|\\\\.)*\",\"new_string\"):\"(?:[^\"\\\\]|\\\\.)*?(?:VITE_\\w*(PRICETAX|API_KEY|CHAVE))"
---

A chave não vai para variável VITE_ (o Vite a embute no bundle).
