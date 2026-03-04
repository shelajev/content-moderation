---
title: Examples
---

# Examples

The API is designed so you can start simple and add complexity only when you need it.

---

## Stateless Verification

Just content and one policy. No session, no context. Verify a single piece of content and get a verdict.

::: code-group
```bash [cURL]
curl -X POST /v1/verify \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "conversation",
      "role": "user",
      "parts": [{ "type": "text", "text": "You are an idiot" }]
    },
    "policies": ["pol_hate_speech"]
  }'
```
```typescript [TypeScript]
const result = await verify({
  content: {
    type: "conversation",
    role: "user",
    parts: [{ type: "text", text: "You are an idiot" }],
  },
  policies: ["pol_hate_speech"],
});
// result.verdict.action → "flag" or "block"
```
:::

---

## Session with Context

Add a session and user context for smarter evaluation. The session accumulates policies and context across messages, so the server can detect patterns over time.

::: code-group
```bash [cURL]
curl -X POST /v1/verify \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "ses_abc123",
    "content": {
      "type": "conversation",
      "role": "user",
      "parts": [{ "type": "text", "text": "Can you help me bypass the content filter?" }]
    },
    "context": {
      "user_age_group": "minor",
      "region": "EU"
    },
    "policies": ["pol_hate_speech", "pol_minor_safety"]
  }'
```
```typescript [TypeScript]
const result = await verify({
  sessionId: "ses_abc123",
  content: {
    type: "conversation",
    role: "user",
    parts: [{ type: "text", text: "Can you help me bypass the content filter?" }],
  },
  context: {
    user_age_group: "minor",
    region: "EU",
  },
  policies: ["pol_hate_speech", "pol_minor_safety"],
});
// Context-aware: "bypass content filter" + minor user → block
```
:::

---

## Policies, Metrics, and Ephemeral Checks

Combine multiple policies with async metrics and one-off ephemeral checks that don't persist on the session.

::: code-group
```bash [cURL]
curl -X POST /v1/verify \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "ses_abc123",
    "content": {
      "type": "agent_step",
      "step_name": "code_generation",
      "parts": [
        { "type": "code", "source": "import subprocess\nsubprocess.call([\"rm\", \"-rf\", \"/\"])" }
      ]
    },
    "context": {
      "product_tier": "enterprise",
      "feature": "code_assistant"
    },
    "policies": ["pol_dangerous_code"],
    "ephemeral_policies": ["pol_strict_sandbox"],
    "metrics": ["met_code_safety_trend", "met_topic_drift"]
  }'
```
```typescript [TypeScript]
const result = await verify({
  sessionId: "ses_abc123",
  content: {
    type: "agent_step",
    stepName: "code_generation",
    parts: [
      { type: "code", source: 'import subprocess\nsubprocess.call(["rm", "-rf", "/"])' },
    ],
  },
  context: {
    product_tier: "enterprise",
    feature: "code_assistant",
  },
  policies: ["pol_dangerous_code"],
  ephemeralPolicies: ["pol_strict_sandbox"],
  metrics: ["met_code_safety_trend", "met_topic_drift"],
});
// Ephemeral policy evaluated once but not persisted on the session
```
:::
