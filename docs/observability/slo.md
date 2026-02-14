# Service Level Objectives (SLOs)

This document defines initial SLOs and error budget policies for FreeFlow.
Adjust targets after observing real traffic.

## Key User Journeys

- Login + load dashboard
- View alarms list
- View inbox tasks
- Open a mini app

## Availability SLOs

- **API gateway:** 99.9% monthly
- **Dashboard service:** 99.5% monthly
- **Alarm service:** 99.5% monthly
- **Inbox service:** 99.5% monthly
- **Web app:** 99.9% monthly

## Latency SLOs (p95)

- **API gateway:** < 500ms
- **Dashboard service:** < 500ms
- **Alarm service:** < 700ms
- **Inbox service:** < 700ms
- **Web app (TTFB):** < 800ms

## Error Budget Policy

- 50% of error budget spent → review recent incidents
- 75% spent → freeze risky changes, prioritize reliability work
- 100% spent → no releases except urgent fixes

## Notes

- Measure SLOs per environment; enforce in staging + prod first.
- Use synthetic checks for key journeys in addition to server metrics.
