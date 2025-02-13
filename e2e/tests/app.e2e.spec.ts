import { test, expect } from '@playwright/test';

test.describe('App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Desktop view (min-width:600px)', () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test('should display permanent drawer and main content', async ({
      page,
    }) => {
      // Main content (provided as children) should be visible.
      await expect(page.locator('text=Content')).toBeVisible();

      // In desktop view, the permanent drawer should show navigation links.
      await expect(page.locator('text=Home')).toBeVisible();
      await expect(page.locator('text=IAPs')).toBeVisible();

      // The user info ("TestUser") should also be visible.
      await expect(page.locator('text=TestUser')).toBeVisible();

      // The mobile AppBar (with id="logo") is rendered only on mobile.
      // In desktop mode it should not be visible.
      await expect(page.locator('#logo')).toBeHidden();
    });

    test('should toggle dark mode and update localStorage', async ({
      page,
    }) => {
      const darkToggle = page
        .locator('text=TestUser')
        .locator('xpath=following-sibling::button');
      await expect(darkToggle).toBeVisible();

      // Initially, localStorage should not have a "darkMode" value.
      let darkModeValue = await page.evaluate(() =>
        localStorage.getItem('darkMode'),
      );
      expect(darkModeValue).toBeNull();

      // Click to toggle dark mode on.
      await darkToggle.click();
      darkModeValue = await page.evaluate(() =>
        localStorage.getItem('darkMode'),
      );
      expect(darkModeValue).toStrictEqual('true');

      // Click again to toggle dark mode off.
      await darkToggle.click();
      darkModeValue = await page.evaluate(() =>
        localStorage.getItem('darkMode'),
      );
      expect(darkModeValue).toStrictEqual('false');
    });
  });

  test.describe('Mobile view (width:375px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display AppBar with hamburger menu and open drawer', async ({
      page,
    }) => {
      // In mobile view, an AppBar with the logo is rendered.
      await expect(page.locator('#logo')).toBeVisible();

      // The navigation links ("Home" and "IAPs") are inside the temporary drawer,
      // so they should not be visible until the drawer is opened.
      await expect(page.locator('text=Home')).toBeHidden();
      await expect(page.locator('text=IAPs')).toBeHidden();

      // Click the hamburger menu button.
      // (Since the AppBar is only rendered in mobile, we assume the first button is the hamburger.)
      const hamburgerButton = page.locator('button').first();
      await hamburgerButton.click();

      // Wait for the drawer content to be visible.
      await expect(page.locator('text=TestUser')).toBeVisible();

      // Now the drawer should open and display the navigation links and user info.
      await expect(page.locator('text=Home')).toBeVisible();
      await expect(page.locator('text=IAPs')).toBeVisible();
      await expect(page.locator('text=TestUser')).toBeVisible();
    });

    test('should toggle dark mode and update localStorage from mobile drawer', async ({
      page,
    }) => {
      // Open the drawer by clicking the hamburger menu.
      const hamburgerButton = page.locator('button').first();
      await hamburgerButton.click();

      // Wait until the drawer is fully open.
      await expect(page.locator('text=TestUser')).toBeVisible();

      // Locate the dark mode toggle button by finding the button sibling of "TestUser".
      const darkToggle = page
        .locator('text=TestUser')
        .locator('xpath=following-sibling::button');
      await expect(darkToggle).toBeVisible();

      // Check that localStorage "darkMode" is initially not set.
      let darkModeValue = await page.evaluate(() =>
        localStorage.getItem('darkMode'),
      );
      expect(darkModeValue).toBeNull();

      // Toggle dark mode on.
      await darkToggle.click();
      darkModeValue = await page.evaluate(() =>
        localStorage.getItem('darkMode'),
      );
      expect(darkModeValue).toStrictEqual('true');

      // Toggle dark mode off.
      await darkToggle.click();
      darkModeValue = await page.evaluate(() =>
        localStorage.getItem('darkMode'),
      );
      expect(darkModeValue).toStrictEqual('false');
    });
  });
});
