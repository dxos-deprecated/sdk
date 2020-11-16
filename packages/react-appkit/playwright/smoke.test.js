//
// Copyright 2020 DXOS.org
//

import { firefox } from 'playwright';

import { Browser } from './utils';

describe('Smoke test.', () => {
  const browser = firefox;
  const startUrl = 'localhost:9001';
  let user;

  beforeAll(async () => {
    jest.setTimeout(30000);
    user = new Browser();
    await user.launchBrowser(browser, startUrl);
  });

  afterAll(async () => {
    await user.closeBrowser();
  });

  test('Opens the storybooks', async () => {
    await user.page.waitForSelector('#tabbutton-knobs')
  });
});
