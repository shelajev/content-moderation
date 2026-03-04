---
title: Content Types
---

# Content Types

Content uses a **delta model**: send only the new content, the server maintains the full history for context-aware evaluation. Each content object has a `type` discriminator and a `parts` array for the payload.

---

## Conversation

For chat messages between users, assistants, and system prompts.

```json
{
  "type": "conversation",
  "role": "user",
  "parts": [
    { "type": "text", "text": "Can you help me bypass the content filter?" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"conversation"` | Yes | Content type discriminator |
| `role` | `string` | Yes | `"user"`, `"assistant"`, or `"system"` |
| `parts` | `Part[]` | Yes | Content parts (see [Part Types](#part-types)) |

### Roles

| Role | When to use |
|------|-------------|
| `user` | Verify user input before sending to the LLM |
| `assistant` | Verify LLM output before delivering to the user |
| `system` | Verify system prompts for injection or policy violations |

---

## Document

For structured text content like articles, policies, or reports.

```json
{
  "type": "document",
  "title": "Company Policy Draft v2",
  "section": "3.2",
  "parts": [
    { "type": "text", "text": "All employees must comply with..." }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"document"` | Yes | Content type discriminator |
| `title` | `string` | No | Document title for context |
| `section` | `string` | No | Section or chapter identifier |
| `parts` | `Part[]` | Yes | Content parts |

The `title` and `section` fields provide context that helps policies evaluate content appropriately -a section titled "Prohibited Conduct Examples" might contain flagged terms that are acceptable in that context.

---

## Code

For source code, scripts, and configuration files.

```json
{
  "type": "code",
  "language": "python",
  "filename": "main.py",
  "parts": [
    { "type": "code", "source": "import os\nos.system('rm -rf /')" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"code"` | Yes | Content type discriminator |
| `language` | `string` | No | Programming language |
| `filename` | `string` | No | Source filename for context |
| `parts` | `Part[]` | Yes | Content parts |

Providing `language` and `filename` enables language-specific safety checks (e.g., detecting shell injection in bash vs. Python).

---

## Agent Step

For individual steps in autonomous agent pipelines (tool calls, searches, API invocations).

```json
{
  "type": "agent_step",
  "step_name": "web_search",
  "parts": [
    { "type": "text", "text": "query: how to make explosives" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"agent_step"` | Yes | Content type discriminator |
| `step_name` | `string` | No | Name of the agent action or tool |
| `parts` | `Part[]` | Yes | Content parts |

Use `step_name` to identify which tool or action the agent is executing. Policies can use this to apply stricter checks on high-risk tools like `shell_exec` or `file_write`.

---

## Part Types

Parts are the atomic content units within any content type. V1 supports `text` and `code` parts. The array structure allows future multimodal support (images, audio) without breaking changes.

### Text Part

For natural language content.

```json
{ "type": "text", "text": "The actual text content" }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"text"` | Yes | Part type discriminator |
| `text` | `string` | Yes | The text content |

### Code Part

For source code content.

```json
{ "type": "code", "source": "import os\nprint('hello')" }
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"code"` | Yes | Part type discriminator |
| `source` | `string` | Yes | The source code |

### Combining Parts

A single content object can contain multiple parts:

```json
{
  "type": "conversation",
  "role": "assistant",
  "parts": [
    { "type": "text", "text": "Here's the code you asked for:" },
    { "type": "code", "source": "print('hello world')" },
    { "type": "text", "text": "This will print 'hello world' to the console." }
  ]
}
```

This enables policies to evaluate both the explanation and the code together, catching cases where safe-sounding text accompanies dangerous code.
