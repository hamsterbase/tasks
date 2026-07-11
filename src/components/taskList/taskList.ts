import { TreeID } from 'loro-crdt';
import { Emitter } from '@hamsterbase/foundation/event';
import { IEditItemState, ISelectionOption, ITaskList, ListOperation } from './type.ts';

export class TaskList implements ITaskList {
  private _isFocused = false;
  public get isFocused() {
    return this._isFocused;
  }

  public setFocus(isFocused: boolean): void {
    this._isFocused = isFocused;
    this._onListStateChange.fire();
  }

  public get cursorId() {
    return this._cursorId;
  }

  public get cursorOffset() {
    return this._cursorOffset;
  }

  public get selectedIds() {
    return this._selectedIds;
  }

  public get items() {
    return this._items;
  }

  private _onListStateChange = new Emitter<void>();
  public onListStateChange = this._onListStateChange.event;

  private _onFocusItem = new Emitter<IEditItemState>();
  public onFocusItem = this._onFocusItem.event;

  private _onCreateNewOne = new Emitter<{ afterId: TreeID | null }>();
  public onCreateNewOne = this._onCreateNewOne.event;

  private _inputValue: string = '';

  public get isInputValueEmpty() {
    return this._inputValue === '';
  }

  private _isEditing = false;

  public get isEditing() {
    return this._isEditing;
  }

  constructor(
    public name: string,
    private _items: TreeID[],
    private _selectedIds: TreeID[],
    private _cursorId: TreeID | null,
    private _cursorOffset: number | null
  ) {}

  public select(id: TreeID, option: ISelectionOption): void {
    if (typeof option.offset === 'number') {
      this._cursorOffset = option.offset;
    }
    if (option?.multipleMode) {
      if (this._selectedIds.includes(id)) {
        this._selectedIds = this._selectedIds.filter((item) => item !== id);
      } else {
        this._selectedIds.push(id);
      }
    } else {
      this._selectedIds = [id];
      this._cursorId = id;
    }

    if (option.fireEditEvent) {
      // Flip editing state proactively so the next render shows the input
      // (display:none → visible) before onFocusItem's focus() call runs.
      // The DOM focus event will redundantly setEditingState(true) — that's
      // a no-op thanks to the equality guard.
      this._isEditing = true;
    }
    this._onListStateChange.fire();
    if (option.fireEditEvent) {
      this._onFocusItem.fire({
        id,
        offset: this.cursorOffset ?? 0,
        selectAll: option.selectAll,
      });
    }
  }

  updateCursor(offset: number | null): void {
    this._cursorOffset = offset;
  }

  updateInputValue(value: string): void {
    this._inputValue = value;
    this._onListStateChange.fire();
  }

  moveCursorDown(): void {}

  moveCursorUp(): void {}

  updateItems(items: TreeID[]): void {
    this._items = items;
  }

  selectNext(): void {
    if (!this.cursorId) {
      return;
    }
    const nextItem = this._items[this._items.indexOf(this.cursorId) + 1];
    if (!nextItem) {
      return;
    }
    this.select(nextItem, {
      multipleMode: false,
      offset: this.cursorOffset ?? 0,
      fireEditEvent: this._isEditing,
    });
  }

  createNewOne(): void {
    if (this._selectedIds.length === 0) {
      this._onCreateNewOne.fire({ afterId: null });
      return;
    }
    const lastSelectedIndex = this._items.findIndex((item) => this.selectedIds.includes(item));
    if (lastSelectedIndex === -1) {
      return;
    }
    const newItem = this._items[lastSelectedIndex];
    this._onCreateNewOne.fire({ afterId: newItem });
  }

  selectPrevious(): void {
    if (!this.cursorId) {
      return;
    }
    const previousItem = this._items[this._items.indexOf(this.cursorId) - 1];
    if (!previousItem) {
      return;
    }
    this.select(previousItem, {
      multipleMode: false,
      offset: this.cursorOffset ?? 0,
      fireEditEvent: this._isEditing,
    });
  }

  focusCurrent() {
    if (!this.cursorId) {
      return;
    }
    this.select(this.cursorId, {
      multipleMode: false,
      offset: this.cursorOffset ?? 0,
      fireEditEvent: true,
    });
  }

  cursorHasNextItem(): boolean {
    if (!this._cursorId) {
      return false;
    }
    const cursorIndex = this._items.indexOf(this._cursorId);
    return cursorIndex !== -1 && cursorIndex < this._items.length - 1;
  }

  cursorHasPreviousItem(): boolean {
    if (!this._cursorId) {
      return false;
    }
    const cursorIndex = this._items.indexOf(this._cursorId);
    return cursorIndex !== -1 && cursorIndex > 0;
  }

  private _onListOperation = new Emitter<ListOperation>();
  public onListOperation = this._onListOperation.event;

  public deleteCurrentItem(): void {
    if (!this.cursorId) {
      return;
    }
    const index = this._items.indexOf(this.cursorId);
    if (index === -1) {
      return;
    }

    let previousItem: TreeID | null = null;

    if (index > 0) {
      previousItem = this._items[index - 1];
    } else {
      if (this._items.length > 1) {
        previousItem = this._items[0];
      }
    }

    this._selectedIds = this._selectedIds.filter((item) => item !== this.cursorId);
    this._onListOperation.fire({
      type: 'delete_item',
      id: this.cursorId,
      focusItem: previousItem,
    });
  }

  clearSelection(): void {
    this._selectedIds = [];
    this._onListStateChange.fire();
  }

  setEditingState(isEditing: boolean): void {
    if (this._isEditing === isEditing) {
      return;
    }
    if (this._isEditing && !isEditing) {
      // Editing just ended (e.g. Escape blurred the title input). Clear the
      // tracked input value so MainListIsInputValueEmpty becomes true and the
      // Backspace keybinding can delete the row, instead of falling through
      // to browser back-navigation.
      this._inputValue = '';
    }
    this._isEditing = isEditing;
    this._onListStateChange.fire();
  }
}
