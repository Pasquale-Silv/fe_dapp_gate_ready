# GateReady — Purchase Order Notarization DApp

<p align="center">
  <img src="assets/GateReady.jpeg" alt="GateReady Logo" width="200" />
</p>

<p align="center">
  <strong>Blockchain-powered purchase order notarization for global logistics</strong>
</p>

<p align="center">
  <a href="https://fe-dapp-gate-ready.vercel.app/">Live App</a> &nbsp;|&nbsp;
  <a href="https://github.com/Pasquale-Silv/sc_gate_ready">Smart Contract</a>
</p>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Smart Contract](#smart-contract)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Order Lifecycle](#order-lifecycle)
- [License](#license)

---

## Project Overview

In international logistics, purchase order documentation is a critical pain point. Multiple parties — sellers, buyers, freight forwarders, customs agents — each maintain their own records, leading to misalignments, disputes, and costly delays across borders. Paper-based or siloed digital systems make it nearly impossible to guarantee that every stakeholder is working from the same source of truth.

**GateReady** aims to solve this problem using blockchain technology. By recording purchase order data and notarization hashes on a public, distributed ledger, GateReady ensures that:

- **Every party sees the same data** — orders live on-chain as shared objects, accessible and verifiable by all participants.
- **Document integrity is guaranteed** — a SHA-256 hash of the purchase order document is stored immutably on-chain, making tampering detectable.
- **Approval workflows are transparent** — buyer and validator confirmations are recorded on the blockchain, creating an auditable trail.
- **Payments are traceable** — order payments are executed in IOTA directly through the smart contract.

GateReady is building toward becoming a startup that brings trust and transparency to the logistics sector through the IOTA blockchain — a feeless, scalable distributed ledger designed for real-world applications.

---

## Key Features

- **Create Purchase Orders** — Sellers define product details, pricing, and designate buyers and validators.
- **Multi-party Approval** — Buyers and validators independently confirm or reject orders on-chain.
- **Document Notarization** — Confirmed orders are hashed (SHA-256) and the hash is stored immutably on the blockchain.
- **On-chain Payment** — Buyers pay the exact order amount in IOTA through the smart contract.
- **Role-based Views** — The UI adapts to show relevant actions based on whether you are the seller, buyer, or validator.
- **Wallet Integration** — Connect any IOTA-compatible wallet to interact with the DApp.

---

## Technologies

| Technology | Purpose |
|---|---|
| **[IOTA](https://iota.org/)** | Layer 1 blockchain — feeless, scalable distributed ledger |
| **[IOTA Move](https://docs.iota.org/developer/iota-move-overview/)** | Smart contract language for the IOTA network |
| **[@iota/iota-sdk](https://www.npmjs.com/package/@iota/iota-sdk)** | TypeScript SDK for interacting with the IOTA network (querying objects, building transactions) |
| **[@iota/dapp-kit](https://www.npmjs.com/package/@iota/dapp-kit)** | React hooks and components for IOTA DApp development (wallet connection, transaction signing) |
| **[React 18](https://react.dev/)** | UI framework |
| **[TypeScript](https://www.typescriptlang.org/)** | Type-safe JavaScript |
| **[Vite](https://vite.dev/)** | Fast build tool and dev server |
| **[Radix UI Themes](https://www.radix-ui.com/themes)** | Accessible component library (dark theme) |
| **[TanStack React Query](https://tanstack.com/query)** | Async state management — caching, polling, and invalidation of on-chain data |
| **[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)** | SHA-256 hashing for document notarization (browser-native, no external dependency) |
| **[Vercel](https://vercel.com/)** | Deployment and hosting platform |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Components  │  │    Hooks     │  │   Utilities   │  │
│  │  (UI layer)  │  │ (data layer) │  │  (crypto/fmt) │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                  │          │
│         └────────┬────────┘──────────────────┘          │
│                  │                                      │
│         ┌────────▼─────────┐                            │
│         │  @iota/dapp-kit  │  Wallet connection,        │
│         │  @iota/iota-sdk  │  transaction building,     │
│         │                  │  object queries             │
│         └────────┬─────────┘                            │
└──────────────────┼──────────────────────────────────────┘
                   │
                   │  JSON-RPC
                   │
┌──────────────────▼──────────────────────────────────────┐
│              IOTA Network (Testnet)                     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Smart Contract: sc_gate_ready::sc_gate_ready    │   │
│  │                                                  │   │
│  │  - create_order()      → PurchaseOrder (Shared)  │   │
│  │  - accept_order()      → Confirmed / Rejected    │   │
│  │  - reject_order()      → Rejected                │   │
│  │  - store_notarization()→ Hash + Timestamp        │   │
│  │  - pay_order()         → Paid (IOTA transfer)    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### How It Works

1. **Frontend** is a single-page React application. It has no backend server — all data comes directly from the IOTA blockchain.

2. **Wallet interaction** is handled by `@iota/dapp-kit`, which provides React hooks for connecting wallets and signing transactions. The `WalletProvider` wraps the app and manages wallet state.

3. **On-chain queries** use `@iota/iota-sdk` to fetch purchase order objects. Since the smart contract does not emit events, the app discovers orders by querying `create_order` transaction blocks and extracting created object IDs from `objectChanges`. Data is cached and auto-refreshed every 30 seconds via React Query.

4. **Transaction building** uses the `Transaction` class from `@iota/iota-sdk/transactions`. Each action (create, accept, reject, notarize, pay) builds a Move call transaction that is signed by the user's wallet and executed on-chain.

5. **Notarization** happens entirely client-side: the app builds a plain-text document from order fields, computes its SHA-256 hash using the Web Crypto API, and stores the hash on-chain via `store_notarization()`.

---

## Smart Contract

The IOTA Move smart contract is the backbone of GateReady. It manages the full lifecycle of purchase orders on-chain.

| | |
|---|---|
| **Repository** | [github.com/Pasquale-Silv/sc_gate_ready](https://github.com/Pasquale-Silv/sc_gate_ready) |
| **Network** | IOTA Testnet |
| **Package ID** | `0x54ea5a6939e911ee036cdc3a07f96954f6bad4409505153c80ddd773b8854feb` |
| **Module** | `sc_gate_ready::sc_gate_ready` |

The contract stores `PurchaseOrder` as **shared objects**, making them accessible to all parties (seller, buyer, validators) without requiring ownership transfer. For more details, see [`docs/move_sc.md`](docs/move_sc.md).

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** — install with `npm install -g pnpm` if not available
- An **IOTA-compatible wallet** browser extension (e.g., [IOTA Wallet](https://chromewebstore.google.com/detail/iota-wallet/))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fe_gate_ready

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
# Type-check and build for production
pnpm build

# Preview the production build locally
pnpm preview
```

### Linting & Formatting

```bash
pnpm lint       # Run ESLint
pnpm format     # Run Prettier
```

---

## Project Structure

```
fe_gate_ready/
├── assets/
│   └── GateReady.jpeg              # Logo
├── docs/
│   └── move_sc.md                  # Smart contract documentation
├── src/
│   ├── main.tsx                    # Entry point & provider hierarchy
│   ├── App.tsx                     # Main app with tabs (My Orders / All Orders / Create)
│   ├── constants.ts                # Package ID, module name, order states, MIST conversion
│   ├── types.ts                    # PurchaseOrder TypeScript interface
│   ├── networkConfig.ts            # IOTA network config (devnet / testnet / mainnet)
│   ├── hooks/
│   │   ├── useOrders.ts            # Fetches all PurchaseOrder objects from chain
│   │   └── useOrderActions.ts      # Hooks for create, accept, reject, notarize, pay
│   ├── utils/
│   │   ├── parseOrder.ts           # Parses IOTA objects into PurchaseOrder type
│   │   └── notarization.ts         # MIST/IOTA conversion, document building, SHA-256 hashing
│   └── components/
│       ├── Header.tsx              # Logo, title, wallet connect button
│       ├── StatusBadge.tsx          # Colored badge for order state
│       ├── OrderCard.tsx           # Order summary card with role indicators
│       ├── OrderDetail.tsx         # Full order detail with context-sensitive actions
│       └── CreateOrderForm.tsx     # New order form with dynamic validator list
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

---

## Order Lifecycle

```
  Seller creates order
         │
         ▼
    ┌──────────┐
    │  Created  │
    └─────┬────┘
          │
     Buyer + Validator(s) review
          │
    ┌─────┴──────────────────┐
    │                        │
    ▼                        ▼
┌───────────┐         ┌───────────┐
│ Confirmed │         │ Rejected  │
└─────┬─────┘         └───────────┘
      │
  Seller notarizes
  (SHA-256 hash → on-chain)
      │
  Buyer pays in IOTA
      │
      ▼
  ┌────────┐
  │  Paid  │
  └────────┘
```

| State | Description |
|---|---|
| **Created** | Order submitted by the seller, awaiting approval |
| **Confirmed** | Approved by the buyer and at least one validator (if any were designated) |
| **Rejected** | Rejected by the buyer or a validator |
| **Paid** | Buyer has paid the full amount (`price * quantity`) in IOTA |

---

## License

This project is part of the GateReady initiative. All rights reserved.
