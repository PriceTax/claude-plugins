#!/bin/bash
set -e
mkdir -p scripts
cat > package.json <<'J'
{ "name": "relatorios", "private": true, "type": "module",
  "dependencies": { "@pricetax/sdk": "^0.1.0" }, "devDependencies": { "tsx": "^4", "typescript": "^5.9.3" } }
J
