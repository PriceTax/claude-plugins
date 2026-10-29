---
type: regex
target: trace
match: not_contains
pattern: "\"name\":\"(?:Write|Edit)\",\"input\":\\{\"file_path\":\"[^\"]*\",(?:\"content\"|\"old_string\":\"(?:[^\"\\\\]|\\\\.)*\",\"new_string\"):\"(?:[^\"\\\\]|\\\\.)*?(?:NEXT_PUBLIC_\\w*(PRICETAX|API_KEY|CHAVE))"
---

A chave não vai para variável NEXT_PUBLIC_.
