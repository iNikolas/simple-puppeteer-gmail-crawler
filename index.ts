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
  // Launch the browser with a visible window
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Enable the 'networkidle0' option to wait for all network connections to finish
  await page.goto("https://mail.google.com", { waitUntil: "networkidle0" });

  // Enter the email address
  await page.type('input[type="email"]', email);
  await page.click("#identifierNext");

  // Wait for the password input to appear and enter the password
  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', "your-password");
  await page.click("#passwordNext");

  // Wait for the Gmail inbox to load
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // Check for unread messages
  const unreadCount = await page.evaluate(() => {
    const unreadElement = document.querySelector(
      '[aria-label="Inbox"] span[role="link"]',
    );
    return unreadElement ? parseInt(unreadElement.textContent) : 0;
  });

  console.log(`Unread messages: ${unreadCount}`);

  // Keep the browser window open to inspect the state
  // await browser.close();
})();
