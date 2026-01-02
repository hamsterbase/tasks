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
  ProjectDetailPanel: {
    /** Menu button in project detail panel header */
    MenuButton: 'project-detail-menu-button',
  },
  DesktopMenu: {
    /** Desktop menu container */
    Container: 'desktop-menu-container',
    /** Desktop menu item - use with label for specific items */
    Item: 'desktop-menu-item',
  },
  DesktopDialog: {
    /** Dialog container */
    Container: 'desktop-dialog-container',
    /** Dialog title */
    Title: 'desktop-dialog-title',
    /** Dialog description */
    Description: 'desktop-dialog-description',
    /** Dialog action button - use with key for specific buttons */
    ActionButton: 'desktop-dialog-action-button',
  },
} as const;
