# Start dev server with API proxy to deployed backend (so /api calls work from localhost).
# Run from project root: .\start-dev.ps1
# Uses npm run dev:proxy so the proxy works on Windows (cross-env sets the var in the Vite process).

npm run dev:proxy
