import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.env.URL || "http://localhost:4317/";
const sections = ["features", "simulator", "showcase", "pricing", "opensource", "community"];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu=false", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
  defaultViewport: { width: 1366, height: 860, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: "shot-hero.png" });

for (const id of sections) {
  await page.evaluate((sid) => {
    const el = document.getElementById(sid);
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  }, id);
  // Wait for reveal animations + (for simulator) the 3D canvas.
  await new Promise((r) => setTimeout(r, id === "simulator" ? 3500 : 1200));
  await page.screenshot({ path: `shot-${id}.png` });
  console.log("captured", id);
}

console.log("CONSOLE ERRORS:", errors.length ? errors.slice(0, 20) : "none");
await browser.close();
