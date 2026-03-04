---
title: Context
---

# Context

Context is key-value metadata that influences how policies evaluate content. Pass it in the `context` field of any request, and it gets merged into the session for all future evaluations.

---

## Passing Context

Include the `context` object with any verification request:

```json
{
  "content": {
    "type": "conversation",
    "role": "user",
    "parts": [
      { "type": "text", "text": "..." }
    ]
  },
  "context": {
    "user_age_group": "minor",
    "region": "EU",
    "product_tier": "free",
    "feature": "chat"
  },
  "policies": ["pol_minor_safety"]
}
```

Context tells policies **who** is using the system and **where**, so they can make smarter decisions. A message like "help me bypass the filter" might pass for an adult developer but block for a minor.

---

## How Context Merges

Context is **additive with key-level overwrite**: new keys are added, existing keys are overwritten (last write wins), and keys are never removed within a session.

**Message 1:**
```json
{ "context": { "user_age_group": "minor", "region": "EU" } }
```
Session context: `{ "user_age_group": "minor", "region": "EU" }`

**Message 2:**
```json
{ "context": { "product_tier": "free" } }
```
Session context: `{ "user_age_group": "minor", "region": "EU", "product_tier": "free" }`

**Message 3:**
```json
{ "context": { "region": "US" } }
```
Session context: `{ "user_age_group": "minor", "region": "US", "product_tier": "free" }` - `region` overwritten.

---

## Verifying Context

The full accumulated context is always returned in the response's `session.context` field, so you can verify exactly what the server knows:

```json
{
  "session": {
    "context": {
      "user_age_group": "minor",
      "region": "US",
      "product_tier": "free",
      "feature": "chat"
    }
  }
}
```

---

## Context Values

Context values must be strings, numbers, or booleans:

```json
{
  "context": {
    "user_age_group": "minor",
    "region": "EU",
    "product_tier": "free",
    "feature": "chat",
    "is_premium": true,
    "message_count": 42
  }
}
```

Objects and arrays are not supported. See [Errors](/errors#invalid-context-400) for what happens when invalid values are passed.

---

## How Policies Use Context

Context doesn't directly block or allow content. Instead, it influences policy evaluation:

| Context key | How policies might use it |
|-------------|--------------------------|
| `user_age_group` | Apply stricter rules for minors |
| `region` | Enforce region-specific regulations (GDPR, COPPA) |
| `product_tier` | Adjust sensitivity thresholds |
| `feature` | Apply feature-specific policies (chat vs. code generation) |
| `is_premium` | Enable additional policy features |

The same content can produce different verdicts depending on the context. This is by design: you report the facts, the policies handle the logic.
