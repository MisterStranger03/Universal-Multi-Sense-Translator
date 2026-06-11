# Universal Multi-Sense Translator

A browser-based multi-sensory translation orchestration app that integrates multiple perception modules, logs, and an LLM-driven orchestrator to interpret and synthesize multimodal sensor inputs.

---

## Features

- **Interactive React UI** with dedicated panels for sensors, timeline, perception logs, and a human-correction modal.
- **Orchestrator View** that aggregates sensor events and queries a language model service for interpretation.
- **Perception Logging & Timeline Visualization** for debugging, replay, and analysis of multimodal events.
- **Correction Modal** for human-in-the-loop adjustments to model outputs.
- **LLM Service Abstraction** via `services/geminiService.ts` — swap backends without touching UI code.
- **Vite + TypeScript SPA scaffold** for fast local development and production builds.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                         │
│                                                              │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────┐     │
│  │ Sensor   │  │  Timeline   │  │   Orchestrator View  │     │
│  │  Panel   │  │   Panel     │  │  (LLM decisions UI)  │     │
│  └────┬─────┘  └──────┬──────┘  └──────────┬───────────┘     │
│       └───────────────┴────────────────────┘                 │
│                         │                                    │
│                    ┌────▼────┐                               │
│                    │ App.tsx │  ← Global state orchestration │
│                    └────┬────┘                               │
│              ┌──────────▼──────────┐                         │
│              │  geminiService.ts   │  ← LLM API wrapper      │
│              └──────────┬──────────┘                         │
└─────────────────────────┼────────────────────────────────────┘
                          │  HTTPS / REST
                    ┌─────▼─────┐
                    │  LLM API  │  (e.g. Gemini / OpenAI)
                    └───────────┘
```

The frontend is a Vite + React 18 + TypeScript SPA. All LLM communication is routed through `services/geminiService.ts`, which acts as the sole integration boundary between the UI and whatever model backend is configured.

---

## Component & File Map

```
universal-multi-sense-translator/
├── index.html                        # App entry point (HTML shell)
├── package.json                      # Dependencies and npm scripts
├── metadata.json                     # Project metadata
├── vite.config.ts                    # Vite build/dev configuration
├── tsconfig.json                     # TypeScript compiler options
├── constants.ts                      # Shared constants and config hints
├── types.ts                          # TypeScript interfaces and types
├── App.tsx                           # Application root & global state
├── index.tsx                         # React DOM mount
├── components/
│   ├── OrchestratorView.tsx          # Orchestrator decisions; re-run / re-evaluate UI
│   ├── SensorPanel.tsx               # Live or sample sensor input display
│   ├── TimelinePanel.tsx             # Visual event & perception history timeline
│   ├── PerceptionLog.tsx             # Detailed logs and metadata per perception event
│   └── CorrectionModal.tsx           # Human correction submission; hooks into orchestrator
└── services/
    └── geminiService.ts              # LLM/perception API abstraction layer
```

| File | Responsibility |
|---|---|
| `App.tsx` | Application root; owns global state, routes events between components |
| `constants.ts` | App-wide constants — sensor types, polling intervals, UI labels |
| `types.ts` | Shared TypeScript types: `SensorEvent`, `PerceptionResult`, `OrchestratorMessage`, `UIState` |
| `OrchestratorView.tsx` | Renders LLM decisions, confidence scores, and exposes re-run triggers |
| `SensorPanel.tsx` | Subscribes to the sensor event feed; renders live or mock input streams |
| `TimelinePanel.tsx` | Scrollable timeline of all perception events |
| `PerceptionLog.tsx` | Expanded log entries with timestamps, raw payloads, and model metadata |
| `CorrectionModal.tsx` | Modal form for submitting human corrections; fires updated events into the orchestrator |
| `services/geminiService.ts` | Wraps all LLM API calls; handles auth, retries, and response parsing |

---

## Quick Start

Requires **Node.js 16+** (Node 18 LTS recommended) and npm 8+. Works on macOS, Linux, and Windows (WSL recommended).

```bash
git clone https://github.com/your-org/universal-multi-sense-translator.git
cd universal-multi-sense-translator
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

```bash
npm run build    # production bundle
npm run preview  # preview the production build locally
```

---

## Configuration & Environment

Vite exposes environment variables prefixed with `VITE_` to the browser bundle. Create a `.env` file in the project root (never commit it):

```env
VITE_LLM_API_KEY=your_api_key_here
VITE_LLM_ENDPOINT=https://generativelanguage.googleapis.com/v1beta
```

`VITE_LLM_API_KEY` is required. `VITE_LLM_ENDPOINT` is optional and defaults to the Gemini endpoint. Both are consumed in `services/geminiService.ts` via `import.meta.env`. Secondary tuning — model name, timeout thresholds — lives in `constants.ts`.

---

## Usage

The typical flow through the app:

1. Run `npm run dev` and open `http://localhost:5173`.
2. In the **Sensor Panel**, load or stream a sample sensor event (e.g. an audio + vision payload).
3. The **Timeline Panel** updates in real time as the event is ingested.
4. The **Orchestrator View** calls `geminiService` and displays the interpreted result with a confidence score.
5. If the output needs correction, open the **Correction Modal**, submit a human label, and the **Perception Log** reflects the update.

---

## Services & APIs

`services/geminiService.ts` is the single integration point with the LLM backend. It reads credentials from environment variables, constructs requests from aggregated sensor events, and parses responses into typed `OrchestratorResult` objects. The module exposes named async functions (`requestInterpretation`, `submitCorrection`) that UI components call directly.

Requests send a multimodal payload (base64-encoded audio/vision data plus a text prompt) to the configured endpoint. Responses are expected to include an `interpretation` string, a `confidence` score, and an optional `suggestions` array. Network errors and non-2xx responses are caught and retried with exponential backoff before surfacing a typed `ServiceError` to the UI.

To swap the backend, update `VITE_LLM_ENDPOINT` and adjust the request construction in `geminiService.ts` — no component code needs to change.

---

## Extending the App

| Goal | Where to start |
|---|---|
| Add a new sensor modality | `types.ts` then `SensorPanel.tsx` |
| Change the LLM backend | `services/geminiService.ts` + `.env` |
| Add a new visualization panel | New component in `components/`, registered in `App.tsx` |
| Persist logs across sessions | Add a storage adapter alongside `geminiService.ts` |

---

## Testing

Automated tests are not yet included in the initial scaffold. The recommended setup is **Vitest** with **React Testing Library**, which integrates natively with Vite. Priority areas: `geminiService.ts` (request construction, response parsing, retry logic), `CorrectionModal.tsx` (form submission and orchestrator callback), and `OrchestratorView.tsx` (loading, success, and error states).

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm test
```

---

## Contributing

1. Open an issue to discuss significant changes before writing code.
2. Fork the repo and create a branch following the convention: `feat/<name>`, `fix/<issue-id>-<desc>`, `docs/<topic>`, or `chore/<task>`.
3. Write strict TypeScript — no `any` types; follow existing component patterns. Use Prettier for formatting and ESLint (`@typescript-eslint`) for linting.
4. Open a PR against `main` with a clear description of what changed and why.

A `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` are recommended as the project matures.

---

## License

This project is licensed under the terms in the [`LICENSE`](./LICENSE) file.