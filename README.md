# Retail POS & Inventory Manager

**Live demo: [brew-and-bean-six.vercel.app](https://brew-and-bean-six.vercel.app)**

A lightweight, retail-ready point-of-sale and inventory management web app designed for small businesses — boutiques, market vendors, and specialty shops. Staff can manage their product catalog, run transactions at the counter, and review same-day sales performance from a single browser tab. All data is persisted in `localStorage`, so the app works offline, survives page refreshes, and requires no backend infrastructure.

## Features

- **Product Catalog** — add, edit, and delete inventory items across categories; toggle in-stock status; all changes persist across sessions
- **Transaction Workflow** — browse in-stock products, build a sale with quantity controls, automatic tax calculation, and complete checkout with confirmation
- **Sales Analytics** — live stats for daily transaction count and revenue, hourly revenue bar chart, expandable transaction history, and a data-reset utility
- **Seeded defaults** — sample catalog loads automatically on first visit
- **Fully offline** — no API calls; all state lives in the browser's localStorage

## Tech Stack

- **React 18** — UI components and state management
- **Vite** — dev server and production bundler
- **Tailwind CSS** — utility-first styling
- **Recharts** — bar chart for hourly revenue
- **localStorage** — client-side persistence (no database required)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. To build for production: `npm run build`.

## AI Development Approach

This project was built in collaboration with an AI coding assistant. The collaboration model emphasized human-led design with AI-led implementation:

- **Business-context-first prompts** — every prompt opened with the client scenario before naming any technical work, producing more cohesive components and on-brand copy than generic CRUD framing.
- **Data contract defined before UI** — the transaction shape (id, timestamp, items, subtotal, tax, total) and storage keys were specified up front, so the analytics layer read clean, consistent data instead of reconciling two improvised structures.
- **Explicit scope-limit syntax** — prompts named what *not* to build ("do NOT add features yet — just the skeleton") to prevent speculative abstractions and partial implementations.
- **Six-component prompt decomposition** — the build was split across six focused prompts (scaffold, catalog, transaction, analytics, polish, deploy), each scoping the AI to a single component to keep its working memory focused and minimize cross-component contamination.

## Screenshots

| Product Catalog | Transaction Workflow | Sales Analytics |
|---|---|---|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |
