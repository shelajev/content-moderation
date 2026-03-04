---
title: Policies & Metrics
---

# Policies & Metrics

Policies and metrics are referenced by ID in the request. Policies are evaluated synchronously and drive the verdict. Metrics are acknowledged immediately and processed asynchronously.

---

## Referencing Policies

Pass policy IDs in the `policies` or `ephemeral_policies` arrays:

```json
{
  "policies": ["pol_hate_speech", "pol_minor_safety"],
  "ephemeral_policies": ["pol_injection_detect"]
}
```

Policy IDs follow the format `pol_<name>`. They are configured in your project dashboard.

---

## Policy Evaluation Layers

Policies are evaluated in three layers, all combined for each request:

| Layer | Scope | How set | Behavior |
|-------|-------|---------|----------|
| **Default policies** | Account/project | Pre-configured in dashboard | Always evaluated on every request |
| **Session policies** | Session lifetime | Via `policies` field | Accumulated - once added, evaluated on all future messages |
| **Ephemeral policies** | Single message | Via `ephemeral_policies` field | Evaluated once, NOT added to session |

### Accumulation Example

**Message 1:**
```json
{ "policies": ["pol_hate_speech"] }
```
Session policies: `[pol_hate_speech]`

**Message 2:**
```json
{ "policies": ["pol_minor_safety"] }
```
Session policies: `[pol_hate_speech, pol_minor_safety]` - both are evaluated.

**Message 3:**
```json
{ "ephemeral_policies": ["pol_injection_detect"] }
```
Evaluated: `[pol_hate_speech, pol_minor_safety, pol_injection_detect]`
Session policies remain: `[pol_hate_speech, pol_minor_safety]` - the ephemeral policy is not persisted.

**Message 4:**
```json
{}
```
Evaluated: `[pol_hate_speech, pol_minor_safety]` - no new policies needed, session policies carry forward.

### Why Accumulation by Default?

Once you know a user is a minor or a conversation is about medical topics, you don't want to "forget" the relevant policies. Accumulation:

- Mirrors how real conversations work
- Reduces payload size on repeat calls
- Prevents accidental policy gaps from client bugs
- The `ephemeral_policies` escape hatch handles one-off checks

---

## Policy Results

Each policy produces a result in the response's `results` object, keyed by policy ID:

```json
{
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
    }
  }
}
```

The aggregate `verdict` applies the most restrictive action across all policies. See [Response Schema](/response) for full detail.

---

## Referencing Metrics

Pass metric IDs in the `metrics` array:

```json
{
  "metrics": ["met_frustration_score", "met_topic_drift"]
}
```

Metric IDs follow the format `met_<name>`. They are configured in your project dashboard.

### How Metrics Differ from Policies

| | Policies | Metrics |
|-|----------|---------|
| **Purpose** | Enforcement - block, flag, or pass | Analytics - track patterns over time |
| **Timing** | Synchronous - result in the response | Asynchronous - processed in the background |
| **Response** | Full result per policy | Acknowledgment only (`"status": "accepted"`) |
| **Session** | Accumulated on session | Accumulated on session |
| **Affects verdict** | Yes | No |

### Metrics Acknowledgment

The response confirms metrics were accepted for processing:

```json
{
  "metrics": {
    "status": "accepted",
    "ids": ["met_frustration_score", "met_topic_drift"]
  }
}
```

Metric results are available via separate analytics endpoints (not part of this API surface).

### Example Metrics

| Metric ID | What it measures |
|-----------|-----------------|
| `met_frustration_score` | User frustration signals across the session |
| `met_topic_drift` | How far the conversation has moved from its original topic |
| `met_repetition_index` | Repeated questions or circular conversation patterns |
| `met_coercibility_score` | How easily the model reverses its position under pressure |
| `met_position_reversal` | Instances where the model contradicts a previous statement |
| `met_code_safety_trend` | Safety trajectory of generated code across agent steps |
