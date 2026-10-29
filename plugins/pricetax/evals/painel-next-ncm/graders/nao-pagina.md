---
type: regex
target: trace
match: not_contains
pattern: "\"name\":\"(?:Write|Edit)\",\"input\":\\{\"file_path\":\"[^\"]*\",(?:\"content\"|\"old_string\":\"(?:[^\"\\\\]|\\\\.)*\",\"new_string\"):\"(?:[^\"\\\\]|\\\\.)*?(?:calculos\\.(linhas|pagina)\\()"
---

Não pagina as linhas para somar no cliente.
