import { Event } from 'vscf/base/common/event';
import { TreeID } from 'loro-crdt';

export interface ISelectionOption {
  offset: number | null;

  multipleMode: boolean;

  fireEditEvent?: boolean;
}

export interface IEditItemState {
  id: TreeID;
  offset: number;
}

export type ListOperation = {
  type: 'delete_item';
  id: TreeID;
  focusItem: TreeID | null;
};

export interface ITaskList {
  onListStateChange: Event<void>;

  onFocusItem: Event<IEditItemState>;

  onCreateNewOne: Event<{ afterId: TreeID | null }>;

  onListOperation: Event<ListOperation>;

  readonly name: string;

  readonly items: string[];

  readonly cursorId: string | null;

  readonly cursorOffset: number | null;

  readonly selectedIds: TreeID[];

  readonly isFocused: boolean;

  readonly isInputValueEmpty: boolean;

  setFocus(isFocused: boolean): void;

  createNewOne(): void;

  focusCurrent(): void;

  select(id: string, option: ISelectionOption): void;

  updateCursor(offset: number | null): void;

  updateInputValue(value: string): void;

  deleteCurrentItem(): void;

  moveCursorDown(): void;

  moveCursorUp(): void;

  selectNext(): void;

  selectPrevious(): void;

  cursorHasNextItem(): boolean;

  cursorHasPreviousItem(): boolean;

  updateItems(items: TreeID[]): void;

  clearSelection(): void;

  setEditingState(isEditing: boolean): void;
}
