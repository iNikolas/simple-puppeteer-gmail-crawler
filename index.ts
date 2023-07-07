const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const email = process.argv[2];
const password = process.argv[3];

if (!email) {
  throw "Email argument was not provided";
}

if (!password) {
  throw "Password argument was not provided";
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://mail.google.com", { waitUntil: "networkidle0" });

  await page.type('input[type="email"]', email);
  await page.click("#identifierNext");

  await page.waitForNavigation({ waitUntil: "networkidle0" });

  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', password);
  // await page.click("#passwordNext");

  await page.waitForNavigation({ waitUntil: "networkidle0" });

  const unreadCount = await page.evaluate(() => {
    const unreadElement = document.querySelector(
      '[aria-label="Inbox"] span[role="link"]',
    );
    if (!unreadElement) {
      throw "Failed to read Inbox";
    }
    return parseInt(unreadElement.textContent);
  });

  console.log(`Unread messages: ${unreadCount}`);

  await browser.close();
})();
