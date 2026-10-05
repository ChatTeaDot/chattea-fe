import { spawn } from "node:child_process";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import lighthouse from "lighthouse";

const APP_ROOT = path.resolve(import.meta.dirname, "..");
const REPORT_DIR = path.join(APP_ROOT, ".lighthouse");
const URL_ = process.env.LIGHTHOUSE_URL ?? "http://localhost:3000/community";

const isUp = async () => {
  try {
    const res = await fetch(URL_, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
};

const waitForServer = async (attempts = 120) => {
  for (let i = 0; i < attempts; i += 1) {
    if (await isUp()) return true;
    await delay(500);
  }
  return false;
};

const playwrightCacheDirs = () => {
  const home = os.homedir();
  return [path.join(home, "Library/Caches/ms-playwright"), path.join(home, ".cache/ms-playwright")];
};

const findCachedChromium = async () => {
  for (const cacheDir of playwrightCacheDirs()) {
    let entries;
    try {
      entries = await readdir(cacheDir);
    } catch {
      continue;
    }
    const chromiumDirs = entries
      .filter((name) => /^chromium-\d+$/.test(name))
      .sort()
      .reverse();
    for (const dir of chromiumDirs) {
      const candidates = [
        path.join(
          cacheDir,
          dir,
          "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        ),
        path.join(
          cacheDir,
          dir,
          "chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        ),
        path.join(cacheDir, dir, "chrome-mac/Chromium.app/Contents/MacOS/Chromium"),
        path.join(cacheDir, dir, "chrome-linux/chrome"),
        path.join(cacheDir, dir, "chrome-linux64/chrome"),
      ];
      for (const candidate of candidates) {
        try {
          await access(candidate);
          return candidate;
        } catch {
          // keep looking
        }
      }
    }
  }
  return null;
};

const launchChrome = async () => {
  const port = 9300 + Math.floor(Math.random() * 500);
  try {
    const { launch } = await import("chrome-launcher");
    const chrome = await launch({
      chromeFlags: ["--headless=new", "--disable-gpu", "--no-first-run"],
      port,
    });
    console.log("[lighthouse] using system Chrome via chrome-launcher");
    return { port: chrome.port, kill: async () => chrome.kill() };
  } catch {
    // no system Chrome — fall through to playwright-managed or cached chromium
  }

  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${port}`],
    });
    console.log("[lighthouse] using playwright chromium:", chromium.executablePath());
    return { port, kill: async () => browser.close() };
  } catch {
    // playwright browsers not installed for this version — try the shared cache directly
  }

  const executablePath = await findCachedChromium();
  if (!executablePath) {
    throw new Error(
      "No Chrome found. Install Chrome, or run `pnpm --filter chattea-web exec playwright install chromium`.",
    );
  }
  console.log("[lighthouse] using cached chromium:", executablePath);
  const proc = spawn(
    executablePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${port}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  return {
    port,
    kill: async () => {
      proc.kill("SIGTERM");
    },
  };
};

let server;
let chrome;

try {
  if (!(await isUp())) {
    console.log("[lighthouse] starting SSR dev server on :3000…");
    server = spawn("pnpm", ["dev"], {
      cwd: APP_ROOT,
      detached: process.platform !== "win32",
      env: process.env,
      stdio: ["ignore", "inherit", "inherit"],
    });
    if (!(await waitForServer())) {
      throw new Error(`dev server did not respond at ${URL_}`);
    }
  }

  chrome = await launchChrome();

  const result = await lighthouse(URL_, {
    port: chrome.port,
    output: ["json", "html"],
    logLevel: "info",
    formFactor: "mobile",
    screenEmulation: { mobile: true },
  });

  if (!result) throw new Error("lighthouse returned no result");

  const scores = Object.fromEntries(
    Object.entries(result.lhr.categories).map(([key, cat]) => [
      key,
      Math.round((cat.score ?? 0) * 100),
    ]),
  );
  console.log(`[lighthouse] ${result.lhr.finalDisplayedUrl}`);
  console.table(scores);

  const failingAudits = Object.values(result.lhr.audits).filter(
    (audit) =>
      audit.score !== null &&
      audit.score < 1 &&
      !["numeric", "notApplicable", "manual", "informative"].includes(audit.scoreDisplayMode),
  );
  for (const audit of failingAudits) {
    console.log(`- ${audit.id}: ${audit.title} (${audit.scoreDisplayMode})`);
  }

  await mkdir(REPORT_DIR, { recursive: true });
  const [jsonReport, htmlReport] = Array.isArray(result.report) ? result.report : [result.report];
  const stamp = result.lhr.fetchTime.replace(/[:.]/g, "-");
  await writeFile(path.join(REPORT_DIR, `lighthouse-${stamp}.json`), jsonReport);
  if (htmlReport) {
    await writeFile(path.join(REPORT_DIR, `lighthouse-${stamp}.html`), htmlReport);
  }
  console.log(`[lighthouse] reports written to ${path.relative(process.cwd(), REPORT_DIR)}`);
} finally {
  await chrome?.kill();
  if (server) {
    try {
      if (process.platform === "win32") {
        server.kill("SIGTERM");
      } else {
        process.kill(-server.pid, "SIGTERM");
      }
    } catch {
      server.kill("SIGTERM");
    }
  }
}
