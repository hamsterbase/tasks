/**
 * Test IDs for E2E testing
 *
 * Usage:
 * import { TestIds } from '@/testIds';
 * <div data-test-id={TestIds.CommandPalette.Overlay}>...</div>
 */

export const TestIds = {
  EntityHeader: {
    /** Display settings button in desktop entity header */
    DisplaySettingsButton: 'entity-header-display-settings-button',
  },
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
    /** Cancel project item in the project detail menu */
    CancelProjectMenuItem: 'project-detail-cancel-project-menu-item',
  },
  HeadingDetail: {
    /** Menu button in heading detail panel header */
    MenuButton: 'heading-detail-menu-button',
  },
  DesktopMenu: {
    /** Desktop menu popup wrapper containing menu and submenu */
    Popup: 'desktop-menu-popup',
    /** Desktop menu container */
    Container: 'desktop-menu-container',
    /** Desktop submenu container */
    Submenu: 'desktop-menu-submenu',
    /** Desktop menu backdrop */
    Backdrop: 'desktop-menu-backdrop',
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
  PageHeader: {
    /** Menu button in mobile page header */
    MenuButton: 'page-header-menu-button',
    /** Display settings button in mobile page header */
    DisplaySettingsButton: 'page-header-display-settings-button',
  },
  TaskDetail: {
    /** Menu button in task detail panel header */
    MenuButton: 'task-detail-menu-button',
  },
  Reminders: {
    /** Reminder popover container inside task detail panel */
    Popover: 'task-detail-reminder-popover',
  },
  DatePicker: {
    /** Desktop date picker overlay container */
    Overlay: 'date-picker-overlay',
  },
  Overlay: {
    /** Shared desktop overlay backdrop */
    ContainerBackdrop: 'overlay-container-backdrop',
  },
  TreeSelect: {
    /** Desktop tree select overlay container */
    Overlay: 'tree-select-overlay',
  },
  TimePicker: {
    /** Desktop time picker overlay container */
    Overlay: 'time-picker-overlay',
  },
  TagEditor: {
    /** Desktop tag editor overlay container */
    Overlay: 'tag-editor-overlay',
  },
} as const;
