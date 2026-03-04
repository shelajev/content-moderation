---
title: Errors
---

# Error Responses

All errors follow a consistent structure with actionable guidance:

```json
{
  "error": {
    "code": "<machine_readable_code>",
    "message": "<human_readable_description>",
    "suggestion": "<what_to_do_about_it>"
  }
}
```

---

## Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 401 | `unauthorized` | Missing or invalid API key |
| 400 | `invalid_content_type` | Unrecognized `content.type` value |
| 400 | `policy_not_found` | One or more policy IDs are invalid |
| 400 | `metric_not_found` | One or more metric IDs are invalid |
| 400 | `invalid_context` | Context contains invalid keys or values |
| 404 | `session_not_found` | Session ID does not exist |
| 410 | `session_expired` | Session has exceeded its TTL |
| 429 | `rate_limit_exceeded` | Too many requests |

---

## Detailed Examples

### `unauthorized` -401

Missing or invalid API key.

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Missing or invalid API key",
    "suggestion": "Check your Authorization header and key prefix"
  }
}
```

**Common causes:**
- Missing `Authorization` header entirely
- Using `cv_test_` key against the production environment
- Key has been revoked or expired

**Fix:** Verify your API key is set correctly:
```bash
export API_KEY="cv_live_abc123"
```

---

### `invalid_content_type` -400

Unrecognized value in `content.type`.

```json
{
  "error": {
    "code": "invalid_content_type",
    "message": "Unrecognized content type: 'chat'",
    "suggestion": "Use one of: conversation, document, code, agent_step"
  }
}
```

**Fix:** Use one of the four supported content types:
- `conversation` -chat messages
- `document` -structured text
- `code` -source code
- `agent_step` -agent tool calls

---

### `policy_not_found` -400

One or more policy IDs don't exist or aren't available for your project.

```json
{
  "error": {
    "code": "policy_not_found",
    "message": "Policy 'pol_nonexistent' not found",
    "suggestion": "Check policy IDs in your project dashboard"
  }
}
```

**Fix:** Verify policy IDs in your project dashboard. Policy IDs follow the format `pol_<name>`.

---

### `metric_not_found` -400

One or more metric IDs don't exist or aren't available for your project.

```json
{
  "error": {
    "code": "metric_not_found",
    "message": "Metric 'met_nonexistent' not found",
    "suggestion": "Check metric IDs in your project dashboard"
  }
}
```

**Fix:** Verify metric IDs in your project dashboard. Metric IDs follow the format `met_<name>`.

---

### `invalid_context` -400

Context object contains invalid keys or value types.

```json
{
  "error": {
    "code": "invalid_context",
    "message": "Context value for key 'metadata' must be a string, number, or boolean",
    "suggestion": "Ensure context values are strings, numbers, or booleans"
  }
}
```

**Fix:** Context values must be primitives -strings, numbers, or booleans. Objects and arrays are not supported:

```json
// Bad
{ "context": { "tags": ["admin", "internal"] } }

// Good
{ "context": { "role": "admin", "is_internal": true } }
```

---

### `session_not_found` -404

The provided `session_id` doesn't match any existing session.

```json
{
  "error": {
    "code": "session_not_found",
    "message": "Session ses_abc123 does not exist",
    "suggestion": "Create a new session by omitting session_id"
  }
}
```

**Common causes:**
- Typo in the session ID
- Session was created in a different environment (test vs. production)

**Fix:** Omit `session_id` to create a new session, or verify the ID from a previous response.

---

### `session_expired` -410

The session has exceeded its configured TTL.

```json
{
  "error": {
    "code": "session_expired",
    "message": "Session ses_abc123 has exceeded its TTL",
    "suggestion": "Create a new session and re-establish context and policies"
  }
}
```

**Fix:** Create a new session by omitting `session_id`. You'll need to re-send any relevant `context` and `policies` since the previous session state is no longer available.

---

### `rate_limit_exceeded` -429

Too many requests from your API key.

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded",
    "suggestion": "Retry after the duration in the Retry-After header"
  }
}
```

The response includes a `Retry-After` header with the number of seconds to wait:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

**Fix:** Implement exponential backoff or respect the `Retry-After` header value.
