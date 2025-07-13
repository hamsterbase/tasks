import { ITaskList } from '@/components/taskList/type.ts';
import { Emitter, Event } from 'vscf/base/common/event';
import { IContextKey, IContextKeyService } from 'vscf/platform/contextkey/common';
import { createDecorator } from 'vscf/platform/instantiation/common';
import './commonds';
import {
  MainListCursorHasNextItem,
  MainListCursorHasPreviousItem,
  MainListFocus,
  MainListIsInputValueEmpty,
  SubListCursorHasNextItem,
  SubListCursorHasPreviousItem,
  SubListFocus,
  SubListIsInputValueEmpty,
} from './contextKey';

export interface IListService {
  readonly _serviceBrand: undefined;

  mainList: ITaskList | null;
  subList: ITaskList | null;

  setMainList(list: ITaskList): void;
  setSubList(list: ITaskList): void;

  onMainListChange: Event<void>;
  onSubListChange: Event<void>;
}

export const IListService = createDecorator<IListService>('listService');

export class ListService implements IListService {
  public readonly _serviceBrand: undefined;

  private _mainList: ITaskList | null = null;
  private _subList: ITaskList | null = null;

  private _mainListFocusContext: IContextKey<boolean>;
  private _mainListCursorHasNextItemContext: IContextKey<boolean>;
  private _mainListCursorHasPreviousItemContext: IContextKey<boolean>;
  private _mainListIsInputValueEmptyContext: IContextKey<boolean>;

  private _subListFocusContext: IContextKey<boolean>;
  private _subListCursorHasNextItemContext: IContextKey<boolean>;
  private _subListCursorHasPreviousItemContext: IContextKey<boolean>;
  private _subListIsInputValueEmptyContext: IContextKey<boolean>;

  constructor(@IContextKeyService readonly contextKeyService: IContextKeyService) {
    this._mainListFocusContext = MainListFocus.bindTo(contextKeyService);
    this._mainListCursorHasNextItemContext = MainListCursorHasNextItem.bindTo(contextKeyService);
    this._mainListCursorHasPreviousItemContext = MainListCursorHasPreviousItem.bindTo(contextKeyService);
    this._mainListIsInputValueEmptyContext = MainListIsInputValueEmpty.bindTo(contextKeyService);

    this._subListFocusContext = SubListFocus.bindTo(contextKeyService);
    this._subListCursorHasNextItemContext = SubListCursorHasNextItem.bindTo(contextKeyService);
    this._subListCursorHasPreviousItemContext = SubListCursorHasPreviousItem.bindTo(contextKeyService);
    this._subListIsInputValueEmptyContext = SubListIsInputValueEmpty.bindTo(contextKeyService);
  }

  public get mainList() {
    return this._mainList;
  }

  public get subList() {
    return this._subList;
  }

  public setMainList(list: ITaskList): void {
    this._mainList = list;
    this._onMainListChange.fire();

    list.onListStateChange(() => {
      this._mainListFocusContext.set(list.isFocused);
      this._mainListCursorHasNextItemContext.set(list.cursorHasNextItem());
      this._mainListCursorHasPreviousItemContext.set(list.cursorHasPreviousItem());
      this._mainListIsInputValueEmptyContext.set(list.isInputValueEmpty);
    });
  }

  public setSubList(list: ITaskList): void {
    this._subList = list;
    this._onSubListChange.fire();

    list.onListStateChange(() => {
      this._subListFocusContext.set(list.isFocused);
      this._subListCursorHasNextItemContext.set(list.cursorHasNextItem());
      this._subListCursorHasPreviousItemContext.set(list.cursorHasPreviousItem());
      this._subListIsInputValueEmptyContext.set(list.isInputValueEmpty);
    });
  }

  private _onMainListChange = new Emitter<void>();
  public onMainListChange = this._onMainListChange.event;

  private _onSubListChange = new Emitter<void>();
  public onSubListChange = this._onSubListChange.event;
}
