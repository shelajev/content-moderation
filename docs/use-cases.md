---
title: Use Cases
---

# Use Cases

### Moderating User Chat

Verify each user message before passing it to the LLM. Use session-based evaluation to detect escalation patterns.

::: code-group
```json [Request]
{
  "session_id": "ses_chat_001",
  "content": {
    "type": "conversation",
    "role": "user",
    "parts": [
      { "type": "text", "text": "Can you tell me how to pick a lock?" }
    ]
  },
  "context": {
    "user_age_group": "adult",
    "feature": "chat"
  },
  "policies": ["pol_hate_speech", "pol_pii_detection"]
}
```
```typescript [TypeScript]
const result = await verify({
  sessionId: "ses_chat_001",
  content: {
    type: "conversation",
    role: "user",
    parts: [{ type: "text", text: "Can you tell me how to pick a lock?" }],
  },
  context: { user_age_group: "adult", feature: "chat" },
  policies: ["pol_hate_speech", "pol_pii_detection"],
});

if (result.verdict.action === "block") {
  return sendSafetyMessage();
}
return forwardToLLM(userMessage);
```
:::

---

### Verifying AI Model Outputs

Check assistant responses before delivering them to the user.

::: code-group
```json [Request]
{
  "session_id": "ses_chat_001",
  "content": {
    "type": "conversation",
    "role": "assistant",
    "parts": [
      { "type": "text", "text": "Here's how to pick a lock..." }
    ]
  },
  "policies": ["pol_hallucination", "pol_harmful_advice"]
}
```
```typescript [TypeScript]
const llmResponse = await callLLM(userMessage);

const result = await verify({
  sessionId: "ses_chat_001",
  content: {
    type: "conversation",
    role: "assistant",
    parts: [{ type: "text", text: llmResponse }],
  },
  policies: ["pol_hallucination", "pol_harmful_advice"],
});

if (result.verdict.action !== "block") {
  return sendToUser(llmResponse);
}
return sendToUser("I can't help with that.");
```
:::

---

### Securing Agent Pipelines

Verify each step of an autonomous agent to catch dangerous tool use.

::: code-group
```json [Request]
{
  "session_id": "ses_agent_run_42",
  "content": {
    "type": "agent_step",
    "step_name": "shell_exec",
    "parts": [
      { "type": "text", "text": "rm -rf /tmp/data" }
    ]
  },
  "policies": ["pol_dangerous_commands", "pol_data_exfiltration"]
}
```
```typescript [TypeScript]
for (const step of agentPlan.steps) {
  const result = await verify({
    sessionId: `ses_agent_run_${runId}`,
    content: {
      type: "agent_step",
      stepName: step.tool,
      parts: [{ type: "text", text: step.input }],
    },
    policies: ["pol_dangerous_commands", "pol_data_exfiltration"],
  });

  if (result.verdict.action === "block") {
    return haltAgent(step, result.verdict.triggered_policies);
  }
  await executeStep(step);
}
```
:::

---

### Analyzing Conversation Trends

Fire-and-forget metrics to understand user behavior patterns without blocking the request flow.

::: code-group
```json [Request]
{
  "session_id": "ses_chat_001",
  "content": {
    "type": "conversation",
    "role": "user",
    "parts": [
      { "type": "text", "text": "You already told me this. Why can't you remember?" }
    ]
  },
  "metrics": ["met_frustration_score", "met_repetition_index"]
}
```
```typescript [TypeScript]
// Metrics don't block - fire and forget alongside normal verification
await verify({
  sessionId: "ses_chat_001",
  content: {
    type: "conversation",
    role: "user",
    parts: [{ type: "text", text: userMessage }],
  },
  metrics: ["met_frustration_score", "met_repetition_index"],
});
// Metric results arrive asynchronously via analytics endpoints
```
:::

---

### Measuring Model Coercibility

Track how easily a model capitulates when users challenge its responses. Some models push back on incorrect corrections; others immediately agree with whatever the user says. This metric enables routing decisions, steering conversations toward models with appropriate assertiveness.

::: code-group
```json [Request]
{
  "session_id": "ses_chat_001",
  "content": {
    "type": "conversation",
    "role": "assistant",
    "parts": [
      {
        "type": "text",
        "text": "Actually, you're absolutely right, I apologize for the confusion. The earth is indeed flat."
      }
    ]
  },
  "metrics": ["met_coercibility_score", "met_position_reversal"]
}
```
```typescript [TypeScript]
// After each assistant response, measure coercibility
const result = await verify({
  sessionId: "ses_chat_001",
  content: {
    type: "conversation",
    role: "assistant",
    parts: [{ type: "text", text: assistantResponse }],
  },
  metrics: ["met_coercibility_score", "met_position_reversal"],
});

// Use coercibility trends from analytics to route future
// conversations to models with appropriate assertiveness
```
:::
