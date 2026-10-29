---
type: regex
target: trace
match: contains
pattern: "\"name\":\"(?:Write|Edit)\",\"input\":\\{\"file_path\":\"[^\"]*\",(?:\"content\"|\"old_string\":\"(?:[^\"\\\\]|\\\\.)*\",\"new_string\"):\"(?:[^\"\\\\]|\\\\.)*?(?:sessoes\\.criar|express\\(|createServer|fastify\\(|new Hono|app\\.(get|post)\\()"
---

Cria um backend que guarda a chave, ou emite token de sessão.
