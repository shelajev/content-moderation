---
layout: doc
title: Content Verification API
---

# Content Verification API

## `POST /v1/verify`

A single, session-aware endpoint for content verification and moderation. Evaluates content against **policies** for synchronous enforcement and collects **metrics** for asynchronous analytics. Maintains conversation context across messages, enabling moderation that understands history, not just the current message.

---

## Quick Start

::: code-group
```bash [cURL]
curl -X POST /v1/verify \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "conversation",
      "role": "user",
      "parts": [{ "type": "text", "text": "Hello, can you help me with my homework?" }]
    },
    "policies": ["pol_hate_speech"]
  }'
```
```typescript [TypeScript]
const response = await fetch("/v1/verify", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content: {
      type: "conversation",
      role: "user",
      parts: [{ type: "text", text: "Hello, can you help me with my homework?" }],
    },
    policies: ["pol_hate_speech"],
  }),
});

const result = await response.json();
```
:::

```json
{
  "request_id": "req_a1b2c3d4",
  "session_id": "ses_new7890",
  "verified_at": "2025-03-04T10:30:00Z",
  "results": {
    "pol_hate_speech": {
      "action": "pass",
      "triggered": false,
      "confidence": 0.03
    }
  },
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

No `session_id` in the request → a new session is created automatically. The response includes the new `session_id` to use in subsequent calls.

---

## Authentication

All requests require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <token>
```
