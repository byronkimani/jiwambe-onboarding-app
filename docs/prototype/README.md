# UX prototype — Jiwambe Onboarding (field tablet)

Officer-facing capture prototype (HTML + React UMD). Split by journey so agents can load one flow without the full ~7k-line SPA.

## Open locally

From this directory:

```bash
python3 -m http.server 8080
```

Then visit [http://localhost:8080/index.html](http://localhost:8080/index.html).

## Entry points

| File | Purpose |
|------|---------|
| [`index.html`](index.html) | Hub — links to all flows |
| [`auth.html`](auth.html) | Email login + OTP |
| [`capture.html`](capture.html) | Ten-stage capture wizard (`?stage=identity`, etc.) |
| [`desk.html`](desk.html) | Worklist, agreement, release (`?app=A-1042`) |
| [`prototype.html`](prototype.html) | Full app (`js/app.js`) |

## JavaScript modules

| File | Contents |
|------|----------|
| [`js/shared.js`](js/shared.js) | Design tokens, atoms, `PhotoSlot`, `FlowNav` |
| [`js/data.js`](js/data.js) | `STAGES`, products, Kenya counties, `seedApps`, `seedInventory` |
| [`js/chrome.js`](js/chrome.js) | `TopBar`, `StepRail`, `StageShell`, modals |
| [`js/auth.js`](js/auth.js) | Login / OTP / profile screens |
| [`js/capture.js`](js/capture.js) | Capture stage screens |
| [`js/desk.js`](js/desk.js) | Worklist, history, drafts, folder UI |
| [`js/flows.js`](js/flows.js) | Agreement, release, summary flows |
| [`js/app.js`](js/app.js) | Full `App()` state machine |
| `js/*-app.js` | Thin mounts for slice HTML pages |

## Convention

Prototype is **SSOT for layout and copy** for the Next.js app unless [`../overview.md`](../overview.md) overrides.

Bike product photos are not in this folder yet (no embedded assets in the source export).
