/**
 * Empirical Stress Test Harness: Rapid Tab Bursting & History Popstate Stress
 * Executed by Challenger 1 (Latency & Rapid Tab Bursting Challenger)
 * 
 * Verifies:
 * 1. Rapid Sequential Tab Bursting (120 full cycles = 840 sequential transitions across all 7 tabs)
 * 2. High-Resolution Latency Profiling (Min, Mean, Max, p50, p90, p95, p99, < 100ms budget)
 * 3. Rapid Randomized Chaos Bursting (300 rapid unpredictable switches)
 * 4. History Stack Popstate Back/Forward Stress (50 full cycles = 500 popstate navigations)
 * 5. URL & State Synchronization on Every Step
 * 6. Zero Auth-Spinner Mounts / UI Flickers Under Load
 * 7. Memory Leak & Heap Growth Auditing
 * 8. Cache Concurrency & Invalidation Stress (2,000 cycles)
 */

import { performance } from "node:perf_hooks";
import assert from "node:assert/strict";
import path from "node:path";
import { BrowserEnvironment } from "../e2e/harness/dom-shim.mjs";
import { AdminDashboardModel, TAB_ROUTE_MAP, ROUTE_TAB_MAP } from "../e2e/harness/admin-controller.mjs";
import { getAdminCache, setAdminCache, invalidateAdminCache } from "../../src/lib/adminCache.js";

const ALL_TABS = ["dashboard", "brands", "investors", "blogs", "services", "ads", "logs"];

function calculatePercentiles(latencies) {
  const sorted = [...latencies].sort((a, b) => a - b);
  const n = sorted.length;
  const p = (pct) => sorted[Math.min(Math.floor(n * (pct / 100)), n - 1)];
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    count: n,
    min: sorted[0],
    max: sorted[n - 1],
    mean: parseFloat(mean.toFixed(4)),
    median: parseFloat(p(50).toFixed(4)),
    p90: parseFloat(p(90).toFixed(4)),
    p95: parseFloat(p(95).toFixed(4)),
    p99: parseFloat(p(99).toFixed(4)),
    stdDev: parseFloat(stdDev.toFixed(4))
  };
}

async function runEmpiricalStressBattery() {
  console.log("===============================================================================");
  console.log("⚡ CHALLENGER 1: EMPIRICAL STRESS TEST HARNESS (BURST & POPSTATE)");
  console.log("===============================================================================\n");

  const results = {
    rapidBurst: null,
    chaosBurst: null,
    popstateStress: null,
    cacheStress: null,
    heapProfile: null,
    verdict: "PENDING",
    failures: []
  };

  const initialHeap = process.memoryUsage().heapUsed;

  // --------------------------------------------------------------------------
  // TEST 1: Rapid Sequential Tab Bursting (120 Cycles = 840 Tab Transitions)
  // --------------------------------------------------------------------------
  console.log("▶ [Test 1] Executing Rapid Sequential Tab Bursting (120 cycles across 7 tabs)...");
  {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dash = new AdminDashboardModel(env);
    const CYCLES = 120;
    const latencies = [];
    let desyncCount = 0;
    let spinnerFlashes = 0;

    const tBurstStart = performance.now();

    for (let cycle = 0; cycle < CYCLES; cycle++) {
      for (const tab of ALL_TABS) {
        const t0 = performance.now();
        dash.handleTabChange(tab);
        const t1 = performance.now();
        const latency = t1 - t0;
        latencies.push(latency);

        const expectedRoute = TAB_ROUTE_MAP[tab];
        if (dash.activeTab !== tab || env.location.pathname !== expectedRoute) {
          desyncCount++;
        }
      }
    }

    const tBurstTotal = performance.now() - tBurstStart;
    spinnerFlashes = env.spinnerMountCount;

    const stats = calculatePercentiles(latencies);
    const violations = latencies.filter(l => l >= 100.0).length;

    results.rapidBurst = {
      cycles: CYCLES,
      totalTransitions: latencies.length,
      totalDurationMs: parseFloat(tBurstTotal.toFixed(2)),
      stats,
      violations,
      desyncCount,
      spinnerFlashes,
      passed: violations === 0 && desyncCount === 0 && spinnerFlashes === 0
    };

    console.log(`  - Completed ${latencies.length} transitions in ${tBurstTotal.toFixed(2)}ms`);
    console.log(`  - Latencies: Min=${stats.min.toFixed(4)}ms, Mean=${stats.mean.toFixed(4)}ms, Median=${stats.median.toFixed(4)}ms, Max=${stats.max.toFixed(4)}ms`);
    console.log(`  - Percentiles: p90=${stats.p90.toFixed(4)}ms, p95=${stats.p95.toFixed(4)}ms, p99=${stats.p99.toFixed(4)}ms`);
    console.log(`  - Budget Violations (>= 100ms): ${violations}`);
    console.log(`  - State / URL Desyncs: ${desyncCount}`);
    console.log(`  - Auth Spinner Mounts: ${spinnerFlashes}`);

    if (!results.rapidBurst.passed) {
      results.failures.push("Rapid Sequential Burst failed latency budget or synchronization");
    }

    dash.destroy();
  }

  // --------------------------------------------------------------------------
  // TEST 2: High-Frequency Randomized Chaos Bursting (300 Rapid Switches)
  // --------------------------------------------------------------------------
  console.log("\n▶ [Test 2] Executing High-Frequency Chaos Bursting (300 unpredictable switches)...");
  {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dash = new AdminDashboardModel(env);
    const CHAOS_SWITCHES = 300;
    const latencies = [];
    let desyncCount = 0;

    // Deterministic pseudo-random sequence for repeatability
    let seed = 123456789;
    const pseudoRand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    for (let i = 0; i < CHAOS_SWITCHES; i++) {
      const targetTab = ALL_TABS[Math.floor(pseudoRand() * ALL_TABS.length)];
      const t0 = performance.now();
      dash.handleTabChange(targetTab);
      const t1 = performance.now();
      latencies.push(t1 - t0);

      const expectedRoute = TAB_ROUTE_MAP[targetTab];
      if (dash.activeTab !== targetTab || env.location.pathname !== expectedRoute) {
        desyncCount++;
      }
    }

    const stats = calculatePercentiles(latencies);
    const violations = latencies.filter(l => l >= 100.0).length;

    results.chaosBurst = {
      switches: CHAOS_SWITCHES,
      stats,
      violations,
      desyncCount,
      spinnerFlashes: env.spinnerMountCount,
      passed: violations === 0 && desyncCount === 0 && env.spinnerMountCount === 0
    };

    console.log(`  - Completed ${CHAOS_SWITCHES} chaos switches`);
    console.log(`  - Latencies: Mean=${stats.mean.toFixed(4)}ms, Max=${stats.max.toFixed(4)}ms, p99=${stats.p99.toFixed(4)}ms`);
    console.log(`  - Budget Violations: ${violations}, Desyncs: ${desyncCount}`);

    if (!results.chaosBurst.passed) {
      results.failures.push("Chaos Bursting encountered desync or latency violation");
    }

    dash.destroy();
  }

  // --------------------------------------------------------------------------
  // TEST 3: Browser History Popstate Stress (50 Full Back/Forward Cycles)
  // --------------------------------------------------------------------------
  console.log("\n▶ [Test 3] Executing History Stack Popstate Stress (50 cycles Back/Forward)...");
  {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dash = new AdminDashboardModel(env);

    // Build initial history trajectory: 10 hops
    const trajectory = [
      "brands", "investors", "blogs", "services", "ads",
      "logs", "brands", "services", "dashboard", "investors"
    ];

    for (const t of trajectory) {
      dash.handleTabChange(t);
    }

    assert.strictEqual(env.history.length, 11, "History stack depth should be 11 (root + 10 hops)");
    assert.strictEqual(dash.activeTab, "investors");

    const POPSTATE_CYCLES = 50;
    const popstateLatencies = [];
    let popstateDesyncs = 0;

    // In each cycle: navigate 5 steps back, then 5 steps forward
    for (let c = 0; c < POPSTATE_CYCLES; c++) {
      // 5 Steps Back
      for (let step = 0; step < 5; step++) {
        const expectedIndex = env.history._index - 1;
        const targetEntry = env.history._stack[expectedIndex];
        const targetRoute = new URL(targetEntry.url).pathname;
        const expectedTab = ROUTE_TAB_MAP[targetRoute] || "dashboard";

        const t0 = performance.now();
        env.history.back();
        const t1 = performance.now();
        popstateLatencies.push(t1 - t0);

        if (dash.activeTab !== expectedTab || env.location.pathname !== targetRoute) {
          popstateDesyncs++;
        }
      }

      // 5 Steps Forward
      for (let step = 0; step < 5; step++) {
        const expectedIndex = env.history._index + 1;
        const targetEntry = env.history._stack[expectedIndex];
        const targetRoute = new URL(targetEntry.url).pathname;
        const expectedTab = ROUTE_TAB_MAP[targetRoute] || "dashboard";

        const t0 = performance.now();
        env.history.forward();
        const t1 = performance.now();
        popstateLatencies.push(t1 - t0);

        if (dash.activeTab !== expectedTab || env.location.pathname !== targetRoute) {
          popstateDesyncs++;
        }
      }
    }

    const stats = calculatePercentiles(popstateLatencies);
    const violations = popstateLatencies.filter(l => l >= 100.0).length;

    results.popstateStress = {
      cycles: POPSTATE_CYCLES,
      totalPopstateEvents: popstateLatencies.length,
      stats,
      violations,
      desyncCount: popstateDesyncs,
      passed: violations === 0 && popstateDesyncs === 0
    };

    console.log(`  - Executed ${popstateLatencies.length} popstate navigation events (50 cycles)`);
    console.log(`  - Latencies: Min=${stats.min.toFixed(4)}ms, Mean=${stats.mean.toFixed(4)}ms, Max=${stats.max.toFixed(4)}ms, p99=${stats.p99.toFixed(4)}ms`);
    console.log(`  - Popstate Desynchronization Count: ${popstateDesyncs}`);
    console.log(`  - Popstate Latency Violations (>= 100ms): ${violations}`);

    if (!results.popstateStress.passed) {
      results.failures.push("Popstate Stress encountered state desync or latency violation");
    }

    dash.destroy();
  }

  // --------------------------------------------------------------------------
  // TEST 4: Zero-Dependency adminCache Concurrency & Scale (2,000 Operations)
  // --------------------------------------------------------------------------
  console.log("\n▶ [Test 4] Stress-testing adminCache Concurrency & Pattern Invalidation (2,000 ops)...");
  {
    invalidateAdminCache(); // Clean state
    const CACHE_OPS = 2000;
    const cacheLatencies = [];
    let cacheFailures = 0;

    const tCacheStart = performance.now();

    for (let i = 0; i < CACHE_OPS; i++) {
      const key = `test_key_${i % 50}`;
      const payload = { iteration: i, payload: "x".repeat(128) };

      const t0 = performance.now();
      setAdminCache(key, payload, 60000);
      const readBack = getAdminCache(key);
      const t1 = performance.now();

      cacheLatencies.push(t1 - t0);

      if (!readBack || readBack.iteration !== i) {
        cacheFailures++;
      }

      // Pattern invalidation stress every 100 ops
      if (i > 0 && i % 100 === 0) {
        invalidateAdminCache("test_key_1");
        if (getAdminCache("test_key_1") !== null) {
          cacheFailures++;
        }
      }
    }

    const tCacheTotal = performance.now() - tCacheStart;
    const stats = calculatePercentiles(cacheLatencies);

    results.cacheStress = {
      operations: CACHE_OPS,
      totalDurationMs: parseFloat(tCacheTotal.toFixed(2)),
      stats,
      cacheFailures,
      passed: cacheFailures === 0
    };

    console.log(`  - Executed ${CACHE_OPS} cache operations in ${tCacheTotal.toFixed(2)}ms`);
    console.log(`  - Operation Latency: Mean=${stats.mean.toFixed(4)}ms, Max=${stats.max.toFixed(4)}ms`);
    console.log(`  - Cache Integrity Failures: ${cacheFailures}`);

    if (!results.cacheStress.passed) {
      results.failures.push("adminCache stress testing detected data corruption or invalidation failure");
    }

    invalidateAdminCache(); // Clean up
  }

  // --------------------------------------------------------------------------
  // TEST 5: Heap Growth & Memory Leak Audit
  // --------------------------------------------------------------------------
  console.log("\n▶ [Test 5] Auditing Heap Growth & Memory Leak Profile...");
  {
    if (global.gc) global.gc();
    const finalHeap = process.memoryUsage().heapUsed;
    const heapDeltaMb = (finalHeap - initialHeap) / (1024 * 1024);

    results.heapProfile = {
      initialHeapMb: parseFloat((initialHeap / (1024 * 1024)).toFixed(2)),
      finalHeapMb: parseFloat((finalHeap / (1024 * 1024)).toFixed(2)),
      deltaMb: parseFloat(heapDeltaMb.toFixed(2)),
      leakSuspected: heapDeltaMb > 50.0 // > 50MB growth without retention
    };

    console.log(`  - Initial Heap: ${results.heapProfile.initialHeapMb} MB`);
    console.log(`  - Final Heap:   ${results.heapProfile.finalHeapMb} MB`);
    console.log(`  - Delta:        ${results.heapProfile.deltaMb} MB`);
    console.log(`  - Leak Detected: ${results.heapProfile.leakSuspected ? "YES (WARNING)" : "NO (STABLE)"}`);

    if (results.heapProfile.leakSuspected) {
      results.failures.push("Excessive heap growth detected across stress cycles");
    }
  }

  // --------------------------------------------------------------------------
  // VERDICT DETERMINATION
  // --------------------------------------------------------------------------
  const allTestsPassed =
    results.rapidBurst.passed &&
    results.chaosBurst.passed &&
    results.popstateStress.passed &&
    results.cacheStress.passed &&
    !results.heapProfile.leakSuspected;

  results.verdict = allTestsPassed ? "APPROVE" : "REQUEST_CHANGES";

  console.log("\n===============================================================================");
  console.log(`🏁 FINAL VERDICT: ${results.verdict}`);
  console.log("===============================================================================");
  if (results.failures.length > 0) {
    console.error("Identified Failures:");
    for (const f of results.failures) console.error(`  - ❌ ${f}`);
  } else {
    console.log("✅ All stress tests satisfied quantitative latency budgets and zero-desync contracts.");
  }

  return results;
}

runEmpiricalStressBattery()
  .then((res) => {
    if (res.verdict !== "APPROVE") process.exit(1);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal stress test exception:", err);
    process.exit(1);
  });
