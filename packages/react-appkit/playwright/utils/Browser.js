//
// Copyright 2020 DXOS.org
//

const headless = !!process.env.CI;
const slowMo = process.env.CI ? 0 : 200;

export class Browser {
  browser = null;
  context = null;
  page = null;

  async launchBrowser (_browser, _startUrl) {
    this.browser = await _browser.launch({ headless, slowMo });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.goto(_startUrl, { waitUntil: 'load' });
  }

  async closeBrowser () {
    await this.browser.close();
  }

  async goToPage (url) {
    await this.page.goto(url);
  }
}
