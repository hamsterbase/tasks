import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/internal/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IContextKey, IContextKeyService } from 'vscf/platform/contextkey/common';
import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService.ts';
import { CommandPaletteFocus, CommandPaletteHasResults, CommandPaletteHasSelection } from './contextKey';

export class CommandPaletteController implements IDisposable {
  static create(instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('dialog', OverlayEnum.commandPalette, (initOptions) => {
      return instantiationService.createInstance(CommandPaletteController, initOptions);
    });
  }

  get zIndex() {
    return this.option.index;
  }

  private _onStatusChange = new Emitter<void>();
  public readonly onStatusChange = this._onStatusChange.event;

  private _onConfirmSelection = new Emitter<void>();
  public readonly onConfirmSelection = this._onConfirmSelection.event;

  private _searchQuery = '';
  private _selectedIndex = -1;
  private _resultsCount = 0;

  private _commandPaletteFocusContext: IContextKey<boolean>;
  private _commandPaletteHasResultsContext: IContextKey<boolean>;
  private _commandPaletteHasSelectionContext: IContextKey<boolean>;

  constructor(
    private option: OverlayInitOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService,
    @IContextKeyService contextKeyService: IContextKeyService
  ) {
    this._commandPaletteFocusContext = CommandPaletteFocus.bindTo(contextKeyService);
    this._commandPaletteHasResultsContext = CommandPaletteHasResults.bindTo(contextKeyService);
    this._commandPaletteHasSelectionContext = CommandPaletteHasSelection.bindTo(contextKeyService);

    this._commandPaletteFocusContext.set(true);
    this._updateContextKeys();
  }

  get searchQuery() {
    return this._searchQuery;
  }

  get selectedIndex() {
    return this._selectedIndex;
  }

  setSearchQuery(query: string) {
    this._searchQuery = query;
    this._selectedIndex = -1;
    this._updateContextKeys();
    this._onStatusChange.fire();
  }

  setResultsCount(count: number) {
    this._resultsCount = count;
    this._updateContextKeys();
  }

  moveSelectionUp() {
    if (this._selectedIndex > 0) {
      this._selectedIndex--;
      this._updateContextKeys();
      this._onStatusChange.fire();
    }
  }

  moveSelectionDown() {
    if (this._selectedIndex < this._resultsCount - 1) {
      this._selectedIndex++;
      this._updateContextKeys();
      this._onStatusChange.fire();
    }
  }

  confirmSelection() {
    if (this._selectedIndex >= 0 && this._selectedIndex < this._resultsCount) {
      this._onConfirmSelection.fire();
    }
  }

  private _updateContextKeys() {
    this._commandPaletteHasResultsContext.set(this._resultsCount > 0);
    this._commandPaletteHasSelectionContext.set(this._selectedIndex >= 0 && this._selectedIndex < this._resultsCount);
  }

  close() {
    this.dispose();
  }

  dispose() {
    this._commandPaletteFocusContext.set(false);
    this._commandPaletteHasResultsContext.set(false);
    this._commandPaletteHasSelectionContext.set(false);
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
  }
}
