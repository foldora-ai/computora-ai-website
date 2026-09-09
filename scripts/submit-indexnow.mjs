import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes("--dry-run");
const [siteArgument, key, sitemapPath] = rawArgs.filter(
  (argument) => argument !== "--dry-run",
);

if (!siteArgument || !key || !sitemapPath) {
  throw new Error(
    "Usage: node scripts/submit-indexnow.mjs <site-url> <key> <sitemap-path> [--dry-run]",
  );
}

if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  throw new Error(
    "The IndexNow key must be 8-128 letters, numbers, or dashes.",
  );
}

const site = new URL(siteArgument);
if (site.protocol !== "https:") {
  throw new Error("The site URL must use HTTPS.");
}

const sitemapXml = await readFile(sitemapPath, "utf8");
const keyPath = resolve(dirname(sitemapPath), `${key}.txt`);
const localKey = (await readFile(keyPath, "utf8")).trim();
if (localKey !== key) {
  throw new Error(`The IndexNow key file does not match: ${keyPath}`);
}

const decodeXml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");

const sitemapUrl = new URL("/sitemap.xml", site).href;
const discoveredUrls = [
  ...sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/giu),
].map(([, value]) => decodeXml(value.trim()));
const urlList = [...new Set([sitemapUrl, ...discoveredUrls])];

for (const value of urlList) {
  const url = new URL(value);
  if (url.origin !== site.origin) {
    throw new Error(`Sitemap URL does not belong to ${site.origin}: ${value}`);
  }
}

if (urlList.length > 10_000) {
  throw new Error("IndexNow accepts at most 10,000 URLs per request.");
}

const keyLocation = new URL(`/${key}.txt`, site).href;
const payload = {
  host: site.hostname,
  key,
  keyLocation,
  urlList,
};

if (dryRun) {
  console.log(`Validated ${urlList.length} URLs for ${site.hostname}.`);
  process.exit(0);
}

const wait = (milliseconds) =>
  new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

let keyIsLive = false;
for (let attempt = 1; attempt <= 30; attempt += 1) {
  try {
    const response = await fetch(keyLocation, { cache: "no-store" });
    if (response.ok && (await response.text()).trim() === key) {
      keyIsLive = true;
      break;
    }
  } catch {
    // A fresh Pages deployment can briefly be unavailable. Retry below.
  }

  if (attempt < 30) {
    await wait(10_000);
  }
}

if (!keyIsLive) {
  throw new Error(`IndexNow key was not available at ${keyLocation}.`);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  throw new Error(`IndexNow returned HTTP ${response.status}: ${body}`);
}

console.log(
  `IndexNow accepted ${urlList.length} URLs for ${site.hostname} (HTTP ${response.status}).`,
);
