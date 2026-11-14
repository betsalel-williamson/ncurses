#!/usr/bin/env node
/**
 * Tell IndexNow (https://www.indexnow.org) search engines about every page of the deployed site.
 * Reads the live sitemap, so run it after the deploy. The key is public by design: the file
 * site/public/<key>.txt holds it, and IndexNow fetches that file to verify the submission.
 * Usage: node scripts/indexnow.mjs https://<owner>.github.io/<repo>/
 */
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteUrl = new URL(process.argv[2] ?? '');
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname += '/';
const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const keyFile = readdirSync(publicDir).find((f) => /^[0-9a-f]{8,128}\.txt$/.test(f));
if (!keyFile) throw new Error(`no IndexNow key file (<hex key>.txt) in ${publicDir}`);
const key = keyFile.replace(/\.txt$/, '');

const locs = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
};
const urls = [];
for (const sitemap of await locs(new URL('sitemap-index.xml', siteUrl))) urls.push(...(await locs(sitemap)));

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: siteUrl.host,
    key,
    keyLocation: new URL(keyFile, siteUrl).href,
    urlList: urls.slice(0, 10000),
  }),
});
console.log(`IndexNow: submitted ${Math.min(urls.length, 10000)} URLs, HTTP ${res.status}`);
// 200 and 202 mean accepted; anything else is a real problem with the key or the URLs.
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
