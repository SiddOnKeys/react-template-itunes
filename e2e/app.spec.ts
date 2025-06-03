import { test, expect } from '@playwright/test';

// Test selectors and constants
const SELECTORS = {
  SEARCH_INPUT: '[data-testid="search-input-field"]',
  SEARCH_BUTTON: '[data-testid="search-button"]',
  SONG_CARD: '[data-testid^="song-card-"]',
  CLEAR_SEARCH: '[data-testid="clear-search"]',
  PLAYBACK_BUTTON: '[data-testid="playback-button"]',
  TRACK_TITLE: '[data-testid="track-title"]',
  ARTIST_TEXT: '[data-testid="artist-text"]',
  PLAYBACK_BAR: '[data-testid="playback-bar"]',
  DETAILS_BUTTON: '[data-testid="details-button"]',
  DIALOG: '[data-testid="dialog"]',
  DIALOG_TITLE: '[data-testid="dialog-title"]',
  DIALOG_CONTENT: '[data-testid="dialog-content"]',
  DIALOG_ARTWORK: '[data-testid="dialog-artwork"]',
  DIALOG_CLOSE: '[data-testid="dialog-close"]',
  ERROR_MESSAGE: '[data-testid="error-message"]',
  NO_RESULTS: '[data-testid="no-results"]'
};

const ATTRIBUTES = {
  PLAYING: 'data-playing'
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

    // Wait for API call to complete
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('itunes.apple.com/search') && response.status() === 200
    );

    try {
      await responsePromise;
    } catch (error) {
      test.info().annotations.push({
        type: 'debug',
        description: `Failed to get API response: ${error.message}`
      });
      throw error;
    }

    // Wait for loading spinner to disappear
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });

    // Wait for search results
    await page.waitForSelector(SELECTORS.SONG_CARD, { state: 'visible', timeout: 15000 });
    const visibleCards = await page.locator(SELECTORS.SONG_CARD).all();
    expect(visibleCards.length).toBeGreaterThan(0);

    // Test playing a song
    const firstSongCard = visibleCards[0];
    const playbackButton = firstSongCard.locator(SELECTORS.PLAYBACK_BUTTON);
    await playbackButton.click();

    // Wait for playback to start by checking for playback bar
    const playbackBar = page.locator(SELECTORS.PLAYBACK_BAR);
    await expect(playbackBar).toBeVisible({ timeout: 10000 });

    // Now check the playing state
    await expect(playbackButton).toHaveAttribute(ATTRIBUTES.PLAYING, 'true');

    // Test the playback controls
    await expect(playbackBar).toBeVisible();

    // Verify song info in playback bar
    const songTitle = (await firstSongCard.locator(SELECTORS.TRACK_TITLE).textContent()) || '';
    const artistName = (await firstSongCard.locator(SELECTORS.ARTIST_TEXT).textContent()) || '';
    await expect(playbackBar.getByText(songTitle)).toBeVisible();
    await expect(playbackBar.getByText(artistName)).toBeVisible();

    // Test opening song details
    const detailsButton = firstSongCard.locator(SELECTORS.DETAILS_BUTTON);
    await detailsButton.click();

    // Verify details dialog
    const dialog = page.locator(SELECTORS.DIALOG);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(SELECTORS.DIALOG_TITLE)).toContainText(songTitle);

    // Verify dialog content
    const dialogContent = dialog.locator(SELECTORS.DIALOG_CONTENT);
    await expect(dialogContent.locator(SELECTORS.DIALOG_ARTWORK)).toBeVisible();
    await expect(dialogContent.getByText('Artist')).toBeVisible();
    await expect(dialogContent.getByText(artistName)).toBeVisible();

    // Close dialog
    const closeButton = dialog.locator(SELECTORS.DIALOG_CLOSE);
    await closeButton.click();
    await expect(dialog).not.toBeVisible();

    // Test queue functionality
    const secondSongCard = visibleCards[1];
    const secondPlaybackButton = secondSongCard.locator(SELECTORS.PLAYBACK_BUTTON);
    const secondSongTitle = (await secondSongCard.locator(SELECTORS.TRACK_TITLE).textContent()) || '';
    await secondPlaybackButton.click();

    // Wait for the second song to appear in the playback bar
    await expect(playbackBar.getByText(secondSongTitle)).toBeVisible({ timeout: 10000 });

    // Test search with special characters
    await searchInput.click();
    await searchInput.fill(TEST_SONGS.SPECIAL_CHARS);
    await searchButton.click();

    // Wait for loading indicator
    await expect(loadingSpinner).toBeVisible();

    // Wait for API call to complete
    const specialCharsResponse = page.waitForResponse(
      (response) => response.url().includes('itunes.apple.com/search') && response.status() === 200
    );

    let responseData;
    try {
      const response = await specialCharsResponse;
      responseData = await response.json();
      test.info().annotations.push({
        type: 'debug',
        description: `API Response received with ${responseData.resultCount} tracks`
      });
    } catch (error) {
      test.info().annotations.push({
        type: 'debug',
        description: `Failed to get API response for special chars search: ${error.message}`
      });
      throw error;
    }

    // Wait for loading spinner to disappear
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });

    // Wait for all song cards to be rendered
    if (responseData && responseData.resultCount > 0) {
      // Wait for the first card to appear
      await page.waitForSelector(SELECTORS.SONG_CARD, { state: 'visible', timeout: 15000 });

      // Then wait for all cards to be rendered
      await page.waitForFunction(
        ({ expectedCount, selector }) => document.querySelectorAll(selector).length >= expectedCount,
        {
          timeout: 15000,
          args: [
            {
              expectedCount: responseData.resultCount,
              selector: SELECTORS.SONG_CARD
            }
          ]
        }
      );

      const specialCharsVisibleCards = await page.locator(SELECTORS.SONG_CARD).all();
      expect(specialCharsVisibleCards.length).toBe(responseData.resultCount);
    } else {
      // If no results, wait for no-results message
      await page.waitForSelector(SELECTORS.NO_RESULTS, { state: 'visible', timeout: 10000 });
    }

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

    // Test error state
    await page.route('**/search*', (route) => {
      route.fulfill({
        status: 500,
        body: 'Server error'
      });
    });

    await searchInput.click();
    await searchInput.fill(TEST_SONGS.ERROR);
    await searchButton.click();

    const errorMessage = page.locator(SELECTORS.ERROR_MESSAGE);
    await expect(errorMessage).toBeVisible();
  });
});
