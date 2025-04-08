import { getAllTags } from '@/core/state/getAllTags';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/internal/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';

export class TagEditorActionSheetController implements IDisposable {
  static create(
    initialTags: string[] = [],
    onUpdate: (tags: string[]) => void,
    instantiationService: IInstantiationService
  ) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('action-sheet', OverlayEnum.tagEditor, (options) => {
      return instantiationService.createInstance(TagEditorActionSheetController, options, initialTags, onUpdate);
    });
  }

  get zIndex() {
    return this.option.index;
  }

  private _selectedTags: string[] = [];
  private _searchText: string = '';
  private _allTags: string[] = [];

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    private option: OverlayInitOptions,
    initialTags: string[] = [],
    private onUpdate: (tags: string[]) => void,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService,
    @ITodoService todoService: ITodoService
  ) {
    this._selectedTags = [...initialTags];
    this._allTags = getAllTags(todoService.modelState);
  }

  get selectedTags() {
    return this._selectedTags;
  }

  get hasTags() {
    return this._selectedTags.length > 0;
  }

  get searchText() {
    return this._searchText;
  }

  get displayTags() {
    if (!this._searchText) {
      // When no search text, show all unselected tags
      return this._allTags.filter((tag) => !this._selectedTags.includes(tag));
    }
    // When searching, show filtered tags
    return this._allTags.filter(
      (tag) => tag.toLowerCase().includes(this._searchText.toLowerCase()) && !this._selectedTags.includes(tag)
    );
  }

  updateSearchText(text: string) {
    this._searchText = text;
    this._onStatusChange.fire();
  }

  addTag(tag: string) {
    if (!this._selectedTags.includes(tag)) {
      this._selectedTags.push(tag);
      this._searchText = '';
      this._onStatusChange.fire();
    }
  }

  removeTag(tag: string) {
    this._selectedTags = this._selectedTags.filter((t) => t !== tag);
    this._onStatusChange.fire();
  }

  saveTags() {
    if (this.onUpdate) {
      this.onUpdate(this._selectedTags);
    }
  }

  dispose() {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
