import { test, expect } from '@playwright/test';

// Test selectors
const SELECTORS = {
  SEARCH_INPUT: '[data-testid="search-input-field"]',
  SEARCH_BUTTON: '[data-testid="search-button"]',
  SONG_CARD: '[data-testid="song-card"]',
  CLEAR_SEARCH: '[data-testid="clear-search"]',
  PLAY_BUTTON: 'button[aria-label="play"]',
  PAUSE_BUTTON: 'button[aria-label="pause"]'
};

// Test data
const TEST_SONGS = {
  VALID: 'The Beatles',
  SPECIAL_CHARS: 'Rock & Roll',
  NOT_FOUND: 'xxxxxxxxxxxxxxxxxxx',
  ERROR: 'Error Test'
};

test.describe('iTunes Music Search Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application before each test
    await page.goto('/');
  });

  test('complete application flow - search, play, and view details', async ({ page }) => {
    // Test the search functionality
    const searchInput = page.locator(SELECTORS.SEARCH_INPUT);
    await expect(searchInput).toBeVisible();
    await searchInput.click();
    await searchInput.fill(TEST_SONGS.VALID);

    // Click search button and verify loading state
    const searchButton = page.locator(SELECTORS.SEARCH_BUTTON);
    await searchButton.click();

    // Wait for loading indicator in search button
    const loadingSpinner = page.locator('role=progressbar');
    await expect(loadingSpinner).toBeVisible();

    // Wait for search results
    const songCards = page.locator(SELECTORS.SONG_CARD);
    await expect(songCards.first()).toBeVisible();
    await expect(loadingSpinner).not.toBeVisible();
    const count = await songCards.count();
    expect(count).toBeGreaterThan(0);

    // Test playing a song
    const firstSongCard = songCards.first();
    const playButton = firstSongCard.locator(SELECTORS.PLAY_BUTTON);
    await playButton.click();

    // Wait for the playing state to be applied and audio to start
    await page.waitForTimeout(1000); // Increased timeout to ensure audio state changes

    // Verify pause button appears
    await expect(firstSongCard.locator(SELECTORS.PAUSE_BUTTON)).toBeVisible();

    // Test the playback controls
    const playbackBar = page.locator('[data-testid="paper"]');
    await expect(playbackBar).toBeVisible();

    // Verify song info in playback bar
    const songTitle = (await firstSongCard.locator('.trackTitle').textContent()) || '';
    const artistName = (await firstSongCard.locator('.artistText').textContent()) || '';
    await expect(playbackBar.getByText(songTitle)).toBeVisible();
    await expect(playbackBar.getByText(artistName)).toBeVisible();

    // Test opening song details
    const detailsButton = firstSongCard.locator('button[aria-label="more details"]');
    await detailsButton.click();

    // Verify details dialog
    const dialog = page.locator('.dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.dialogTitle')).toContainText(songTitle);

    // Verify dialog content
    const dialogContent = dialog.locator('.dialogContent');
    await expect(dialogContent.locator('.dialogArtwork')).toBeVisible();
    await expect(dialogContent.getByText('Artist')).toBeVisible();
    await expect(dialogContent.getByText(artistName)).toBeVisible();

    // Close dialog
    const closeButton = dialog.locator('.dialogCloseButton');
    await closeButton.click();
    await expect(dialog).not.toBeVisible();

    // Test queue functionality
    const secondSongCard = songCards.nth(1);
    const secondPlayButton = secondSongCard.locator(SELECTORS.PLAY_BUTTON);
    await secondPlayButton.click();

    // Wait for the playing state to update
    await page.waitForTimeout(500);

    // Verify first song shows play button and second song shows pause button
    await expect(firstSongCard.locator(SELECTORS.PLAY_BUTTON)).toBeVisible();
    await expect(secondSongCard.locator(SELECTORS.PAUSE_BUTTON)).toBeVisible();

    // Test search with special characters
    await searchInput.click();
    await searchInput.fill(TEST_SONGS.SPECIAL_CHARS);
    await searchButton.click();
    await expect(songCards.first()).toBeVisible();

    // Test empty search results
    await searchInput.click();
    await searchInput.fill(TEST_SONGS.NOT_FOUND);
    await searchButton.click();
    const noResults = page.locator('text=No tracks found');
    await expect(noResults).toBeVisible();

    // Test clear functionality
    const clearButton = page.locator(SELECTORS.CLEAR_SEARCH);
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await expect(searchInput).toHaveValue('');
  });

  test('responsive design and layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const searchInput = page.locator(SELECTORS.SEARCH_INPUT);
    await expect(searchInput).toBeVisible();

    // Perform a search
    await searchInput.click();
    await searchInput.fill(TEST_SONGS.VALID);
    const searchButton = page.locator(SELECTORS.SEARCH_BUTTON);
    await searchButton.click();

    // Verify grid layout adjusts
    const songCards = page.locator(SELECTORS.SONG_CARD);
    await expect(songCards.first()).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(songCards.first()).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(songCards.first()).toBeVisible();
  });

  test('error handling and loading states', async ({ page }) => {
    const searchInput = page.locator(SELECTORS.SEARCH_INPUT);

    // Test loading state
    await searchInput.click();
    await searchInput.fill(TEST_SONGS.VALID);
    const searchButton = page.locator(SELECTORS.SEARCH_BUTTON);
    await searchButton.click();

    // Verify loading spinner appears in search button
    const loadingSpinner = page.locator('role=progressbar');
    await expect(loadingSpinner).toBeVisible();

    // Wait for results
    const songCards = page.locator(SELECTORS.SONG_CARD);
    await expect(songCards.first()).toBeVisible();
    await expect(loadingSpinner).not.toBeVisible();

    // Test error state (you might need to modify this based on your error handling)
    // This assumes your app shows an error message when the API fails
    await page.route('**/search*', (route) => {
      route.fulfill({
        status: 500,
        body: 'Server error'
      });
    });

    await searchInput.click();
    await searchInput.fill(TEST_SONGS.ERROR);
    await searchButton.click();

    const errorMessage = page.locator('.errorMessage');
    await expect(errorMessage).toBeVisible();
  });
});
