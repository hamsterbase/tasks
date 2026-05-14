import { formatTheme } from '@/base/common/formatTheme';

export const desktopStyles = {
  sidebarContainerStyle: /*tw*/ 'w-full h-full pt-2 flex flex-col',
  sidebarBackground: /*tw*/ 'bg-bg2',
  SidebarMinWidth: /*tw*/ 'w-45',
  SidebarMaxWidth: /*tw*/ 'w-128',
  SidebarPreferredWidth: /*tw*/ 'w-56',

  SidebarHeaderContainer: /*tw*/ 'flex items-center justify-start h-12 px-2 flex-shrink-0',
  SidebarHeaderActions: /*tw*/ 'flex items-center gap-0.5 ml-auto',
  SidebarHeaderIconButton:
    'flex items-center justify-center hover:bg-bg3 hover:text-t1 rounded-md transition-colors size-6 text-t3',
  SidebarHeaderIconButtonIcon: /*tw*/ 'size-4',

  SidebarMenuItemContainer: /*tw*/ 'flex flex-col gap-0.5 px-2',
  SidebarMenuItem: /*tw*/ 'h-7 px-2 flex rounded-md text-sm leading-5 items-center gap-2 group transition-colors',
  SidebarMenuItemActive: /*tw*/ 'bg-bg3 text-t1',
  SidebarMenuItemInactive: /*tw*/ 'text-t2 hover:bg-bg3 hover:text-t1',
  SidebarMenuItemIcon: /*tw*/ 'size-4 flex items-center justify-center flex-shrink-0',
  SidebarMenuItemIconSvg: /*tw*/ 'size-4',
  SidebarMenuItemLabel: /*tw*/ 'flex-1 truncate min-w-0',
  SidebarMenuItemBadgePrimary:
    'min-w-4 text-xs leading-none h-4 rounded-sm bg-accent-danger text-white flex items-center justify-center px-1 font-medium',
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
  SidebarAreaGap: /*tw*/ 'mt-3 first:mt-0',

  SidebarProjectItemActive: /*tw*/ 'bg-bg3 text-t1',
  SidebarProjectItemInactive: /*tw*/ 'text-t2 hover:bg-bg3 hover:text-t1',
  SidebarProjectItemIcon: /*tw*/ 'size-4 flex items-center justify-center flex-shrink-0 text-t3',
  SidebarProjectItemDueDate: /*tw*/ 'text-xs leading-5',
  SidebarProjectItemDueDateDanger: /*tw*/ 'text-accent-danger',
  SidebarProjectItemDueDateMuted: /*tw*/ 'text-t3',

  EntityHeaderContainer: /*tw*/ 'flex flex-col bg-bg1 flex-shrink-0',
  EntityHeaderMainRow: /*tw*/ 'min-h-11 flex items-start justify-between px-5 pr-3',
  EntityHeaderMainRowDetail: /*tw*/ '!px-3',
  EntityHeaderContentWrapper: /*tw*/ 'flex items-start gap-2 flex-1 min-w-0',
  EntityHeaderIconContainer: /*tw*/ 'h-5 w-4 flex-shrink-0 flex items-center justify-center text-t2 mt-3',
  EntityHeaderIconButton: /*tw*/ 'size-full flex items-center justify-center',
  EntityHeaderIconSvg: /*tw*/ 'size-4',
  EntityHeaderEditableTextArea:
    /*tw*/ 'flex-1 min-w-0 text-sm leading-5 font-semibold text-t1 bg-transparent border-none outline-none placeholder:text-t3 rounded-sm px-1 -mx-1 my-3',
  EntityHeaderTitle: /*tw*/ 'flex-1 min-w-0 text-sm leading-5 font-semibold text-t1 truncate my-3',
  EntityHeaderActionsContainer: /*tw*/ 'self-start flex items-center gap-0.5 mt-2.5',
  EntityHeaderActionIcon: /*tw*/ 'size-3.5 flex items-center justify-center',
  EntityHeaderActionIconSvg: /*tw*/ 'size-3.5',
  EntityHeaderIconActionButton:
    /*tw*/ 'size-6 flex items-center justify-center rounded-md text-t3 hover:bg-bg3 hover:text-t1 transition-colors flex-shrink-0',
  EntityHeaderIconActionButtonActive: /*tw*/ '!bg-bg3 !text-t1',
  EntityHeaderBelowTitleSlot: /*tw*/ 'mx-3 mb-2 px-3 py-1.5 bg-bg2 rounded-lg',
  EntityHeaderBelowTitleSlotDetail: /*tw*/ '!mx-1',

  ClearSelectionButton:
    'border-t border-line-regular h-15 flex items-center text-base text-t3 justify-center cursor-pointer',

  TaskDetailAttributeRow:
    /*tw*/ 'appearance-none flex items-start gap-2 py-1.5 px-2 -mx-2 rounded-md text-left bg-transparent border-none hover:bg-bg2 transition-colors cursor-pointer',
  TaskDetailAttributeIconContainer: /*tw*/ 'w-4 h-4 flex-shrink-0 flex items-center justify-center text-t3',
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

  RecurringRuleContent: /*tw*/ 'min-w-0 flex flex-col items-end gap-1',
  RecurringRuleSummaryHint: /*tw*/ 'text-xs leading-4 text-t3',
  RecurringRuleSummaryItem: /*tw*/ 'max-w-52 flex items-center gap-1.5',
  RecurringRuleSummaryTitle: /*tw*/ 'text-xs leading-4 text-t3 whitespace-nowrap',
  RecurringRuleSummaryValue: /*tw*/ 'text-xs leading-4 text-t1 truncate',

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

  tagFilterBarContainer: /*tw*/ '-mx-1 flex min-w-0 flex-wrap items-center gap-0.5',
  tagFilterBarIcon: /*tw*/ 'mr-1 h-5 flex items-center justify-center text-t3',
  tagFilterBarIconSvg: /*tw*/ 'size-4',
  tagFilterBarChip: /*tw*/ 'h-6 rounded-full px-2 text-xs leading-5 transition-colors cursor-pointer select-none',
  tagFilterBarChipIdle: /*tw*/ 'text-t3 hover:bg-bg3 hover:text-t1',
  tagFilterBarChipActive: /*tw*/ 'bg-bg3 text-t1',

  ItemTagContainer: /*tw*/ 'flex min-w-0 max-w-30 items-center gap-1 text-xs leading-4',
  ItemTagNormal: /*tw*/ 'text-t3',
  ItemTagDanger: /*tw*/ 'text-accent-danger',
  ItemTagSelected: /*tw*/ '',
  ItemTagUnselected: /*tw*/ '',
  ItemTagIcon: /*tw*/ 'size-3 flex items-center justify-center flex-shrink-0',
  ItemTagIconSvg: /*tw*/ 'size-3',
  ItemTagLabel: /*tw*/ 'min-w-0 truncate',

  AuthFormContainer: /*tw*/ 'flex flex-col gap-4',
  AuthFormErrorMessage: /*tw*/ 'px-4 text-xs leading-4 text-accent-danger',
  AuthFormButtonSection: /*tw*/ 'flex flex-col gap-3 px-4',
  AuthFormFooterContainer: /*tw*/ 'flex items-center gap-2',
  AuthFormFooterText: /*tw*/ 'text-xs font-normal text-t3 leading-4',
  AuthFormSwitchButton: /*tw*/ 'text-brand hover:underline ml-1',
  AuthFormLink: /*tw*/ 'text-brand mx-1 hover:underline',
  AuthFormInput:
    /*tw*/ 'block w-full bg-transparent px-4 py-3 text-sm leading-5 text-t1 outline-none transition-colors placeholder:text-t3 focus:bg-bg2',
  AuthFormSubmitButton: /*tw*/ 'self-start',
  DefaultInputField:
    /*tw*/ 'w-full h-13 rounded-lg border border-line-regular bg-bg1 px-3 py-3 text-base font-normal leading-5 text-t1 placeholder-t3 focus:border-brand focus:pr-8 focus:outline-none',

  SelectContainer: /*tw*/ 'relative',
  SelectTrigger:
    /*tw*/ 'flex min-w-32 cursor-pointer items-center gap-2 rounded-md border border-line-regular bg-transparent px-2 py-1 text-xs text-t1 transition-colors hover:border-line-bold',
  SelectTriggerLabel: /*tw*/ 'flex-1 truncate text-left',
  SelectTriggerIcon: /*tw*/ 'size-3.5 flex-shrink-0 text-t3 transition-transform',

  SettingsSidebarBackRow: /*tw*/ 'flex h-12 flex-shrink-0 items-center pl-5 pr-2',
  SettingsSidebarBackLink:
    /*tw*/ 'flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 -mx-2 text-xs text-t2 transition-colors hover:bg-bg3 hover:text-t1',
  SettingsSidebarBackIconContainer: /*tw*/ 'flex size-3.5 items-center justify-center',
  SettingsSidebarBackIcon: /*tw*/ 'size-3.5',
  SettingsSidebarBackLabel: /*tw*/ 'font-medium',
  SettingsSidebarGroupList: /*tw*/ 'flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2',
  SettingsSidebarGroup: /*tw*/ 'flex flex-col gap-0.5',
  SettingsSidebarGroupHeading: /*tw*/ 'px-2 pb-1.5 pt-3 text-xs font-semibold text-t3',
  MacTopBarContainer: /*tw*/ 'flex h-8 flex-shrink-0 items-center px-2',
  MacTopBarDragRegion: /*tw*/ 'h-full flex-1',
  MacTopBarControlRegion: /*tw*/ 'flex items-center gap-0.5',
  MacTopBarButtonDisabled: /*tw*/ 'pointer-events-none opacity-40',

  AIChatContentWidth: /*tw*/ 'w-full max-w-2xl mx-auto',
  AIChatPageRoot: /*tw*/ 'flex h-full w-full flex-col bg-bg1',
  AIChatPageHeader: /*tw*/ 'h-11 flex flex-shrink-0 items-center justify-between bg-bg1 px-5 pr-3',
  AIChatPageHeaderMain: /*tw*/ 'flex min-w-0 flex-1 items-center gap-2',
  AIChatPageHeaderIconContainer: /*tw*/ 'w-4 h-5 flex items-center justify-center text-t2',
  AIChatPageHeaderIconButton: /*tw*/ 'size-full flex items-center justify-center',
  AIChatPageHeaderIcon: /*tw*/ 'size-4',
  AIChatPageHeaderTitleGroup: /*tw*/ 'group flex min-w-0 flex-1 items-center gap-1',
  AIChatPageHeaderTitle: /*tw*/ 'truncate text-sm font-semibold text-t1',
  AIChatPageHeaderActions: /*tw*/ 'flex items-center gap-1',
  AIChatPageHeaderActionButton:
    /*tw*/ 'flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-xs text-t2 transition-colors',
  AIChatPageHeaderActionIconContainer: /*tw*/ 'size-3.5 flex items-center justify-center',
  AIChatPageHeaderActionIcon: /*tw*/ 'size-3.5',
  AIChatPageHeaderActionLabel: /*tw*/ 'text-xs font-normal leading-5',
  AIChatPageScrollContainer: /*tw*/ 'flex-1 overflow-y-auto px-6 py-6',

  AIChatInputOuter: /*tw*/ 'px-6 pb-6',
  AIChatInputNotice: /*tw*/ 'rounded-xl border border-line-light bg-bg2 px-4 py-3 text-center text-sm text-t3',
  AIChatInputNoticeLink: /*tw*/ 'ml-1 text-brand hover:underline',
  AIChatInputContainer:
    /*tw*/ 'flex flex-col gap-2 rounded-xl border border-line-light bg-bg2 px-3 py-2 transition-colors focus-within:border-line-bold',
  AIChatInputLinkedRow: /*tw*/ 'flex items-start gap-2 py-1 text-xs text-t2',
  AIChatInputLinkedContent: /*tw*/ 'flex min-w-0 flex-1 flex-col gap-0.5 border-l-2 border-brand pl-2',
  AIChatInputLinkedLabel: /*tw*/ 'text-xs text-brand',
  AIChatInputLinkedText: /*tw*/ 'line-clamp-2 text-xs leading-5 text-t3',
  AIChatInputLinkedClearButton:
    /*tw*/ 'flex size-4 flex-shrink-0 items-center justify-center rounded-sm text-t3 transition-colors hover:bg-bg3 hover:text-t1',
  AIChatInputLinkedClearIcon: /*tw*/ 'size-3',
  AIChatInputFormRow: /*tw*/ 'flex items-end gap-2',
  AIChatInputTextarea:
    /*tw*/ 'min-h-6 max-h-32 flex-1 resize-none overflow-y-auto border-none bg-transparent px-0 py-0 text-sm leading-5 text-t1 outline-none placeholder:text-t3',
  AIChatInputSubmitButton:
    /*tw*/ 'flex size-7 flex-shrink-0 items-center justify-center rounded-md bg-brand text-white transition-opacity hover:opacity-90',
  AIChatInputSubmitIcon: /*tw*/ 'size-4',

  AIChatMessageListEmpty: /*tw*/ 'flex h-full items-center justify-center text-t3',
  AIChatMessageList: /*tw*/ 'flex flex-col gap-6',
  AIChatThinkingBlock: /*tw*/ 'overflow-hidden rounded-md border border-line-light bg-bg2',
  AIChatThinkingToggle:
    /*tw*/ 'flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-t3 transition-colors hover:text-t1',
  AIChatThinkingIcon: /*tw*/ 'size-3.5 flex-shrink-0',
  AIChatThinkingStreamingIcon: /*tw*/ 'size-3.5 flex-shrink-0 animate-spin',
  AIChatThinkingLabel: /*tw*/ 'flex-1',
  AIChatThinkingContent: /*tw*/ 'whitespace-pre-wrap break-words px-3 pb-3 text-xs leading-5 text-t1',
  AIChatMessageFooterStatus: /*tw*/ 'flex items-center gap-1 text-xs text-t3',
  AIChatMessageFooterLoadingIcon: /*tw*/ 'size-3 animate-spin text-brand',
  AIChatMessageFooterStoppedIcon: /*tw*/ 'size-3',
  AIChatMessageReplyButton: /*tw*/ 'select-none text-xs text-t3 transition-colors hover:text-t1',
  AIChatMessageText: /*tw*/ 'whitespace-pre-wrap text-sm leading-5 text-t1',
  AIChatMessageContainerUser: /*tw*/ 'w-full max-w-2xl mx-auto flex flex-col items-end gap-1',
  AIChatMessageContainerAssistant: /*tw*/ 'w-full max-w-2xl mx-auto flex flex-col items-start gap-1',
  AIChatMessageUserBubble:
    /*tw*/ 'flex max-w-full flex-col gap-1 rounded-xl bg-bg3 px-3 py-2 text-sm leading-5 text-t1',
  AIChatMessageLinkedQuote: /*tw*/ 'line-clamp-2 border-l-2 border-brand pl-2 text-xs leading-5 text-t3',
  AIChatMessageAssistantContent: /*tw*/ 'flex max-w-full flex-col gap-2 text-sm leading-5 text-t1',

  AIChatToolStatusBase: /*tw*/ 'flex items-center gap-1 text-xs',
  AIChatToolStatusToneNeutral: /*tw*/ 'text-t3',
  AIChatToolStatusToneSuccess: /*tw*/ 'text-accent-success',
  AIChatToolStatusToneWarning: /*tw*/ 'text-accent-warning',
  AIChatToolStatusToneDanger: /*tw*/ 'text-accent-danger',
  AIChatToolStatusIcon: /*tw*/ 'size-3.5 flex-shrink-0',
  AIChatToolStatusLoadingIcon: /*tw*/ 'size-3.5 flex-shrink-0 animate-spin',
  AIChatToolSectionButton:
    /*tw*/ 'flex w-full items-center gap-1 py-1.5 text-xs text-t3 transition-colors hover:text-t1',
  AIChatToolSectionTitle: /*tw*/ 'flex-1 text-left',
  AIChatToolSectionChevron: /*tw*/ 'size-3.5 flex-shrink-0 transition-transform',
  AIChatToolSectionChevronExpanded: /*tw*/ 'rotate-90',
  AIChatToolSectionContent:
    /*tw*/ 'mb-1 overflow-x-auto break-all whitespace-pre-wrap rounded-md bg-bg3 px-2 py-1.5 font-mono text-xs leading-5 text-t1',
  AIChatToolCard: /*tw*/ 'overflow-hidden rounded-md border border-line-light bg-bg2',
  AIChatToolCardHeader: /*tw*/ 'flex items-center gap-2 px-3 py-2',
  AIChatToolCardTitle: /*tw*/ 'flex-1 truncate text-sm font-medium text-t1',
  AIChatToolCardBody: /*tw*/ 'flex flex-col px-3 pb-2',
  AIChatToolCardActions: /*tw*/ 'flex items-center gap-2 pt-2',
  AIChatToolCardConfirmButton:
    /*tw*/ 'rounded-md bg-brand px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90',
  AIChatToolCardCancelButton:
    /*tw*/ 'rounded-md border border-line-light bg-bg1 px-3 py-1.5 text-xs text-t1 transition-colors hover:bg-bg3',

  SwitchLabel: /*tw*/ 'inline-flex items-center cursor-pointer',
  SwitchLabelDisabled: /*tw*/ 'opacity-50 cursor-not-allowed',
  SwitchInput: /*tw*/ 'sr-only',
  SwitchTrack: /*tw*/ 'relative h-5 w-9 rounded-full transition-colors',
  SwitchTrackChecked: /*tw*/ 'bg-brand',
  SwitchTrackUnchecked: /*tw*/ 'bg-bg3',
  SwitchThumb: /*tw*/ 'absolute left-0.5 top-0.5 size-4 rounded-full bg-bg1 transition-transform',
  SwitchThumbChecked: /*tw*/ 'translate-x-4',

  SettingsItemContainer: /*tw*/ 'flex items-center justify-between gap-4 px-4 py-3',
  SettingsItemContentWrapper: /*tw*/ 'flex min-w-0 flex-1 flex-col gap-0.5',
  SettingsItemTitle: /*tw*/ 'text-sm font-medium leading-5 text-t1',
  SettingsItemDescription: /*tw*/ 'text-xs leading-4 text-t3',
  SettingsItemActionWrapper: /*tw*/ 'flex flex-shrink-0 items-center',
  SettingsItemInput:
    /*tw*/ 'w-45 rounded-md border border-line-regular bg-transparent px-2 py-1 text-xs leading-4 text-t1 placeholder:text-t3 outline-none transition-colors hover:border-line-bold focus:border-brand',

  SettingsItemGroupContainer: 'overflow-hidden rounded-lg border border-line-light bg-bg1 divide-y divide-line-light',

  SettingButtonBase:
    /*tw*/ 'focus:outline-none flex flex-row justify-center items-center whitespace-nowrap cursor-pointer',
  SettingButtonSizeLarge: /*tw*/ 'h-8 rounded-md px-6 text-xs',
  SettingButtonSizeMedium: /*tw*/ 'h-8 rounded-md px-3 text-xs',
  SettingButtonSizeSmall: /*tw*/ 'h-7 rounded-md px-3 text-xs',
  SettingButtonFullWidth: /*tw*/ 'w-full',

  SettingButtonPrimaryEmphasis: /*tw*/ 'bg-brand text-white hover:opacity-90 transition-opacity',
  SettingButtonSolidDanger: /*tw*/ 'bg-accent-danger text-white hover:opacity-90 transition-opacity',
  SettingButtonSolidDefault: /*tw*/ 'bg-bg3 text-white hover:opacity-90 transition-opacity',

  SettingButtonFilledDanger:
    /*tw*/ 'bg-accent-danger/10 text-accent-danger hover:bg-accent-danger/20 transition-colors',
  SettingButtonFilledDefault: /*tw*/ 'border border-line-light bg-bg2 text-t1 hover:bg-bg3 transition-colors',

  SettingButtonDefaultPrimary: /*tw*/ 'bg-transparent text-brand hover:bg-brand/10 transition-colors',
  SettingButtonDefaultDanger: /*tw*/ 'bg-transparent text-accent-danger hover:bg-accent-danger/10 transition-colors',
  SettingButtonDefaultDefault: /*tw*/ 'bg-transparent text-t1 hover:bg-bg2 transition-colors',

  SettingButtonTextPrimary: /*tw*/ 'bg-transparent text-brand hover:underline',
  SettingButtonTextDanger: /*tw*/ 'bg-transparent text-accent-danger hover:underline',
  SettingButtonTextDefault: /*tw*/ 'bg-transparent text-t1 hover:bg-bg2 transition-colors',

  SettingButtonDisabled: /*tw*/ 'opacity-50 cursor-not-allowed pointer-events-none',

  DatabaseListStateContainer: /*tw*/ 'text-center py-4',
  DatabaseListStateText: /*tw*/ 'text-t2',
  DatabaseListErrorText: /*tw*/ 'text-accent-danger',

  TodaySectionHeading: /*tw*/ 'flex items-center gap-2 px-2 pt-5 pb-1.5',
  TodaySectionTitle: /*tw*/ 'text-xs font-semibold text-t3 uppercase tracking-wider',
  TodaySectionCount: /*tw*/ 'text-xs text-t3',

  BackButtonLink: /*tw*/ 'mb-2 flex h-12 w-fit flex-row items-center rounded-lg px-3 no-underline text-t1 hover:bg-bg2',
  BackButtonContainer: /*tw*/ 'flex flex-row items-center gap-1',
  BackButtonIcon: /*tw*/ 'w-6 h-6 flex items-center justify-center',
  BackButtonLabel: /*tw*/ 'text-xl leading-5',

  DetailViewContainer: /*tw*/ 'h-full flex flex-col',
  DetailViewHeaderStatusIconColor: /*tw*/ 'text-t3',
  DetailViewHeaderStatusBox: /*tw*/ 'size-4',
  DetailViewContent: /*tw*/ 'flex-1 overflow-y-auto',
  DetailViewContentInner: /*tw*/ 'px-3 pt-1 pb-3',
  DetailViewNotesTextarea:
    'w-full min-h-15 px-0 mb-3 text-sm text-t1 placeholder:text-t3 bg-transparent border-none outline-none resize-none leading-5',
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

  InfoItemContainer: /*tw*/ 'flex items-center justify-between gap-4 px-4 py-3',
  InfoItemLabel: /*tw*/ 'text-xs text-t3',
  InfoItemValueContainer: /*tw*/ 'flex items-center gap-2',
  InfoItemValue: /*tw*/ 'text-sm text-t1',
  InfoItemCopyButton:
    /*tw*/ 'size-6 flex items-center justify-center rounded-md text-t3 hover:bg-bg3 hover:text-t1 cursor-pointer transition-colors',
  InfoItemCopyIcon: /*tw*/ 'size-3.5',

  CheckboxContainer: /*tw*/ 'flex items-center gap-2 px-4 py-3',
  CheckboxInputContainer: /*tw*/ 'relative',
  CheckboxInput: /*tw*/ 'sr-only',
  CheckboxBox: /*tw*/ 'flex h-5 w-4 items-center justify-center cursor-pointer text-t3',
  CheckboxBoxChecked: /*tw*/ 'text-brand',
  CheckboxBoxUnchecked: /*tw*/ 'text-t3',
  CheckboxIcon: /*tw*/ 'size-4',
  CheckboxLabel: /*tw*/ 'text-xs text-t3 leading-4',

  SettingsTitleContainer: /*tw*/ 'mb-3 flex items-start justify-between gap-4 px-4',
  SettingsTitleContent: /*tw*/ 'flex min-w-0 flex-1 flex-col gap-1',
  SettingsTitleHeading: /*tw*/ 'font-semibold text-t1',
  SettingsTitleHeadingLevel1: /*tw*/ 'text-base leading-6',
  SettingsTitleHeadingLevel2: /*tw*/ 'text-sm leading-5 text-t2',
  SettingsTitleDescription: /*tw*/ 'text-xs leading-4 text-t3',
  SettingsTitleActionContainer: /*tw*/ 'flex flex-shrink-0 items-center',
  SettingsSectionContainer: /*tw*/ 'flex flex-col',

  TaskListItemContainer:
    /*tw*/ 'group relative flex items-start gap-2 px-2 py-2 rounded-md outline-none cursor-pointer',
  TaskListItemContainerCompleted: /*tw*/ 'opacity-60',
  TaskListItemContainerWillDisappear: /*tw*/ 'opacity-50',
  TaskListItemContainerSelected: /*tw*/ 'bg-bg3',
  TaskListItemContainerArchived: /*tw*/ 'opacity-50!',
  TaskListItemContainerSelectedInactive: /*tw*/ 'bg-bg2',
  TaskListItemDragHandle:
    'absolute left-0 top-0 flex h-full w-3 -translate-x-full items-center justify-center text-t3 opacity-0 group-hover:opacity-100 transition-opacity',
  TaskListItemDragHandleIcon: /*tw*/ 'size-2.5',
  TaskListItemStatusButton: /*tw*/ 'flex h-5 w-4 flex-shrink-0 items-center justify-center text-t3 outline-none',
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
  SubtaskItemStatusButton: 'flex size-4 flex-shrink-0 items-center justify-center text-t3',
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

  SettingsContentContainer: /*tw*/ 'h-full w-full overflow-y-auto',
  SettingsContentBackButton: /*tw*/ 'p-3',
  SettingsContentInner: /*tw*/ 'mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 pb-32',
  SettingsContentInnerWithBack: /*tw*/ 'pt-6',
  SettingsContentInnerWithoutBack: /*tw*/ 'pt-10',
  SettingsContentPageTitle: /*tw*/ 'px-4 text-3xl font-semibold leading-9 text-t1',

  EntityPageNotFoundContainer: /*tw*/ 'h-full w-full bg-bg1 flex items-center justify-center',
  EntityPageNotFoundText: /*tw*/ 'text-t3 text-lg',

  TaskListSectionItemsContainer: /*tw*/ '',

  FutureProjectsPageContainer: /*tw*/ 'h-full w-full bg-bg1',
  FutureProjectsPageWrapper: /*tw*/ 'h-full flex flex-col',
  FutureProjectsPageContent: /*tw*/ 'flex-1 overflow-y-auto p-4',

  ProjectTaskAreaContainer: /*tw*/ 'flex-1',
  ProjectIconContainer: /*tw*/ 'inline-flex shrink-0 items-center justify-center text-t3',
  ProjectIconSvg: /*tw*/ 'block',
  TaskIconContainer: /*tw*/ 'inline-flex shrink-0 items-center justify-center',

  DatabaseItemContainer: /*tw*/ 'flex w-full flex-col gap-1 px-4 py-3',
  DatabaseItemMainRow: /*tw*/ 'flex items-center gap-3',
  DatabaseItemContentWrapper: /*tw*/ 'flex flex-1 items-center gap-2',
  DatabaseItemIconWrapper: /*tw*/ 'flex size-6 flex-shrink-0 items-center justify-center rounded text-t3',
  DatabaseItemIcon: /*tw*/ 'size-4 flex items-center justify-center',
  DatabaseItemContent: /*tw*/ 'flex flex-1 flex-col gap-0.5',
  DatabaseItemTitleRow: /*tw*/ 'flex items-center gap-2',
  DatabaseItemTitle: /*tw*/ 'text-sm font-medium text-t1',
  DatabaseItemCurrentBadge: /*tw*/ 'rounded bg-brand/10 px-1.5 py-0.5 text-xs text-brand',
  DatabaseItemDescriptionRow: /*tw*/ 'flex items-center gap-2',
  DatabaseItemDescription: /*tw*/ 'text-xs text-t3',
  DatabaseItemActionButtons: /*tw*/ 'flex items-center gap-1 shrink-0',
  DatabaseItemActionButton:
    /*tw*/ 'flex size-6 items-center justify-center rounded-md text-t3 transition-colors hover:bg-bg2 hover:text-t1',
  DatabaseItemActionButtonDanger:
    /*tw*/ 'flex size-6 items-center justify-center rounded-md text-t3 transition-colors hover:bg-accent-danger/10 hover:text-accent-danger',
  DatabaseItemActionButtonIcon: /*tw*/ 'size-4',
  DatabaseItemPropertiesSection: /*tw*/ 'shrink-0',
  DatabaseItemProperty: /*tw*/ 'flex flex-col gap-0.5',
  DatabaseItemPropertyLabel: /*tw*/ 'text-sm text-t1',
  DatabaseItemPropertyValue: /*tw*/ 'text-xs text-t3',
  DatabaseItemExtraSection: /*tw*/ 'flex flex-col gap-0.5 pl-8',

  DatabaseTokenSection: /*tw*/ 'flex flex-col gap-0.5',
  DatabaseTokenRow: /*tw*/ 'flex items-center gap-3',
  DatabaseTokenLine: /*tw*/ 'flex-1 min-w-0 text-xs text-t3 truncate',
  DatabaseTokenActions: /*tw*/ 'flex items-center gap-1.5 shrink-0 text-xs text-t3',
  DatabaseTokenActionSeparator: /*tw*/ 'select-none',
  DatabaseTokenCopyLink: /*tw*/ 'transition-colors hover:text-brand cursor-pointer',
  DatabaseTokenRevokeLink: /*tw*/ 'transition-colors hover:text-accent-danger cursor-pointer',

  SettingsButtonRow: /*tw*/ 'flex items-center gap-3',
  SettingsEmptyStateActionButton:
    /*tw*/ 'inline-flex h-7 items-center gap-1.5 rounded-md bg-transparent px-3 text-xs text-t1 transition-colors hover:bg-bg2',
  SettingsEmptyStateActionIcon: /*tw*/ 'size-3.5',
  SettingsDisabledStateContainer: /*tw*/ 'w-full px-4 py-12 text-center',
  SettingsDisabledStateText: /*tw*/ 'text-sm text-t3',
  SettingsDisabledStateLink:
    /*tw*/ 'mt-4 inline-flex items-center text-sm text-brand transition-colors hover:text-brand/80',
  SettingsDialogRoot: /*tw*/ 'fixed inset-0 z-[60] flex items-center justify-center',
  SettingsDialogBackdrop: /*tw*/ 'absolute inset-0 bg-black/40',
  SettingsDialogSurface:
    /*tw*/ 'relative mx-4 flex w-[28rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border border-line-regular bg-bg1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
  SettingsDialogHeader: /*tw*/ 'flex items-center justify-between gap-3 px-4 py-3',
  SettingsDialogTitle: /*tw*/ 'text-sm font-semibold text-t1',
  SettingsDialogCloseButton:
    /*tw*/ 'size-6 flex items-center justify-center rounded-sm text-t3 transition-colors hover:bg-bg3 hover:text-t1 cursor-pointer',
  SettingsDialogCloseIcon: /*tw*/ 'size-3.5',
  SettingsDialogContent: /*tw*/ 'px-4 pt-1 pb-2',
  SettingsDialogActions: /*tw*/ 'mt-2 flex flex-col gap-4',
  SettingsDialogField: /*tw*/ 'flex flex-col space-y-1.5',
  SettingsDialogLabel: /*tw*/ 'text-xs font-medium text-t1',
  SettingsDialogRequired: /*tw*/ 'ml-0.5 text-accent-danger',
  SettingsDialogInput:
    /*tw*/ 'w-full rounded-md border border-line-regular bg-transparent px-2.5 py-1.5 text-xs text-t1 outline-none transition-colors hover:border-line-bold focus:border-brand placeholder:text-t3',
  SettingsDialogFooter: /*tw*/ 'flex justify-end gap-2 px-4 py-3',
  SettingsDialogCancelButton:
    /*tw*/ 'inline-flex h-7 items-center rounded-md px-3 text-xs text-t2 cursor-pointer transition-colors hover:bg-bg3 hover:text-t1 disabled:cursor-not-allowed disabled:opacity-50',
  SettingsDialogConfirmButton:
    /*tw*/ 'inline-flex h-7 items-center rounded-md bg-brand px-3 text-xs text-white cursor-pointer transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50',

  SpaceMedium: /*tw*/ 'h-4',
  SpaceLarge: /*tw*/ 'h-16',

  AccountSettingsButtonContainer: /*tw*/ 'flex flex-col gap-2',

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

  DragBar: /*tw*/ 'fixed top-0 left-0 w-screen h-2 z-50',
  SidebarLayoutContent: /*tw*/ 'h-full overflow-hidden rounded-lg border border-line-light bg-bg1',
  SidebarLayoutContentCollapsedPadding: /*tw*/ 'pl-4',

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
  DesktopHeadingListItemContentHidden: /*tw*/ 'opacity-0',
  DesktopHeadingListItemDragHandle:
    'absolute left-0 top-0 flex h-full w-3 -translate-x-full items-center justify-center text-t3 opacity-0 transition-opacity group-hover:opacity-100',
  DesktopHeadingListItemDragHandleIcon: /*tw*/ 'size-2.5',
  DesktopHeadingListItemInput:
    /*tw*/ 'flex-1 min-w-0 bg-transparent outline-none text-xs font-semibold uppercase tracking-wider text-t3 placeholder:text-t3 rounded-sm px-1 -mx-1 truncate',

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
  OverlayBackgroundMask: /*tw*/ 'absolute inset-0 bg-black/40',
  OverlayContainer:
    /*tw*/ 'relative mx-4 flex w-[28rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border border-line-regular bg-bg1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]',

  OverlayContainerBackdrop: /*tw*/ 'fixed inset-0',
  OverlayContainerContent:
    /*tw*/ 'fixed bg-bg1 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-line-regular',
  OverlayContainerFilterWrapper: /*tw*/ 'px-2 py-1.5 border-b border-line-light',
  OverlayContainerFilterInput: /*tw*/ 'w-full bg-transparent outline-none text-xs text-t1 placeholder:text-t3',
  OverlayHeader: /*tw*/ 'flex items-center justify-between gap-3 px-4 py-3 border-b border-line-light',
  OverlayTitle: /*tw*/ 'text-sm font-semibold text-t1',
  OverlayCloseButton:
    /*tw*/ 'size-6 flex items-center justify-center rounded-sm text-t3 hover:bg-bg3 hover:text-t1 transition-colors',
  OverlayCloseIcon: /*tw*/ 'size-3.5',
  OverlayContent: /*tw*/ 'px-4 py-3',
  OverlayFooter: /*tw*/ 'flex justify-end gap-2 px-4 py-3 border-t border-line-light',
  OverlayCancelButton:
    /*tw*/ 'text-xs text-t2 px-3 py-1 rounded-md hover:bg-bg3 hover:text-t1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  OverlayConfirmButton:
    /*tw*/ 'text-xs text-white bg-brand px-3 py-1 rounded-md hover:opacity-90 cursor-pointer transition-opacity disabled:pointer-events-none disabled:opacity-50',
  OverlayConfirmButtonDisabled: /*tw*/ 'pointer-events-none opacity-50',

  DesktopDialogDescription: /*tw*/ 'text-sm text-t3 leading-4.5 font-normal',
  DesktopDialogActionsContainer: /*tw*/ 'flex flex-col gap-2 mt-2',
  DesktopDialogField: /*tw*/ 'flex flex-col space-y-1',
  DesktopDialogInput:
    /*tw*/ 'w-full rounded-md border border-line-light bg-bg2 px-2 py-1 text-xs text-t1 outline-none transition-colors focus:border-line-bold placeholder:text-t3',
  DesktopDialogError: /*tw*/ 'text-sm text-accent-danger',

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
  TreeSelectOverlayItemIcon: /*tw*/ 'size-3.5',
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

  RecurringTaskSettingsDialogRoot: /*tw*/ 'fixed inset-0 z-[60] flex items-center justify-center',
  RecurringTaskSettingsDialogBackdrop: /*tw*/ 'absolute inset-0 bg-black/40',
  RecurringTaskSettingsDialogSurface:
    /*tw*/ 'relative mx-4 flex w-[28rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border border-line-regular bg-bg1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
  RecurringTaskSettingsDialogHeader: /*tw*/ 'flex items-center justify-between gap-3 px-4 py-3',
  RecurringTaskSettingsDialogTitle: /*tw*/ 'text-sm font-semibold text-t1',
  RecurringTaskSettingsDialogCloseButton:
    /*tw*/ 'size-6 flex items-center justify-center rounded-sm text-t3 hover:bg-bg3 hover:text-t1 cursor-pointer transition-colors',
  RecurringTaskSettingsDialogCloseIcon: /*tw*/ 'size-3.5',
  RecurringTaskSettingsDialogBody: /*tw*/ 'flex flex-col gap-4 px-4 py-3',
  RecurringTaskSettingsDialogBodyHint: /*tw*/ 'text-xs leading-5 text-t3',
  RecurringTaskSettingsDialogSection: /*tw*/ 'flex flex-col gap-1.5',
  RecurringTaskSettingsDialogSectionHeader: /*tw*/ 'flex items-baseline justify-between gap-3',
  RecurringTaskSettingsDialogSectionHeaderResult: /*tw*/ 'flex items-baseline gap-1 min-w-0',
  RecurringTaskSettingsDialogSectionHeaderPlaceholder: /*tw*/ 'text-xs text-t3',
  RecurringTaskSettingsDialogSectionTitle: /*tw*/ 'text-xs font-medium text-t2',
  RecurringTaskSettingsDialogInput:
    /*tw*/ 'w-full rounded-md border border-line-regular bg-transparent px-2.5 py-1.5 text-xs text-t1 outline-none transition-colors hover:border-line-bold focus:border-brand placeholder:text-t3',
  RecurringTaskSettingsDialogInputDanger:
    /*tw*/ 'border-accent-danger hover:border-accent-danger focus:border-accent-danger',
  RecurringTaskSettingsDialogSummaryCard: /*tw*/ 'text-xs leading-5 text-t3 break-words',
  RecurringTaskSettingsDialogSummaryArrow: /*tw*/ 'text-xs text-t3',
  RecurringTaskSettingsDialogSummaryValueEmphasis: /*tw*/ 'text-xs font-medium text-brand whitespace-nowrap',
  RecurringTaskSettingsDialogErrorCard: /*tw*/ 'flex flex-col gap-0.5 text-xs leading-5',
  RecurringTaskSettingsDialogErrorDescription: /*tw*/ 'text-accent-danger',
  RecurringTaskSettingsDialogSyntaxHint: /*tw*/ 'text-t3',
  RecurringTaskSettingsDialogFooter: /*tw*/ 'flex justify-end gap-2 px-4 py-3',
  RecurringTaskSettingsDialogCancelButton:
    /*tw*/ 'rounded-md px-3 py-1 text-xs text-t2 hover:bg-bg3 hover:text-t1 cursor-pointer transition-colors',
  RecurringTaskSettingsDialogConfirmButton:
    /*tw*/ 'rounded-md bg-brand px-3 py-1 text-xs text-white hover:opacity-90 cursor-pointer transition-opacity',
  RecurringTaskSettingsDialogConfirmButtonDisabled: /*tw*/ 'pointer-events-none opacity-50',

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
  DatePickerOverlayDivider: /*tw*/ 'h-px bg-line-light',
  DatePickerCalendarNavIcon: /*tw*/ 'size-3.5',
  TimePickerOverlayContainer:
    /*tw*/ 'w-[19rem] overflow-hidden rounded-md border border-line-regular bg-bg1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
  TimePickerOverlayDisplay: /*tw*/ 'border-b border-line-light px-3 py-2 text-xs text-t1',
  TimePickerOverlayBody: /*tw*/ 'flex',
  TimePickerOverlayCalendarColumn: /*tw*/ 'min-w-0 flex-1 border-r border-line-light px-2 pb-2',
  TimePickerOverlayMonthHeader: /*tw*/ 'flex items-center justify-between pt-2 pb-1',
  TimePickerOverlayMonthLabel: /*tw*/ 'text-xs font-medium text-t1',
  TimePickerOverlayNav: /*tw*/ 'flex items-center gap-0.5',
  TimePickerOverlayNavButton:
    /*tw*/ 'size-5 cursor-pointer rounded-sm text-t3 transition-colors hover:bg-bg3 hover:text-t1 flex items-center justify-center',
  TimePickerOverlayWeekdayRow: /*tw*/ 'grid grid-cols-7 gap-0.5 pt-1 pb-0.5',
  TimePickerOverlayWeekdayCell: /*tw*/ 'h-5 flex items-center justify-center text-[10px] text-t3',
  TimePickerOverlayGrid: /*tw*/ 'grid grid-cols-7 gap-0.5 bg-bg1',
  TimePickerOverlayDayCell:
    /*tw*/ 'h-7 cursor-pointer rounded-sm text-xs text-t1 transition-colors hover:bg-bg3 flex items-center justify-center',
  TimePickerOverlayDayCellMuted: /*tw*/ 'text-t4',
  TimePickerOverlayDayCellToday: /*tw*/ 'text-brand',
  TimePickerOverlayDayCellSelected: /*tw*/ 'bg-brand text-white hover:bg-brand',
  TimePickerOverlayTimeColumn: /*tw*/ 'relative w-10 border-r border-line-light last:border-r-0',
  TimePickerOverlayTimeColumnScroll:
    /*tw*/ 'absolute inset-0 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  TimePickerOverlayTimeItem:
    /*tw*/ 'mx-1 h-7 cursor-pointer rounded-sm text-xs text-t2 transition-colors hover:bg-bg3 flex items-center justify-center',
  TimePickerOverlayTimeItemSelected: /*tw*/ 'bg-brand text-white hover:bg-brand hover:text-white',
  TimePickerOverlayFooter: /*tw*/ 'flex items-center justify-end gap-2 border-t border-line-light px-3 py-2',
  TimePickerOverlayCancelButton:
    /*tw*/ 'rounded-md px-3 py-1 text-xs text-t2 cursor-pointer transition-colors hover:bg-bg3 hover:text-t1',
  TimePickerOverlayConfirmButton:
    /*tw*/ 'rounded-md bg-brand px-3 py-1 text-xs text-white cursor-pointer transition-opacity hover:opacity-90',
  TimePickerOverlayCurrentMonthIcon: /*tw*/ 'size-2.5',
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
  CommandPaletteInputContainerWithQuery: /*tw*/ 'border-b border-line-regular',
  CommandPaletteInput: /*tw*/ 'flex-1 bg-transparent text-base text-t1 placeholder-t3 focus:outline-none font-normal',
  CommandPaletteResultsContainer: /*tw*/ 'max-h-96 overflow-y-auto p-3',
  CommandPaletteResultsEmpty: /*tw*/ 'flex items-center justify-center h-24 text-t3 text-base',
  CommandPaletteResultItem:
    /*tw*/ 'flex items-start gap-2 px-2 py-2 rounded-md hover:bg-bg2 cursor-pointer transition-colors',
  CommandPaletteResultItemSelected: /*tw*/ 'bg-bg2',
  CommandPaletteResultItemIcon: /*tw*/ 'size-4 text-t3 flex-shrink-0 flex items-center justify-center',
  CommandPaletteResultItemIconSvg: /*tw*/ 'size-4',
  CommandPaletteResultItemContent: /*tw*/ 'flex min-w-0 flex-1 flex-col gap-0.5',
  CommandPaletteResultItemParent: /*tw*/ 'flex min-w-0 items-center gap-1 text-xs leading-4 text-t3',
  CommandPaletteResultItemParentIcon: /*tw*/ 'size-3 text-t3 flex-shrink-0 flex items-center justify-center',
  CommandPaletteResultItemParentIconSvg: /*tw*/ 'size-3',
  CommandPaletteResultItemParentTitle: /*tw*/ 'truncate min-w-0',
  CommandPaletteResultItemTitle: /*tw*/ 'text-sm text-t1 truncate leading-4 h-4',
};

export type DesktopThemeDefinition = typeof desktopStyles;

formatTheme(desktopStyles);
