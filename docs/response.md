---
title: Response Schema
---

# Response Schema

The response tells you what to do and why. Most integrations only need `verdict.action` for control flow, but per-policy detail is always available for debugging and custom UIs.

## Full Response

```json
{
  "request_id": "req_xyz789",
  "session_id": "ses_abc123",
  "verified_at": "2025-03-04T10:30:00Z",

  "results": {
    "pol_hate_speech": {
      "action": "pass",
      "triggered": false,
      "confidence": 0.08
    },
    "pol_minor_safety": {
      "action": "block",
      "triggered": true,
      "confidence": 0.94,
      "reason": "Request to bypass safety controls flagged for minor user",
      "evidence": {
        "matched_pattern": "bypass content filter",
        "context_factor": "user_age_group=minor"
      }
    },
    "pol_pii_detection": {
      "action": "pass",
      "triggered": false,
      "confidence": 0.02
    }
  },

  "verdict": {
    "action": "block",
    "triggered_policies": ["pol_minor_safety"]
  },

  "metrics": {
    "status": "accepted",
    "ids": ["met_frustration_score", "met_topic_drift"]
  },

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

---

## Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | `string` | Unique identifier for this verification request |
| `session_id` | `string` | Session identifier (new or existing) |
| `verified_at` | `string` | ISO 8601 timestamp of evaluation |
| `results` | `object` | Per-policy evaluation results, keyed by policy ID |
| `verdict` | `object` | **The enforcement decision** - most callers only need this |
| `metrics` | `object` | Acknowledgment of async metric evaluation. Only present when metrics were requested. |
| `session` | `object` | Current session state for debugging |

---

## Verdict

The single field most integrations branch on:

| Field | Type | Description |
|-------|------|-------------|
| `action` | `string` | Most restrictive action across all policies |
| `triggered_policies` | `string[]` | IDs of all policies that triggered |

Action precedence: `block` > `flag` > `pass`. If any policy returns `block`, the verdict is `block`.

::: code-group
```bash [cURL]
# Check the verdict
curl -s -X POST /v1/verify \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "content": { "type": "conversation", "role": "user", "parts": [{ "type": "text", "text": "test" }] }, "policies": ["pol_hate_speech"] }' \
  | jq '.verdict.action'
```
```typescript [TypeScript]
const result = await response.json();

if (result.verdict.action === "block") {
  console.log(`Blocked by: ${result.verdict.triggered_policies}`);
} else if (result.verdict.action === "flag") {
  console.log(`Flagged for review by: ${result.verdict.triggered_policies}`);
} else {
  // action === "pass"
  deliverContent();
}
```
:::

---

## Policy Result

Each key in `results` is a policy ID. The value gives you the detail behind the verdict:

| Field | Type | Description |
|-------|------|-------------|
| `action` | `string` | `"pass"`, `"flag"`, or `"block"` |
| `triggered` | `boolean` | Whether the policy was triggered |
| `confidence` | `number` | Confidence score (0.0-1.0) |
| `reason` | `string` | Human-readable explanation (present when triggered) |
| `evidence` | `object` | Policy-specific details (present when triggered) |

When a policy triggers, `reason` explains what happened in plain language and `evidence` provides the machine-readable details: the matched pattern, the context factor that escalated it, etc.

### Triggered vs. Not Triggered

When a policy is **not triggered**, the result is minimal:

```json
{
  "pol_hate_speech": {
    "action": "pass",
    "triggered": false,
    "confidence": 0.08
  }
}
```

When a policy **is triggered**, you get the full explanation:

```json
{
  "pol_minor_safety": {
    "action": "block",
    "triggered": true,
    "confidence": 0.94,
    "reason": "Request to bypass safety controls flagged for minor user",
    "evidence": {
      "matched_pattern": "bypass content filter",
      "context_factor": "user_age_group=minor"
    }
  }
}
```

---

## Metrics Acknowledgment

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | `"accepted"` - metrics are queued for async processing |
| `ids` | `string[]` | Metric IDs that were accepted |

Metric results are available via separate analytics endpoints (not part of this API surface). The `metrics` object is only present in the response when metrics were requested.

---

## Session Echo

Every response includes the full session state so you always know what the server knows:

| Field | Type | Description |
|-------|------|-------------|
| `active_policies` | `string[]` | All policies accumulated on this session |
| `message_index` | `integer` | Position of this message in the session (1-indexed) |
| `context` | `object` | Full accumulated context |

This lets you verify at any point which policies are active, where you are in the conversation, and what context has been accumulated. See [Sessions](/sessions) and [Context](/context) for how these values evolve over time.
