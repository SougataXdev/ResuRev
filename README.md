# ResuRev 🚀

## AI-Powered Resume Review Platform

Transform your resume with intelligent AI feedback and land your dream job.

[![React](https://img.shields.io/badge/React-19.1.0-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![React Router](https://img.shields.io/badge/React_Router-7.7.1-ca4245?style=for-the-badge&logo=react-router)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)](https://docker.com/)

---

## ✨ Features

### 🔍 Core Intelligence

- **AI Resume Analysis** – Integrates with Puter AI to evaluate content, structure & ATS readiness
- **ATS Score & Tiers** – Dynamic scoring with visual tiers (Top, Solid, Fair, Improve)
- **Duplicate Detection** – Input hashing prevents reprocessing identical uploads
- **Incremental Feedback Parsing** – Resilient JSON extraction from AI responses
- **Preview Generation** – First-page PDF → PNG preview (client-side)

### 📂 Resume Management

- **Dynamic Dashboard** – Real-time listing from Puter KV store
- **Client-Side Filters** – Status, search, sort (score / created)
- **Pagination** – Efficient rendering (15 per page)
- **Relative Time** – Intl.RelativeTimeFormat fallback utilities
- **Soft Delete + Tombstones** – Persistent hiding across refresh & multi-tab sync
- **Broadcast & Storage Sync** – Live updates across tabs (BroadcastChannel + localStorage)

### 🎨 User Experience

- **Responsive Design** – Seamless across devices
- **Accessible UI** – Radix primitives + semantic HTML
- **Drag & Drop Upload** – With progress and status phases
- **Optimistic UX** – Instant state updates on destructive actions
- **Dark Mode** – Polished visual system

### 🏗️ Technical Excellence

- **Modern Stack** – React 19 + React Router 7 file-based routing
- **Strong Typing** – Centralized domain types (`types/resume.ts`)
- **State Store** – Lightweight Zustand + custom Puter orchestration layer
- **Progressive Enhancement** – Graceful fallbacks for formatting & parsing
- **Code Organization** – Clear separation of UI, domain, infra

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- (Optional) Docker

### Installation

```bash
git clone https://github.com/SougataXdev/resurev.git
cd resurev
npm install
npm run dev
```

Visit: <http://localhost:5173>

---

## 🧠 Puter Integration

The app relies on the Puter runtime (script injected in `root.tsx`) to provide:

- KV Storage (`resume:*`, tombstones, hash indexes)
- File uploads (raw resume + generated preview image)
- AI feedback (`puter.ai.feedback`) with custom prompt helpers
- Hashing & parsing utilities (when available) with safe fallbacks

If running outside the Puter environment ensure the script tag `<script src="https://js.puter.com/v2/"></script>` is reachable.

---

## 🛠️ Development Scripts

```bash
npm run dev       # Start with HMR
npm run build     # Production build
npm run start     # Serve production build
npm run typecheck # TypeScript diagnostics
```

---

## 📁 Project Structure (Updated)

```text
resurev/
├── app/
│   ├── components/
│   │   ├── landing/        # Marketing sections (Hero, Features, Pricing, Footer)
│   │   ├── review/         # ReviewResult + parsing helpers
│   │   ├── ui/             # Base UI primitives (button, sheet, card, animator)
│   │   └── Navigation.tsx
│   ├── lib/
│   │   ├── puter.lib.ts    # Puter state + orchestration layer
│   │   └── utils.ts        # Utility helpers (cn, generateUUID)
│   ├── routes/
│   │   ├── home.tsx        # Landing page
│   │   ├── auth.tsx        # Authentication gateway
│   │   ├── dashboard.tsx   # Resume management
│   │   ├── upload.tsx      # Upload & analysis flow
│   │   ├── resume.$id.tsx  # Resume detail / review page
│   │   └── review.tsx      # (Deprecated redirect → dashboard)
│   ├── root.tsx            # App root & layout (injects Puter script)
│   ├── routes.ts           # Route manifest
│   └── app.css             # Global styles
├── types/
│   ├── resume.ts           # Domain model types
│   └── puter.types.ts      # Puter API typing
├── public/
├── Dockerfile
└── components.json
```

> Removed legacy `signin.tsx` / `signup.tsx` in favor of unified `auth.tsx`.

---

## 🔄 Data Lifecycle

1. User uploads resume (PDF/DOC/DOCX)
2. Optional PDF → PNG preview generated client-side
3. Record persisted to KV as `resume:{uuid}` (status=pending)
4. AI analysis executes → JSON (parsed + validated)
5. Record updated (status=completed)
6. Dashboard reflects changes (real-time sync)
7. Delete triggers KV delete + tombstone marker to suppress reappearance

---

## 🧪 Scoring & Tiers

- ≥ 85: Top
- 70–84: Solid
- 55–69: Fair
- < 55: Improve

Each resume card includes progress bar, badges, relative creation time, and quick actions (open / delete).

---

## 📦 Key Dependencies (Extended)

```json
{
  "react": "^19.1.0",
  "react-router": "^7.7.1",
  "zustand": "^5.0.7",
  "zod": "^3.25.76",
  "pdfjs-dist": "^5.4.54",
  "@radix-ui/react-dialog": "^1.1.14",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-tabs": "^1.1.13"
}
```

---

## 🧾 Environment Notes

No server-side secrets are required; storage & AI calls route through the Puter client context. For future server hardening you can introduce a Remix / Express boundary or edge functions.

---

## 🐳 Docker

```bash
docker build -t resurev .
docker run -p 3000:3000 resurev
```

Multi-stage build optimizes runtime image size. Serve `build/` output in production.

---

## 🤝 Contributing

1. Fork
2. Branch: `feat/your-feature`
3. Commit: Conventional style (e.g. `dashboard: add filtering`)
4. PR with clear description

### Guidelines

- Maintain type safety
- Keep commits focused
- Ensure accessibility (ARIA / keyboard)
- Update docs when adding major features

---

## 📄 License

MIT – see [LICENSE](LICENSE)

---

## 🆘 Support

- Issues: GitHub Issues
- (Future) Email & Discord community

---

Built with ❤️ using React Router & Puter AI.
