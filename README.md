<div align="center">

<h1>Veri0G — Compute Proof Explorer</h1>

<p><strong>The human-readable explorer for 0G Compute attestation proofs.</strong><br/>
Paste a provider address. See whether it's really running inside attested secure hardware — in plain language, not a CLI log.</p>

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js"/>
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript"/>
  <img alt="GSAP" src="https://img.shields.io/badge/GSAP-3.15-88ce02?style=flat-square"/>
  <img alt="0G SDK" src="https://img.shields.io/badge/0G_Compute_SDK-0.8-8cebd2?style=flat-square"/>
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-4-06b6d4?style=flat-square&logo=tailwindcss"/>
</p>

<p>
  <a href="https://0g.ai">0G Network</a> ·
  <a href="https://docs.0g.ai">Documentation</a> ·
  <a href="#getting-started">Quick Start</a>
</p>

</div>

---

## 🚨 The Problem

As AI increasingly powers decentralized applications, verifying the integrity of AI inferences is paramount. If a model's execution cannot be audited, decentralized AI falls back into a web of centralized trust assumptions.

**0G Chain** introduced Trusted Execution Environments (TEEs) and cryptographic proofs to solve this. But a massive UX bottleneck exists: checking these proofs is today a developer-only task — restricted to CLI tools and raw SDK workflows. Everyday users, Web3 consumers, and dApp operators have no human-readable way to verify if an AI response was actually secured inside attested hardware.

## 💡 The Solution

**Veri0G** bridges this critical gap — the **"Etherscan for AI Proofs"** on the 0G network. It abstracts complex backend cryptography into an intuitive, zero-friction verification dashboard.

Anyone can paste a 0G Compute Provider Address and receive an instant, transparent attestation receipt. Cold, unreadable developer logs become an immediately understandable trust signal.

---

## ✨ Features

| Feature | Description |
|---|---|
| **One-click TEE verification** | Paste an address, run a real check against the live 0G testnet — no CLI required |
| **Live provider directory** | Searchable, browseable list of every active compute provider |
| **Honest verification receipts** | Honest `PASS` / `FAIL` — never "verified" when checks are incomplete |
| **Full transparency log** | Every step the verifier ran, exposed on demand |
| **Zero wallet required** | Fully read-only; no gas, no signing, no funds needed |
| **Neo-Brutalist UI** | Memphis-inspired animated design with GSAP entrance transitions |
| **Curtain-split boot screen** | Animated 0–100% loader with simulated system boot messages |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────┐
│                   Next.js App Router               │
│                                                    │
│  ┌──────────────────┐    ┌──────────────────────┐  │
│  │  Landing Page    │    │  /dashboard          │  │
│  │  (Client)        │    │  (Client)            │  │
│  │  ├ LoadingState  │    │  ├ ProviderSearch    │  │
│  │  ├ HeroBackground│    │  ├ VerificationCard  │  │
│  │  └ Hero (GSAP)   │    │  └ DashboardNavbar   │  │
│  └──────────────────┘    └──────────────────────┘  │
│                                   │                │
│              ┌────────────────────┤                │
│              ▼                    ▼                │
│  ┌────────────────────┐  ┌──────────────────────┐  │
│  │  POST /api/verify  │  │  GET /api/providers  │  │
│  │  (Server-only)     │  │  (Server-only)       │  │
│  └──────────┬─────────┘  └──────────┬───────────┘  │
│             │                       │              │
└─────────────┼───────────────────────┼──────────────┘
              │                       │
              ▼                       ▼
     ┌────────────────────────────────────────┐
     │           app/lib/zeroG.ts             │
     │  (Server-only — hard build boundary)   │
     │                                        │
     │  ● getZeroGBroker() — singleton        │
     │  ● listProviders()  — 60s cache        │
     │  ● verifyProvider() — dual audit       │
     │    ├ TEE signer match                  │
     │    └ Docker-compose hash check         │
     └──────────────────┬─────────────────────┘
                        │
                        ▼
          ┌─────────────────────────┐
          │  @0gfoundation/         │
          │  0g-compute-ts-sdk      │
          │                         │
          │  Galileo Testnet        │
          │  RPC endpoint           │
          └─────────────────────────┘
```

### Key Design Decisions

- **`server-only` boundary** — `app/lib/zeroG.ts` imports `server-only`, preventing the private key and RPC logic from ever reaching the browser build. Hard compile-time enforcement.
- **Broker singleton** — The 0G SDK broker is initialized once and cached across warm lambda invocations, avoiding repeated wallet connections per request.
- **60-second provider cache** — `listProviders()` caches the full service list in-memory to avoid hammering the network on every keystroke in the search input.
- **Dual verification audit** — `verifyProvider()` runs both `signerVerification` and `composeVerification` atomically, populating a typed `VerificationResult` structure serializable to JSON.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React Server Components) |
| **Language** | TypeScript 5 — strict mode throughout |
| **UI Framework** | React 19 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | [GSAP 3](https://gsap.com/) + `@gsap/react` |
| **Smooth Scroll** | [Lenis](https://lenis.darkroom.engineering/) |
| **Icons** | Lucide React |
| **Blockchain SDK** | `@0gfoundation/0g-compute-ts-sdk` v0.8 |
| **Web3** | `ethers.js` v6 |

---

## 📂 Project Structure

```
0g-proof-dashboard/
├── app/
│   ├── api/
│   │   ├── verify/route.ts        # POST – runs full provider attestation
│   │   └── providers/route.ts     # GET  – returns all active providers
│   ├── components/
│   │   ├── LoadingState.tsx        # Boot screen (0–100% + curtain split)
│   │   ├── HeroBackground.tsx      # Memphis Design SVG animation canvas
│   │   ├── Hero.tsx                # Landing hero section with GSAP timeline
│   │   ├── Navbar.tsx              # Landing navigation bar
│   │   ├── Stats.tsx               # Protocol stat pills
│   │   ├── HowItWorks.tsx          # 4-step process walkthrough
│   │   ├── Features.tsx            # Animated feature list
│   │   ├── TechStack.tsx           # Technology showcase
│   │   ├── TrustMetrics.tsx        # Trust & transparency metrics
│   │   ├── VerificationCard.tsx    # Full attestation result card
│   │   ├── ProviderSearch.tsx      # Address search + live dropdown
│   │   ├── DashboardNavbar.tsx     # Dashboard navigation bar
│   │   ├── Footer.tsx              # Landing page footer
│   │   ├── SmoothScroll.tsx        # Lenis smooth-scroll wrapper
│   │   └── StatusBadge.tsx         # PASS / FAIL / MANUAL badge
│   ├── dashboard/
│   │   └── page.tsx                # /dashboard route
│   ├── lib/
│   │   └── zeroG.ts                # 0G broker singleton + verification logic
│   ├── types/                      # Shared TypeScript interfaces
│   ├── layout.tsx                  # Root layout (fonts, meta)
│   └── page.tsx                    # Landing page route (/)
├── public/                         # Static assets
├── tailwind.config.ts              # Tailwind theme tokens
├── next.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone

```bash
git clone https://github.com/your-username/0g-proof-dashboard.git
cd 0g-proof-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:

```env
# ─────────────────────────────────────────────────────────────
#  PRIVATE_KEY — a throwaway wallet key (no funds required)
#
#  The 0G SDK requires a wallet to initialize the broker.
#  listService() and verifyService() are fully read-only.
#
#  Generate a fresh key in seconds:
#    node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"
# ─────────────────────────────────────────────────────────────
PRIVATE_KEY=0x...your_throwaway_private_key...

# ─────────────────────────────────────────────────────────────
#  ZERO_G_RPC_URL — Defaults to the public Galileo testnet RPC
#  Override only if you run a local node or use a different endpoint
# ─────────────────────────────────────────────────────────────
ZERO_G_RPC_URL=https://evmrpc-testnet.0g.ai
```

> **No funds needed.** Verification is read-only — the wallet is only used to initialize the SDK, not to sign or broadcast any transactions.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🔍 API Routes

### `POST /api/verify`

Runs a full TEE attestation check on a 0G Compute provider.

**Request:**
```json
{ "providerAddress": "0x..." }
```

**Response:**
```json
{
  "providerAddress": "0x...",
  "found": true,
  "service": {
    "provider": "0x...",
    "serviceType": "inference",
    "url": "https://...",
    "model": "llama-3-8b",
    "inputPrice": "...",
    "outputPrice": "...",
    "verifiability": "TeeML"
  },
  "isVerified": true,
  "signerMatch": true,
  "composeHashPassed": true,
  "dockerImages": ["sha256:..."],
  "steps": ["Locating service...", "..."],
  "error": null
}
```

### `GET /api/providers`

Returns all active 0G Compute providers (60-second server-side cache).

**Response:**
```json
[
  {
    "provider": "0x...",
    "serviceType": "inference",
    "model": "...",
    "verifiability": "TeeML",
    ...
  }
]
```

---

## 🎨 Design System

Veri0G uses a **Neo-Brutalism × 90s Memphis Design** visual language inspired by the [0G Zero Cup](https://0g.ai/arena/zero-cup) tournament site.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Navy | `#1C1941` | Primary text, borders, shadows |
| Mint | `#8cebd2` / `#8AF2CF` | Hero background, accents |
| Purple | `#845EEB` | CTAs, highlights |
| Hot Pink | `#FF77C9` | Hero background shapes |
| Deep Blue | `#4D38D9` | Cube shapes |
| Red | `#EE3248` | Triangle shapes |
| Gold | `#FFD166` | Stars, plus signs |

### Animation Principles

- **GSAP timelines** for sequenced entrance animations triggered by `isLoaded` state
- **CSS keyframes** for ambient floating shapes (hardware-accelerated `transform` only)
- **ScrollTrigger** for scroll-driven feature reveals
- **Lenis** for buttery-smooth scroll momentum

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Create a feature branch
git checkout -b feat/your-feature-name

# Make changes, then
npm run lint
npx tsc --noEmit

# Push and open a PR
git push origin feat/your-feature-name
```

---

## 📜 License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <p>Built for the <strong>0G Zero Cup Hackathon</strong> · Powered by 0G Compute Network</p>
  <p>
    <a href="https://0g.ai">0G Website</a> ·
    <a href="https://docs.0g.ai">Docs</a> ·
    <a href="https://twitter.com/0G_labs">Twitter</a>
  </p>
</div>