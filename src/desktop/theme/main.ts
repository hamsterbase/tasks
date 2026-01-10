import { formatTheme } from '@/base/common/formatTheme';

export const desktopStyles = {
  sidebarContainerStyle: /*tw*/ 'w-full h-full pl-2 pt-2 pr-4 flex flex-col',
  sidebarContainerNoPaddingTop: /*tw*/ 'pt-0!',
  sidebarBackground: /*tw*/ 'bg-bg3',
  SidebarMinWidth: /*tw*/ 'w-45',
  SidebarMaxWidth: /*tw*/ 'w-128',
  SidebarPreferredWidth: /*tw*/ 'w-60',

  SidebarHeaderContainer: /*tw*/ 'flex items-end justify-end h-11 mb-2',
  SidebarHeaderSearchButton:
    'flex items-center justify-center hover:bg-bg1 hover:text-brand rounded-md transition-colors size-9 text-t3',
  SidebarHeaderSearchButtonIcon: /*tw*/ 'size-5',

  SidebarMenuItemContainer: /*tw*/ 'space-y-2',
  SidebarMenuItem: /*tw*/ 'h-9 px-3 flex rounded-lg text-base leading-5 items-center gap-3 group',
  SidebarMenuItemActive: /*tw*/ 'bg-brand text-white',
  SidebarMenuItemInactive: /*tw*/ 'text-t1 hover:bg-bg1',
  SidebarMenuItemIcon: /*tw*/ 'size-5 flex items-center justify-center flex-shrink-0',
  SidebarMenuItemLabel: /*tw*/ 'flex-1 truncate min-w-0',
  SidebarMenuItemBadgePrimary:
    'bg-stress-red min-w-5 text-sm leading-3.5 h-5 rounded-full text-white flex items-center justify-center px-1.5',
  SidebarMenuItemBadgeSecondaryActive: /*tw*/ 'text-white',
  SidebarMenuItemBadgeSecondary: /*tw*/ 'text-t3',
  SidebarMenuDivider: /*tw*/ 'bg-line-bold h-0.25',

  SidebarProjectAreaList: /*tw*/ 'flex-1 overflow-y-auto py-2',
  SidebarProjectAreaListNoTopPadding: /*tw*/ 'pt-0',

  SidebarAreaToggleButton:
    'flex-shrink-0 size-5 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center',
  SidebarAreaToggleButtonActive: /*tw*/ 'text-white',
  SidebarAreaToggleButtonInactive: /*tw*/ 'text-t3',
  SidebarAreaGap: /*tw*/ 'mt-3',

  SidebarProjectItemActive: /*tw*/ 'bg-brand text-white',
  SidebarProjectItemInactive: /*tw*/ 'text-t2 hover:bg-bg1',
  SidebarProjectItemDueDateDanger: /*tw*/ 'text-stress-red',
  SidebarProjectItemDueDateActive: /*tw*/ 'text-white',
  SidebarProjectItemDueDateInactive: /*tw*/ 'text-t3',

  SidebarActionsContainer: /*tw*/ 'flex gap-1 h-15 items-center',
  SidebarCreateButton:
    'flex-1 flex items-center gap-2 px-3 py-2 text-sm text-t1 hover:bg-bg1 hover:text-brand rounded-md transition-colors h-11',
  SidebarCreateButtonIcon: /*tw*/ 'size-5',
  SidebarSettingsButton:
    'flex items-center justify-center hover:bg-bg hover:bg-bg1 hover:text-brand rounded-md transition-colors size-11 text-t3',
  SidebarSettingsButtonIcon: /*tw*/ 'size-5',

  EntityHeaderContainer:
    /*tw*/ 'min-h-15 flex items-start justify-between px-5 py-3.75 border-b border-line-regular bg-bg1',
  EntityHeaderPanelIconContainer: /*tw*/ 'flex items-center size-7.5 text-t2 mr-3 justify-center',
  EntityHeaderPanelIcon: /*tw*/ 'size-5',
  EntityHeaderContentWrapper: /*tw*/ 'flex items-start gap-3 flex-1 min-w-0',
  EntityHeaderIconContainer: /*tw*/ 'size-7.5 flex items-center justify-center',
  EntityHeaderIconButton: /*tw*/ 'size-6 flex items-center justify-center',
  EntityHeaderEditableTextArea:
    'flex-1 text-xl leading-7.5 font-medium text-t1 resize-none bg-transparent border-none outline-none px-0 py-0',
  EntityHeaderTitle: /*tw*/ 'text-xl leading-7.5 font-medium text-t1 truncate',
  EntityHeaderActionsContainer: /*tw*/ 'flex items-center gap-5',
  EntityHeaderActionButton:
    'flex items-center gap-2 px-1.5 py-1 text-sm text-t2 hover:bg-bg3 rounded-sm transition-colors h-7',
  EntityHeaderActionIcon: /*tw*/ 'size-5 flex items-center content-center',
  EntityHeaderActionLabel: /*tw*/ 'text-base leading-5 font-normal',

  ClearSelectionButton:
    'border-t border-line-regular h-15 flex items-center text-base text-t3 justify-center cursor-pointer',

  SelectionFieldButton: /*tw*/ 'flex items-start py-3 gap-2 text-t2 min-h-11 hover:bg-bg3 px-3 rounded-lg w-full',
  SelectionFieldIcon: /*tw*/ 'size-5 shrink-0 flex items-center justify-center',
  SelectionFieldPlaceholderText: /*tw*/ 'text-base leading-5',

  RemindersFieldContainer: /*tw*/ 'ml-7',
  RemindersFieldDateText: /*tw*/ 'text-t1 text-base leading-5',
  RemindersFieldTimeText: /*tw*/ 'text-t2 text-sm leading-5',
  RemindersFieldPastText: /*tw*/ 'line-through',

  RecurringRuleContent: /*tw*/ 'flex flex-col items-start gap-6 text-base leading-5',

  TaskLocationFieldLocationText: /*tw*/ 'text-base leading-5 text-t1 truncate',

  TaskDateFieldDateContainer: /*tw*/ 'flex items-baseline gap-1.5 text-base leading-5',
  TaskDateFieldDateNormal: /*tw*/ 'text-t1',
  TaskDateFieldDateOverdue: /*tw*/ 'text-stress-red',
  TaskDateFieldRemainingText: /*tw*/ 'text-t3',

  TagsFieldEmptyButton: /*tw*/ 'flex items-center py-2 gap-2 text-t2 h-11 hover:bg-bg3 px-3 rounded-lg w-full',
  TagsFieldWithTagsButton: /*tw*/ 'flex items-start py-3 gap-2 text-t2 min-h-11 hover:bg-bg3 px-3 rounded-lg w-full',
  TagsFieldIcon: /*tw*/ 'size-5',
  TagsFieldIconWithTags: /*tw*/ 'size-5 flex-shrink-0',
  TagsFieldText: /*tw*/ 'text-base leading-5',
  TagsFieldTagsContainer: /*tw*/ 'flex flex-wrap gap-3 justify-start',
  TagsFieldTag: /*tw*/ 'text-brand rounded-sm text-base px-2 h-5 flex items-center bg-brand/15',

  SubtaskListTitle: /*tw*/ 'flex items-center px-3 gap-2.5 h-14',
  SubtaskListTitleIcon: /*tw*/ 'size-5 flex-shrink-0 text-t1 flex items-center justify-center',
  SubtaskListTitleText: /*tw*/ 'flex-1 text-base leading-5 font-normal text-t1',

  InboxTaskInputWrapper: /*tw*/ 'pt-3 mb-3',
  InboxTaskInputContainer: /*tw*/ 'flex flex-row items-center p-3 gap-3 h-11 bg-bg3 rounded-lg',
  InboxTaskInputIcon: /*tw*/ 'flex-none size-5 text-t3',
  InboxTaskInputField: /*tw*/ 'flex-1 bg-transparent text-base text-t1 placeholder-t3 focus:outline-none font-normal',

  InboxAreaContainer: /*tw*/ 'flex items-center gap-6',
  InboxAreaInputWrapper: /*tw*/ 'flex-1',
  InboxAreaHeadingButton: /*tw*/ 'relative size-11 bg-bg3 flex items-center justify-center rounded-lg',
  InboxAreaHeadingIcon: /*tw*/ 'size-5 text-t3',
  InboxAreaHeadingBadge:
    /*tw*/ 'absolute top-5.5 right-2.5 w-2 h-2 bg-primary rounded-full flex items-center justify-center',
  InboxAreaHeadingBadgeIcon: /*tw*/ 'text-t3 text-xs leading-none',

  ItemTagContainer: /*tw*/ 'flex text-sm leading-5 h-5 items-center gap-0.5 rounded-sm max-w-30 text-t2',
  ItemTagSelected: /*tw*/ '',
  ItemTagUnselected: /*tw*/ '',
  ItemTagIcon: /*tw*/ 'size-3 flex items-center content-center flex-shrink-0',
  ItemTagLabel: /*tw*/ 'truncate',

  AuthFormContainer: /*tw*/ 'flex flex-col gap-9',
  AuthFormSection: /*tw*/ 'flex flex-col gap-3',
  AuthFormErrorMessage: /*tw*/ 'text-stress-red text-base',
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
  SettingButtonSolidDanger: /*tw*/ 'bg-stress-red text-white hover:bg-stress-red/90',
  SettingButtonSolidDefault: /*tw*/ 'bg-bg3 text-white hover:bg-bg3/90',

  SettingButtonFilledPrimary: /*tw*/ 'bg-brand/10 text-brand hover:bg-brand/20',
  SettingButtonFilledDanger: /*tw*/ 'bg-stress-red/10 text-stress-red hover:bg-stress-red/20',
  SettingButtonFilledDefault: /*tw*/ 'bg-bg2 text-t1 hover:bg-bg3',

  SettingButtonDefaultPrimary: /*tw*/ 'bg-transparent text-brand border border-brand hover:bg-brand/10',
  SettingButtonDefaultDanger: /*tw*/ 'bg-transparent text-stress-red border border-stress-red hover:bg-stress-red/10',
  SettingButtonDefaultDefault: /*tw*/ 'bg-transparent text-t1 border border-line-regular hover:bg-bg2',

  SettingButtonTextPrimary: /*tw*/ 'bg-transparent text-brand hover:bg-brand/10',
  SettingButtonTextDanger: /*tw*/ 'bg-transparent text-stress-red hover:bg-stress-red/10',
  SettingButtonTextDefault: /*tw*/ 'bg-transparent text-t1 hover:bg-bg2',

  SettingButtonDisabled: /*tw*/ 'opacity-50 cursor-not-allowed pointer-events-none',

  DatabaseListContainer: /*tw*/ 'mt-12',
  DatabaseListLoadingContainer: /*tw*/ 'text-center py-4',
  DatabaseListLoadingText: /*tw*/ 'text-t2',
  DatabaseListErrorContainer: /*tw*/ 'text-center py-4',
  DatabaseListErrorText: /*tw*/ 'text-stress-red',
  DatabaseListEmptyContainer: /*tw*/ 'text-center py-4',
  DatabaseListEmptyText: /*tw*/ 'text-t2',

  TitleContentSectionContainer: /*tw*/ 'flex flex-col pt-5',
  TitleContentSectionHeader: /*tw*/ 'flex flex-row justify-center items-center px-3 gap-2 w-full h-11 flex-none',
  TitleContentSectionTitle: /*tw*/ 'flex-1 text-base leading-5 font-normal text-t1 truncate',
  TitleContentSectionAction: /*tw*/ 'flex-shrink-0',
  TitleContentSectionActionButton:
    'px-3 py-1 h-11 text-base rounded-lg hover:bg-bg2 transition-colors text-t2 hover:text-t1',

  BackButtonLink: /*tw*/ 'flex flex-row items-center h-12 no-underline text-t1 hover:bg-bg2 mb-2 rounded-lg px-3 w-fit',
  BackButtonContainer: /*tw*/ 'flex flex-row items-center gap-1',
  BackButtonIcon: /*tw*/ 'w-6 h-6 flex items-center justify-center',
  BackButtonLabel: /*tw*/ 'text-xl leading-5',

  DetailViewContainer: /*tw*/ 'h-full flex flex-col',
  DetailViewHeader: /*tw*/ 'min-h-15 flex px-5 py-3.75 gap-5 items-start justify-between border-b border-line-regular',
  DetailViewHeaderTitle: /*tw*/ 'flex-1 text-xl leading-7.5 font-medium outline-none',
  DetailViewHeaderMenuButton: /*tw*/ 'size-6 h-7.6 flex items-center',
  DetailViewHeaderMenuIcon: /*tw*/ 'size-6 text-t3',
  DetailViewContent: /*tw*/ 'flex-1 overflow-y-auto',
  DetailViewContentInner: /*tw*/ 'p-2 space-y-2',
  DetailViewNotesTextarea:
    'w-full p-3 outline-none resize-none text-base leading-5 placeholder:text-t3 caret-brand break-all',
  DetailViewDivider: /*tw*/ 'h-px bg-line-regular',

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
  CheckboxBox: /*tw*/ 'size-5 cursor-pointer',
  CheckboxBoxChecked: /*tw*/ 'text-brand',
  CheckboxBoxUnchecked: /*tw*/ 'text-t3',
  CheckboxStatusBox: /*tw*/ 'size-full',
  CheckboxLabel: /*tw*/ 'text-base text-t3 leading-5',

  SettingsTitleContainer: /*tw*/ 'flex mb-8',
  SettingsTitleContent: /*tw*/ 'flex flex-col gap-1 flex-1',
  SettingsTitleHeading: /*tw*/ 'font-medium text-t1 leading-5',
  SettingsTitleHeadingLevel1: /*tw*/ 'text-2xl',
  SettingsTitleHeadingLevel2: /*tw*/ 'text-xl',
  SettingsTitleDescription: /*tw*/ 'text-base font-normal text-t3 leading-5',
  SettingsTitleActionContainer: /*tw*/ 'flex items-center',

  TaskListItemContainer: /*tw*/ 'group relative flex items-start gap-3 px-3 py-3 rounded-md outline-none',
  TaskListItemContainerWillDisappear: /*tw*/ 'opacity-50',
  TaskListItemContainerSelected: /*tw*/ 'bg-bg3',
  TaskListItemContainerArchived: /*tw*/ 'opacity-50!',
  TaskListItemContainerSelectedInactive: /*tw*/ 'bg-bg2',
  TaskListItemContainerEditing: /*tw*/ 'editing-border rounded-l-none',
  TaskListItemDragHandle:
    'absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-60 transition-opacity',
  TaskListItemStatusButton: /*tw*/ 'flex-shrink-0 size-5 outline-none',
  TaskListItemStatusBox: /*tw*/ 'size-5',
  TaskListItemStatusBoxCompleted: /*tw*/ 'text-brand',
  TaskListItemStatusBoxUncompleted: /*tw*/ 'text-t3',
  TaskListItemContent: /*tw*/ 'flex flex-col gap-2 flex-1 min-w-0',
  TaskListItemTitleRow: /*tw*/ 'flex items-center gap-2',
  TaskListItemTitleInput:
    'text-base leading-5 flex-1 bg-transparent border-none outline-none text-ellipsis text-t1 overflow-hidden',
  TaskListItemTitleSpan: /*tw*/ 'cursor-text whitespace-nowrap overflow-hidden',
  TaskListItemTitleSpanPlaceHolder: /*tw*/ 'text-t3',
  TaskListItemIcon: /*tw*/ 'size-5 text-t3 flex-shrink-0',

  SubtaskItemContainer: /*tw*/ 'flex items-center gap-3 h-11 px-3 group rounded-lg',
  SubtaskItemContainerSelected: /*tw*/ 'bg-bg3',
  SubtaskItemContainerSelectedInactive: /*tw*/ 'bg-bg2',
  SubtaskItemContainerDefault: /*tw*/ 'bg-bg1',
  SubtaskItemContainerEditing: /*tw*/ 'editing-border rounded-l-none',
  SubtaskItemStatusButton:
    'size-5 text-t3 flex items-center justify-center hover:bg-bg3 rounded transition-colors flex-shrink-0',
  SubtaskItemInputWrapper: /*tw*/ 'flex-1 min-w-0',
  SubtaskItemInput: /*tw*/ 'text-sm bg-transparent outline-none border-none w-full text-ellipsis',
  SubtaskItemInputCanceled: /*tw*/ 'line-through text-t3',
  SubtaskItemInputCompleted: /*tw*/ 'text-t3',
  SubtaskItemInputCreated: /*tw*/ 'text-t1',
  SubtaskItemDragHandle:
    /*tw*/ 'opacity-0 group-hover:opacity-100 hover:bg-bg3 p-1 rounded transition-all flex-shrink-0',
  SubtaskItemDragHandleIcon: /*tw*/ 'size-5 text-t3',
  SubtaskItemDragging: /*tw*/ 'flex items-center h-8 bg-bg3 rounded opacity-50',

  ItemTagsListContainer: /*tw*/ 'flex gap-3 items-center',

  DesktopProjectListItemLink:
    'min-h-11 no-underline flex items-start gap-3 px-3 py-3 rounded-lg group relative cursor-default',
  DesktopProjectListItemDragging: /*tw*/ 'bg-bg3',
  DesktopProjectListItemDragHandle:
    'absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-60 transition-opacity',
  DesktopProjectListItemStatusBox: /*tw*/ 'flex-shrink-0',
  DesktopProjectListItemStatusBoxIcon: /*tw*/ 'size-5',
  DesktopProjectListItemContent: /*tw*/ 'flex-1 min-w-0 flex gap-2 flex-col',
  DesktopProjectListItemTitle: /*tw*/ 'text-base font-base text-t1 truncate leading-5',
  DesktopProjectListItemChevron:
    'flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity size-5 text-t3',

  DesktopPageContainer: /*tw*/ 'h-full w-full flex flex-col',
  DesktopPageContentPane: /*tw*/ 'w-full flex-1',
  DesktopPageMainPane: /*tw*/ 'h-full flex flex-col overflow-hidden',
  DesktopPageMainContent: /*tw*/ 'flex-1 overflow-y-auto px-5',
  DesktopPageDetailPane: /*tw*/ 'border-l border-line-regular',

  DetailPanelMinWidth: /*tw*/ 'w-45',
  DetailPanelMaxWidth: /*tw*/ 'w-128',
  DetailPanelPreferredWidth: /*tw*/ 'w-75',

  SubtaskListContainer: /*tw*/ 'space-y-0.25 group',

  SettingsContentContainer: /*tw*/ 'w-full flex flex-col h-full',
  SettingsContentBackButton: /*tw*/ 'p-3',

  AreaPageNotFoundContainer: /*tw*/ 'h-full w-full bg-bg1 flex items-center justify-center',
  AreaPageNotFoundText: /*tw*/ 'text-t3 text-lg',

  TaskListSectionItemsContainer: /*tw*/ 'space-y-1',

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
  SchedulePageContent: /*tw*/ 'mx-auto p-6 space-y-6',
  SchedulePageGroupContainer: /*tw*/ 'space-y-4',
  SchedulePageGroupHeader: /*tw*/ 'space-y-1 flex items-center gap-2',
  SchedulePageGroupTitle: /*tw*/ 'text-lg font-semibold text-t1',
  SchedulePageGroupSubtitle: /*tw*/ 'text-sm text-t2',
  SchedulePageItemList: /*tw*/ 'space-y-2',
  SchedulePageEmptyState: /*tw*/ 'text-center py-12',
  SchedulePageEmptyText: /*tw*/ 'text-t3 text-lg',
  CompletedPageGroupTitle: /*tw*/ 'text-lg font-semibold text-t1 w-10',

  DragOverlayContent: /*tw*/ 'bg-bg1 shadow-sm rounded-lg',

  EmptyPanelContainer: /*tw*/ 'flex items-center justify-center h-full',
  EmptyPanelText: /*tw*/ 'text-t3',

  EmptyStateContainer: /*tw*/ 'text-center py-12 text-t3',
  EmptyStateText: /*tw*/ 'text-sm',

  SubtaskListCreateButton:
    'flex items-center gap-2 justify-center w-full text-base leading-5 h-11 text-t3 hover:bg-bg3 px-3 rounded-lg transition-colors',
  SubtaskListCreateButtonIcon: /*tw*/ 'size-5',

  SidebarLayoutContainer: /*tw*/ 'h-screen w-screen relative  safe-top bg-bg3',
  SidebarLayoutPaneWrapper: /*tw*/ 'p-4 pl-0 bg-bg3',
  SidebarLayoutContent: /*tw*/ 'bg-bg1 rounded-lg overflow-hidden border border-line-regular h-full',
  SidebarLayoutContentCollapsedPadding: /*tw*/ 'pl-4',
  SidebarLayoutContentShowDragHandle: /*tw*/ 'pt-0',

  MultipleSelectionViewContainer: /*tw*/ 'h-full flex flex-col bg-bg1',
  MultipleSelectionViewContent: /*tw*/ 'flex items-center justify-center flex-1',
  MultipleSelectionViewText: /*tw*/ 'text-t2 text-center',

  DesktopHeadingListItemContainer: /*tw*/ 'group relative',
  DesktopHeadingListItemContainerDragging: /*tw*/ 'bg-bg3 rounded-lg',
  DesktopHeadingListItemContainerPadding: /*tw*/ 'pt-4',
  DesktopHeadingListItemArchived: /*tw*/ 'opacity-50! line-through',
  DesktopHeadingListItemDivider: /*tw*/ 'h-px mb-4 shadow-sm',
  DesktopHeadingListItemDividerHidden: /*tw*/ 'opacity-0',
  DesktopHeadingListItemContent:
    'px-3 py-3 flex items-center gap-3 justify-between text-base leading-5 font-medium text-t1 rounded-lg transition-colors min-h-11 relative',
  DesktopHeadingListItemContentFocused: /*tw*/ 'bg-bg3',
  DesktopHeadingListItemContentSelected: /*tw*/ 'bg-bg2',
  DesktopHeadingListItemContentEditing: /*tw*/ 'editing-border rounded-l-none',
  DesktopHeadingListItemContentHidden: /*tw*/ 'opacity-0',
  DesktopHeadingListItemDragHandle:
    'absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-50 transition-opacity z-10',
  DesktopHeadingListItemIcon: /*tw*/ 'size-5 text-t1 flex-shrink-0',
  DesktopHeadingListItemInput: /*tw*/ 'flex-1 bg-transparent outline-none text-t1 font-medium',

  DragHandleContainer: /*tw*/ 'flex-1 h-full',

  DesktopMessageContainer: /*tw*/ 'fixed top-6 right-6 flex flex-col items-end pointer-events-none',
  DesktopMessageContent:
    'bg-bg1 text-t1 border-line-regular border rounded-lg shadow-lg backdrop-blur-sm min-w-80 max-w-md p-4 pointer-events-auto transform transition-all duration-200 ease-out',
  DesktopMessageVisible: /*tw*/ 'translate-x-0 opacity-100',
  DesktopMessageHidden: /*tw*/ 'translate-x-full opacity-0',
  DesktopMessageInner: /*tw*/ 'flex items-start gap-3',
  DesktopMessageIcon: /*tw*/ 'flex-shrink-0 mt-0.5 size-5 flex items-center justify-center',
  DesktopMessageIconSuccess: /*tw*/ 'text-success-green',
  DesktopMessageIconError: /*tw*/ 'text-stress-red',
  DesktopMessageIconInfo: /*tw*/ 'text-brand',
  DesktopMessageTextContainer: /*tw*/ 'flex-1 min-w-0 gap-1 flex flex-col',
  DesktopMessageText: /*tw*/ 'text-medium font-medium leading-5 break-words',
  DesktopMessageDescription: /*tw*/ 'text-sm font-medium leading-5 break-words text-t3',
  DesktopMessageCloseButton:
    'size-5 flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0 ml-2 text-t3',
  DesktopMessageUndo: /*tw*/ 'px-8 text-brand mt-2 text-sm',
  DesktopMenuBackdrop: /*tw*/ 'fixed inset-0',
  DesktopMenuContainer: /*tw*/ 'fixed outline-none w-65',
  DesktopMenuContent: /*tw*/ 'bg-bg1 border border-line-light rounded-lg shadow-lg py-1 w-full',
  DesktopMenuDivider: /*tw*/ 'border-t border-line-light my-1',

  DesktopMenuItemBase: /*tw*/ 'h-11 w-full flex items-center py-2 px-3 text-left text-base transition-colors',
  DesktopMenuItemEnabled: /*tw*/ 'text-t2 hover:bg-bg2',
  DesktopMenuItemDisabled: /*tw*/ 'text-t3 cursor-not-allowed',
  DesktopMenuItemActive: /*tw*/ 'bg-bg2',

  DesktopMenuItemContent: /*tw*/ 'flex items-center gap-2 flex-1',
  DesktopMenuItemLabel: /*tw*/ 'flex-1',
  DesktopMenuItemCheckbox: /*tw*/ 'w-4 h-4 flex items-center justify-center',
  DesktopMenuItemCheckIcon: /*tw*/ 'w-3 h-3 text-t1',
  DesktopMenuItemChevron: /*tw*/ 'w-4 h-4 text-t3',

  DesktopSubmenuContainer: /*tw*/ 'fixed bg-bg1 border border-line-light rounded-lg shadow-lg py-1',
  DesktopSubmenuItem: /*tw*/ 'h-11 w-full flex items-center gap-2 py-2 px-3 text-left text-base transition-colors',

  OverlayBackdrop: /*tw*/ 'fixed inset-0 flex items-center justify-center',
  OverlayBackgroundMask: /*tw*/ 'absolute inset-0 bg-black opacity-45',
  OverlayContainer: /*tw*/ 'bg-bg1-float rounded-lg shadow-2xl flex flex-col min-w-130 mx-4 relative p-5',

  OverlayContainerBackdrop: /*tw*/ 'fixed inset-0',
  OverlayContainerContent: /*tw*/ 'fixed bg-bg1 rounded-lg shadow-xl border border-line-light',
  OverlayContainerFilterWrapper: /*tw*/ 'border-b border-line-regular p-3',
  OverlayHeader: /*tw*/ 'flex items-center justify-between order-b border-bg2-float mb-6',
  OverlayTitle: /*tw*/ 'text-xl leading-6 font-medium text-t1',
  OverlayCloseButton: /*tw*/ 'text-t3 transition-colors size-6',
  OverlayContent: /*tw*/ '',
  OverlayFooter: /*tw*/ 'flex justify-end gap-3 rounded-b-lg',

  DesktopDialogDescription: /*tw*/ 'text-sm text-t3 leading-4.5 font-normal',
  DesktopDialogActionsContainer: /*tw*/ 'flex flex-col gap-2 mt-5',

  TagEditorOverlayContainer: /*tw*/ 'w-80',
  TagEditorOverlayCreateButton:
    'h-11 w-full px-3 text-left text-sm hover:bg-bg2 transition-colors flex items-center gap-2',
  TagEditorOverlayCreateButtonActive: /*tw*/ 'bg-bg2',
  TagEditorOverlayCreateButtonIcon: /*tw*/ 'text-brand',
  TagEditorOverlayScrollContainer: /*tw*/ 'py-3 overflow-y-auto max-h-70',
  TagEditorOverlayTagItem: /*tw*/ 'h-11 flex items-center gap-2 px-3 text-sm transition-colors',
  TagEditorOverlayTagItemActive: /*tw*/ 'bg-bg2',
  TagEditorOverlayTagCheckbox: /*tw*/ 'size-5 flex items-center justify-center',
  TagEditorOverlayTagCheckboxSelected: /*tw*/ 'text-brand',
  TagEditorOverlayTagCheckboxUnselected: /*tw*/ 'text-t3',
  TagEditorOverlayEmptyHint: /*tw*/ 'px-3 py-2 text-sm text-t3 text-center',

  RecurringTaskSettingsOverlayField: /*tw*/ 'mb-4',
  RecurringTaskSettingsOverlayLabel: /*tw*/ 'block text-sm font-medium text-t2 mb-2',
  RecurringTaskSettingsOverlayInput:
    /*tw*/ 'w-full px-3 py-2 border border-line-regular rounded bg-bg1 text-t1 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
  RecurringTaskSettingsOverlayExplanation: /*tw*/ 'text-sm text-t3 mt-1',
  RecurringTaskSettingsOverlayCalculation: /*tw*/ 'text-sm text-brand mt-1',

  TreeSelectOverlayContainer: /*tw*/ 'w-80',
  TreeSelectOverlayContentArea: /*tw*/ 'max-h-76 overflow-y-auto py-3',
  TreeSelectOverlayButton:
    /*tw*/ 'w-full h-11 flex items-center gap-2 px-3 hover:bg-bg3 transition-colors text-left text-t2',
  TreeSelectOverlayButtonDisabled: /*tw*/ 'opacity-50 cursor-not-allowed',
  TreeSelectOverlayButtonPadding: /*tw*/ 'pl-6',
  TreeSelectOverlayIcon: /*tw*/ 'size-5 shrink-0 text-t2',
  TreeSelectOverlayText: /*tw*/ 'text-base leading-5 truncate',

  CreateDatabaseOverlayFormContainer: /*tw*/ 'flex flex-col gap-3',
  CreateDatabaseOverlayErrorText: /*tw*/ 'text-stress-red text-sm',

  DatePickerOverlayContainer: /*tw*/ 'w-76',
  DatePickerCalendarHeaderContainer: /*tw*/ 'flex justify-between items-center p-3 h-13',
  DatePickerCalendarHeaderTitle: /*tw*/ 'text-lg font-medium text-t1 height-7 leading-7',
  DatePickerCalendarNavContainer: /*tw*/ 'flex items-center',
  DatePickerCalendarNavButton:
    /*tw*/ 'size-7 p-1.5 hover:bg-bg2 rounded text-lg text-t2 hover:text-t1 transition-colors',
  DatePickerOverlayQuickActionsContainer: /*tw*/ 'flex flex-col gap-1 pt-3',
  DatePickerOverlayQuickActionButton:
    'h-11 px-3 text-left text-t1 hover:bg-bg2 rounded transition-colors flex items-center gap-2',
  DatePickerOverlayQuickActionIcon: /*tw*/ 'size-5 text-t2',
  DatePickerCalendarNavIcon: /*tw*/ 'size-4',
  DatePickerCalendarCalendarWrapper: /*tw*/ 'text-base px-3',
  DatePickerCalendarScrollContainer: /*tw*/ 'h-60 overflow-y-auto',
  DatePickerCalendarMonthHeaderTitle: /*tw*/ 'text-lg font-medium text-t1 border-b border-line-regular py-2',
  DatePickerCalendarMonthGrid: /*tw*/ 'grid grid-cols-7 gap-x-0.5 bg-bg1',
  DatePickerCalendarDayButton: /*tw*/ 'size-9  rounded text-base relative hover:bg-bg2 transition-colors',
  DatePickerCalendarDaySelected: /*tw*/ 'bg-brand text-white hover:bg-brand',
  DatePickerCalendarDayNotCurrentMonth: /*tw*/ 'opacity-30',
  DatePickerCalendarDayToday: /*tw*/ 'text-brand font-bold',
  DatePickerCalendarDayCurrentMonth: /*tw*/ 'text-t1',
  DatePickerCalendarTodayLabel: /*tw*/ 'absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs',
  DatePickerCalendarWeekdayGrid: /*tw*/ 'h-6 grid grid-cols-7 gap-0.5 sticky top-0 bg-white',
  DatePickerCalendarWeekdayCell: /*tw*/ 'text-center text-xs text-t3 h-6 w-9 flex items-center justify-center',

  // TimePicker styles
  TimePickerOverlayContainer: /*tw*/ 'w-108',
  TimePickerOverlayMainContent: /*tw*/ 'flex',
  TimePickerOverlayCalendarSection: /*tw*/ 'flex-1',
  TimePickerOverlayTimeSection: /*tw*/ 'w-36 h-83 border-l border-line-regular flex',
  TimePickerScrollColumn: /*tw*/ 'flex-1 overflow-y-auto relative p-3',
  TimePickerScrollItem:
    'h-9 flex items-center justify-center text-sm hover:bg-bg2 transition-all flex-shrink-0 w-full rounded',
  TimePickerScrollItemSelected: /*tw*/ 'bg-brand text-white font-medium scale-105 hover:bg-brand',
  TimePickerScrollColumnWrapper: /*tw*/ 'w-18 h-83 overflow-y-auto',
  TimePickerOverlayFooter: /*tw*/ 'flex justify-between gap-2 px-3 py-3 border-t border-line-regular',

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
    /*tw*/ 'bg-bg1-float rounded-lg shadow-2xl flex flex-col w-[720px] max-w-[calc(100vw-32px)] relative',
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
