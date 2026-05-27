export const MobileTestIds = {
  Home: {
    CreateTaskButton: 'mobile-home-create-task-button',
  },
  CreateTask: {
    TitleInput: 'mobile-create-task-title-input',
    DueDateRow: 'mobile-create-task-due-date-row',
    TagsRow: 'mobile-create-task-tags-row',
    AddSubtaskButton: 'mobile-create-task-add-subtask-button',
    SubtaskInput: 'mobile-create-task-subtask-input',
    RemindersRow: 'mobile-create-task-reminders-row',
  },
  TagEditor: {
    Input: 'mobile-tag-editor-input',
  },
  DatePicker: {
    DayPrefix: 'mobile-date-picker-day',
  },
  TimePicker: {
    HourPrefix: 'mobile-time-picker-hour',
    MinutePrefix: 'mobile-time-picker-minute',
    DoneButton: 'mobile-time-picker-done-button',
    PresetPrefix: 'mobile-time-picker-preset',
  },
  ActionSheet: {
    Backdrop: 'mobile-action-sheet-backdrop',
  },
  PageHeader: {
    Root: 'page-header',
  },
  EditTaskItem: {
    MenuButton: 'edit-task-menu-button',
  },
  TaskItem: {
    Root: 'task-item',
    StatusBox: 'task-item-status-box',
  },
  Toast: {
    Root: 'overlay-toast',
  },
  Login: {
    AccountInput: 'login-input-account',
    PasswordInput: 'login-input-password',
    ConfirmPasswordInput: 'login-input-confirm-password',
    SubmitButton: 'login-register-button-submit',
  },
  ProjectMeta: {
    Checkbox: 'project-checkbox',
  },
} as const;

export function getMobileDatePickerDayTestId(dateText: string) {
  return `${MobileTestIds.DatePicker.DayPrefix}-${dateText}`;
}

export function getMobileTimePickerHourTestId(hour: number) {
  return `${MobileTestIds.TimePicker.HourPrefix}-${hour.toString().padStart(2, '0')}`;
}

export function getMobileTimePickerMinuteTestId(minute: number) {
  return `${MobileTestIds.TimePicker.MinutePrefix}-${minute.toString().padStart(2, '0')}`;
}

export function getMobileTimePickerPresetTestId(label: string) {
  return `${MobileTestIds.TimePicker.PresetPrefix}-${label.replace(/\s+/g, '-').toLowerCase()}`;
}
