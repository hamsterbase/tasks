/**
 * Test IDs for E2E testing
 *
 * Usage:
 * import { TestIds } from '@/testIds';
 * <div data-test-id={TestIds.CommandPalette.Overlay}>...</div>
 */

export const TestIds = {
  SchedulePage: {
    /** Desktop schedule page root */
    Root: 'desktop-schedule-page',
  },
  ImagePreview: {
    /** Close the desktop image preview */
    CloseButton: 'desktop-image-preview-close',
  },
  AIChat: {
    /** Linked message label above the chat input */
    LinkedMessage: 'ai-chat-linked-message',
    /** In-progress response status */
    Generating: 'ai-chat-generating',
  },
  EntityHeader: {
    /** Expanded tag filter bar */
    TagFilterBar: 'entity-tag-filter-bar',
    /** Show future tasks menu item */
    ShowFutureTasksMenuItem: 'display-show-future-tasks',
    /** Completed tasks range submenu trigger */
    CompletedRangeMenuItem: 'display-completed-range',

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
    /** Full-project completed and total task count in the detail panel */
    TaskProgressCount: 'project-detail-task-progress-count',
    /** Cancel project item in the project detail menu */
    CancelProjectMenuItem: 'project-detail-cancel-project-menu-item',
    /** Add heading item in the project detail menu */
    AddHeadingMenuItem: 'project-detail-add-heading-menu-item',
  },
  HeadingDetail: {
    /** Menu button in heading detail panel header */
    MenuButton: 'heading-detail-menu-button',
  },
  DetailPanel: {
    /** Tag editor trigger in desktop details */
    TagsField: 'detail-panel-tags-field',
    /** Location selector trigger in desktop details */
    LocationField: 'detail-panel-location-field',

    /** ID row in the desktop detail panel; clicking it copies HT#<uid> */
    IdField: 'detail-panel-id-field',
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
    /** Reminder selector trigger */
    Field: 'task-detail-reminders-field',
    /** Add reminder action */
    AddButton: 'task-detail-add-reminder',

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
  SelfhostedSync: {
    /** Auto-sync toggle row in selfhosted sync settings */
    AutoSyncToggle: 'selfhosted-sync-auto-sync-toggle',
  },
  RecurringTaskSettings: {
    /** Invalid recurring rule message */
    InvalidRule: 'recurring-task-invalid-rule',

    /** Desktop recurring task settings overlay container */
    Overlay: 'recurring-task-settings-overlay',
    /** Start date input in the recurring task settings overlay */
    StartDateInput: 'recurring-task-settings-start-input',
    /** Due date input in the recurring task settings overlay */
    DueDateInput: 'recurring-task-settings-due-input',
  },
  CliApproval: {
    Explanation: 'cli-approval-explanation',
    ExplanationImage: 'cli-approval-explanation-image',
    /** Approvals page root */
    Page: 'cli-approval-page',
    /** One approvable entry (a single op) in the approvals page or panel */
    OpRow: 'cli-approval-op-row',
    /** Approve button on an entry */
    ApproveButton: 'cli-approval-approve-button',
    /** Reject / remove button on an entry */
    RejectButton: 'cli-approval-reject-button',
    /** Approve every valid non-deletion entry shown in the current approval review */
    ApproveAllButton: 'cli-approval-approve-all-button',
    /** Reject every entry shown in the current approval review */
    RejectAllButton: 'cli-approval-reject-all-button',
    /** Always-visible approvals entry in a project detail panel */
    DetailEntry: 'cli-approval-detail-entry',
    /** CLI setup instructions shown on the approvals page when nothing is pending */
    SetupGuide: 'cli-approval-setup-guide',
    /** Copies the agent prompt out of the setup guide */
    SetupGuideCopyButton: 'cli-approval-setup-guide-copy-button',
    /** One node row of the created-items tree */
    TreeNode: 'cli-approval-tree-node',
    /** Right slide-over approval panel container */
    PanelContainer: 'cli-approval-panel',
  },
} as const;
