import { Emitter, Event } from 'vs/base/common/event';
import { TreeID } from 'loro-crdt';
import { ISelectionService, SelectionState } from '../common/selectionService';

export class SelectionService implements ISelectionService {
  readonly _serviceBrand: undefined;

  private readonly _onSelectionChanged = new Emitter<SelectionState>();
  readonly onSelectionChanged: Event<SelectionState> = this._onSelectionChanged.event;

  private _selectedItems: TreeID[] = [];

  get selectedItems(): ReadonlyArray<TreeID> {
    return [...this._selectedItems];
  }

  select(item: TreeID): void {
    this._selectedItems = [item];
    this._fireSelectionChanged();
  }

  addToSelection(item: TreeID): void {
    const existingIndex = this._findItemIndex(item);
    if (existingIndex === -1) {
      this._selectedItems.push(item);
      this._fireSelectionChanged();
    }
  }

  removeFromSelection(itemId: TreeID): void {
    const index = this._findItemIndex(itemId);
    if (index !== -1) {
      this._selectedItems.splice(index, 1);
      this._fireSelectionChanged();
    }
  }

  clearSelection(): void {
    if (this._selectedItems.length > 0) {
      this._selectedItems = [];
      this._fireSelectionChanged();
    }
  }

  isSelected(itemId: string | TreeID): boolean {
    return this._findItemIndex(itemId) !== -1;
  }

  private _findItemIndex(itemId: string | TreeID): number {
    return this._selectedItems.findIndex((item) => item === itemId);
  }

  private _fireSelectionChanged(): void {
    this._onSelectionChanged.fire({
      selectedItems: [...this._selectedItems],
    });
  }

  dispose(): void {
    this._onSelectionChanged.dispose();
  }
}
