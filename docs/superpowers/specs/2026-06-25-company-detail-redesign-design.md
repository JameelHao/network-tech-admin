# Company Detail Page Redesign

## Goal
Replace the current stacked-list company detail page with a dual-pane layout: timeline (left) + AI insights sidebar (right).

## Layout

```
┌───────────────────────────────────────┬──────────────────┐
│  时间流 (flex-1)                       │  侧边栏 (w-80)    │
│                                       │                  │
│  YYYY-MM 月标题 (sticky)               │  AI 分析          │
│  ┌─────────────────────────────────┐  │  ┌──────────────┐ │
│  │ 📄 论文标题                      │  │  │ 优势亮点       │ │
│  │    venue · 6月15日 · 3 引用      │  │  │ • strength 1  │ │
│  ├─────────────────────────────────┤  │  │ • strength 2  │ │
│  │ 📰 新闻标题                      │  │  │              │ │
│  │    source · 6月14日              │  │  │ 关注领域       │ │
│  ├─────────────────────────────────┤  │  │ • focus 1     │ │
│  │ ⭐ repo name                    │  │  │ • focus 2     │ │
│  │    ★ 1234 · Python · 6月10日    │  │  └──────────────┘ │
│  └─────────────────────────────────┘  │                  │
│                                       │  统计概览         │
│  [Load More 按钮]                     │  ┌──────────────┐ │
│                                       │  │ ■ 18 repos    │ │
│                                       │  │ ■ 145 papers  │ │
│                                       │  │ ■ 89 news     │ │
│                                       │  │ ■ 6 products  │ │
│                                       │  └──────────────┘ │
│                                       │                  │
│                                       │  热门主题 Top 10  │
│                                       │  (带数量标签)      │
│                                       │                  │
│                                       │  [主题趋势图]      │
└───────────────────────────────────────┴──────────────────┘
```

## Data Flow

### API: GET /api/companies/[slug]/timeline
- Accepts: `slug`, `page` (default 1), `pageSize` (default 10)
- Fetches from 4 tables in parallel, each limited to `page * pageSize` rows:
  - `papers` WHERE companies CONTAINS [slug]
  - `news_items` WHERE companies CONTAINS [slug]
  - `github_repos` WHERE company_slug = slug
  - `products` WHERE vendor = company_name
- Normalizes to `TimelineEvent[]`, sorts by `date` DESC
- Slices to `pageSize` for current page
- Returns `{ events: TimelineEvent[], total: number }`

### TimelineEvent type
```ts
type EventType = "paper" | "news" | "repo" | "product";
type TimelineEvent = {
  type: EventType;
  id: string;
  date: string;   // YYYY-MM-DD
  title: string;
  href: string;
  meta: Record<string, any>; // type-specific metadata
};
```

### AI Insights Sidebar
- Query `vendors` table: `name = COMPANY_NAMES[slug]`
- Extract `ai_insights` JSON: strengths[], focus_areas[], positioning
- Stats: counts for repos, papers, news, products
- Popular topics: aggregate from papers + news, sorted by count, top 10

## Components

### `CompanyTimeline` (client component)
- Props: `initialEvents`, `total`, `slug`, `lang`
- State: `events[]`, `page`, `loading`, `hasMore`
- Renders events in month groups, "Load More" button fetches next page via API
- Events show appropriate icon + formatted meta per type:

| Type | Icon | Meta |
|------|------|------|
| paper | 📄 | venue · date · citation_count |
| news | 📰 | source · date |
| repo | ⭐ | full_name · stars · language · date |
| product | 📦 | product_name · stage · pricing · date |

### `CompanyDetailPage` (server component, updated)
- Fetches: first page of timeline events, vendor AI insights, topic stats
- Renders: Topbar → dual-pane layout
- Left pane: `CompanyTimeline` with initial data
- Right pane: sidebar with AI insights, stats, popular topics, trend chart

## Implementation Order
1. Create API route `/api/companies/[slug]/timeline`
2. Build `CompanyTimeline` client component
3. Rewrite `[slug]/page.tsx`
4. Remove unused imports (CompanyHeatmap, CompanyTrendChart if not needed)

## Files Changed
- NEW: `src/app/api/companies/[slug]/timeline/route.ts`
- NEW: `src/components/admin/CompanyTimeline.tsx`
- MODIFY: `src/app/admin/companies/[slug]/page.tsx`
