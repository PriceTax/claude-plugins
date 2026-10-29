#!/bin/bash
# Projeto Next.js mínimo (App Router) com o SDK "instalado" no package.json.
set -e
mkdir -p app
cat > package.json <<'J'
{ "name": "painel", "private": true, "scripts": { "dev": "next dev", "build": "next build" },
  "dependencies": { "next": "15.5.4", "react": "19.1.1", "react-dom": "19.1.1", "@pricetax/sdk": "^0.1.0" },
  "devDependencies": { "typescript": "^5.9.3", "@types/react": "^19", "@types/node": "^22" } }
J
cat > tsconfig.json <<'J'
{ "compilerOptions": { "strict": true, "jsx": "preserve", "module": "esnext", "moduleResolution": "bundler", "paths": { "@/*": ["./*"] } } }
J
cat > app/layout.tsx <<'J'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
J
cat > app/page.tsx <<'J'
export default function Home() { return <main>Painel</main> }
J
printf 'PRICETAX_API_KEY=ptc_000000000000_%s\n' "$(printf '0%.0s' {1..64})" > .env.local
printf 'node_modules\n.next\n.env*.local\n' > .gitignore
