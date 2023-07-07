const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const email = process.argv[2];
const password = process.argv[3];
const gmailUrl = "https://mail.google.com";
const emailSelector = 'input[type="email"]';
const passwordSelector = 'input[type="password"]';

if (!email) {
  throw "Email argument was not provided";
}

if (!password) {
  throw "Password argument was not provided";
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(gmailUrl, { waitUntil: "networkidle0" });

  await page.type(emailSelector, email);
  await page.keyboard.press("Enter");

  await page.waitForNavigation();

  await page.waitForSelector(passwordSelector);

  await new Promise((resolve) => setTimeout(() => resolve(null), 2000));

  await page.type(passwordSelector, password);
  await page.click(passwordSelector);
  await page.keyboard.press("Enter");

  await page.waitForNavigation();

  const unreadCount = await page.evaluate(() => {
    const unreadElement = document.querySelector('a[aria-label^="Inbox"]');
    if (!unreadElement || typeof unreadElement.ariaLabel !== "string") {
      return null;
    }
    return parseInt(unreadElement.ariaLabel.match(/\d+/g)[0]);
  });

  const result = unreadCount === null || isNaN(unreadCount) ? 'Failed to read Unread messages' : `Unread messages: ${unreadCount}`
  console.log(result);

  await browser.close();
})();
