# Content Verification API

API design for a session-aware content verification and moderation endpoint. A single `POST /v1/verify` endpoint that evaluates content against policies, collects async metrics, and maintains conversation context across messages.

**Documentation site:** https://shelajev.github.io/content-moderation/

## Key sections

- [Use Cases](https://shelajev.github.io/content-moderation/use-cases) - Moderating chat, verifying AI outputs, securing agent pipelines, measuring model coercibility
- [Request Schema](https://shelajev.github.io/content-moderation/request) / [Response Schema](https://shelajev.github.io/content-moderation/response) - Full request/response types with field tables and examples
- [Policies & Metrics](https://shelajev.github.io/content-moderation/policies-and-metrics) - How policies are referenced, accumulation behavior, sync vs async evaluation
- [Context](https://shelajev.github.io/content-moderation/context) - How context is passed, merged across messages, and used by policies
- [Design Decisions](https://shelajev.github.io/content-moderation/design-decisions) - Rationale behind the 8 key architectural choices

## Running locally

```bash
npm install
npm run docs:dev
```

Opens at http://localhost:5173/content-moderation/
