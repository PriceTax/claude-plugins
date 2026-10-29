#!/bin/bash
# SPA React + Vite mínima; a chave está no .env sem prefixo (como um usuário faria).
set -e
mkdir -p src
cat > package.json <<'J'
{ "name": "spa", "private": true, "type": "module", "scripts": { "dev": "vite", "build": "vite build" },
  "dependencies": { "react": "19.1.1", "react-dom": "19.1.1", "@pricetax/sdk": "^0.1.0" },
  "devDependencies": { "vite": "^7", "@vitejs/plugin-react": "^5", "typescript": "^5.9.3" } }
J
cat > vite.config.ts <<'J'
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
export default defineConfig({ plugins: [react()] })
J
cat > index.html <<'J'
<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
J
cat > src/main.tsx <<'J'
import { createRoot } from "react-dom/client"
import App from "./App"
createRoot(document.getElementById("root")!).render(<App />)
J
cat > src/App.tsx <<'J'
export default function App() { return <h1>Meu painel</h1> }
J
printf 'PRICETAX_API_KEY=ptc_000000000000_%s\n' "$(printf '0%.0s' {1..64})" > .env
printf 'node_modules\ndist\n.env\n' > .gitignore
