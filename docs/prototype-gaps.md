# Prototype gaps (remaining)

**Prototype:** [`prototype/`](prototype/) — reference UI only.  
**Production behavior:** [`api-contract.md`](api-contract.md).

Most screens are ported to Next.js (**demo UI**). What is still open:

| Area | Gap |
|------|-----|
| **Pricing** | Prototype `calcDaily()` / `MIN_DEPOSIT` in `data.js` — **closed in app** via `GET /catalog/pricing-rules` + `POST /catalog/quotes` |
| **Payments** | Prototype STK simulation — **partial**; real M-Pesa via `/payments/*` upstream TBD |
| **Documents** | OCR, face match, anomaly scan — UI placeholders; presigned upload not wired |
| **Data** | Worklist/demo advance buttons — replace with CRM-driven state |
| **Ops** | LMS / insurance transitions between desk columns — back-office, not tablet |
| **i18n** | Kiswahili deferred |
| **Offline** | Descoped for v1 |

When closing a gap: update this file and [`implementation-status.md`](implementation-status.md).
