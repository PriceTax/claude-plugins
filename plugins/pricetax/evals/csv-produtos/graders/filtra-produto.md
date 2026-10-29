---
type: regex
target: trace
match: contains
pattern: "\"name\":\"(?:Write|Edit)\",\"input\":\\{\"file_path\":\"[^\"]*\",(?:\"content\"|\"old_string\":\"(?:[^\"\\\\]|\\\\.)*\",\"new_string\"):\"(?:[^\"\\\\]|\\\\.)*?(?:tipo_linha\\\\?[\"']?\\s*:\\s*\\[\\s*\\\\?[\"']produto)"
---

Filtra só produtos com o valor certo de tipo_linha.
