# Prototype gaps

**Prototype SSOT:** [`prototype/`](prototype/) — layout, copy, disabled states, component structure.  
**Parity matrix:** [`prototype-parity.md`](prototype-parity.md).

## UI parity (open)

Track visual/UX debt vs prototype. Close rows when parity matrix is ticked.

| Area | Gap | Status |
|------|-----|--------|
| Auth login/OTP | shadcn vs proto `Btn` disabled states | In progress |
| Capture lookup | Portal card, inline Search, full PII | In progress |
| Capture identity | `SectionCard` groupings | In progress |
| Capture chrome | Top pause/DQ row | In progress |
| Agreement | `SignaturePad`, pause/DQ footer | Planned |
| Release | Defect report, `StickerSmsBtn`, pause/DQ | Planned |
| Desk | STAGE pill label "Offline · Stage" | Planned |

## Behavior / backend (unchanged from prior doc)

| Area | Gap |
|------|-----|
| **Pricing** | Closed in app via `/v1/field/products*` BFF |
| **Payments** | STK partial; real M-Pesa upstream TBD |
| **Documents** | OCR/face placeholders; presigned storage upstream TBD |
| **Data** | Demo advance + polling; CRM-driven transitions TBD |
| **Ops** | LMS transitions — back-office |
| **Offline** | Descoped v1 |
| **i18n** | Kiswahili deferred |

When closing a gap: update this file, [`prototype-parity.md`](prototype-parity.md), and [`implementation-status.md`](implementation-status.md).
