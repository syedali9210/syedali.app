/**
 * Asks IndexNow (Bing, which ChatGPT search and Copilot read from, and Yandex, Seznam, Naver) to fetch every page in the live sitemap again,
 * so a change shows up in hours instead of weeks. Run after a deploy that changes pages: npm run indexnow
 * The key proves the site is ours: public/3f51aff8d8f02446fff1f4ea5557412d.txt holds it, and it isn't a secret.
 */
const SITE = "https://www.syedali.app";
const KEY = "3f51aff8d8f02446fff1f4ea5557412d";

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error("The live sitemap lists no pages: deploy first.");
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} pages`);
