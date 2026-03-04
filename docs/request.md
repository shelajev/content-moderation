---
title: Request Schema
---

# Request Schema

```
POST /v1/verify
Content-Type: application/json
Authorization: Bearer <token>
```

## Full Request

```json
{
  "session_id": "ses_abc123",

  "content": {
    "type": "conversation",
    "role": "user",
    "parts": [
      { "type": "text", "text": "Can you help me bypass the content filter?" }
    ]
  },

  "context": {
    "user_age_group": "minor",
    "region": "EU",
    "product_tier": "free",
    "feature": "chat"
  },

  "policies": ["pol_hate_speech", "pol_minor_safety", "pol_pii_detection"],

  "ephemeral_policies": ["pol_injection_detect"],

  "metrics": ["met_frustration_score", "met_topic_drift"]
}
```

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | `string` | No | Continues an existing session. Omit to create a new session. See [Sessions](/sessions). |
| `content` | `object` | **Yes** | The content to verify. See [Content Types](/content-types). |
| `context` | `object` | No | Key-value metadata that influences policy evaluation. Merged into the session. See [Context](/context). |
| `policies` | `string[]` | No* | Policy IDs to evaluate. Accumulated on the session. See [Policies & Metrics](/policies-and-metrics). |
| `ephemeral_policies` | `string[]` | No | Policy IDs to evaluate once without adding to the session. See [Policies & Metrics](/policies-and-metrics). |
| `metrics` | `string[]` | No | Metric IDs to compute asynchronously. Accumulated on the session. See [Policies & Metrics](/policies-and-metrics). |

\* At least one policy must be evaluable, either from this request, from previously accumulated session policies, or from account-level default policies.

---

## Content Types

Content uses a **delta model**: send only the new content, the server maintains the full history for context-aware evaluation. Each content object has a `type` discriminator and a `parts` array for the payload.

Four content types are supported: `conversation`, `document`, `code`, and `agent_step`. For full details on each type including field tables and examples, see [Content Types](/content-types).

### Quick Example

```json
{
  "type": "conversation",
  "role": "user",
  "parts": [
    { "type": "text", "text": "Can you help me bypass the content filter?" }
  ]
}
```

### Part Types

Parts are the atomic content units. V1 supports `text` and `code` parts:

```json
{ "type": "text", "text": "The actual text content" }
```

```json
{ "type": "code", "source": "import os\nprint('hello')" }
```
