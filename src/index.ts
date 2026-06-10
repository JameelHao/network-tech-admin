#!/usr/bin/env node

import { syncAllPapers, syncArxivPapers, syncS2Papers, syncCompanyPapers } from "./sync/paper-import.js";
import { syncAllFeeds } from "./sync/feeds.js";
import { syncGitHubRepos } from "./sync/github.js";
import { syncRFCs } from "./sync/rfcs.js";
import { classifyPapers, classifyNews } from "./lib/ai-classify.js";
import { generateConfSummary, generateAllConfSummaries } from "./sync/conf-ai.js";
import { syncVendorIntelligence } from "./sync/vendor-intelligence.js";

const task = process.argv[2] ?? "all";

async function main() {
  const start = Date.now();
  console.log(`[sync-worker] Starting task: ${task} at ${new Date().toISOString()}`);

  try {
    switch (task) {
      case "papers": {
        const year = parseInt(process.env.SYNC_YEAR ?? String(new Date().getFullYear()), 10);
        const stats = await syncAllPapers(year);
        console.log(`[sync-worker] Papers sync complete:`, JSON.stringify(stats));
        const cr = await classifyPapers(30);
        console.log(`[sync-worker] AI classify: ${cr.updated}/${cr.processed}`);
        break;
      }
      case "arxiv": {
        const year = parseInt(process.env.SYNC_YEAR ?? String(new Date().getFullYear()), 10);
        const stats = await syncArxivPapers(year);
        console.log(`[sync-worker] arXiv sync complete:`, JSON.stringify(stats));
        break;
      }
      case "s2": {
        const year = parseInt(process.env.SYNC_YEAR ?? String(new Date().getFullYear()), 10);
        const stats = await syncS2Papers(year);
        console.log(`[sync-worker] S2 sync complete:`, JSON.stringify(stats));
        break;
      }
      case "company-papers": {
        const year = parseInt(process.env.SYNC_YEAR ?? String(new Date().getFullYear()), 10);
        const stats = await syncCompanyPapers(year);
        console.log(`[sync-worker] Company papers sync complete:`, JSON.stringify(stats));
        break;
      }
      case "feeds": {
        const stats = await syncAllFeeds();
        console.log(`[sync-worker] Feeds sync complete:`, JSON.stringify(stats));
        const nr = await classifyNews(30);
        console.log(`[sync-worker] AI classify news: ${nr.updated}/${nr.processed}`);
        break;
      }
      case "github": {
        const stats = await syncGitHubRepos();
        console.log(`[sync-worker] GitHub sync complete:`, JSON.stringify(stats));
        break;
      }
      case "rfcs": {
        const stats = await syncRFCs();
        console.log(`[sync-worker] RFC sync complete:`, JSON.stringify(stats));
        break;
      }
      case "classify": {
        const paperResult = await classifyPapers(30);
        console.log(`[sync-worker] Classified papers: ${paperResult.updated}/${paperResult.processed}`);
        const newsResult = await classifyNews(30);
        console.log(`[sync-worker] Classified news: ${newsResult.updated}/${newsResult.processed}`);
        break;
      }
      case "classify-papers": {
        const r = await classifyPapers(30);
        console.log(`[sync-worker] Classified papers: ${r.updated}/${r.processed}`);
        break;
      }
      case "classify-news": {
        const r = await classifyNews(30);
        console.log(`[sync-worker] Classified news: ${r.updated}/${r.processed}`);
        break;
      }
      case "conf-summaries": {
        const count = await generateAllConfSummaries();
        console.log(`[sync-worker] Generated ${count} conference summaries`);
        break;
      }
      case "conf-summary": {
        const id = process.argv[3];
        if (!id) { console.error("[sync-worker] Usage: conf-summary <conferenceId>"); process.exit(1); }
        await generateConfSummary(id);
        break;
      }
      case "vendor-intel": {
        const count = await syncVendorIntelligence();
        console.log(`[sync-worker] Updated ${count} vendor profiles`);
        break;
      }
      case "all": {
        const year = parseInt(process.env.SYNC_YEAR ?? String(new Date().getFullYear()), 10);
        const results = await Promise.allSettled([
          syncAllPapers(year).then(async (s) => {
            const c = await classifyPapers(30);
            return { task: "papers", stats: s, classified: c.updated };
          }),
          syncAllFeeds().then(async (s) => {
            const c = await classifyNews(30);
            return { task: "feeds", stats: s, classified: c.updated };
          }),
          syncGitHubRepos().then((s) => ({ task: "github", stats: s })),
          syncRFCs().then((s) => ({ task: "rfcs", stats: s })),
        ]);
        for (const r of results) {
          if (r.status === "fulfilled") {
            console.log(`[sync-worker] ${r.value.task}:`, JSON.stringify(r.value.stats));
          } else {
            console.error(`[sync-worker] ${r.reason}`);
          }
        }
        break;
      }
      default:
        console.error(`[sync-worker] Unknown task: ${task}`);
        console.log(`Usage: npx tsx src/index.ts <task>`);
        console.log(`Tasks: papers, arxiv, s2, company-papers, feeds, github, rfcs, classify, classify-papers, classify-news, conf-summary, conf-summaries, all`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`[sync-worker] Fatal error:`, err);
    process.exit(1);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[sync-worker] Finished in ${elapsed}s`);
}

main();
