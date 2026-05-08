# ☕ Brew & Bean — Order Manager

**Live demo: [brew-and-bean-six.vercel.app](https://brew-and-bean-six.vercel.app)**

A lightweight café management web app built for a small business client. Staff can manage the menu, build customer orders, and review same-day sales performance — all from a single browser tab with no backend required. All data is persisted in `localStorage` so the app works offline and survives page refreshes.

## Tech Stack

- **React 18** — UI components and state management
- **Vite** — dev server and production bundler
- **Tailwind CSS** — utility-first styling
- **Recharts** — bar chart for hourly revenue
- **localStorage** — client-side persistence (no database needed)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

To build for production:

```bash
npm run build
```

## Features

- **Menu Manager** — add, edit, and delete menu items (Drinks, Food, Pastry); toggle in-stock status; changes persist across sessions
- **Order Cart** — browse in-stock items, build an order with quantity controls, automatic tax calculation (8%), complete orders with a success toast
- **Dashboard** — live stats for today's orders and revenue, hourly revenue bar chart, expandable order history, and a data-reset utility
- **Seeded defaults** — six starter menu items load automatically on first visit
- **Fully offline** — no API calls; all state lives in the browser's localStorage

## Screenshots

| Menu Manager | Order Cart | Dashboard |
|---|---|---|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |
