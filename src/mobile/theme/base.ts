import classNames from 'classnames';
import { extendsStyle, ThemeDefinition } from './types';

export const baseStyles: ThemeDefinition = {
  /** 首页菜单的样式 */
  homeMenuBackground: 'bg-bg1',
  homeMenuRound: 'rounded-md',
  homeMenuItemPadding: 'px-3 py-2',
  homePageItemGap: 'gap-2',
  homeMenuNumberColor: 'text-sm font-medium text-t3',
  homeMenuDueTaskNumberColor: 'text-sm font-medium text-white bg-stress-red rounded-full h-4 min-w-4',
  homeMenuIconStyle: 'w-5 h-5 text-brand',

  // header 和底部按钮的 padding
  headerFooterPadding: 'px-6',
  // 屏幕边框距离列表元素的 padding
  screenEdgePadding: 'px-3',

  // Bottom Menu theme variables
  bottomMenuHeight: 'h-11',
  bottomMenuBackground: 'bg-bg2',
  bottomMenuBorder: 'border-t border-line-light',
  bottomMenuItemHeight: 'h-11',
  bottomMenuTextNormal: 'text-t2',
  bottomMenuTextActive: 'text-brand',
  bottomMenuTextInactive: 'text-t3',

  // 列表元素的高度
  // 列表元素的圆角
  listItemRound: '',
  // 列表元素被拖拽时的背景色
  listItemDraggedBackground: 'bg-bg3',

  pageBackground: 'bg-bg2',
  listItemBackground: 'bg-bg1',
  listItemEditingBackground: 'bg-bg1',

  // 全局的圆角
  itemRound: 'rounded-md',

  headerBackground: 'bg-bg1',
  headerPadding: classNames(extendsStyle('headerFooterPadding'), 'py-2'),

  taskItemGroupRound: extendsStyle('itemRound'),
  taskItemGroupBackground: 'bg-bg1',
  taskItemGroupHeaderPadding: 'pt-2',
  taskItemGroupTopRound: 'rounded-t-lg',
  taskItemGroupBottomRound: 'rounded-b-lg',

  taskItemGroupPaddingBottomWhenDragging: 'pb-11',

  taskItemHeight: 'h-11',
  taskItemPaddingX: 'px-3',
  taskItemPlaceholderColor: 'text-t3',
  taskItemGap: 'gap-2',
  taskItemIconSize: 'size-5 flex-shrink-0 flex items-center justify-center',

  // 任务项编辑时的圆角
  taskItemEditingRound: extendsStyle('itemRound'),
  taskItemEditingShadow: 'shadow-sm',

  taskItemOverlayBackground: extendsStyle('listItemBackground'),
  taskItemOverlayRound: extendsStyle('itemRound'),
  taskItemOverlayShadow: 'inset-shadow-sm shadow-sm',

  taskItemDraggingRound: extendsStyle('itemRound'),

  pageContentPaddingX: 'px-3',
  pageContentPaddingY: 'pb-15',

  // 弹窗背景的颜色
  overlayBackground: 'bg-black',
  overlayBackgroundOpacity: 'opacity-50',
  overlayAnimationDuration: 'duration-250',
  actionSheetPadding: 'p-4 pt-0',
  actionSheetRound: 'rounded-t-lg',
  actionSheetBorder: '',
  actionSheetBackground: 'bg-bg2-float',

  actionSheetActionGroupRound: 'rounded-lg',
  actionSheetActionGroupBackground: 'bg-bg1',
  actionSheetActionGroupItemPadding: 'p-4',
  actionSheetActionGroupItemGap: 'gap-2',
  actionSheetContentBorder: '',

  // Tag Editor theme variables
  tagEditorContainerBackground: 'bg-bg1',
  tagEditorSelectedTagColor: 'text-brand',
  tagEditorInputTextColor: 'text-t1',
  tagEditorSuggestionBackground: 'bg-bg1',
  tagEditorSuggestionTextColor: 'text-t1',
  tagEditorCreateTagTextColor: 'text-brand',
  tagEditorContainerPadding: 'px-4 py-2',
  tagEditorContainerRound: 'rounded-lg',
  tagEditorSuggestionPadding: 'px-4 py-2',
  tagEditorSuggestionRound: 'rounded-lg',
  tagEditorTextSize: 'text-sm',
  tagEditorSmallGap: 'gap-2',
  tagEditorHeightDefault: 'h-11',
  tagEditorMinHeightDefault: 'min-h-11',

  // Calendar/DatePicker theme variables
  datePickerDayCellHeight: '56',
  datePickerMonthHeaderHeight: '40',
  datePickerGapHeight: '4',
  datePickerItemHeight: '0', // This will be calculated in the component
  datePickerDayButtonHeight: 'h-14',
  datePickerDayButtonRound: 'rounded-lg',
  datePickerDaySelectedBackground: 'bg-brand',
  datePickerDaySelectedTextColor: 'text-white',
  datePickerTodayTextColor: 'text-brand',
  datePickerHeaderBackground: 'bg-graph-bg-regular',
  datePickerHeaderPadding: 'py-2 -mx-4 px-4',
  datePickerWeekdayTextColor: 'text-t1',
  datePickerWeekdayTextSize: 'text-sm',
  datePickerBackground: 'bg-bg1!',
  datePickerContentPadding: 'px-4',
  datePickerTitlePadding: 'px-6',
  datePickerActionSheetPadding: 'px-0!',

  midButtonStyle: 'w-10 h-8 rounded-lg flex items-center justify-center text-text-white',

  taskDetailBottomActionStyle: 'flex items-center justify-center size-9 rounded-lg  text-t2',
  taskDetailBottomActionIconStyle: 'size-5',

  // InfoItem theme variables
  infoItemRound: 'rounded-md',
  infoItemPadding: 'py-1.5 px-2',
  infoItemMargin: 'mb-1.5',
  infoItemGap: 'gap-2',
  infoItemIconColor: 'text-t2',
  infoItemTextColor: 'text-t1',
  infoItemDeleteIconColor: 'text-t3',
  infoItemIconSize: 'size-4',
  infoItemTextSize: 'text-sm',
  infoItemDeleteIconSize: 'size-4',
  infoItemGroupGap: 'gap-0',
  infoItemGroupBackground: 'bg-bg1',
  infoItemGroupRound: 'rounded-lg',
  itemItemMinHeight: 'min-h-10',
  editingTaskSubtaskContainerBackground: 'bg-bg2',
  editingTaskSubtaskPadding: 'px-2',
  editingTaskSubtaskContainerRound: 'rounded-lg',
  editingTaskSubtaskContainerMargin: 'mb-2 mt-1.5',
  editingTaskSubtaskContainerSpacing: 'space-y-0.5',

  createTaskSubtaskContainerBackground: 'bg-bg2',
  createTaskSubtaskContainerPadding: 'px-2',

  createTaskToolbarStyle: 'size-10 bg-bg1 rounded-lg flex items-center justify-center text-t2',
  createTaskToolbarIconStyle: 'inline-flex items-center justify-center size-5',
  createTaskToolbarGap: 'gap-2',
  metaDataBackground: 'bg-bg1',
  metaDataGap: 'gap-2',
  metaDataPadding: 'p-2',
  metaDataRound: 'rounded-lg',

  inputItemStyle: 'bg-bg1 rounded-lg focus:outline-none px-3 py-2 w-full border-0 text-base',
  textAreaItemStyle: 'bg-bg1 rounded-lg focus:outline-none px-3 py-2 w-full border-0 text-sm',
  itemEditTaskNotesTextAreaStyle: 'bg-bg1 rounded-lg focus:outline-none px-0 py-0 w-full border-0 text-sm text-t2',

  createTaskPageStyle: 'min-h-dvh flex flex-col gap-2 bg-bg2 text-t1',
  createTaskPageHeaderStyle:
    'flex justify-between items-center border-b border-line-regular flex-shrink-0 safe-top sticky top-0 bg-bg2',
  createTaskPageButtonStyle: 'text-sm h-12 font-medium',
  createTaskPageConfirmButtonColor: 'text-brand',
  createTaskPageCancelButtonColor: 'text-t2',
  createTaskPageTitleStyle: 'text-base font-semibold text-t1 h-12 flex items-center',
  createTaskPageContentGap: 'gap-2',

  // Tabbar theme variables
  tabbarBackground: 'bg-bg1',
  tabbarHeight: 'h-10',
  tabbarRound: 'rounded-lg',
  tabbarItemWidth: 'w-24',
  tabbarItemTextSize: 'text-sm',
  tabbarItemTextColorActive: 'text-brand',
  tabbarItemTextColorInactive: 'text-t2',
  tabbarItemFontWeight: 'font-medium',
  tabbarIndicatorWidth: 'w-4',
  tabbarIndicatorHeight: 'h-0.5',
  tabbarIndicatorMarginTop: 'mt-1',
  tabbarIndicatorRound: 'rounded-full',
  tabbarIndicatorColorActive: 'bg-brand',
  tabbarIndicatorColorInactive: 'bg-transparent',

  projectAreaSelectorContainer: 'h-50 overflow-y-scroll flex flex-col space-y-2',
  projectAreaSelectorInputContainer: 'bg-bg1 rounded-md px-3 py-2 text-t1 h-11 w-full flex items-center',
  projectAreaSelectorInput: 'flex-1 min-w-40 focus:outline-none bg-transparent text-sm',
  projectAreaSelectorItem: 'bg-bg1 rounded-md px-3 py-2 text-t1 break-words w-full text-left flex items-center gap-2',
  projectAreaSelectorItemIcon: 'size-5 text-t3',
  projectAreaSelectorSubItemPadding: 'pl-4',
  projectAreaSelectorTextSize: 'text-sm',
  projectAreaSelectorContentGap: 'space-y-2',

  switchUncheckedBackground: 'bg-bg2',
  switchCheckedBackground: 'bg-brand',
  switchInnerBorder: '',
  switchOuterBorder: '',

  dialogBorder: '',
};
