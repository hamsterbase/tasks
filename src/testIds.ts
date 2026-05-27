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
    /** Tag filter toggle button in desktop entity header */
    FilterToggleButton: 'entity-header-filter-toggle-button',
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
    /** Sidebar button that opens the command palette */
    SidebarTrigger: 'command-palette-sidebar-trigger',
  },
  ProjectDetailPanel: {
    /** Menu button in project detail panel header */
    MenuButton: 'project-detail-menu-button',
    /** Cancel project item in the project detail menu */
    CancelProjectMenuItem: 'project-detail-cancel-project-menu-item',
    /** Add heading item in the project detail menu */
    AddHeadingMenuItem: 'project-detail-add-heading-menu-item',
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
    /** Tag filter button in mobile page header */
    FilterButton: 'page-header-filter-button',
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
    /** Inbox action row in the tree select overlay (task variant) */
    ActionInbox: 'tree-select-action-inbox',
    /** Root-level (no area) project row in the tree select overlay */
    RootProjectRow: 'tree-select-root-project-row',
    /** Area row in the tree select overlay */
    AreaRow: 'tree-select-area-row',
    /** Project row nested under an area in the tree select overlay */
    AreaProjectRow: 'tree-select-area-project-row',
  },
  TimePicker: {
    /** Desktop time picker overlay container */
    Overlay: 'time-picker-overlay',
  },
  TagEditor: {
    /** Desktop tag editor overlay container */
    Overlay: 'tag-editor-overlay',
  },
  TodayPage: {
    /** Sortable heading row for an area or project group on the Today page */
    GroupHeader: 'today-group-header',
    /** Title element inside a Today group heading */
    GroupHeaderTitle: 'today-group-header-title',
  },
  TaskListItem: {
    /** Root of a desktop task row */
    Root: 'task-list-item',
    /** Title element inside a desktop task row */
    Title: 'task-list-item-title',
    /** Status checkbox button inside a desktop task row */
    StatusBox: 'task-item-status-box',
  },
  ProjectListItem: {
    /** Root of a desktop project row */
    Root: 'project-list-item',
    /** Title element inside a desktop project row */
    Title: 'project-list-item-title',
  },
  Sidebar: {
    /** Create menu button in the desktop sidebar header */
    CreateMenuButton: 'sidebar-create-menu-button',
  },
  CloudDatabase: {
    /** Row in the cloud database settings showing an inbox token */
    InboxTokenRow: 'cloud-database-inbox-token-row',
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
