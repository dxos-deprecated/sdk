/* eslint-disable jest/expect-expect */
//
// Copyright 2020 DXOS.org
//

import { firefox } from 'playwright';

import { Browser } from './utils';

describe('Smoke test.', () => {
  const browser = firefox;
  const startUrl = 'http://localhost:9001';
  let user;

  beforeAll(async () => {
    jest.setTimeout(30000);
    user = new Browser();
    await user.launchBrowser(browser, startUrl);
  });

  afterAll(async () => {
    await user.closeBrowser();
  });

  test('Opens the Redeem Invitation storybook 2', async () => {
    await user.page.goto(`${startUrl}/iframe.html?id=invitations--with-redeem-invitation&viewMode=story`);
    await user.page.waitForSelector('//span[text()=\'Submit\']');
  });

  test('Can create a party in AppKit story', async () => {
    await user.page.goto(`${startUrl}/iframe.html?id=appkit--with-app-kit-provider&viewMode=story`);
    await user.page.waitForSelector('//button[text()=\'Add Party\']');
    await user.page.click('//button[text()=\'Add Party\']');
    await user.page.waitForSelector('.party-public-key');
  });
});
