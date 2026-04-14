import { formatTheme } from '@/base/common/formatTheme';

export const desktopStyles = {
  sidebarContainerStyle: /*tw*/ 'w-full h-full pt-2 flex flex-col',
  sidebarBackground: /*tw*/ 'bg-bg2',
  SidebarMinWidth: /*tw*/ 'w-45',
  SidebarMaxWidth: /*tw*/ 'w-128',
  SidebarPreferredWidth: /*tw*/ 'w-56',

  SidebarHeaderContainer: /*tw*/ 'flex items-center justify-end h-12 px-2 mb-3 flex-shrink-0',
  SidebarHeaderActions: /*tw*/ 'flex items-center gap-0.5 ml-auto',
  SidebarHeaderIconButton:
    'flex items-center justify-center hover:bg-bg3 hover:text-t1 rounded-md transition-colors size-6 text-t3',
  SidebarHeaderIconButtonIcon: /*tw*/ 'size-4',

  SidebarMenuItemContainer: /*tw*/ 'flex flex-col gap-0.5 px-2',
  SidebarMenuItem: /*tw*/ 'h-7 px-2 flex rounded-md text-sm leading-5 items-center gap-2 group transition-colors',
  SidebarMenuItemActive: /*tw*/ 'bg-bg3 text-t1 font-medium',
  SidebarMenuItemInactive: /*tw*/ 'text-t2 hover:bg-bg3 hover:text-t1',
  SidebarMenuItemIcon: /*tw*/ 'size-4 flex items-center justify-center flex-shrink-0',
  SidebarMenuItemIconSvg: /*tw*/ 'size-4',
  SidebarMenuItemLabel: /*tw*/ 'flex-1 truncate min-w-0',
  SidebarMenuItemBadgePrimary:
    'min-w-4 text-xs leading-none h-4 rounded-sm bg-accent-danger text-white flex items-center justify-center px-1 font-medium',
  SidebarMenuItemBadgeSecondaryActive: /*tw*/ 'text-t3 text-xs',
  SidebarMenuItemBadgeSecondary: /*tw*/ 'text-t3 text-xs',
  SidebarMenuDivider: /*tw*/ 'bg-line-light h-px my-3 mx-2',

  SidebarProjectAreaList: /*tw*/ 'flex-1 overflow-y-auto flex flex-col px-2 pb-2',
  SidebarProjectAreaListNoTopPadding: /*tw*/ 'pt-0',

  SidebarAreaItem:
    /*tw*/ 'h-7 px-2 flex rounded-md text-sm leading-5 items-center gap-2 group cursor-pointer transition-colors font-medium',
  SidebarAreaItemActive: /*tw*/ 'bg-bg3 text-t1',
  SidebarAreaItemInactive: /*tw*/ 'text-t1 hover:bg-bg3',
  SidebarAreaItemIcon: /*tw*/ 'size-4 flex items-center justify-center flex-shrink-0 text-t3',
  SidebarAreaToggleButton: 'flex-shrink-0 size-4 transition-all flex items-center justify-center text-t3',
  SidebarAreaToggleButtonActive: /*tw*/ 'text-t3',
  SidebarAreaToggleButtonInactive: /*tw*/ 'text-t3',
  SidebarAreaGap: /*tw*/ 'mt-3 first:mt-0',

  SidebarProjectItemActive: /*tw*/ 'bg-bg3 text-t1 font-medium',
  SidebarProjectItemInactive: /*tw*/ 'text-t2 hover:bg-bg3 hover:text-t1',
  SidebarProjectItemIcon: /*tw*/ 'size-4 flex items-center justify-center flex-shrink-0 text-t3',
  SidebarProjectItemDueDate: /*tw*/ 'text-xs leading-5',
  SidebarProjectItemDueDateDanger: /*tw*/ 'text-accent-danger',
  SidebarProjectItemDueDateActive: /*tw*/ 'text-t3',
  SidebarProjectItemDueDateInactive: /*tw*/ 'text-t3',

  EntityHeaderContainer: /*tw*/ 'min-h-11 flex items-center justify-between px-5 pr-3 bg-bg1 flex-shrink-0',
  EntityHeaderPanelIconContainer: /*tw*/ 'flex items-center size-5 text-t2 mr-3 justify-center',
  EntityHeaderPanelIcon: /*tw*/ 'size-4',
  EntityHeaderContentWrapper: /*tw*/ 'flex items-start gap-2 flex-1 min-w-0 py-3',
  EntityHeaderIconContainer: /*tw*/ 'size-5 flex items-center justify-center text-t2',
  EntityHeaderIconButton: /*tw*/ 'size-5 flex items-center justify-center',
  EntityHeaderIconSvg: /*tw*/ 'size-5',
  EntityHeaderEditableTextArea:
    'flex-1 text-sm leading-5 font-semibold text-t1 resize-none bg-transparent border-none outline-none px-1 -mx-1 py-0 rounded-sm',
  EntityHeaderTitle: /*tw*/ 'text-sm leading-5 font-semibold text-t1 truncate',
  EntityHeaderActionsContainer: /*tw*/ 'self-start flex items-center gap-1 pt-2.5',
  EntityHeaderActionButton:
    'flex items-center gap-1 px-2 h-7 text-xs text-t2 hover:bg-bg3 hover:text-t1 rounded-md transition-colors',
  EntityHeaderActionIcon: /*tw*/ 'size-3.5 flex items-center justify-center',
  EntityHeaderActionIconSvg: /*tw*/ 'size-3.5',
  EntityHeaderActionLabel: /*tw*/ 'text-xs leading-5 font-normal',
  EntityHeaderIconActionButton:
    /*tw*/ 'size-6 flex items-center justify-center rounded-md text-t3 hover:bg-bg3 hover:text-t1 transition-colors flex-shrink-0',
  EntityHeaderIconActionIcon: /*tw*/ 'size-3.5',

  ClearSelectionButton:
    'border-t border-line-regular h-15 flex items-center text-base text-t3 justify-center cursor-pointer',

  TaskDetailAttributeRow:
    /*tw*/ 'appearance-none flex items-start gap-3 py-1.5 px-2 -mx-2 rounded-md text-left bg-transparent border-none hover:bg-bg2 transition-colors cursor-pointer',
  TaskDetailAttributeIconContainer: /*tw*/ 'w-3.5 h-4 flex-shrink-0 flex items-center justify-center text-t3',
  TaskDetailAttributeIconContainerDanger: /*tw*/ 'text-accent-danger',
  TaskDetailAttributeIconContainerPlaceholder: /*tw*/ 'text-t3',
  TaskDetailAttributeIcon: /*tw*/ 'size-3.5',
  TaskDetailAttributeLabel: /*tw*/ 'text-xs text-t3 flex-1 whitespace-nowrap',
  TaskDetailAttributeContent: /*tw*/ 'ml-auto min-w-0 text-xs text-t1',
  TaskDetailAttributeContentPlaceholder: /*tw*/ 'text-t3',
  TaskDetailAttributeTagList: /*tw*/ 'flex gap-1.5 items-center flex-wrap justify-end min-w-0',
  TaskDetailAttributeTag: /*tw*/ 'text-xs leading-4 text-t2 px-2 py-0.5 rounded-full border border-line-light',

  RemindersFieldAnchor: /*tw*/ 'relative',
  RemindersFieldPopover:
    'absolute top-full right-0 mt-1 w-56 bg-bg1 border border-line-regular rounded-md p-1 z-20 shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
  RemindersFieldPopoverEmpty: /*tw*/ 'px-2 py-1.5 text-xs text-t3',
  RemindersFieldPopoverItem:
    'group flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm text-t1 hover:bg-bg3 transition-colors cursor-pointer',
  RemindersFieldPopoverDeleteButton:
    'size-4 flex items-center justify-center rounded-sm text-t3 opacity-0 group-hover:opacity-100 hover:text-accent-danger hover:bg-accent-danger/10 transition-opacity',
  RemindersFieldPopoverDeleteIcon: /*tw*/ 'size-3',
  RemindersFieldPopoverDivider: /*tw*/ 'h-px bg-line-light mx-1 my-1',
  RemindersFieldPopoverAddRow:
    'flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer rounded-sm text-t2 hover:bg-bg3 hover:text-t1 transition-colors',
  RemindersFieldPopoverAddIcon: /*tw*/ 'size-3.5 flex-shrink-0',
  RemindersFieldDateText: /*tw*/ 'flex-1 text-t1',
  RemindersFieldTimeText: /*tw*/ 'text-t3',
  RemindersFieldPastTag: /*tw*/ 'line-through text-t3',

  RecurringRuleContent: /*tw*/ 'flex flex-col items-end gap-1 text-xs leading-4',

  TaskLocationFieldLocationText: /*tw*/ 'text-xs text-t1',

  TaskDateFieldDateContainer: /*tw*/ 'flex items-baseline justify-end gap-1 text-xs leading-4 flex-wrap',
  TaskDateFieldDateNormal: /*tw*/ 'text-xs text-t1',
  TaskDateFieldDateOverdue: /*tw*/ 'text-xs text-accent-danger font-medium',
  TaskDateFieldRemainingText: /*tw*/ 'text-xs text-t3',
  SubtaskListSection: /*tw*/ 'flex flex-col gap-0.5 text-sm',

  InboxTaskInputWrapper: /*tw*/ '',
  InboxTaskInputContainer:
    /*tw*/ 'group flex w-full flex-row items-center gap-2 px-2 py-2 rounded-md transition-colors hover:bg-bg2 focus-within:bg-bg2',
  InboxTaskInputIcon: /*tw*/ 'flex-none size-4 text-t3 group-focus-within:text-t2',
  InboxTaskInputField:
    /*tw*/ 'flex-1 bg-transparent text-sm leading-5 text-t1 placeholder:text-t3 focus:outline-none font-normal',

  InboxAreaContainer: /*tw*/ 'flex w-full items-center',
  InboxAreaInputWrapper: /*tw*/ 'flex-1',

  ItemTagContainer: /*tw*/ 'flex min-w-0 max-w-30 items-center gap-1 text-xs leading-4',
  ItemTagNormal: /*tw*/ 'text-t3',
  ItemTagDanger: /*tw*/ 'text-accent-danger',
  ItemTagSelected: /*tw*/ '',
  ItemTagUnselected: /*tw*/ '',
  ItemTagIcon: /*tw*/ 'size-3 flex items-center justify-center flex-shrink-0',
  ItemTagIconSvg: /*tw*/ 'size-3',
  ItemTagLabel: /*tw*/ 'min-w-0 truncate',

  AuthFormContainer: /*tw*/ 'flex flex-col gap-9',
  AuthFormSection: /*tw*/ 'flex flex-col gap-3',
  AuthFormErrorMessage: /*tw*/ 'text-accent-danger text-base',
  AuthFormButtonSection: /*tw*/ 'flex flex-col gap-3',
  AuthFormFooterContainer: /*tw*/ 'flex items-center gap-2 justify-center',
  AuthFormFooterText: /*tw*/ 'text-base font-normal text-t3 leading-5',
  AuthFormSwitchButton: /*tw*/ 'text-brand hover:underline ml-1',
  AuthFormLink: /*tw*/ 'text-brand mx-1 hover:underline',

  SelectContainer: /*tw*/ 'relative',
  SelectTrigger:
    'box-border flex flex-row justify-between items-center p-3 gap-3 min-w-44 h-11 border border-line-regular rounded-lg cursor-pointer bg-bg1 hover:border-brand focus-within:border-brand',
  SelectTriggerText: /*tw*/ 'flex-none order-0 flex-grow-0 w-auto h-5 font-normal text-base leading-5 text-t1',
  SelectTriggerIcon: /*tw*/ 'flex-none order-1 flex-grow-0 w-5 h-5 text-t3 transition-transform',

  SwitchLabel: /*tw*/ 'inline-flex items-center cursor-pointer',
  SwitchLabelDisabled: /*tw*/ 'opacity-50 cursor-not-allowed',
  SwitchInput: /*tw*/ 'sr-only',
  SwitchContainer: /*tw*/ 'relative w-12.75 h-7.75 rounded-full transition-colors',
  SwitchContainerActive: /*tw*/ 'bg-brand',
  SwitchContainerInactive: /*tw*/ 'bg-bg2',
  SwitchKnob: /*tw*/ 'absolute size-7.75 bg-white rounded-full transition-all duration-200 top-0 shadow-sm',
  SwitchKnobActive: /*tw*/ 'left-5',
  SwitchKnobInactive: /*tw*/ 'left-0.5',

  SettingsItemContainer: /*tw*/ 'flex w-full items-start justify-between',
  SettingsItemContentWrapper: /*tw*/ 'flex-1 pr-4',
  SettingsItemTitle: /*tw*/ 'text-base font-medium text-t1 leading-6 h-6',
  SettingsItemDescription: /*tw*/ 'text-sm font-normal text-t3 leading-4.5 min-h-4.5',
  SettingsItemActionWrapper: /*tw*/ 'flex-shrink-0 h-10.5 flex item-center',

  SettingsItemGroupContainer:
    'flex flex-col justify-center items-start p-4 gap-3 border border-line-regular rounded-lg',
  SettingsItemGroupDivider: /*tw*/ 'w-full h-0.25 bg-bg3',

  SettingButtonBase: /*tw*/ 'rounded-lg focus:outline-none flex flex-row justify-center items-center whitespace-nowrap',
  SettingButtonSizeLarge: /*tw*/ 'h-13 text-base font-normal min-w-20',
  SettingButtonSizeMedium: /*tw*/ 'h-11 text-base font-normal min-w-20 px-3',
  SettingButtonSizeSmall: /*tw*/ 'h-9 text-sm font-normal min-w-20 px-3',
  SettingButtonFullWidth: /*tw*/ 'w-full',

  SettingButtonSolidPrimary: /*tw*/ 'bg-brand text-white hover:bg-brand/90',
  SettingButtonSolidDanger: /*tw*/ 'bg-accent-danger text-white hover:bg-accent-danger/90',
  SettingButtonSolidDefault: /*tw*/ 'bg-bg3 text-white hover:bg-bg3/90',

  SettingButtonFilledPrimary: /*tw*/ 'bg-brand/10 text-brand hover:bg-brand/20',
  SettingButtonFilledDanger: /*tw*/ 'bg-accent-danger/10 text-accent-danger hover:bg-accent-danger/20',
  SettingButtonFilledDefault: /*tw*/ 'bg-bg2 text-t1 hover:bg-bg3',

  SettingButtonDefaultPrimary: /*tw*/ 'bg-transparent text-brand border border-brand hover:bg-brand/10',
  SettingButtonDefaultDanger:
    /*tw*/ 'bg-transparent text-accent-danger border border-accent-danger hover:bg-accent-danger/10',
  SettingButtonDefaultDefault: /*tw*/ 'bg-transparent text-t1 border border-line-regular hover:bg-bg2',

  SettingButtonTextPrimary: /*tw*/ 'bg-transparent text-brand hover:bg-brand/10',
  SettingButtonTextDanger: /*tw*/ 'bg-transparent text-accent-danger hover:bg-accent-danger/10',
  SettingButtonTextDefault: /*tw*/ 'bg-transparent text-t1 hover:bg-bg2',

  SettingButtonDisabled: /*tw*/ 'opacity-50 cursor-not-allowed pointer-events-none',

  DatabaseListContainer: /*tw*/ 'mt-12',
  DatabaseListLoadingContainer: /*tw*/ 'text-center py-4',
  DatabaseListLoadingText: /*tw*/ 'text-t2',
  DatabaseListErrorContainer: /*tw*/ 'text-center py-4',
  DatabaseListErrorText: /*tw*/ 'text-accent-danger',
  DatabaseListEmptyContainer: /*tw*/ 'text-center py-4',
  DatabaseListEmptyText: /*tw*/ 'text-t2',

  TodaySectionHeading: /*tw*/ 'flex items-center gap-2 px-2 pt-5 pb-1.5',
  TodaySectionTitle: /*tw*/ 'text-xs font-semibold text-t3 uppercase tracking-wider',
  TodaySectionCount: /*tw*/ 'text-xs text-t3',

  BackButtonLink: /*tw*/ 'flex flex-row items-center h-12 no-underline text-t1 hover:bg-bg2 mb-2 rounded-lg px-3 w-fit',
  BackButtonContainer: /*tw*/ 'flex flex-row items-center gap-1',
  BackButtonIcon: /*tw*/ 'w-6 h-6 flex items-center justify-center',
  BackButtonLabel: /*tw*/ 'text-xl leading-5',

  DetailViewContainer: /*tw*/ 'h-full flex flex-col',
  DetailViewHeader: /*tw*/ 'group h-11 flex items-center gap-1 px-3 flex-shrink-0',
  DetailViewHeaderStatusIcon: /*tw*/ 'flex-shrink-0 flex items-center justify-center text-t2',
  DetailViewHeaderStatusBox: /*tw*/ 'size-4',
  DetailViewHeaderTitle:
    /*tw*/ 'flex-1 min-w-0 text-sm leading-5 font-semibold text-t1 bg-transparent border-none outline-none placeholder:text-t3 focus:bg-bg2 rounded-sm px-1 -mx-1',
  DetailViewHeaderActions: /*tw*/ 'flex items-center gap-0.5 flex-shrink-0',
  DetailViewHeaderMenuButton:
    /*tw*/ 'size-6 flex items-center justify-center rounded-md text-t3 hover:bg-bg3 hover:text-t1 transition-colors',
  DetailViewHeaderMenuIcon: /*tw*/ 'size-3.5',
  DetailViewContent: /*tw*/ 'flex-1 overflow-y-auto',
  DetailViewContentInner: /*tw*/ 'px-3 pt-1 pb-3',
  DetailViewNotesTextarea:
    'w-full min-h-6 px-0 py-0.5 mb-3 text-sm text-t1 placeholder:text-t3 bg-transparent border-none outline-none resize-none leading-5',
  DetailViewDivider: /*tw*/ 'h-px bg-line-light my-3',
  DetailViewSubtaskHeader: /*tw*/ 'flex items-center gap-1 mt-6 mb-3',
  DetailViewSubtaskHeaderTitle: /*tw*/ 'text-xs text-t2 font-medium',
  DetailViewSubtaskHeaderCount: /*tw*/ 'ml-auto text-xs text-t3 font-normal',
  DetailViewSubtaskProgressBar: /*tw*/ 'h-1 bg-bg3 rounded-full overflow-hidden mb-3',
  DetailViewSubtaskProgressFill: /*tw*/ 'h-full bg-accent-success rounded-full transition-all',
  DetailViewHint: /*tw*/ 'text-xs text-t3 mb-5',

  MarkdownPageLoading: /*tw*/ 'text-t2',
  MarkdownPageH1: /*tw*/ 'text-2xl font-medium text-t1 mb-4 mt-6',
  MarkdownPageH2: /*tw*/ 'text-xl font-medium text-t1 mb-3 mt-5',
  MarkdownPageH3: /*tw*/ 'text-lg font-medium text-t1 mb-2 mt-4',
  MarkdownPageP: /*tw*/ 'text-t1 mb-4 leading-relaxed',
  MarkdownPageLink: /*tw*/ 'text-accent no-underline hover:underline',
  MarkdownPageStrong: /*tw*/ 'text-t1 font-medium',
  MarkdownPageUl: /*tw*/ 'text-t1 my-4 list-disc pl-6',
  MarkdownPageOl: /*tw*/ 'text-t1 my-4 list-decimal pl-6',
  MarkdownPageLi: /*tw*/ 'my-1',
  MarkdownPageBlockquote: /*tw*/ 'text-t2 border-l-4 border-line-light pl-4 my-4',

  InfoItemContainer:
    /*tw*/ 'flex flex-row justify-between items-center gap-3 w-full h-5 font-normal text-balance leading-5',
  InfoItemLabel: /*tw*/ 'text-t3',
  InfoItemValueContainer: /*tw*/ 'flex items-center gap-2',
  InfoItemValue: /*tw*/ 'text-t1',
  InfoItemCopyButton: /*tw*/ 'text-t3 hover:text-t1 transition-colors',
  InfoItemCopyIcon: /*tw*/ 'w-4 h-4',

  CheckboxContainer: /*tw*/ 'flex items-center gap-2',
  CheckboxInputContainer: /*tw*/ 'relative',
  CheckboxInput: /*tw*/ 'sr-only',
  CheckboxBox: /*tw*/ 'flex h-5 w-4 items-center justify-center cursor-pointer',
  CheckboxBoxChecked: /*tw*/ 'text-brand',
  CheckboxBoxUnchecked: /*tw*/ 'text-t3',
  CheckboxStatusBox: /*tw*/ 'size-4',
  CheckboxLabel: /*tw*/ 'text-sm text-t3 leading-5',

  SettingsTitleContainer: /*tw*/ 'flex mb-8',
  SettingsTitleContent: /*tw*/ 'flex flex-col gap-1 flex-1',
  SettingsTitleHeading: /*tw*/ 'font-medium text-t1 leading-5',
  SettingsTitleHeadingLevel1: /*tw*/ 'text-2xl',
  SettingsTitleHeadingLevel2: /*tw*/ 'text-xl',
  SettingsTitleDescription: /*tw*/ 'text-base font-normal text-t3 leading-5',
  SettingsTitleActionContainer: /*tw*/ 'flex items-center',

  TaskListItemContainer:
    /*tw*/ 'group relative flex items-start gap-2 px-2 py-2 rounded-md outline-none cursor-pointer',
  TaskListItemContainerCompleted: /*tw*/ 'opacity-60',
  TaskListItemContainerWillDisappear: /*tw*/ 'opacity-50',
  TaskListItemContainerSelected: /*tw*/ 'bg-bg3',
  TaskListItemContainerArchived: /*tw*/ 'opacity-50!',
  TaskListItemContainerSelectedInactive: /*tw*/ 'bg-bg2',
  TaskListItemContainerEditing: /*tw*/ 'editing-border rounded-l-none',
  TaskListItemDragHandle:
    'absolute left-0 top-0 flex h-full w-3 -translate-x-full items-center justify-center text-t3 opacity-0 group-hover:opacity-100 transition-opacity',
  TaskListItemDragHandleIcon: /*tw*/ 'size-2.5',
  TaskListItemStatusButton: /*tw*/ 'flex h-5 w-4 flex-shrink-0 items-center justify-center outline-none',
  TaskListItemStatusBox: /*tw*/ 'size-4',
  TaskListItemStatusBoxCompleted: /*tw*/ 'text-t3',
  TaskListItemStatusBoxUncompleted: /*tw*/ 'text-t3',
  TaskListItemContent: /*tw*/ 'flex flex-col gap-1 flex-1 min-w-0',
  TaskListItemTitleRow: /*tw*/ 'flex items-center gap-2',
  TaskListItemTitleInput:
    'text-sm leading-5 flex-1 min-w-0 bg-transparent outline-none text-t1 truncate placeholder:text-t3 rounded-sm px-1 -mx-1',
  TaskListItemTitleInputCompleted: /*tw*/ 'line-through text-t3',
  TaskListItemTitleSpan: /*tw*/ 'cursor-text whitespace-nowrap overflow-hidden',
  TaskListItemTitleSpanPlaceHolder: /*tw*/ 'text-t3',
  TaskListItemIcon: /*tw*/ 'size-3.5 text-t3 flex-shrink-0 opacity-60',

  SubtaskItemContainer: /*tw*/ 'group flex items-center gap-2 -mx-2 px-2 py-1.5 rounded-md cursor-pointer',
  SubtaskItemContainerSelected: /*tw*/ 'bg-bg3',
  SubtaskItemContainerSelectedInactive: /*tw*/ 'bg-bg2',
  SubtaskItemContainerDefault: /*tw*/ '',
  SubtaskItemContainerEditing: /*tw*/ 'editing-border rounded-l-none',
  SubtaskItemStatusButton: 'flex size-4 flex-shrink-0 items-center justify-center',
  SubtaskItemInputWrapper: /*tw*/ 'flex-1 min-w-0',
  SubtaskItemInput:
    /*tw*/ 'w-full text-sm leading-5 text-t1 bg-transparent outline outline-1 outline-transparent rounded-sm px-1 -mx-1 truncate',
  SubtaskItemInputCanceled: /*tw*/ 'line-through text-t3',
  SubtaskItemInputCompleted: /*tw*/ 'line-through text-t3',
  SubtaskItemInputCreated: /*tw*/ 'text-t1',
  SubtaskItemDragHandle: /*tw*/ 'flex size-4 flex-shrink-0 items-center justify-center text-t3 cursor-grab',
  SubtaskItemDragHandleIcon: /*tw*/ 'size-3 text-t3',
  SubtaskItemDragging: /*tw*/ 'flex items-center h-8 bg-bg3 rounded opacity-50',

  ItemTagsListContainer: /*tw*/ 'flex min-w-0 flex-wrap items-center gap-2',

  DesktopProjectListItemLink: 'group relative no-underline flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer',
  DesktopProjectListItemDragging: /*tw*/ 'bg-bg3',
  DesktopProjectListItemDragHandle:
    'absolute left-0 top-0 flex h-full w-3 -translate-x-full items-center justify-center text-t3 opacity-0 group-hover:opacity-100 transition-opacity',
  DesktopProjectListItemStatusBox: /*tw*/ 'flex h-5 w-4 flex-shrink-0 items-center justify-center',
  DesktopProjectListItemStatusBoxIcon: /*tw*/ 'size-4',
  DesktopProjectListItemContent: /*tw*/ 'flex flex-col gap-1 flex-1 min-w-0',
  DesktopProjectListItemTitle: /*tw*/ 'flex-1 min-w-0 text-sm leading-5 font-normal text-t1 truncate px-1 -mx-1',
  DesktopPageContainer: /*tw*/ 'h-full w-full flex flex-col',
  DesktopPageContentPane: /*tw*/ 'w-full flex-1',
  DesktopPageMainPane: /*tw*/ 'h-full flex flex-col overflow-hidden',
  DesktopPageMainContent: /*tw*/ 'flex-1 overflow-y-auto px-3 pb-3',
  DesktopPageDetailPane: /*tw*/ 'border-l border-line-light',

  DetailPanelMinWidth: /*tw*/ 'w-45',
  DetailPanelMaxWidth: /*tw*/ 'w-128',
  DetailPanelPreferredWidth: /*tw*/ 'w-72',

  SettingsContentContainer: /*tw*/ 'w-full flex flex-col h-full',
  SettingsContentBackButton: /*tw*/ 'p-3',

  AreaPageNotFoundContainer: /*tw*/ 'h-full w-full bg-bg1 flex items-center justify-center',
  AreaPageNotFoundText: /*tw*/ 'text-t3 text-lg',

  TaskListSectionItemsContainer: /*tw*/ '',

  FutureProjectsPageContainer: /*tw*/ 'h-full w-full bg-bg1',
  FutureProjectsPageWrapper: /*tw*/ 'h-full flex flex-col',
  FutureProjectsPageContent: /*tw*/ 'flex-1 overflow-y-auto p-4',

  ProjectPageNotFoundContainer: /*tw*/ 'h-full w-full bg-bg1 flex items-center justify-center',
  ProjectPageNotFoundText: /*tw*/ 'text-t3 text-lg',

  ProjectTaskAreaContainer: /*tw*/ 'flex-1',

  DatabaseItemContainer: /*tw*/ 'flex flex-col gap-3 w-full',
  DatabaseItemMainRow: /*tw*/ 'flex items-center gap-3',
  DatabaseItemContentWrapper: /*tw*/ 'flex items-center gap-2 flex-1',
  DatabaseItemIconWrapper: /*tw*/ 'w-11 h-11 bg-bg3 rounded-lg flex items-center justify-center flex-shrink-0',
  DatabaseItemIcon: /*tw*/ 'size-5 flex items-center justify-center',
  DatabaseItemContent: /*tw*/ 'flex flex-col gap-1 flex-1',
  DatabaseItemTitleRow: /*tw*/ 'flex items-center gap-2 h-6',
  DatabaseItemTitle: /*tw*/ 'text-base font-medium text-t1 leading-6',
  DatabaseItemCurrentBadge: /*tw*/ 'text-sm font-normal text-brand leading-4.5',
  DatabaseItemDescriptionRow: /*tw*/ 'flex items-center gap-2',
  DatabaseItemDescription: /*tw*/ 'text-sm font-normal text-t3 leading-4.5',
  DatabaseItemActionButtons: /*tw*/ 'flex items-center gap-2 shrink-0',
  DatabaseItemPropertiesSection: /*tw*/ 'shrink-0',
  DatabaseItemProperty: /*tw*/ 'flex flex-col gap-1 h-11.5 justify-center',
  DatabaseItemPropertyLabel: /*tw*/ 'text-base font-medium text-t1 leading-6',
  DatabaseItemPropertyValue: /*tw*/ 'text-sm font-normal text-t3 leading-4.5',

  SpaceMedium: /*tw*/ 'h-8',
  SpaceLarge: /*tw*/ 'h-16',

  AccountSettingsButtonContainer: /*tw*/ 'space-y-3',

  SchedulePageContainer: /*tw*/ 'h-full w-full bg-bg1',
  SchedulePageLayout: /*tw*/ 'h-full flex flex-col',
  SchedulePageScrollArea: /*tw*/ 'flex-1 overflow-y-auto',
  SchedulePageContent: /*tw*/ 'px-3 pb-3',
  SchedulePageGroupContainer: /*tw*/ 'space-y-0',
  SchedulePageGroupHeader: /*tw*/ 'flex items-baseline gap-2 px-2 pt-5 pb-1.5',
  SchedulePageGroupTitle: /*tw*/ 'text-sm font-semibold text-t1',
  SchedulePageGroupSubtitle: /*tw*/ 'text-xs text-t3',
  SchedulePageItemList: /*tw*/ 'space-y-0',
  SchedulePageEmptyState: /*tw*/ 'text-center py-12',
  SchedulePageEmptyText: /*tw*/ 'text-t3 text-lg',
  CompletedPageGroupTitle: /*tw*/ 'text-xs font-semibold text-t3 uppercase tracking-wider',

  DragOverlayContent: /*tw*/ 'bg-bg1 shadow-sm rounded-lg',

  EmptyStateContainer: /*tw*/ 'text-center py-12 text-t3',
  EmptyStateText: /*tw*/ 'text-sm',

  SubtaskListCreateButton:
    'appearance-none bg-transparent border-none p-0 w-full flex items-center gap-2 pt-1 text-t3 text-left cursor-pointer hover:text-t2 transition-colors',
  SubtaskListCreateButtonIconContainer: /*tw*/ 'size-3 flex items-center justify-center',
  SubtaskListCreateButtonIcon: /*tw*/ 'size-3',
  SubtaskListCreateButtonLabel: /*tw*/ 'text-xs',

  SidebarLayoutContainer: /*tw*/ 'h-screen w-screen relative safe-top bg-bg2',
  SidebarLayoutPaneWrapper: /*tw*/ 'p-2 pl-0 bg-bg2',
  SidebarLayoutContent: /*tw*/ 'h-full overflow-hidden rounded-lg border border-line-light bg-bg1',
  SidebarLayoutContentCollapsedPadding: /*tw*/ 'pl-4',
  SidebarLayoutContentShowDragHandle: /*tw*/ 'pt-0',

  MultipleSelectionViewContainer: /*tw*/ 'h-full flex flex-col bg-bg1',
  MultipleSelectionViewContent: /*tw*/ 'flex items-center justify-center flex-1',
  MultipleSelectionViewText: /*tw*/ 'text-t2 text-center',

  DesktopHeadingListItemContainer: /*tw*/ 'group relative',
  DesktopHeadingListItemContainerDragging: /*tw*/ 'bg-bg3 rounded-lg',
  DesktopHeadingListItemArchived: /*tw*/ 'opacity-50! line-through',
  DesktopHeadingListItemContent:
    'group relative mt-4 flex w-full items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors',
  DesktopHeadingListItemContentFocused: /*tw*/ 'bg-bg3',
  DesktopHeadingListItemContentSelected: /*tw*/ 'bg-bg3',
  DesktopHeadingListItemContentEditing: /*tw*/ 'editing-border',
  DesktopHeadingListItemContentHidden: /*tw*/ 'opacity-0',
  DesktopHeadingListItemDragHandle:
    'absolute left-0 top-0 flex h-full w-3 -translate-x-full items-center justify-center text-t3 opacity-0 transition-opacity group-hover:opacity-100',
  DesktopHeadingListItemDragHandleIcon: /*tw*/ 'size-2.5',
  DesktopHeadingListItemInput:
    /*tw*/ 'flex-1 min-w-0 bg-transparent outline-none text-xs font-semibold uppercase tracking-wider text-t3 placeholder:text-t3 rounded-sm px-1 -mx-1 truncate',

  DragHandleContainer: /*tw*/ 'flex-1 h-full',

  DesktopMessageContainer: /*tw*/ 'fixed top-6 right-6 flex flex-col items-end pointer-events-none',
  DesktopMessageContent:
    'bg-bg1 text-t1 border-line-regular border rounded-lg shadow-lg backdrop-blur-sm min-w-80 max-w-md p-4 pointer-events-auto transform transition-all duration-200 ease-out',
  DesktopMessageVisible: /*tw*/ 'translate-x-0 opacity-100',
  DesktopMessageHidden: /*tw*/ 'translate-x-full opacity-0',
  DesktopMessageInner: /*tw*/ 'flex items-start gap-3',
  DesktopMessageIcon: /*tw*/ 'flex-shrink-0 mt-0.5 size-5 flex items-center justify-center',
  DesktopMessageIconSuccess: /*tw*/ 'text-accent-success',
  DesktopMessageIconError: /*tw*/ 'text-accent-danger',
  DesktopMessageIconInfo: /*tw*/ 'text-brand',
  DesktopMessageTextContainer: /*tw*/ 'flex-1 min-w-0 gap-1 flex flex-col',
  DesktopMessageText: /*tw*/ 'text-medium font-medium leading-5 break-words',
  DesktopMessageDescription: /*tw*/ 'text-sm font-medium leading-5 break-words text-t3',
  DesktopMessageCloseButton:
    'size-5 flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0 ml-2 text-t3',
  DesktopMessageUndo: /*tw*/ 'px-8 text-brand mt-2 text-sm',
  DesktopMenuBackdrop: /*tw*/ 'fixed inset-0',
  DesktopMenuContainer: /*tw*/ 'fixed outline-none w-[180px]',
  DesktopMenuContent:
    /*tw*/ 'bg-bg1 border border-line-regular rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-1 w-full',
  DesktopMenuDivider: /*tw*/ 'h-px bg-line-light mx-1 my-1',

  DesktopMenuItemBase: /*tw*/ 'w-full flex items-center px-2 py-1.5 text-left text-xs rounded-sm transition-colors',
  DesktopMenuItemEnabled: /*tw*/ 'text-t1 hover:bg-bg3',
  DesktopMenuItemDisabled: /*tw*/ 'text-t3 cursor-not-allowed',
  DesktopMenuItemActive: /*tw*/ 'bg-bg3',
  DesktopMenuItemDanger: /*tw*/ 'text-accent-danger hover:bg-accent-danger/10',

  DesktopMenuItemContent: /*tw*/ 'flex items-center gap-2 flex-1 min-w-0',
  DesktopMenuItemIcon: /*tw*/ 'size-3.5 flex items-center justify-center flex-shrink-0',
  DesktopMenuItemIconEmpty: /*tw*/ 'size-3.5 flex-shrink-0',
  DesktopMenuItemLabel: /*tw*/ 'flex-1 truncate',
  DesktopMenuItemCheckbox: /*tw*/ 'size-3.5 flex items-center justify-center flex-shrink-0',
  DesktopMenuItemCheckIcon: /*tw*/ 'size-3.5 flex-shrink-0 text-t2',
  DesktopMenuItemChevron: /*tw*/ 'size-3.5 text-t3',

  DesktopSubmenuContainer:
    /*tw*/ 'fixed bg-bg1 border border-line-regular rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-1',
  DesktopSubmenuItem:
    /*tw*/ 'w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs rounded-sm transition-colors',

  OverlayBackdrop: /*tw*/ 'fixed inset-0 flex items-center justify-center',
  OverlayBackgroundMask: /*tw*/ 'absolute inset-0 bg-black opacity-45',
  OverlayContainer: /*tw*/ 'bg-bg1 rounded-lg shadow-2xl flex flex-col min-w-130 mx-4 relative p-5',

  OverlayContainerBackdrop: /*tw*/ 'fixed inset-0',
  OverlayContainerContent:
    /*tw*/ 'fixed bg-bg1 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-line-regular',
  OverlayContainerFilterWrapper: /*tw*/ 'px-2 py-1.5 border-b border-line-light',
  OverlayContainerFilterInput: /*tw*/ 'w-full bg-transparent outline-none text-xs text-t1 placeholder:text-t3',
  OverlayHeader: /*tw*/ 'flex items-center justify-between order-b border-bg2 mb-6',
  OverlayTitle: /*tw*/ 'text-xl leading-6 font-medium text-t1',
  OverlayCloseButton: /*tw*/ 'text-t3 transition-colors size-6',
  OverlayContent: /*tw*/ '',
  OverlayFooter: /*tw*/ 'flex justify-end gap-3 rounded-b-lg',

  DesktopDialogDescription: /*tw*/ 'text-sm text-t3 leading-4.5 font-normal',
  DesktopDialogActionsContainer: /*tw*/ 'flex flex-col gap-2 mt-5',

  TagEditorOverlayContainer: /*tw*/ 'w-[224px]',
  TagEditorOverlayCreateButton:
    /*tw*/ 'flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer rounded-sm text-t2 hover:bg-bg3 hover:text-t1 transition-colors mx-1',
  TagEditorOverlayCreateButtonActive: /*tw*/ 'bg-bg3 text-t1',
  TagEditorOverlayCreateButtonIcon: /*tw*/ 'size-3.5 flex items-center justify-center flex-shrink-0',
  TagEditorOverlayScrollContainer: /*tw*/ 'py-1 overflow-y-auto max-h-[224px]',
  TagEditorOverlayTagItem:
    /*tw*/ 'flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer rounded-sm text-t1 transition-colors mx-1',
  TagEditorOverlayTagItemActive: /*tw*/ 'bg-bg3',
  TagEditorOverlayTagLabel: /*tw*/ 'flex-1 truncate',
  TagEditorOverlayTagCheck: /*tw*/ 'size-3 text-brand flex-shrink-0',
  TagEditorOverlayEmptyHint: /*tw*/ 'px-3 py-2 text-xs text-t3 text-center',

  TreeSelectOverlayMoveTargetContainer:
    /*tw*/ 'w-56 bg-bg1 border border-line-regular rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden',
  TreeSelectOverlayAreaPickerContainer:
    /*tw*/ 'w-48 bg-bg1 border border-line-regular rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden',
  TreeSelectOverlayContent: /*tw*/ 'outline-none',
  TreeSelectOverlayInputWrap: /*tw*/ 'px-2 py-1.5 border-b border-line-light',
  TreeSelectOverlayInput: /*tw*/ 'w-full bg-transparent outline-none text-xs text-t1 placeholder:text-t3',
  TreeSelectOverlayList: /*tw*/ 'max-h-64 overflow-y-auto py-1',
  TreeSelectOverlayAreaList: /*tw*/ 'max-h-48 overflow-y-auto py-1',
  TreeSelectOverlayAction:
    /*tw*/ 'flex justify-start text-left items-center gap-1.5 px-2 py-1.5 text-xs cursor-pointer rounded-sm text-t2 hover:bg-bg3 hover:text-t1 transition-colors mx-1',
  TreeSelectOverlayAreaAction:
    /*tw*/ 'flex justify-start text-left items-center gap-2 px-2 py-1.5 text-xs cursor-pointer rounded-sm text-t2 hover:bg-bg3 hover:text-t1 transition-colors mx-1',
  TreeSelectOverlayActionIcon: /*tw*/ 'size-3.5 flex items-center justify-center flex-shrink-0 text-t3',
  TreeSelectOverlayDivider: /*tw*/ 'h-px bg-line-light mx-1 my-1',
  TreeSelectOverlayAreaRow:
    /*tw*/ 'flex w-[calc(100%-0.5rem)] justify-start text-left items-center gap-1.5 px-2 py-1.5 text-xs rounded-sm text-t1 hover:bg-bg3 transition-colors mx-1',
  TreeSelectOverlayAreaRowSelectable: /*tw*/ 'cursor-pointer',
  TreeSelectOverlayAreaRowSelected: /*tw*/ 'bg-brand/10 text-brand hover:bg-brand/10',
  TreeSelectOverlayAreaIcon: /*tw*/ 'size-3.5 flex items-center justify-center flex-shrink-0 text-t3',
  TreeSelectOverlayAreaLabel: /*tw*/ 'flex-1 font-medium truncate',
  TreeSelectOverlayChevronButton:
    /*tw*/ 'size-4 flex items-center justify-center rounded-sm hover:bg-bg3/80 flex-shrink-0',
  TreeSelectOverlayChevron: /*tw*/ 'size-3 text-t3 transition-transform flex-shrink-0',
  TreeSelectOverlayChevronExpanded: /*tw*/ 'rotate-90',
  TreeSelectOverlayProjectRow:
    /*tw*/ 'flex w-[calc(100%-0.5rem)] justify-start text-left items-center gap-1.5 pl-7 pr-2 py-1.5 text-xs cursor-pointer rounded-sm text-t1 hover:bg-bg3 transition-colors mx-1',
  TreeSelectOverlayProjectRowSelected: /*tw*/ 'bg-brand/10 text-brand hover:bg-brand/10',
  TreeSelectOverlayProjectIcon: /*tw*/ 'size-3 flex items-center justify-center flex-shrink-0 text-t3',
  TreeSelectOverlayProjectLabel: /*tw*/ 'flex-1 truncate',
  TreeSelectOverlaySearchRow:
    /*tw*/ 'flex w-[calc(100%-0.5rem)] justify-start text-left items-center gap-1.5 px-2 py-1.5 text-xs cursor-pointer rounded-sm text-t1 hover:bg-bg3 transition-colors mx-1',
  TreeSelectOverlaySearchLabel: /*tw*/ 'flex-1 truncate',
  TreeSelectOverlayAreaItem:
    /*tw*/ 'flex w-[calc(100%-0.5rem)] justify-start text-left items-center gap-2 px-2 py-1.5 text-xs cursor-pointer rounded-sm text-t1 hover:bg-bg3 transition-colors mx-1',
  TreeSelectOverlayAreaItemSelected: /*tw*/ 'bg-brand/10 text-brand hover:bg-brand/10',
  TreeSelectOverlayAreaItemIcon: /*tw*/ 'size-3.5 flex items-center justify-center flex-shrink-0 text-t3',
  TreeSelectOverlayAreaItemLabel: /*tw*/ 'flex-1 truncate',
  TreeSelectOverlayEmpty: /*tw*/ 'px-3 py-2 text-xs text-t3 text-center',

  RecurringTaskSettingsOverlayField: /*tw*/ 'mb-4',
  RecurringTaskSettingsOverlayLabel: /*tw*/ 'block text-sm font-medium text-t2 mb-2',
  RecurringTaskSettingsOverlayInput:
    /*tw*/ 'w-full px-3 py-2 border border-line-regular rounded bg-bg1 text-t1 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
  RecurringTaskSettingsOverlayExplanation: /*tw*/ 'text-sm text-t3 mt-1',
  RecurringTaskSettingsOverlayCalculation: /*tw*/ 'text-sm text-brand mt-1',

  CreateDatabaseOverlayFormContainer: /*tw*/ 'flex flex-col gap-3',
  CreateDatabaseOverlayErrorText: /*tw*/ 'text-accent-danger text-sm',

  DatePickerOverlayContainer: /*tw*/ 'w-[240px] overflow-hidden',
  DatePickerCalendarHeaderContainer: /*tw*/ 'flex justify-between items-center px-2 pt-2 pb-1',
  DatePickerCalendarHeaderTitle: /*tw*/ 'text-xs font-medium text-t1',
  DatePickerCalendarNavContainer: /*tw*/ 'flex items-center gap-0.5',
  DatePickerCalendarNavButton:
    /*tw*/ 'size-5 flex items-center justify-center rounded-sm text-t3 hover:bg-bg3 hover:text-t1 transition-colors',
  DatePickerOverlayQuickActionsContainer: /*tw*/ 'flex flex-col py-1',
  DatePickerOverlayQuickActionButton:
    /*tw*/ 'flex items-center gap-2 px-2 py-1.5 text-xs text-t1 cursor-pointer hover:bg-bg3 transition-colors',
  DatePickerOverlayQuickActionIcon: /*tw*/ 'size-4 text-t3 flex-shrink-0',
  DatePickerCalendarNavIcon: /*tw*/ 'size-3.5',
  DatePickerCalendarCalendarWrapper: /*tw*/ 'px-2 pb-2',
  DatePickerCalendarMonthGrid: /*tw*/ 'grid grid-cols-7 gap-0.5 bg-bg1',
  DatePickerCalendarDayButton:
    /*tw*/ 'h-7 rounded-sm text-xs flex items-center justify-center hover:bg-bg3 transition-colors',
  DatePickerCalendarDaySelected: /*tw*/ 'bg-brand text-white hover:bg-brand',
  DatePickerCalendarDayNotCurrentMonth: /*tw*/ 'text-t4',
  DatePickerCalendarDayToday: /*tw*/ 'text-brand',
  DatePickerCalendarDayCurrentMonth: /*tw*/ 'text-t1',
  DatePickerCalendarWeekdayGrid: /*tw*/ 'grid grid-cols-7 gap-0.5 pt-1 pb-0.5',
  DatePickerCalendarWeekdayCell: /*tw*/ 'h-5 flex items-center justify-center text-[10px] text-t3',

  // NotesField Markdown styles
  NotesMarkdownH1: /*tw*/ 'text-lg font-bold mb-2 mt-4 first:mt-0',
  NotesMarkdownH2: /*tw*/ 'text-base font-bold mb-2 mt-3 first:mt-0',
  NotesMarkdownH3: /*tw*/ 'text-sm font-bold mb-1 mt-2 first:mt-0',
  NotesMarkdownH4: /*tw*/ 'text-sm font-semibold mb-1 mt-2 first:mt-0',
  NotesMarkdownP: /*tw*/ 'leading-relaxed',
  NotesMarkdownOl: /*tw*/ 'list-decimal ml-4 mb-2 space-y-1',
  NotesMarkdownUl: /*tw*/ 'list-disc ml-4 mb-2 space-y-1',
  NotesMarkdownLi: /*tw*/ 'leading-relaxed',
  NotesMarkdownLink: /*tw*/ 'text-brand underline break-all hover:text-brand/80 transition-colors',
  NotesMarkdownBlockquote: /*tw*/ 'pl-4 border-l-4 border-line-light bg-bg2/50 py-2 mb-2 rounded-r',
  NotesMarkdownCode: /*tw*/ 'bg-bg2 px-1 py-0.5 rounded text-sm font-mono',
  NotesMarkdownPre: /*tw*/ 'bg-bg2 p-3 rounded mb-2 overflow-x-auto text-sm',
  NotesFieldContainer: /*tw*/ 'overflow-y-auto max-h-80',

  // CommandPalette styles
  CommandPaletteOverlayBackdrop: /*tw*/ 'fixed inset-0 flex items-start justify-center pt-30',
  CommandPaletteOverlayBackgroundMask: /*tw*/ 'absolute inset-0 bg-black opacity-45',
  CommandPaletteOverlayContainer:
    /*tw*/ 'bg-bg1 rounded-lg shadow-2xl flex flex-col w-[720px] max-w-[calc(100vw-32px)] relative',
  CommandPaletteInputContainer: /*tw*/ 'flex items-center gap-3 px-6 h-14',
  CommandPaletteInput: /*tw*/ 'flex-1 bg-transparent text-base text-t1 placeholder-t3 focus:outline-none font-normal',
  CommandPaletteResultsContainer: /*tw*/ 'max-h-96 overflow-y-auto p-3',
  CommandPaletteResultsEmpty: /*tw*/ 'flex items-center justify-center h-24 text-t3 text-base',
  CommandPaletteResultItem:
    /*tw*/ 'flex items-start gap-2 px-3 py-3 rounded-md hover:bg-bg2 cursor-pointer transition-colors',
  CommandPaletteResultItemSelected: /*tw*/ 'bg-bg2',
  CommandPaletteResultItemIcon: /*tw*/ 'size-4 text-t3 flex-shrink-0 flex items-center justify-center',
  CommandPaletteResultItemTitle: /*tw*/ 'text-sm text-t1 truncate leading-4 h-4',
};

export type DesktopThemeDefinition = typeof desktopStyles;

formatTheme(desktopStyles);
