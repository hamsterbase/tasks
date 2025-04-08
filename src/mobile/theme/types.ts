export interface ThemeDefinition {
  homeMenuBackground: string;
  homeMenuRound: string;
  homeMenuItemPadding: string;
  homePageItemGap: string;
  homeMenuNumberColor: string;
  homeMenuDueTaskNumberColor: string;

  itemRound: string;

  homeMenuIconStyle: string;
  headerFooterPadding: string;
  screenEdgePadding: string;
  listItemRound: string;
  listItemDraggedBackground: string;
  pageBackground: string;
  listItemBackground: string;
  listItemEditingBackground: string;

  headerBackground: string;
  headerPadding: string;

  // Bottom Menu theme variables
  bottomMenuHeight: string;
  bottomMenuBackground: string;
  bottomMenuBorder: string;
  bottomMenuItemHeight: string;
  bottomMenuTextNormal: string;
  bottomMenuTextActive: string;
  bottomMenuTextInactive: string;

  taskItemGroupRound: string;
  taskItemGroupBackground: string;
  taskItemGroupHeaderPadding: string;
  taskItemGroupTopRound: string;
  taskItemGroupBottomRound: string;
  taskItemGroupPaddingBottomWhenDragging: string;

  taskItemHeight: string;
  taskItemGap: string;
  taskItemIconSize: string;
  taskItemPaddingX: string;
  taskItemPlaceholderColor: string;

  taskItemEditingRound: string;
  taskItemEditingShadow: string;

  taskItemOverlayBackground: string;
  taskItemOverlayRound: string;
  taskItemOverlayShadow: string;

  taskItemDraggingRound: string;

  pageContentPaddingX: string;
  pageContentPaddingY: string;

  overlayBackground: string;
  overlayBackgroundOpacity: string;
  overlayAnimationDuration: string;

  actionSheetPadding: string;
  actionSheetRound: string;
  actionSheetBorder: string;
  actionSheetBackground: string;

  actionSheetActionGroupRound: string;
  actionSheetActionGroupBackground: string;
  actionSheetActionGroupItemPadding: string;
  actionSheetActionGroupItemGap: string;
  actionSheetContentBorder: string;

  // Tag Editor theme variables
  tagEditorContainerBackground: string;
  tagEditorSelectedTagColor: string;
  tagEditorInputTextColor: string;
  tagEditorSuggestionBackground: string;
  tagEditorSuggestionTextColor: string;
  tagEditorCreateTagTextColor: string;
  tagEditorContainerPadding: string;
  tagEditorContainerRound: string;
  tagEditorSuggestionPadding: string;
  tagEditorSuggestionRound: string;
  tagEditorTextSize: string;
  tagEditorSmallGap: string;
  tagEditorHeightDefault: string;
  tagEditorMinHeightDefault: string;

  // Calendar/DatePicker theme variables
  datePickerDayCellHeight: string;
  datePickerMonthHeaderHeight: string;
  datePickerGapHeight: string;
  datePickerItemHeight: string;
  datePickerDayButtonHeight: string;
  datePickerDayButtonRound: string;
  datePickerDaySelectedBackground: string;
  datePickerDaySelectedTextColor: string;
  datePickerTodayTextColor: string;
  datePickerHeaderBackground: string;
  datePickerHeaderPadding: string;
  datePickerWeekdayTextColor: string;
  datePickerWeekdayTextSize: string;
  datePickerBackground: string;
  datePickerContentPadding: string;
  datePickerActionSheetPadding: string;
  datePickerTitlePadding: string;

  midButtonStyle: string;

  taskDetailBottomActionStyle: string;
  taskDetailBottomActionIconStyle: string;

  // InfoItem theme variables
  infoItemRound: string;
  infoItemPadding: string;
  infoItemMargin: string;
  infoItemGap: string;
  infoItemIconColor: string;
  infoItemTextColor: string;
  infoItemDeleteIconColor: string;
  infoItemIconSize: string;
  infoItemTextSize: string;
  infoItemDeleteIconSize: string;
  infoItemGroupGap: string;
  infoItemGroupBackground: string;
  infoItemGroupRound: string;
  itemItemMinHeight: string;

  editingTaskSubtaskContainerBackground: string;
  editingTaskSubtaskPadding: string;
  editingTaskSubtaskContainerRound: string;
  editingTaskSubtaskContainerMargin: string;
  editingTaskSubtaskContainerSpacing: string;

  createTaskSubtaskContainerBackground: string;
  createTaskSubtaskContainerPadding: string;

  createTaskToolbarStyle: string;
  createTaskToolbarIconStyle: string;
  createTaskToolbarGap: string;

  createTaskPageStyle: string;
  createTaskPageHeaderStyle: string;
  createTaskPageButtonStyle: string;
  createTaskPageConfirmButtonColor: string;
  createTaskPageCancelButtonColor: string;
  createTaskPageTitleStyle: string;
  createTaskPageContentGap: string;
  metaDataBackground: string;
  metaDataGap: string;
  metaDataPadding: string;
  metaDataRound: string;

  inputItemStyle: string;
  textAreaItemStyle: string;
  itemEditTaskNotesTextAreaStyle: string;

  // Tabbar theme variables
  tabbarBackground: string;
  tabbarHeight: string;
  tabbarRound: string;
  tabbarItemWidth: string;
  tabbarItemTextSize: string;
  tabbarItemTextColorActive: string;
  tabbarItemTextColorInactive: string;
  tabbarItemFontWeight: string;
  tabbarIndicatorWidth: string;
  tabbarIndicatorHeight: string;
  tabbarIndicatorMarginTop: string;
  tabbarIndicatorRound: string;
  tabbarIndicatorColorActive: string;
  tabbarIndicatorColorInactive: string;

  projectAreaSelectorContainer: string;
  projectAreaSelectorInputContainer: string;
  projectAreaSelectorInput: string;
  projectAreaSelectorItem: string;
  projectAreaSelectorItemIcon: string;
  projectAreaSelectorSubItemPadding: string;
  projectAreaSelectorContentGap: string;
  projectAreaSelectorTextSize: string;

  switchUncheckedBackground: string;
  switchInnerBorder: string;
  switchOuterBorder: string;
  switchCheckedBackground: string;

  dialogBorder: string;
}

export function extendsStyle(key: keyof ThemeDefinition) {
  return `extend::${key}`;
}
