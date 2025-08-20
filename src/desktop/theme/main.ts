import { formatTheme } from '@/base/common/formatTheme';

export const desktopStyles = {
  sidebarContainerStyle: 'w-full h-full pl-2 pt-2 pr-4 flex flex-col',
  sidebarBackground: 'bg-bg3',

  // Sidebar Menu
  SidebarMenuItemContainer: 'space-y-2',
  SidebarMenuItem: 'h-11 px-3 flex rounded-lg text-base leading-5 items-center gap-3 group',
  SidebarMenuItemActive: 'bg-brand text-white',
  SidebarMenuItemInactive: 'text-t1 hover:bg-bg1',
  SidebarMenuItemIcon: 'size-5 flex items-center justify-center flex-shrink-0',
  SidebarMenuItemLabel: 'flex-1 truncate min-w-0',
  SidebarMenuItemBadgePrimary:
    'bg-stress-red min-w-5 text-sm leading-3.5 h-5 rounded-full text-red flex items-center justify-center px-1.5 text-white',
  SidebarMenuItemBadgeSecondaryActive: 'text-white',
  SidebarMenuItemBadgeSecondary: 'text-t3',
  SidebarMenuDivider: 'bg-line-bold h-0.25',

  SidebarProjectAreaList: 'flex-1 overflow-y-auto py-2',
  SidebarProjectAreaListNoTopPadding: 'pt-0',

  SidebarAreaToggleButton: 'flex-shrink-0 size-5 transition-all opacity-0 group-hover:opacity-100',
  SidebarAreaToggleButtonActive: 'text-white',
  SidebarAreaToggleButtonInactive: 'text-t3',
  SidebarAreaGap: 'mt-2',

  SidebarProjectItemActive: 'bg-brand text-white',
  SidebarProjectItemInactive: 'text-t2 hover:bg-bg1',
  SidebarProjectItemDueDate: 'flex-shrink-0',
  SidebarProjectItemDueDateDanger: 'text-stress-red',
  SidebarProjectItemDueDateActive: 'text-white',
  SidebarProjectItemDueDateInactive: 'text-t3',

  // Sidebar Bottom Actions
  SidebarActionsContainer: 'flex gap-1 h-15 items-center',
  SidebarCreateButton:
    'flex-1 flex items-center gap-2 px-3 py-2 text-sm text-t1 hover:bg-bg1 hover:text-brand rounded-md transition-colors h-11',
  SidebarCreateButtonIcon: 'size-5',
  SidebarSettingsButton:
    'flex items-center justify-center hover:bg-bg hover:bg-bg1 hover:text-brand rounded-md transition-colors size-11 text-t3',
  SidebarSettingsButtonIcon: 'size-5',

  // Entity Header
  EntityHeaderContainer: 'min-h-15 flex items-start justify-between px-5 py-3.75 border-b border-line-regular bg-bg1',
  EntityHeaderContentWrapper: 'flex items-start gap-3 flex-1 min-w-0',
  EntityHeaderIconButton: 'size-7.5 flex items-center justify-center',
  EntityHeaderEditableTextArea:
    'flex-1 text-xl leading-7.5 font-medium text-t1 resize-none bg-transparent border-none outline-none px-0 py-0',
  EntityHeaderTitle: 'text-xl leading-7.5 font-medium text-t1 truncate',
  EntityHeaderActionsContainer: 'flex items-center gap-5',
  EntityHeaderActionButton:
    'flex items-center gap-2 px-1.5 py-1 text-sm text-t3 hover:bg-bg3 rounded-sm transition-colors h-7',
  EntityHeaderActionIcon: 'size-5 flex items-center content-center',
  EntityHeaderActionLabel: 'text-base leading-5 font-normal',

  // Clear Selection Button
  ClearSelectionButton:
    'border-t border-line-regular h-15 flex items-center text-base text-t3 justify-center cursor-pointer',

  // Task Location Field
  TaskLocationFieldButton: 'flex items-center py-2 gap-2 text-t2 h-11 hover:bg-bg3 px-3 rounded-lg w-full',
  TaskLocationFieldIcon: 'size-5 shrink-0',
  TaskLocationFieldMoveText: 'text-base leading-5',
  TaskLocationFieldLocationText: 'text-base leading-5 text-t1 truncate',

  // Task Date Field
  TaskDateFieldButton: 'flex items-center py-2 gap-2 text-t2 h-11 hover:bg-bg3 px-3 rounded-lg w-full',
  TaskDateFieldIcon: 'size-5 shrink-0 flex items-center justify-center',
  TaskDateFieldPlaceholderText: 'text-base leading-5',
  TaskDateFieldDateContainer: 'flex items-baseline gap-1.5 text-base leading-5',
  TaskDateFieldDateNormal: 'text-t1',
  TaskDateFieldDateOverdue: 'text-stress-red',
  TaskDateFieldRemainingText: 'text-t3',

  // Tags Field
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

  // Inbox Task Input
  InboxTaskInputWrapper: 'pt-3 mb-3',
  InboxTaskInputContainer: 'flex flex-row items-center p-3 gap-3 h-11 bg-bg3 rounded-lg',
  InboxTaskInputIcon: 'flex-none size-5 text-t3',
  InboxTaskInputField: 'flex-1 bg-transparent text-base text-t1 placeholder-t3 focus:outline-none font-normal',

  // Item Tag
  ItemTagContainer: 'flex text-xs leading-4 h-5 items-center px-2 gap-1 rounded-sm max-w-30 text-t2',
  ItemTagSelected: 'bg-bg1',
  ItemTagUnselected: 'bg-bg3',
  ItemTagIcon: 'size-3 flex items-center content-center flex-shrink-0',
  ItemTagLabel: 'truncate',

  // Auth Forms
  AuthFormSwitchButton: 'text-brand hover:underline ml-1',
  AuthFormLink: 'text-brand mx-1 hover:underline',

  // Select Component
  SelectContainer: 'relative',
  SelectTrigger:
    'box-border flex flex-row justify-between items-center p-3 gap-3 w-44 h-11 border border-line-light rounded-lg cursor-pointer bg-bg1 hover:border-brand focus-within:border-brand',
  SelectTriggerText: 'flex-none order-0 flex-grow-0 w-auto h-5 font-normal text-base leading-5 text-t1',
  SelectTriggerIcon: 'flex-none order-1 flex-grow-0 w-5 h-5 text-t3 transition-transform',
  SelectTriggerIconOpen: 'rotate-180',
  SelectDropdown:
    'absolute top-full left-0 right-0 mt-1 bg-bg1 border border-line-light rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto py-1',
  SelectOption: 'px-3 py-3 h-11 hover:bg-bg2 cursor-pointer text-t1 font-normal text-base leading-5 flex items-center',

  // Switch Component
  SwitchContainer: 'relative w-12.75 h-7.75 rounded-full transition-colors',
  SwitchContainerActive: 'bg-brand',
  SwitchContainerInactive: 'bg-bg2',
  SwitchKnob: 'absolute size-7.75 bg-white rounded-full transition-all duration-200 top-0 shadow-sm',
  SwitchKnobActive: 'left-5',
  SwitchKnobInactive: 'left-0.5',

  // Settings Item Component
  SettingsItemContainer: 'flex w-full items-start justify-between',
  SettingsItemContentWrapper: 'flex-1 pr-4',
  SettingsItemTitle: 'text-base font-medium text-t1 leading-6 h-6',
  SettingsItemDescription: 'text-sm font-normal text-t3 leading-4.5 h-4.5',
  SettingsItemActionWrapper: 'flex-shrink-0 h-10.5 flex item-center',

  // Settings Item Group Component
  SettingsItemGroupContainer:
    'flex flex-col justify-center items-start p-4 gap-3 border border-line-regular rounded-lg',
  SettingsItemGroupDivider: 'w-full h-0.25 bg-bg3',
};

export type DesktopThemeDefinition = typeof desktopStyles;

formatTheme(desktopStyles);
