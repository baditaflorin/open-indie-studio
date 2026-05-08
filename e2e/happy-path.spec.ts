import { expect, test } from '@playwright/test';

test('creates a sprite and exposes repo/support metadata', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { name: 'Open Indie Studio' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Star repo' })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/open-indie-studio',
  );
  await expect(page.getByRole('link', { name: 'PayPal' })).toHaveAttribute(
    'href',
    'https://www.paypal.com/paypalme/florinbadita',
  );
  await expect(page.getByText(/v0\.1\.0 ·/)).toBeVisible();

  await page.getByRole('button', { name: 'Add collectible' }).click();
  await expect(page.getByText('Added collectible')).toBeVisible();
  await expect(page.getByTestId('scene-canvas')).toBeVisible();

  await page.waitForTimeout(100);
  const sceneHasPixels = await page.getByTestId('scene-canvas').evaluate((canvas) => {
    const context = (canvas as HTMLCanvasElement).getContext('2d');
    const pixel = context?.getImageData(32, 32, 1, 1).data;
    return Boolean(pixel && pixel[3] > 0 && (pixel[0] > 0 || pixel[1] > 0 || pixel[2] > 0));
  });
  expect(sceneHasPixels).toBe(true);
});

test('mobile layout and lazy gpu preview render', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await expect(page.getByRole('heading', { name: 'Open Indie Studio' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Star repo' })).toBeVisible();

  await page.getByRole('button', { name: 'Start preview' }).click();
  const gpuPanel = page.locator('section', { hasText: 'GPU Preview' });
  const threeCanvas = gpuPanel.locator('canvas');

  await expect(threeCanvas).toBeVisible();
  await page.waitForTimeout(250);

  const dataUrlLength = await threeCanvas.evaluate(
    (canvas) => (canvas as HTMLCanvasElement).toDataURL('image/png').length,
  );
  expect(dataUrlLength).toBeGreaterThan(1000);
});
