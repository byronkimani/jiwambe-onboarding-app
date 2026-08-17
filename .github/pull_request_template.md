## Summary

<!-- What changed and why -->

## Prototype parity

- [ ] Opened matching [`docs/prototype/`](docs/prototype/) screen beside localhost (e.g. `capture.html?stage=identity`)
- [ ] Updated [`docs/prototype-parity.md`](docs/prototype-parity.md) checkboxes for changed screens
- [ ] Visual E2E updated if layout changed (`e2e/visual/`)

## Test plan

- [ ] `pnpm lint` (zero errors and zero warnings)
- [ ] `pnpm typecheck`
- [ ] `pnpm test --run`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e` (if applicable)
