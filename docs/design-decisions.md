---
title: Design Decisions
---

# Design Decisions

The rationale behind the key architectural decisions in the Content Verification API.

---

## 1. Single Endpoint with Implicit Session Creation

**Decision:** No `session_id` → new session. With `session_id` → continue existing.

**Why:** Satisfies the single-endpoint constraint while supporting the full session lifecycle. No need for separate `POST /sessions` or `DELETE /sessions` endpoints. Session expiration is handled server-side via TTL.

**Trade-off:** Slightly less explicit than separate create/continue endpoints, but dramatically simpler for integrators. The response always includes the `session_id`, so there's no ambiguity.

---

## 2. Delta Content Model

**Decision:** Clients send only the new message. The server stores and uses full history.

**Why:** This is the key differentiator from stateless APIs. It enables conversation-aware moderation (e.g., detecting escalation over 5 messages, or identifying that a user is probing around the same topic). It also reduces bandwidth -message 50 in a conversation is one message, not 50.

**Trade-off:** Requires server-side storage. We mitigate this with session TTL and bounded history. The payoff -context-aware evaluation -is the entire value proposition.

---

## 3. Typed Content with Parts Array

**Decision:** Content uses a `type` discriminator with type-specific fields and a `parts` array for payload.

**Why:** Different content types need different metadata (conversations have `role`, code has `language`, documents have `section`). The `parts` array is forward-compatible with multimodal content -when we add image or audio support, existing integrations don't break. V1 ships with `text` and `code` part types.

---

## 4. Policy Accumulation (Not Override)

**Decision:** `policies` array accumulates on the session. `ephemeral_policies` handles one-off checks.

**Why:** Accumulation matches real conversation dynamics -once you know a user is a minor, you don't forget it. It reduces repeat payload sizes and prevents gaps from client bugs. The `ephemeral_policies` escape hatch covers the edge case of one-off stricter checks.

**Alternative considered:** Override model (each request replaces session policies). Rejected because it pushes state management to the client and creates risk of accidental policy gaps.

---

## 5. Context as Additive Key-Value Store

**Decision:** Each call's `context` is merged into session context. New keys added, existing keys overwritten (last write wins). Keys never removed.

**Why:** Context represents facts about the session that influence evaluation. Facts accumulate -you learn the user is in the EU, then that they're on the free tier. The response's `session.context` provides full transparency into what the server knows.

---

## 6. Synchronous Policies, Asynchronous Metrics

**Decision:** Policy results are returned in the response body. Metrics are acknowledged immediately and processed asynchronously.

**Why:** Policies are enforcement -the caller needs the verdict *now* to decide whether to deliver the content. Metrics are analytics -they don't affect the request flow and may require expensive computation (e.g., frustration scoring across an entire session). Mixing sync and async in one endpoint cleanly separates concerns without requiring two endpoints.

---

## 7. Verdict as Aggregate with Per-Policy Detail

**Decision:** Both a top-level `verdict` (aggregate) and per-policy `results` (detail).

**Why:** Most callers just need the verdict (`block`/`flag`/`pass`) for their control flow. But when debugging or building custom UIs, per-policy breakdown with `confidence`, `reason`, and `evidence` is essential. This serves both the "just tell me what to do" and "explain why" use cases.

Action precedence: `block` > `flag` > `pass`. If any policy returns `block`, the verdict is `block`.

---

## 8. Session Echo in Response

**Decision:** Every response includes a `session` object showing accumulated policies, message index, and full context.

**Why:** Principle of least surprise. The caller always knows what the server "knows" -which policies are active, where they are in the conversation, and what context has been accumulated. This is invaluable for debugging and prevents invisible state drift.
