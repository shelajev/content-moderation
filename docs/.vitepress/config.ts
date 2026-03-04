import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Content Verification API',
  description: 'Session-aware content verification and moderation API',
  base: '/content-moderation/',

  themeConfig: {
    nav: [
      { text: 'API Docs', link: '/' },
    ],

    sidebar: [
      {
        text: 'API Documentation',
        items: [
          {
            text: 'Overview',
            link: '/',
            collapsed: true,
            items: [
              { text: 'Quick Start', link: '/#quick-start' },
              { text: 'Authentication', link: '/#authentication' },
            ],
          },
          {
            text: 'Use Cases',
            link: '/use-cases',
            collapsed: true,
            items: [
              { text: 'Moderating User Chat', link: '/use-cases#moderating-user-chat' },
              { text: 'Verifying AI Outputs', link: '/use-cases#verifying-ai-model-outputs' },
              { text: 'Securing Agents', link: '/use-cases#securing-agent-pipelines' },
              { text: 'Conversation Trends', link: '/use-cases#analyzing-conversation-trends' },
              { text: 'Model Coercibility', link: '/use-cases#measuring-model-coercibility' },
            ],
          },
        ],
      },
      {
        text: 'Reference',
        items: [
          {
            text: 'Request Schema',
            link: '/request',
            collapsed: true,
            items: [
              { text: 'Fields', link: '/request#fields' },
              { text: 'Content Types', link: '/request#content-types' },
            ],
          },
          {
            text: 'Response Schema',
            link: '/response',
            collapsed: true,
            items: [
              { text: 'Verdict', link: '/response#verdict' },
              { text: 'Policy Result', link: '/response#policy-result' },
              { text: 'Metrics Acknowledgment', link: '/response#metrics-acknowledgment' },
              { text: 'Session Echo', link: '/response#session-echo' },
            ],
          },
          {
            text: 'Content Types',
            link: '/content-types',
            collapsed: true,
            items: [
              { text: 'Conversation', link: '/content-types#conversation' },
              { text: 'Document', link: '/content-types#document' },
              { text: 'Code', link: '/content-types#code' },
              { text: 'Agent Step', link: '/content-types#agent-step' },
              { text: 'Part Types', link: '/content-types#part-types' },
            ],
          },
          {
            text: 'Errors',
            link: '/errors',
          },
        ],
      },
      {
        text: 'Concepts',
        items: [
          {
            text: 'Policies & Metrics',
            link: '/policies-and-metrics',
            collapsed: true,
            items: [
              { text: 'Policy Layers', link: '/policies-and-metrics#policy-evaluation-layers' },
              { text: 'Policy Results', link: '/policies-and-metrics#policy-results' },
              { text: 'Referencing Metrics', link: '/policies-and-metrics#referencing-metrics' },
            ],
          },
          {
            text: 'Context',
            link: '/context',
            collapsed: true,
            items: [
              { text: 'How Context Merges', link: '/context#how-context-merges' },
              { text: 'How Policies Use Context', link: '/context#how-policies-use-context' },
            ],
          },
          {
            text: 'Sessions',
            link: '/sessions',
            collapsed: true,
            items: [
              { text: 'Creating a Session', link: '/sessions#creating-a-session' },
              { text: 'Continuing a Session', link: '/sessions#continuing-a-session' },
              { text: 'Session Expiration', link: '/sessions#session-expiration' },
            ],
          },
          { text: 'Examples', link: '/progressive-disclosure' },
          { text: 'Design Decisions', link: '/design-decisions' },
        ],
      },
    ],

    outline: false,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/' },
    ],
  },
})
