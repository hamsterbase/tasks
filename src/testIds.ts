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
    /** Start date row in the desktop task detail panel */
    StartDateField: 'task-detail-start-date-field',
    /** Due date row in the desktop task detail panel */
    DueDateField: 'task-detail-due-date-field',
    /** Recurring rule row in the desktop task detail panel */
    RecurringRuleField: 'task-detail-recurring-rule-field',
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
  RecurringTaskSettings: {
    /** Desktop recurring task settings overlay container */
    Overlay: 'recurring-task-settings-overlay',
    /** Start date input in the recurring task settings overlay */
    StartDateInput: 'recurring-task-settings-start-input',
    /** Due date input in the recurring task settings overlay */
    DueDateInput: 'recurring-task-settings-due-input',
  },
} as const;
