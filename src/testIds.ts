/**
 * Test IDs for E2E testing
 *
 * Usage:
 * import { TestIds } from '@/testIds';
 * <div data-test-id={TestIds.CommandPalette.Overlay}>...</div>
 */

export const TestIds = {
  CommandPalette: {
    /** Command palette overlay container */
    Overlay: 'command-palette-overlay',
    /** Command palette backdrop */
    Backdrop: 'command-palette-backdrop',
    /** Command palette input field */
    Input: 'command-palette-input',
    /** Search results container */
    ResultsContainer: 'command-palette-results',
    /** Individual search result item */
    ResultItem: 'command-palette-result-item',
    /** No results message */
    NoResults: 'command-palette-no-results',
  },
} as const;
