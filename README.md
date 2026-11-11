# AUREL — Premium Betting & Agent Management Platform (Interactive Demo)

Interactive frontend product demonstration showcasing a unified sports betting experience, customer wallet & internal deposit request workflows, agent management portal, and super administrator control center.

> **Disclaimer:** Interactive product prototype. All users, events, odds, balances, and transactions are simulated locally via client state and `localStorage`. No real-money gambling or payment processing is implemented.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS**
- **Zustand** (with `localStorage` persistence)
- **React Router v6**
- **React Hook Form** + **Zod**
- **Recharts** + **Framer Motion** + **Lucide React**

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Netlify Deployment

This repository includes `netlify.toml` and `public/_redirects` preconfigured for Netlify:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **SPA Routing:** All paths rewrite to `/index.html` (`200`) so direct refreshes on `/customer/*`, `/agent/*`, `/admin/*`, and `/sports` resolve cleanly.
