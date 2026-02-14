# Performance Testing Plan

This document defines a lightweight performance testing baseline for FreeFlow.

## Target Scenarios

- Login and load dashboard
- Fetch alarms list
- Fetch inbox tasks
- Open a mini app

## Load Profile (Baseline)

- 25 RPS steady for 10 minutes
- 100 RPS spike for 2 minutes
- 10 VUs warm-up for 2 minutes

## Pass/Fail Thresholds

- p95 latency < 1s for core APIs
- Error rate < 1%
- No sustained CPU > 85% for 10m

## k6 Scripts

- `scripts/perf/k6/dashboard.js`
- `scripts/perf/k6/alarms.js`

## Notes

- Replace URLs and tokens with your environment values.
- Start with staging before production.
