# Analytics and Feedback Plan

This document defines event tracking and feedback capture for FreeFlow.

## Analytics Stack (Example)

- PostHog for product analytics
- Optional: Segment for routing events to multiple tools

## Event Taxonomy

### Authentication

- `user_login`
- `user_logout`

### Dashboard

- `dashboard_viewed`
- `widget_viewed`
- `widget_interacted`

### Alarms

- `alarms_list_viewed`
- `alarm_acknowledged`

### Inbox

- `inbox_list_viewed`
- `task_completed`

### Mini Apps

- `miniapp_opened`
- `miniapp_action`

## Feedback Capture

- In-app feedback widget (link to support form)
- NPS prompt after 7 days
- Optional: email survey after onboarding

## Dashboards

- DAU/WAU/MAU
- Activation funnel (login → dashboard → action)
- Feature usage by module
