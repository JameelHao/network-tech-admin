#!/usr/bin/env node

import { syncAllPapers, syncArxivPapers, syncS2Papers, syncCompanyPapers } from "./sync/paper-import.js";
import { syncAllFeeds } from "./sync/feeds.js";
import { syncGitHubRepos } from "./sync/github.js";
import { syncRFCs } from "./sync/rfcs.js";

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
      case "all": {
        const year = parseInt(process.env.SYNC_YEAR ?? String(new Date().getFullYear()), 10);
        const results = await Promise.allSettled([
          syncAllPapers(year).then((s) => ({ task: "papers", stats: s })),
          syncAllFeeds().then((s) => ({ task: "feeds", stats: s })),
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
        console.log(`Tasks: papers, arxiv, s2, company-papers, feeds, github, rfcs, all`);
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
