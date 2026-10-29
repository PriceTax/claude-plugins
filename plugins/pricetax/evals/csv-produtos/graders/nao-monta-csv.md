---
type: regex
target: trace
match: not_contains
pattern: "\"name\":\"(?:Write|Edit)\",\"input\":\\{\"file_path\":\"[^\"]*\",(?:\"content\"|\"old_string\":\"(?:[^\"\\\\]|\\\\.)*\",\"new_string\"):\"(?:[^\"\\\\]|\\\\.)*?(?:calculos\\.(linhas|pagina)\\(|join\\(\\\\?[\"'];)"
---

Não pagina as linhas nem monta o CSV à mão.
