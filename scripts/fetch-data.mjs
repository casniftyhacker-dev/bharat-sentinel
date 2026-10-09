import { mkdirSync, writeFileSync } from "node:fs";

const symbols = {
  nifty50: "^NSEI",
  sensex: "^BSESN",
  crude: "CL=F",
  indiaVix: "^INDIAVIX",
};

const out = { updatedAt: new Date().toISOString(), markets: {}, errors: [] };

for (const [key, sym] of Object.entries(symbols)) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const meta = (await res.json()).chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    out.markets[key] = { price, prev, changePct: ((price - prev) / prev) * 100 };
  } catch (e) {
    out.errors.push(`${key}: ${e.message}`);
  }
}

mkdirSync("public", { recursive: true });
writeFileSync("public/data.json", JSON.stringify(out, null, 2));
console.log("Saved", Object.keys(out.markets), "errors:", out.errors);
