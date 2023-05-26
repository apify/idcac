# I Don't Care About Cookies for Playwright/Puppeteer

This package contains the I don't care about cookies extension compiled for use with Playwright or Puppeteer.

## Usage

```typescript
import { chromium } from 'playwright'; // works with Firefox too!
import { getExtensionPath } from 'idcac-playwright';

(async () => {
    const b = await chromium.launch({
        headless: false,
    });

    const context = await b.newContext();
    const p = await context.newPage();

    await p.goto('https://google.com');

    // Inject the extension (you can cache the file to avoid repeated reads)
    await p.evaluate(fs.readFileSync(getExtensionPath(), 'utf8'));

    // Enjoy your webpage without annoying cookie modals!
})();
```

## What works:
- Custom CSS injection
- Custom JS injection

## WIP 
- Network interception
    - trying to figure out the best way to do this with Playwright

## What doesn't work:
- Whitelisting (just don't inject the script on the page you want to whitelist)