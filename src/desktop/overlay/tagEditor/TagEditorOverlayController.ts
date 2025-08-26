import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { Emitter } from 'vscf/base/common/event';
import { Disposable } from 'vscf/base/common/lifecycle';
import { IContextKey, IContextKeyService } from 'vscf/platform/contextkey/common';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '../../../services/overlay/common/WorkbenchOverlayService';
import {
  TagEditorFocus,
  TagEditorHasSearchText,
  TagEditorHasSelectedTags,
  TagEditorHasSuggestions,
} from './contextKey';

export class TagEditorOverlayController extends Disposable {
  static create(
    initialTags: string[] = [],
    allTags: string[],
    onUpdate: (tags: string[]) => void,
    instantiationService: IInstantiationService,
    position?: { x: number; y: number }
  ) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.desktopTagEditor, (options) => {
      const controller = instantiationService.createInstance(
        TagEditorOverlayController,
        options,
        initialTags,
        allTags,
        onUpdate
      );
      if (position) {
        controller.setPosition(position);
      }
      return controller;
    });
  }

  get zIndex() {
    return this.option.index;
  }

  private _selectedTags: string[] = [];
  private _searchText: string = '';
  private _allTags: string[] = [];
  private _position: { x: number; y: number } = { x: 0, y: 0 };
  private _focusedIndex: number = -1;
  private _sortedTags: string[] = [];

  private _tagEditorFocusContext: IContextKey<boolean>;
  private _tagEditorHasSearchTextContext: IContextKey<boolean>;
  private _tagEditorHasSelectedTagsContext: IContextKey<boolean>;
  private _tagEditorHasSuggestionsContext: IContextKey<boolean>;

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  constructor(
    public option: OverlayInitOptions,
    initialTags: string[] = [],
    allTags: string[],
    private onUpdate: (tags: string[]) => void,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService,
    @IContextKeyService contextKeyService: IContextKeyService
  ) {
    super();
    this._selectedTags = [...initialTags];
    this._allTags = [...allTags];
    this._initializeSortedTags();
    this._tagEditorFocusContext = TagEditorFocus.bindTo(contextKeyService);
    this._tagEditorHasSearchTextContext = TagEditorHasSearchText.bindTo(contextKeyService);
    this._tagEditorHasSelectedTagsContext = TagEditorHasSelectedTags.bindTo(contextKeyService);
    this._tagEditorHasSuggestionsContext = TagEditorHasSuggestions.bindTo(contextKeyService);

    this._tagEditorFocusContext.set(true);
    this._updateContextKeys();
  }

  get selectedTags() {
    return this._selectedTags;
  }

  get searchText() {
    return this._searchText;
  }

  get totalTags() {
    return this._allTags.length;
  }

  get displayTags() {
    if (!this._searchText) {
      return this._sortedTags;
    }
    return this._sortedTags.filter((tag) => tag.toLowerCase().includes(this._searchText.toLowerCase()));
  }

  get showCreateButton() {
    return this._searchText && !this._allTags.includes(this._searchText);
  }

  setPosition(position: { x: number; y: number }) {
    this._position = position;
  }

  getPosition(): { x: number; y: number } {
    return this._position;
  }

  get focusedIndex() {
    return this._focusedIndex;
  }

  updateSearchText(text: string) {
    this._searchText = text;
    this._focusedIndex = -1;
    this._updateContextKeys();
    this._onStatusChange.fire();
  }

  addTag(tag: string) {
    if (!this._selectedTags.includes(tag)) {
      this._selectedTags.push(tag);
      // Add the new tag to _allTags if it doesn't exist
      if (!this._allTags.includes(tag)) {
        this._allTags.push(tag);
        this._sortedTags.push(tag);
      }
      this._searchText = '';
      this._focusedIndex = this.displayTags.indexOf(tag);
      this._updateContextKeys();
      this._onStatusChange.fire();
    }
  }

  createTagFromSearch() {
    if (this._searchText && !this._selectedTags.includes(this._searchText)) {
      this.addTag(this._searchText);
    }
  }

  toggleFocusedTag() {
    if (this._focusedIndex >= 0 && this._focusedIndex < this.displayTags.length) {
      const tag = this.displayTags[this._focusedIndex];
      const currentFocusedIndex = this._focusedIndex;
      if (this._selectedTags.includes(tag)) {
        this.removeTag(tag);
      } else {
        this.addTag(tag);
      }
      // Restore focus after toggle operation
      this._focusedIndex = currentFocusedIndex;
      this._onStatusChange.fire();
    }
  }

  focusNext() {
    if (this.displayTags.length > 0) {
      this._focusedIndex = Math.min(this._focusedIndex + 1, this.displayTags.length - 1);
      this._onStatusChange.fire();
    }
  }

  focusPrevious() {
    if (this.displayTags.length > 0) {
      this._focusedIndex = Math.max(this._focusedIndex - 1, this.showCreateButton ? -1 : 0);
      this._onStatusChange.fire();
    }
  }

  updateFocusedIndex(index: number) {
    this._focusedIndex = index;
    this._onStatusChange.fire();
  }

  removeTag(tag: string) {
    this._selectedTags = this._selectedTags.filter((t) => t !== tag);
    this._updateContextKeys();
    this._onStatusChange.fire();
  }

  removeLastTag() {
    if (this._searchText === '' && this._selectedTags.length > 0) {
      this._selectedTags.pop();
      this._updateContextKeys();
      this._onStatusChange.fire();
    }
  }

  saveTags() {
    if (this.onUpdate) {
      this.onUpdate(this._selectedTags);
    }
  }

  private _initializeSortedTags() {
    const selectedTags = this._selectedTags.filter((tag) => this._allTags.includes(tag));
    const unselectedTags = this._allTags.filter((tag) => !this._selectedTags.includes(tag));

    selectedTags.sort((a, b) => a.localeCompare(b));
    unselectedTags.sort((a, b) => a.localeCompare(b));

    this._sortedTags = [...selectedTags, ...unselectedTags];
  }

  private _updateContextKeys() {
    this._tagEditorHasSearchTextContext.set(this._searchText.length > 0);
    this._tagEditorHasSelectedTagsContext.set(this._selectedTags.length > 0);
    this._tagEditorHasSuggestionsContext.set(this.displayTags.length > 0);
  }

  cancel() {
    this.saveTags();
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    this._tagEditorFocusContext.set(false);
    this._tagEditorHasSearchTextContext.set(false);
    this._tagEditorHasSelectedTagsContext.set(false);
    this._tagEditorHasSuggestionsContext.set(false);
    super.dispose();
    this._onStatusChange.fire();
  }

  dispose() {
    this.saveTags();
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    this._tagEditorFocusContext.set(false);
    this._tagEditorHasSearchTextContext.set(false);
    this._tagEditorHasSelectedTagsContext.set(false);
    this._tagEditorHasSuggestionsContext.set(false);
    super.dispose();
    this._onStatusChange.fire();
  }
}
