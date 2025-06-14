import { TreeID } from 'loro-crdt';
import { Event } from 'vs/base/common/event.ts';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation.ts';

export interface SelectionState {
  selectedItems: TreeID[];
}

export interface ISelectionService {
  readonly _serviceBrand: undefined;

  onSelectionChanged: Event<SelectionState>;

  readonly selectedItems: ReadonlyArray<TreeID>;

  select(item: TreeID): void;

  addToSelection(item: TreeID): void;
  removeFromSelection(itemId: TreeID): void;

  clearSelection(): void;
  isSelected(itemId: string | TreeID): boolean;
}

export const ISelectionService = createDecorator<ISelectionService>('selectionService');
