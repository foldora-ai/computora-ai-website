import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://computoraai.com";
const DIST_DIR = path.resolve("dist");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function routeFile(url) {
  const route = url.replace(`${SITE_URL}/`, "").replace(/\/$/, "");
  return route
    ? path.join(DIST_DIR, ...route.split("/"), "index.html")
    : path.join(DIST_DIR, "index.html");
}

function attribute(html, pattern) {
  return html.match(pattern)?.[1]?.trim();
}

function visibleWordCount(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

const sitemap = read(path.join(DIST_DIR, "sitemap.xml"));
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);
const errors = [];
const inboundCounts = new Map(urls.map((url) => [url, 0]));

for (const url of urls) {
  const filePath = routeFile(url);
  const route = url.replace(SITE_URL, "") || "/";

  if (!fs.existsSync(filePath)) {
    errors.push(`${route}: missing generated index.html`);
    continue;
  }

  const html = read(filePath);
  const canonical = attribute(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  );
  const title = attribute(html, /<title[^>]*>([^<]+)<\/title>/i);
  const description = attribute(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
  );
  const robots = attribute(
    html,
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i,
  );
  const socialImage = attribute(
    html,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  );

  if (canonical !== url) errors.push(`${route}: canonical mismatch`);
  if (!title || title.length < 25 || title.length > 65) {
    errors.push(`${route}: title length is ${title?.length ?? 0}`);
  }
  if (!description || description.length < 70 || description.length > 165) {
    errors.push(`${route}: description length is ${description?.length ?? 0}`);
  }
  if (robots?.includes("noindex")) errors.push(`${route}: sitemap page is noindex`);
  if ((html.match(/<h1[\s>]/gi) ?? []).length !== 1) {
    errors.push(`${route}: expected exactly one H1`);
  }
  if (!/<script[^>]+application\/ld\+json/i.test(html)) {
    errors.push(`${route}: missing JSON-LD`);
  }
  if (visibleWordCount(html) < 80) errors.push(`${route}: thin visible content`);
  if (!socialImage) {
    errors.push(`${route}: missing Open Graph image`);
  } else if (socialImage.startsWith(`${SITE_URL}/`)) {
    const imagePath = path.join(
      DIST_DIR,
      ...new URL(socialImage).pathname.replace(/^\//, "").split("/"),
    );
    if (!fs.existsSync(imagePath)) {
      errors.push(`${route}: Open Graph image does not exist`);
    }
  }
  if (!html.includes('property="og:image:width" content="1200"')) {
    errors.push(`${route}: missing social image width`);
  }
  if (!html.includes('property="og:image:height" content="630"')) {
    errors.push(`${route}: missing social image height`);
  }
  if (!html.includes('name="twitter:card" content="summary_large_image"')) {
    errors.push(`${route}: missing large Twitter card`);
  }

  for (const match of html.matchAll(/href=["'](\/[^"'#?]*)/g)) {
    const link = match[1];
    if (link === "/" || path.posix.extname(link) !== "") continue;

    const target = path.join(
      DIST_DIR,
      ...link.replace(/^\/|\/$/g, "").split("/"),
      "index.html",
    );
    if (!fs.existsSync(target)) errors.push(`${route}: broken internal link ${link}`);

    const linkedUrl = new URL(link, `${SITE_URL}/`).href;
    if (linkedUrl !== url && inboundCounts.has(linkedUrl)) {
      inboundCounts.set(linkedUrl, (inboundCounts.get(linkedUrl) ?? 0) + 1);
    }
  }
}

for (const [url, inboundCount] of inboundCounts) {
  if (url !== `${SITE_URL}/` && inboundCount === 0) {
    errors.push(`${url.replace(SITE_URL, "")}: orphaned sitemap page`);
  }
}

if (errors.length) {
  throw new Error(`Computora SEO audit failed:\n- ${errors.join("\n- ")}`);
}

console.log(`Audited ${urls.length} Computora sitemap URLs with no SEO errors.`);
