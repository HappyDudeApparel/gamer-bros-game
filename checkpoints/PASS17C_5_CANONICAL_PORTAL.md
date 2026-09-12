# PASS 17C-5 — CANONICAL PORTAL

Status: **GREEN**

Validated on `pass17-concept-match` with the production Crystal Library V2 tube component.

## Gate result

The canonical portal passed on both desktop and Android. The gate verified:

- the component is `crystal-library-v2-tube`;
- cold entry is rejected before prewarm;
- production prewarm reaches idle-ready state;
- real entry switches the objective to Crystal Library V2 transmission;
- active charge state is reached without watchdog timeout;
- the portal camera can focus the active transmission;
- the production phase sequence reaches `charge → convert → sustain → dissipate → afterglow → complete`;
- transfer completion, world completion, retry UI, hero hide, watchdog completion, and final World 1-1 objective all resolve correctly;
- the existing Prism Valley route validation remains green at 334 main-route samples and 441 optional-route samples.

Desktop and Android proof screenshots were uploaded by the validation workflow.

Primary successful portal workflow: `Validate Pass 17C-5 Canonical Portal`.

Pass 17C-5 is frozen as the canonical portal checkpoint for the Pass 17 production candidate.
