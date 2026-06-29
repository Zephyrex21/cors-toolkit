<div align="center">

<img src="public/favicon.svg" width="64" height="64" alt="AllowOrigin logo" />

# AllowOrigin

**Paste your CORS error. Pick your framework. Get the exact fix.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-alloworigin.dev-6e7fff?style=for-the-badge&logo=vercel&logoColor=white)](https://alloworigin.dev)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Powered by Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## What is this?

AllowOrigin is a zero-backend CORS error fixer. You paste the raw error from your browser console, pick your server framework, and get the **exact lines of code** to add — with your origin pre-filled, context-aware for credentials, preflight, and blocked headers.

No ads. No sign-up. No data leaves your browser.

---

## Features

- **Error DNA parser** — understands Chrome, Edge, Firefox, and Safari error formats. Extracts your origin, blocked URL, error type, and missing header automatically.

- **Animated request flow** — see the exact request/response cycle that caused the block, then toggle to "After fix" to watch it succeed.

- **9 framework configs** — Express, Fastify, Nginx, FastAPI, Django, Spring Boot, Laravel, Go (Gin), and ASP.NET Core. Each config is generated with your real origin pre-filled and credentials mode automatically detected.

- **Headers inspector** — paste your Network tab response headers and get a full CORS audit: what's correct, what's wrong, what's missing, and the exact fix for each.

- **Client-side checklist** — context-aware list of client-side mistakes to verify (fetch options, middleware order, dev proxy setup).

- **Shareable fix links** — every fix is encoded in the URL. Copy and share the exact same view with your team in one click.

- **Keyboard shortcuts** — `⌘K` to focus input, `⌘↵` to diagnose, `⌘D` to toggle theme.

- **Dark / light mode** — system-preference aware, toggleable.

---

## Screenshots

> *(Add your own screenshots here after running the project)*

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite 5 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Styling | CSS Custom Properties (glassmorphism) |
| State | React useState / useReducer |
| Routing | URLSearchParams (no router needed) |
| Deploy | Vercel |

Zero backend. Zero database. Zero API keys. Fully static.

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Run locally

```bash
# Clone the repo
git clone https://github.com/Zephyrex21/alloworigin.git
cd alloworigin

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — paste a CORS error and go.

### Build for production

```bash
npm run build
# Output is in /dist — deploy anywhere that serves static files
```

---

## Deploy to Vercel

The fastest way to ship it:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time sets up the project)
vercel

# Deploy to production
vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) and it auto-deploys on every push.

---

## Project structure

```
alloworigin/
├── public/
│   └── favicon.svg
├── src/
│   ├── lib/
│   │   ├── errorParser.js        # Chrome/Firefox/Safari CORS error parser
│   │   ├── frameworkConfigs.js   # 9 framework config templates
│   │   ├── headerParser.js       # Raw HTTP header parser + CORS audit
│   │   ├── urlState.js           # URL state encoding for shareability
│   │   └── useKeyboardShortcuts.js
│   ├── components/
│   │   ├── FlowVisualizer.jsx    # Animated request/response flow diagram
│   │   ├── HeadersInspector.jsx  # Paste headers → CORS diff
│   │   ├── ClientChecklist.jsx   # Context-aware client-side checklist
│   │   ├── ShortcutsModal.jsx    # Keyboard shortcuts reference
│   │   └── Toast.jsx             # Notification toasts
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── vercel.json
└── vite.config.js
```

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ K` / `Ctrl K` | Focus the error input |
| `⌘ ↵` / `Ctrl ↵` | Diagnose the error |
| `⌘ D` / `Ctrl D` | Toggle dark / light mode |
| `Escape` | Clear input and reset |
| `?` | Show all shortcuts |

---

## Supported frameworks

| Framework | Install command |
|-----------|----------------|
| Express.js | `npm install cors` |
| Fastify | `npm install @fastify/cors` |
| Nginx | *(config only)* |
| FastAPI | *(built-in middleware)* |
| Django | `pip install django-cors-headers` |
| Spring Boot | *(built-in)* |
| Laravel | *(built-in)* |
| Go / Gin | `go get github.com/gin-contrib/cors` |
| ASP.NET Core | *(built-in)* |

---

## License

MIT — use it, fork it, ship it.

---

<div align="center">
  Built by <a href="https://github.com/Zephyrex21">Zephyrex</a> · <a href="https://alloworigin.dev">alloworigin.dev</a>
</div>
