0g-proof-dashboard/
├── .env.local                     # 🔒 Environment variables (RPC URLs, Private Keys)
├── package.json                   # 📦 Project dependencies (Next, ethers, 0g-sdk)
├── tailwind.config.ts             # 🎨 Tailwind CSS configuration
├── tsconfig.json                  # 🛠️ TypeScript configuration
└── src/
    ├── app/                       # 🌐 NEXT.JS APP ROUTER (Pages & APIs)
    │   ├── globals.css            # Global CSS (Tailwind imports go here)
    │   ├── layout.tsx             # The HTML wrapper, fonts, and global metadata
    │   ├── page.tsx               # The main landing page (The Dashboard UI)
    │   └── api/
    │       └── verify/
    │           └── route.ts       # Your Backend API that securely talks to 0G
    │
    ├── components/                # 🧩 REUSABLE UI PIECES
    │   ├── SearchBar.tsx          # The input field where users paste the Provider Address
    │   ├── VerificationCard.tsx   # The "Receipt" showing if the AI is verified or not
    │   ├── StatusBadge.tsx        # A visual pill (Green ✅ Verified / Red ❌ Failed)
    │   └── LoadingState.tsx       # A spinner/skeleton shown while checking the proof
    │
    ├── lib/                       # ⚙️ CORE LOGIC & HELPER FUNCTIONS
    │   ├── zeroG.ts               # The 0G Engine: Initializes the broker & ethers.js
    │   └── utils.ts               # Small helpers (e.g., truncating 0x addresses)
    │
    └── types/                     # 🔤 TYPESCRIPT DEFINITIONS
        └── index.ts               # Interfaces for your API responses to keep code strict±


        0xa48f01287233509FD694a22Bf840225062E67836   — Qwen 2.5 7B
0x69Eb5a0BD7d0f4bF39eD5CE9Bd3376c61863aE08   — Gemma 3 27B