import { formatTheme } from '@/base/common/formatTheme';

export const desktopStyles = {
  sidebarContainerStyle: 'w-full h-full pl-2 pt-2 pr-4 flex flex-col',
  sidebarContainerNoPaddingTop: 'pt-0!',
  sidebarBackground: 'bg-bg3',
  SidebarMinWidth: 'w-45',
  SidebarMaxWidth: 'w-128',
  SidebarPreferredWidth: 'w-60',

  SidebarMenuItemContainer: 'space-y-2',
  SidebarMenuItem: 'h-9 px-3 flex rounded-lg text-base leading-5 items-center gap-3 group',
  SidebarMenuItemActive: 'bg-brand text-white',
  SidebarMenuItemInactive: 'text-t1 hover:bg-bg1',
  SidebarMenuItemIcon: 'size-5 flex items-center justify-center flex-shrink-0',
  SidebarMenuItemLabel: 'flex-1 truncate min-w-0',
  SidebarMenuItemBadgePrimary:
    'bg-stress-red min-w-5 text-sm leading-3.5 h-5 rounded-full text-white flex items-center justify-center px-1.5',
  SidebarMenuItemBadgeSecondaryActive: 'text-white',
  SidebarMenuItemBadgeSecondary: 'text-t3',
  SidebarMenuDivider: 'bg-line-bold h-0.25',

  SidebarProjectAreaList: 'flex-1 overflow-y-auto py-2',
  SidebarProjectAreaListNoTopPadding: 'pt-0',

  SidebarAreaToggleButton:
    'flex-shrink-0 size-5 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center',
  SidebarAreaToggleButtonActive: 'text-white',
  SidebarAreaToggleButtonInactive: 'text-t3',
  SidebarAreaGap: 'mt-3',

  SidebarProjectItemActive: 'bg-brand text-white',
  SidebarProjectItemInactive: 'text-t2 hover:bg-bg1',
  SidebarProjectItemDueDateDanger: 'text-stress-red',
  SidebarProjectItemDueDateActive: 'text-white',
  SidebarProjectItemDueDateInactive: 'text-t3',

  SidebarActionsContainer: 'flex gap-1 h-15 items-center',
  SidebarCreateButton:
    'flex-1 flex items-center gap-2 px-3 py-2 text-sm text-t1 hover:bg-bg1 hover:text-brand rounded-md transition-colors h-11',
  SidebarCreateButtonIcon: 'size-5',
  SidebarSettingsButton:
    'flex items-center justify-center hover:bg-bg hover:bg-bg1 hover:text-brand rounded-md transition-colors size-11 text-t3',
  SidebarSettingsButtonIcon: 'size-5',

  EntityHeaderContainer: 'min-h-15 flex items-start justify-between px-5 py-3.75 border-b border-line-regular bg-bg1',
  EntityHeaderPanelIconContainer: 'flex items-center size-7.5 text-t2 mr-3 justify-center',
  EntityHeaderPanelIcon: 'size-5',
  EntityHeaderContentWrapper: 'flex items-start gap-3 flex-1 min-w-0',
  EntityHeaderIconContainer: 'size-7.5 flex items-center justify-center',
  EntityHeaderIconButton: 'size-6 flex items-center justify-center',
  EntityHeaderEditableTextArea:
    'flex-1 text-xl leading-7.5 font-medium text-t1 resize-none bg-transparent border-none outline-none px-0 py-0',
  EntityHeaderTitle: 'text-xl leading-7.5 font-medium text-t1 truncate',
  EntityHeaderActionsContainer: 'flex items-center gap-5',
  EntityHeaderActionButton:
    'flex items-center gap-2 px-1.5 py-1 text-sm text-t2 hover:bg-bg3 rounded-sm transition-colors h-7',
  EntityHeaderActionIcon: 'size-5 flex items-center content-center',
  EntityHeaderActionLabel: 'text-base leading-5 font-normal',

  ClearSelectionButton:
    'border-t border-line-regular h-15 flex items-center text-base text-t3 justify-center cursor-pointer',

  SelectionFieldButton: 'flex items-start py-3 gap-2 text-t2 min-h-11 hover:bg-bg3 px-3 rounded-lg w-full',
  SelectionFieldIcon: 'size-5 shrink-0 flex items-center justify-center',
  SelectionFieldPlaceholderText: 'text-base leading-5',

  TaskLocationFieldLocationText: 'text-base leading-5 text-t1 truncate',

  TaskDateFieldDateContainer: 'flex items-baseline gap-1.5 text-base leading-5',
  TaskDateFieldDateNormal: 'text-t1',
  TaskDateFieldDateOverdue: 'text-stress-red',
  TaskDateFieldRemainingText: 'text-t3',

  TagsFieldEmptyButton: 'flex items-center py-2 gap-2 text-t2 h-11 hover:bg-bg3 px-3 rounded-lg w-full',
  TagsFieldWithTagsButton: 'flex items-start py-3 gap-2 text-t2 min-h-11 hover:bg-bg3 px-3 rounded-lg w-full',
  TagsFieldIcon: 'size-5',
  TagsFieldIconWithTags: 'size-5 flex-shrink-0',
  TagsFieldText: 'text-base leading-5',
  TagsFieldTagsContainer: 'flex flex-wrap gap-3 justify-start',
  TagsFieldTag: 'text-brand rounded-sm text-xs px-2 py-0.5 h-5 flex items-center bg-brand/15',

  SubtaskListTitle: 'flex items-center px-3 gap-2.5 h-14',
  SubtaskListTitleIcon: 'size-5 flex-shrink-0 text-t1 flex items-center justify-center',
  SubtaskListTitleText: 'flex-1 text-base leading-5 font-normal text-t1',

  InboxTaskInputWrapper: 'pt-3 mb-3',
  InboxTaskInputContainer: 'flex flex-row items-center p-3 gap-3 h-11 bg-bg3 rounded-lg',
  InboxTaskInputIcon: 'flex-none size-5 text-t3',
  InboxTaskInputField: 'flex-1 bg-transparent text-base text-t1 placeholder-t3 focus:outline-none font-normal',

  InboxAreaContainer: 'flex items-center gap-6',
  InboxAreaInputWrapper: 'flex-1',
  InboxAreaHeadingButton: 'relative size-11 bg-bg3 flex items-center justify-center rounded-lg',
  InboxAreaHeadingIcon: 'size-5 text-t3',
  InboxAreaHeadingBadge: 'absolute top-5.5 right-2.5 w-2 h-2 bg-primary rounded-full flex items-center justify-center',
  InboxAreaHeadingBadgeIcon: 'text-t3 text-xs leading-none',

  ItemTagContainer: 'flex text-xs leading-4 h-5 items-center px-2 gap-1 rounded-sm max-w-30 text-t2',
  ItemTagSelected: 'bg-bg1',
  ItemTagUnselected: 'bg-bg3',
  ItemTagIcon: 'size-3 flex items-center content-center flex-shrink-0',
  ItemTagLabel: 'truncate',

  AuthFormContainer: 'flex flex-col gap-9',
  AuthFormSection: 'flex flex-col gap-3',
  AuthFormErrorMessage: 'text-stress-red text-base',
  AuthFormButtonSection: 'flex flex-col gap-3',
  AuthFormFooterContainer: 'flex items-center gap-2 justify-center',
  AuthFormFooterText: 'text-base font-normal text-t3 leading-5',
  AuthFormSwitchButton: 'text-brand hover:underline ml-1',
  AuthFormLink: 'text-brand mx-1 hover:underline',

  SelectContainer: 'relative',
  SelectTrigger:
    'box-border flex flex-row justify-between items-center p-3 gap-3 w-44 h-11 border border-line-regular rounded-lg cursor-pointer bg-bg1 hover:border-brand focus-within:border-brand',
  SelectTriggerText: 'flex-none order-0 flex-grow-0 w-auto h-5 font-normal text-base leading-5 text-t1',
  SelectTriggerIcon: 'flex-none order-1 flex-grow-0 w-5 h-5 text-t3 transition-transform',

  SwitchLabel: 'inline-flex items-center cursor-pointer',
  SwitchLabelDisabled: 'opacity-50 cursor-not-allowed',
  SwitchInput: 'sr-only',
  SwitchContainer: 'relative w-12.75 h-7.75 rounded-full transition-colors',
  SwitchContainerActive: 'bg-brand',
  SwitchContainerInactive: 'bg-bg2',
  SwitchKnob: 'absolute size-7.75 bg-white rounded-full transition-all duration-200 top-0 shadow-sm',
  SwitchKnobActive: 'left-5',
  SwitchKnobInactive: 'left-0.5',

  SettingsItemContainer: 'flex w-full items-start justify-between',
  SettingsItemContentWrapper: 'flex-1 pr-4',
  SettingsItemTitle: 'text-base font-medium text-t1 leading-6 h-6',
  SettingsItemDescription: 'text-sm font-normal text-t3 leading-4.5 min-h-4.5',
  SettingsItemActionWrapper: 'flex-shrink-0 h-10.5 flex item-center',

  SettingsItemGroupContainer:
    'flex flex-col justify-center items-start p-4 gap-3 border border-line-regular rounded-lg',
  SettingsItemGroupDivider: 'w-full h-0.25 bg-bg3',

  SettingButtonBase: 'rounded-lg focus:outline-none flex flex-row justify-center items-center whitespace-nowrap',
  SettingButtonSizeLarge: 'h-13 text-base font-normal min-w-20',
  SettingButtonSizeMedium: 'h-11 text-base font-normal min-w-20 px-3',
  SettingButtonSizeSmall: 'h-9 text-sm font-normal min-w-20 px-3',
  SettingButtonFullWidth: 'w-full',

  SettingButtonSolidPrimary: 'bg-brand text-white hover:bg-brand/90',
  SettingButtonSolidDanger: 'bg-stress-red text-white hover:bg-stress-red/90',
  SettingButtonSolidDefault: 'bg-bg3 text-white hover:bg-bg3/90',

  SettingButtonFilledPrimary: 'bg-brand/10 text-brand hover:bg-brand/20',
  SettingButtonFilledDanger: 'bg-stress-red/10 text-stress-red hover:bg-stress-red/20',
  SettingButtonFilledDefault: 'bg-bg2 text-t1 hover:bg-bg3',

  SettingButtonDefaultPrimary: 'bg-transparent text-brand border border-brand hover:bg-brand/10',
  SettingButtonDefaultDanger: 'bg-transparent text-stress-red border border-stress-red hover:bg-stress-red/10',
  SettingButtonDefaultDefault: 'bg-transparent text-t1 border border-line-regular hover:bg-bg2',

  SettingButtonTextPrimary: 'bg-transparent text-brand hover:bg-brand/10',
  SettingButtonTextDanger: 'bg-transparent text-stress-red hover:bg-stress-red/10',
  SettingButtonTextDefault: 'bg-transparent text-t1 hover:bg-bg2',

  SettingButtonDisabled: 'opacity-50 cursor-not-allowed pointer-events-none',

  DatabaseListContainer: 'mt-12',
  DatabaseListLoadingContainer: 'text-center py-4',
  DatabaseListLoadingText: 'text-t2',
  DatabaseListErrorContainer: 'text-center py-4',
  DatabaseListErrorText: 'text-stress-red',
  DatabaseListEmptyContainer: 'text-center py-4',
  DatabaseListEmptyText: 'text-t2',

  TitleContentSectionContainer: 'flex flex-col pt-5',
  TitleContentSectionHeader: 'flex flex-row justify-center items-center px-3 gap-2 w-full h-11 flex-none',
  TitleContentSectionTitle: 'flex-1 text-base leading-5 font-normal text-t1 truncate',
  TitleContentSectionAction: 'flex-shrink-0',
  TitleContentSectionActionButton:
    'px-3 py-1 h-11 text-base rounded-lg hover:bg-bg2 transition-colors text-t2 hover:text-t1',

  BackButtonLink: 'flex flex-row items-center h-12 no-underline text-t1 hover:bg-bg2 mb-2 rounded-lg px-3 w-fit',
  BackButtonContainer: 'flex flex-row items-center gap-1',
  BackButtonIcon: 'w-6 h-6 flex items-center justify-center',
  BackButtonLabel: 'text-xl leading-5',

  DetailViewContainer: 'h-full flex flex-col',
  DetailViewHeader: 'min-h-15 flex px-5 py-3.75 gap-5 items-start justify-between border-b border-line-regular',
  DetailViewHeaderTitle: 'flex-1 text-xl leading-7.5 font-medium outline-none',
  DetailViewHeaderMenuButton: 'size-6 h-7.6 flex items-center',
  DetailViewHeaderMenuIcon: 'size-6 text-t3',
  DetailViewContent: 'flex-1 overflow-y-auto',
  DetailViewContentInner: 'p-5 space-y-2',
  DetailViewNotesTextarea:
    'w-full p-3 bg-bg2 rounded-lg outline-none resize-none text-base leading-5 placeholder:text-t3',
  DetailViewDivider: 'h-px bg-line-regular',

  MarkdownPageLoading: 'text-t2',
  MarkdownPageH1: 'text-2xl font-medium text-t1 mb-4 mt-6',
  MarkdownPageH2: 'text-xl font-medium text-t1 mb-3 mt-5',
  MarkdownPageH3: 'text-lg font-medium text-t1 mb-2 mt-4',
  MarkdownPageP: 'text-t1 mb-4 leading-relaxed',
  MarkdownPageLink: 'text-accent no-underline hover:underline',
  MarkdownPageStrong: 'text-t1 font-medium',
  MarkdownPageUl: 'text-t1 my-4 list-disc pl-6',
  MarkdownPageOl: 'text-t1 my-4 list-decimal pl-6',
  MarkdownPageLi: 'my-1',
  MarkdownPageBlockquote: 'text-t2 border-l-4 border-line-light pl-4 my-4',

  InfoItemContainer: 'flex flex-row justify-between items-center gap-3 w-full h-5 font-normal text-balance leading-5',
  InfoItemLabel: 'text-t3',
  InfoItemValueContainer: 'flex items-center gap-2',
  InfoItemValue: 'text-t1',
  InfoItemCopyButton: 'text-t3 hover:text-t1 transition-colors',
  InfoItemCopyIcon: 'w-4 h-4',

  CheckboxContainer: 'flex items-center gap-2',
  CheckboxInputContainer: 'relative',
  CheckboxInput: 'sr-only',
  CheckboxBox: 'size-5 cursor-pointer',
  CheckboxBoxChecked: 'text-brand',
  CheckboxBoxUnchecked: 'text-t3',
  CheckboxStatusBox: 'size-full',
  CheckboxLabel: 'text-base text-t3 leading-5',

  SettingsTitleContainer: 'flex mb-8',
  SettingsTitleContent: 'flex flex-col gap-1 flex-1',
  SettingsTitleHeading: 'font-medium text-t1 leading-5',
  SettingsTitleHeadingLevel1: 'text-2xl',
  SettingsTitleHeadingLevel2: 'text-xl',
  SettingsTitleDescription: 'text-base font-normal text-t3 leading-5',
  SettingsTitleActionContainer: 'flex items-center',

  TaskListItemContainer: 'group relative flex items-start gap-3 px-3 py-3 rounded-md outline-none',
  TaskListItemContainerWillDisappear: 'opacity-50',
  TaskListItemContainerSelected: 'bg-bg3',
  TaskListItemContainerSelectedInactive: 'bg-bg2',
  TaskListItemContainerEditing: 'editing-border rounded-l-none',
  TaskListItemDragHandle:
    'absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-60 transition-opacity',
  TaskListItemStatusButton: 'flex-shrink-0 size-5 outline-none',
  TaskListItemStatusBox: 'size-5',
  TaskListItemStatusBoxCompleted: 'text-brand',
  TaskListItemStatusBoxUncompleted: 'text-t3',
  TaskListItemContent: 'flex flex-col gap-2 flex-1 min-w-0',
  TaskListItemTitleRow: 'flex items-center gap-2',
  TaskListItemTitleInput:
    'text-base leading-5 flex-1 bg-transparent border-none outline-none text-ellipsis text-t1 overflow-hidden',
  TaskListItemTitleSpan: 'cursor-text whitespace-nowrap overflow-hidden',
  TaskListItemTitleSpanPlaceHolder: 'text-t3',
  TaskListItemIcon: 'size-5 text-t3 flex-shrink-0',

  SubtaskItemContainer: 'flex items-center gap-3 h-11 px-3 group rounded-lg',
  SubtaskItemContainerSelected: 'bg-bg3',
  SubtaskItemContainerSelectedInactive: 'bg-bg2',
  SubtaskItemContainerDefault: 'bg-bg1',
  SubtaskItemContainerEditing: 'editing-border rounded-l-none',
  SubtaskItemStatusButton:
    'size-5 text-t3 flex items-center justify-center hover:bg-bg3 rounded transition-colors flex-shrink-0',
  SubtaskItemInputWrapper: 'flex-1 min-w-0',
  SubtaskItemInput: 'text-sm bg-transparent outline-none border-none w-full text-ellipsis',
  SubtaskItemInputCanceled: 'line-through text-t3',
  SubtaskItemInputCompleted: 'text-t3',
  SubtaskItemInputCreated: 'text-t1',
  SubtaskItemDragHandle: 'opacity-0 group-hover:opacity-100 hover:bg-bg3 p-1 rounded transition-all flex-shrink-0',
  SubtaskItemDragHandleIcon: 'size-5 text-t3',
  SubtaskItemDragging: 'flex items-center h-8 bg-bg3 rounded opacity-50',

  ItemTagsListContainer: 'flex gap-2 items-center',

  DesktopProjectListItemLink:
    'min-h-11 no-underline flex items-start gap-3 px-3 py-3 rounded-lg group relative cursor-default',
  DesktopProjectListItemDragging: 'bg-bg3',
  DesktopProjectListItemDragHandle:
    'absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-60 transition-opacity',
  DesktopProjectListItemStatusBox: 'flex-shrink-0',
  DesktopProjectListItemStatusBoxIcon: 'size-5',
  DesktopProjectListItemContent: 'flex-1 min-w-0 flex gap-2 flex-col',
  DesktopProjectListItemTitle: 'text-base font-base text-t1 truncate leading-5',
  DesktopProjectListItemChevron:
    'flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity size-5 text-t3',

  DesktopPageContainer: 'h-full w-full flex flex-col',
  DesktopPageContentPane: 'w-full flex-1',
  DesktopPageMainPane: 'h-full flex flex-col overflow-hidden',
  DesktopPageMainContent: 'flex-1 overflow-y-auto px-5',
  DesktopPageDetailPane: 'border-l border-line-regular',

  DetailPanelMinWidth: 'w-45',
  DetailPanelMaxWidth: 'w-128',
  DetailPanelPreferredWidth: 'w-75',

  SubtaskListContainer: 'space-y-0.25 group',

  SettingsContentContainer: 'w-full flex flex-col',
  SettingsContentBackButton: 'p-3',

  AreaPageNotFoundContainer: 'h-full w-full bg-bg1 flex items-center justify-center',
  AreaPageNotFoundText: 'text-t3 text-lg',

  TaskListSectionItemsContainer: 'space-y-1',

  FutureProjectsPageContainer: 'h-full w-full bg-bg1',
  FutureProjectsPageWrapper: 'h-full flex flex-col',
  FutureProjectsPageContent: 'flex-1 overflow-y-auto p-4',

  ProjectPageNotFoundContainer: 'h-full w-full bg-bg1 flex items-center justify-center',
  ProjectPageNotFoundText: 'text-t3 text-lg',

  ProjectTaskAreaContainer: 'flex-1',

  DatabaseItemContainer: 'flex flex-col gap-3 w-full',
  DatabaseItemMainRow: 'flex items-center gap-3',
  DatabaseItemContentWrapper: 'flex items-center gap-2 flex-1',
  DatabaseItemIconWrapper: 'w-11 h-11 bg-bg3 rounded-lg flex items-center justify-center flex-shrink-0',
  DatabaseItemIcon: 'size-5 flex items-center justify-center',
  DatabaseItemContent: 'flex flex-col gap-1 flex-1',
  DatabaseItemTitleRow: 'flex items-center gap-2 h-6',
  DatabaseItemTitle: 'text-base font-medium text-t1 leading-6',
  DatabaseItemCurrentBadge: 'text-sm font-normal text-brand leading-4.5',
  DatabaseItemDescriptionRow: 'flex items-center gap-2',
  DatabaseItemDescription: 'text-sm font-normal text-t3 leading-4.5',
  DatabaseItemActionButtons: 'flex items-center gap-2 shrink-0',
  DatabaseItemPropertiesSection: 'shrink-0',
  DatabaseItemProperty: 'flex flex-col gap-1 h-11.5 justify-center',
  DatabaseItemPropertyLabel: 'text-base font-medium text-t1 leading-6',
  DatabaseItemPropertyValue: 'text-sm font-normal text-t3 leading-4.5',

  SpaceMedium: 'h-8',
  SpaceLarge: 'h-16',

  AccountSettingsButtonContainer: 'space-y-3',

  SchedulePageContainer: 'h-full w-full bg-bg1',
  SchedulePageLayout: 'h-full flex flex-col',
  SchedulePageScrollArea: 'flex-1 overflow-y-auto',
  SchedulePageContent: 'mx-auto p-6 space-y-6',
  SchedulePageGroupContainer: 'space-y-4',
  SchedulePageGroupHeader: 'space-y-1 flex items-center gap-2',
  SchedulePageGroupTitle: 'text-lg font-semibold text-t1',
  SchedulePageGroupSubtitle: 'text-sm text-t2',
  SchedulePageItemList: 'space-y-2',
  SchedulePageEmptyState: 'text-center py-12',
  SchedulePageEmptyText: 'text-t3 text-lg',
  CompletedPageGroupTitle: 'text-lg font-semibold text-t1 w-10',

  DragOverlayContent: 'bg-bg1 shadow-sm rounded-lg',

  EmptyPanelContainer: 'flex items-center justify-center h-full',
  EmptyPanelText: 'text-t3',

  EmptyStateContainer: 'text-center py-12 text-t3',
  EmptyStateText: 'text-sm',

  SubtaskListCreateButton:
    'flex items-center gap-2 justify-center w-full text-base leading-5 h-11 text-t3 hover:bg-bg3 px-3 rounded-lg transition-colors',
  SubtaskListCreateButtonIcon: 'size-5',

  SidebarLayoutContainer: 'h-screen w-screen relative  safe-top bg-bg3',
  SidebarLayoutPaneWrapper: 'p-4 pl-0 bg-bg3',
  SidebarLayoutContent: 'bg-bg1 rounded-lg overflow-hidden border border-line-regular h-full',
  SidebarLayoutContentCollapsedPadding: 'pl-4',
  SidebarLayoutContentShowDragHandle: 'pt-0',

  MultipleSelectionViewContainer: 'h-full flex flex-col bg-bg1',
  MultipleSelectionViewContent: 'flex items-center justify-center flex-1',
  MultipleSelectionViewText: 'text-t2 text-center',

  DesktopHeadingListItemContainer: 'group relative',
  DesktopHeadingListItemContainerDragging: 'bg-bg3 rounded-lg',
  DesktopHeadingListItemContainerPadding: 'pt-4',
  DesktopHeadingListItemDivider: 'h-px mb-4 shadow-sm',
  DesktopHeadingListItemDividerHidden: 'opacity-0',
  DesktopHeadingListItemContent:
    'px-3 py-3 flex items-center gap-3 justify-between text-base leading-5 font-medium text-t1 rounded-lg transition-colors min-h-11 relative',
  DesktopHeadingListItemContentFocused: 'bg-bg3',
  DesktopHeadingListItemContentSelected: 'bg-bg2',
  DesktopHeadingListItemContentEditing: 'editing-border rounded-l-none',
  DesktopHeadingListItemContentHidden: 'opacity-0',
  DesktopHeadingListItemDragHandle:
    'absolute -left-5 top-1/2 -translate-y-1/2 size-5 text-t3 opacity-0 group-hover:opacity-50 transition-opacity z-10',
  DesktopHeadingListItemIcon: 'size-5 text-t1 flex-shrink-0',
  DesktopHeadingListItemInput: 'flex-1 bg-transparent outline-none text-t1 font-medium',

  DragHandleContainer: 'w-full',

  DesktopMessageContainer: 'fixed top-6 right-6 flex flex-col items-end pointer-events-none',
  DesktopMessageContent:
    'bg-bg1 text-t1 border-line-regular border rounded-lg shadow-lg backdrop-blur-sm min-w-80 max-w-md p-4 pointer-events-auto transform transition-all duration-200 ease-out',
  DesktopMessageVisible: 'translate-x-0 opacity-100',
  DesktopMessageHidden: 'translate-x-full opacity-0',
  DesktopMessageInner: 'flex items-start gap-3',
  DesktopMessageIcon: 'flex-shrink-0 mt-0.5 size-5 flex items-center justify-center',
  DesktopMessageIconSuccess: 'text-success-green',
  DesktopMessageIconError: 'text-stress-red',
  DesktopMessageIconInfo: 'text-brand',
  DesktopMessageTextContainer: 'flex-1 min-w-0 gap-1 flex flex-col',
  DesktopMessageText: 'text-medium font-medium leading-5 break-words',
  DesktopMessageDescription: 'text-sm font-medium leading-5 break-words text-t3',
  DesktopMessageCloseButton:
    'size-5 flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0 ml-2 text-t3',
  DesktopMessageUndo: 'px-8 text-brand mt-2 text-sm',
  DesktopMenuBackdrop: 'fixed inset-0',
  DesktopMenuContainer: 'fixed outline-none w-65',
  DesktopMenuContent: 'bg-bg1 border border-line-light rounded-lg shadow-lg py-1 w-full',
  DesktopMenuDivider: 'border-t border-line-light my-1',

  DesktopMenuItemBase: 'h-11 w-full flex items-center py-2 px-3 text-left text-base transition-colors',
  DesktopMenuItemEnabled: 'text-t2 hover:bg-bg2',
  DesktopMenuItemDisabled: 'text-t3 cursor-not-allowed',
  DesktopMenuItemActive: 'bg-bg2',

  DesktopMenuItemContent: 'flex items-center gap-2 flex-1',
  DesktopMenuItemLabel: 'flex-1',
  DesktopMenuItemCheckbox: 'w-4 h-4 flex items-center justify-center',
  DesktopMenuItemCheckIcon: 'w-3 h-3 text-t1',
  DesktopMenuItemChevron: 'w-4 h-4 text-t3',

  DesktopSubmenuContainer: 'fixed bg-bg1 border border-line-light rounded-lg shadow-lg py-1',
  DesktopSubmenuItem: 'h-11 w-full flex items-center gap-2 py-2 px-3 text-left text-base transition-colors',

  OverlayBackdrop: 'fixed inset-0 flex items-center justify-center',
  OverlayBackgroundMask: 'absolute inset-0 bg-black opacity-45',
  OverlayContainer: 'bg-bg1-float rounded-lg shadow-2xl flex flex-col min-w-130 mx-4 relative p-5',

  OverlayContainerBackdrop: 'fixed inset-0',
  OverlayContainerContent: 'fixed bg-bg1 rounded-lg shadow-xl border border-line-light',
  OverlayContainerFilterWrapper: 'border-b border-line-regular p-3',
  OverlayHeader: 'flex items-center justify-between order-b border-bg2-float mb-6',
  OverlayTitle: 'text-xl leading-6 font-medium text-t1',
  OverlayCloseButton: 'text-t3 transition-colors size-6',
  OverlayContent: '',
  OverlayFooter: 'flex justify-end gap-3 rounded-b-lg',

  DesktopDialogDescription: 'text-sm text-t3 leading-4.5 font-normal',
  DesktopDialogActionsContainer: 'flex flex-col gap-2 mt-5',

  TagEditorOverlayContainer: 'w-80',
  TagEditorOverlayCreateButton:
    'h-11 w-full px-3 text-left text-sm hover:bg-bg2 transition-colors flex items-center gap-2',
  TagEditorOverlayCreateButtonActive: 'bg-bg2',
  TagEditorOverlayCreateButtonIcon: 'text-brand',
  TagEditorOverlayScrollContainer: 'py-3 overflow-y-auto max-h-70',
  TagEditorOverlayTagItem: 'h-11 flex items-center gap-2 px-3 text-sm transition-colors',
  TagEditorOverlayTagItemActive: 'bg-bg2',
  TagEditorOverlayTagCheckbox: 'size-5 flex items-center justify-center',
  TagEditorOverlayTagCheckboxSelected: 'text-brand',
  TagEditorOverlayTagCheckboxUnselected: 'text-t3',
  TagEditorOverlayEmptyHint: 'px-3 py-2 text-sm text-t3 text-center',

  TreeSelectOverlayContainer: 'w-80',
  TreeSelectOverlayContentArea: 'max-h-76 overflow-y-auto py-3',
  TreeSelectOverlayButton: 'w-full h-11 flex items-center gap-2 px-3 hover:bg-bg3 transition-colors text-left text-t2',
  TreeSelectOverlayButtonDisabled: 'opacity-50 cursor-not-allowed',
  TreeSelectOverlayButtonPadding: 'pl-6',
  TreeSelectOverlayIcon: 'size-5 shrink-0 text-t2',
  TreeSelectOverlayText: 'text-base leading-5 truncate',

  CreateDatabaseOverlayFormContainer: 'flex flex-col gap-3',
  CreateDatabaseOverlayErrorText: 'text-stress-red text-sm',

  DatePickerOverlayContainer: 'w-76',
  DatePickerCalendarHeaderContainer: 'flex justify-between items-center p-3 h-13',
  DatePickerCalendarHeaderTitle: 'text-lg font-medium text-t1 height-7 leading-7',
  DatePickerCalendarNavContainer: 'flex items-center',
  DatePickerCalendarNavButton: 'size-7 p-1.5 hover:bg-bg2 rounded text-lg text-t2 hover:text-t1 transition-colors',
  DatePickerOverlayQuickActionsContainer: 'flex flex-col gap-1 pt-3',
  DatePickerOverlayQuickActionButton:
    'h-11 px-3 text-left text-t1 hover:bg-bg2 rounded transition-colors flex items-center gap-2',
  DatePickerOverlayQuickActionIcon: 'size-5 text-t2',
  DatePickerCalendarNavIcon: 'size-4',
  DatePickerCalendarCalendarWrapper: 'text-base px-3',
  DatePickerCalendarScrollContainer: 'h-60 overflow-y-auto',
  DatePickerCalendarMonthHeaderTitle: 'text-lg font-medium text-t1 border-b border-line-regular py-2',
  DatePickerCalendarMonthGrid: 'grid grid-cols-7 gap-x-0.5 bg-bg1',
  DatePickerCalendarDayButton: 'size-9  rounded text-base relative hover:bg-bg2 transition-colors',
  DatePickerCalendarDaySelected: 'bg-brand text-white hover:bg-brand',
  DatePickerCalendarDayNotCurrentMonth: 'opacity-30',
  DatePickerCalendarDayToday: 'text-brand font-bold',
  DatePickerCalendarDayCurrentMonth: 'text-t1',
  DatePickerCalendarTodayLabel: 'absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs',
  DatePickerCalendarWeekdayGrid: 'h-6 grid grid-cols-7 gap-0.5 sticky top-0 bg-white',
  DatePickerCalendarWeekdayCell: 'text-center text-xs text-t3 h-6 w-9 flex items-center justify-center',

  // TimePicker styles
  TimePickerOverlayContainer: 'w-108',
  TimePickerOverlayMainContent: 'flex',
  TimePickerOverlayCalendarSection: 'flex-1',
  TimePickerOverlayTimeSection: 'w-36 h-83 border-l border-line-regular flex',
  TimePickerScrollColumn: 'flex-1 overflow-y-auto relative p-3',
  TimePickerScrollItem:
    'h-9 flex items-center justify-center text-sm hover:bg-bg2 transition-all flex-shrink-0 w-full rounded',
  TimePickerScrollItemSelected: 'bg-brand text-white font-medium scale-105 hover:bg-brand',
  TimePickerScrollColumnWrapper: 'w-18 h-83 overflow-y-auto',
  TimePickerOverlayFooter: 'flex justify-between gap-2 px-3 py-3 border-t border-line-regular',
};

export type DesktopThemeDefinition = typeof desktopStyles;

formatTheme(desktopStyles);
