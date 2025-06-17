import { Event } from '@/packages/vscf/base/common/event';
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

export interface ITaskList {
  readonly name: string;

  readonly items: string[];

  readonly cursorId: string | null;

  readonly cursorOffset: number | null;

  readonly selectedIds: TreeID[];

  readonly isFocused: boolean;

  onListStateChange: Event<void>;

  onFocusItem: Event<IEditItemState>;

  setFocus(isFocused: boolean): void;

  select(id: string, option: ISelectionOption): void;

  updateCursor(offset: number): void;

  moveCursorDown(): void;

  moveCursorUp(): void;

  selectNext(): void;

  selectPrevious(): void;

  cursorHasNextItem(): boolean;

  cursorHasPreviousItem(): boolean;

  updateItems(items: string[]): void;
}
