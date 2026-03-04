---
title: Sessions
---

# Sessions

Sessions track conversation history across multiple verification requests. They are created and continued through the same `POST /v1/verify` endpoint, with no separate session lifecycle API.

---

## Creating a Session

Omit `session_id` from the request. A new session is created and its ID is returned in the response.

::: code-group
```json [Request]
{
  "content": {
    "type": "conversation",
    "role": "user",
    "parts": [
      { "type": "text", "text": "Hi" }
    ]
  },
  "policies": ["pol_hate_speech"]
}
```
```json [Response]
{
  "session_id": "ses_new7890",
  "verdict": {
    "action": "pass",
    "triggered_policies": []
  },
  "session": {
    "active_policies": ["pol_hate_speech"],
    "message_index": 1,
    "context": {}
  }
}
```
:::

---

## Continuing a Session

Include the `session_id` from a previous response. Only send the new (delta) content - the server has the full history.

::: code-group
```json [Request]
{
  "session_id": "ses_new7890",
  "content": {
    "type": "conversation",
    "role": "assistant",
    "parts": [
      { "type": "text", "text": "Sure, I can help with that." }
    ]
  }
}
```
```json [Response]
{
  "session_id": "ses_new7890",
  "verdict": {
    "action": "pass",
    "triggered_policies": []
  },
  "session": {
    "active_policies": ["pol_hate_speech"],
    "message_index": 2,
    "context": {}
  }
}
```
:::

Policies, context, and metrics from previous messages are already on the session. You only need to send new additions.

---

## What Accumulates on a Session

Each request can add to the session's state:

| What | How it accumulates | Reference |
|------|-------------------|-----------|
| **Policies** | Added to session, evaluated on all future messages | [Policies & Metrics](/policies-and-metrics) |
| **Context** | Merged with key-level overwrite (last write wins) | [Context](/context) |
| **Metrics** | Added to session, computed on all future messages | [Policies & Metrics](/policies-and-metrics) |
| **Content history** | Appended - server maintains the full conversation | [Content Types](/content-types) |

---

## Session Echo

Every response includes a `session` object showing the full accumulated state:

```json
{
  "session": {
    "active_policies": ["pol_hate_speech", "pol_minor_safety", "pol_pii_detection"],
    "message_index": 3,
    "context": {
      "user_age_group": "minor",
      "region": "EU",
      "product_tier": "free",
      "feature": "chat"
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `active_policies` | `string[]` | All policies accumulated on this session |
| `message_index` | `integer` | Position of this message in the session (1-indexed) |
| `context` | `object` | Full accumulated context |

---

## Session Expiration

Sessions expire after a configurable TTL (set in project settings, not via this endpoint). Calling with an expired `session_id` returns a `session_expired` error:

```json
{
  "error": {
    "code": "session_expired",
    "message": "Session ses_abc123 has exceeded its TTL",
    "suggestion": "Create a new session and re-establish context and policies"
  }
}
```

When a session expires, you need to create a new one and re-send any relevant context and policies.
