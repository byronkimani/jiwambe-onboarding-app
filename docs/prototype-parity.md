# Prototype parity matrix

**SSOT:** [`prototype/`](prototype/) — same design as [`prototype/v2/v2.html`](prototype/v2/v2.html).  
**Rule:** No UI PR merges without checking the matching prototype screen beside localhost.

## How to verify

1. Serve prototype: `cd docs/prototype && python3 -m http.server 8080`
2. Run app: `pnpm dev`
3. Compare at **768px+** width (tablet-first)
4. Tick parity in PR or update status below

## Screen matrix

| Prototype | Prototype file | App route | App component | Parity |
|-----------|----------------|-----------|---------------|--------|
| `LoginScreen` | `js/auth.js` | `/` | `officer-login-step.tsx` | [ ] |
| `OtpScreen` | `js/auth.js` | `/` (step) | `officer-otp-step.tsx` | [ ] |
| `ReadinessScreen` | `js/capture.js` | `/capture/readiness` | `readiness-stage-body.tsx` | [ ] |
| `LookupScreen` | `js/capture.js` | `/capture/lookup` | `capture-stage-body.tsx` | [ ] |
| `IdentityScreen` | `js/capture.js` | `/capture/identity` | `capture-stage-body.tsx` | [ ] |
| `DlScreen` | `js/capture.js` | `/capture/dl` | `capture-stage-body.tsx` | [ ] |
| `CogcScreen` | `js/capture.js` | `/capture/cogc` | `capture-stage-body.tsx` | [ ] |
| `ReferencesScreen` | `js/capture.js` | `/capture/references` | `capture-stage-body.tsx` | [ ] |
| `ModelScreen` | `js/capture.js` | `/capture/model` | `model-stage-body.tsx` | [ ] |
| `ProductScreen` | `js/capture.js` | `/capture/product` | `capture-stage-body.tsx` | [ ] |
| `BikeScreen` | `js/capture.js` | `/capture/bike` | `capture-stage-body.tsx` | [ ] |
| `ReviewScreen` | `js/capture.js` | `/capture/review` | `capture-stage-body.tsx` | [ ] |
| `Worklist` | `js/desk.js` | `/desk` | `desk-worklist-screen.tsx` | [ ] |
| `DraftsScreen` | `js/desk.js` | `/desk/drafts` | `desk-worklist-screen.tsx` | [ ] |
| `HistoryScreen` | `js/desk.js` | `/desk/history` | `desk-worklist-screen.tsx` | [ ] |
| `AgreementFlow` | `js/flows.js` | `/desk/applications/[id]/agreement` | `agreement-flow.tsx` | [ ] |
| `ReleaseFlow` | `js/flows.js` | `/desk/applications/[id]/release` | `release-flow.tsx` | [ ] |
| `SummaryFlow` | `js/flows.js` | `/desk/applications/[id]/summary` | `summary-flow.tsx` | [ ] |
| `ProfileView` | `js/auth.js` | `/desk/profile` | `officer-profile-page.tsx` | [ ] |

## App-only (visual system from `LoginScreen`, not pixel-compared)

| Screen | App route | Component | Styled |
|--------|-----------|-----------|--------|
| Forgot password | `/forgot-password` | `forgot-password-screen.tsx` | [ ] |
| Activate | `/activate` | `activate-account-screen.tsx` | [ ] |
| Reset password | `/reset-password` | `reset-password-screen.tsx` | [ ] |
| Account blocked | `/account-blocked` | `account-blocked-screen.tsx` | [ ] |
| Offline | `/offline` | `offline/page.tsx` | [ ] |

## Atoms (from `js/shared.js`, `js/chrome.js`)

| Atom | App file | Ported |
|------|----------|--------|
| `SectionCard` | `atoms/section-card.tsx` | [ ] |
| `ChoiceRow` | `atoms/proto-choice-row.tsx` | [ ] |
| `Select` | `atoms/proto-field.tsx` (`ProtoSelect`) | [ ] |
| `Checkbox` | `atoms/proto-checkbox.tsx` | [ ] |
| `SignaturePad` | `atoms/signature-pad.tsx` | [ ] |
| `AiChip` | `atoms/proto-ai-chip.tsx` | [ ] |
| `QualityBadge` | `atoms/quality-badge.tsx` | [ ] |
