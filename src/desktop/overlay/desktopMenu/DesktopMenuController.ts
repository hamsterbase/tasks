import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService, OverlayInitOptions } from '@/services/overlay/common/WorkbenchOverlayService';
import { Emitter } from 'vscf/base/common/event';
import { IDisposable } from 'vscf/base/common/lifecycle';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { IContextKeyService, IContextKey } from 'vscf/platform/contextkey/common';
import {
  DesktopMenuFocus,
  DesktopMenuCanMoveDown,
  DesktopMenuCanMoveUp,
  DesktopMenuHasSubmenu,
  DesktopMenuIsSubmenuOpen,
} from './contextKey';

export interface IMenuConfig {
  label: string;
  checked?: boolean;
  onSelect?: () => void;
  submenu?: Array<IMenuSubmenuConfig[]>;
  disabled?: boolean;
}

export interface IMenuSubmenuConfig {
  label: string;
  checked?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface DesktopMenuOptions {
  menuConfig: IMenuConfig[];
  x: number;
  y: number;
}

function validateMenuConfig(config: IMenuConfig[]): IMenuConfig[] {
  if (!config || !Array.isArray(config)) {
    console.warn('Invalid menuConfig provided, using empty configuration');
    return [];
  }
  return config;
}

const menuItemHeight = 36;
const menuWidth = 270;
const menuItemOffset = 4;

export class DesktopMenuController implements IDisposable {
  static create(initOptions: DesktopMenuOptions, instantiationService: IInstantiationService) {
    const workbenchOverlayService = instantiationService.invokeFunction((accessor) => {
      return accessor.get(IWorkbenchOverlayService);
    });
    return workbenchOverlayService.createOverlay('menu', OverlayEnum.desktopMenu, (options) => {
      return instantiationService.createInstance(DesktopMenuController, options, initOptions);
    });
  }

  private readonly _onStatusChange = new Emitter<void>();
  readonly onStatusChange = this._onStatusChange.event;

  private _desktopMenuFocusContext: IContextKey<boolean>;
  private _desktopMenuCanMoveDownContext: IContextKey<boolean>;
  private _desktopMenuCanMoveUpContext: IContextKey<boolean>;
  private _desktopMenuHasSubmenuContext: IContextKey<boolean>;
  private _desktopMenuIsSubmenuOpenContext: IContextKey<boolean>;

  get zIndex() {
    return this.option.index;
  }

  get x() {
    return this.initOptions.x;
  }

  get y() {
    return this.initOptions.y;
  }

  get menuStyle() {
    return {
      width: menuWidth,
      left: this.x - menuWidth,
      top: this.y,
      zIndex: this.zIndex,
    };
  }
  get submenuStyle() {
    return {
      left: this.x + menuItemOffset,
      top: this.y + (this.activeIndex ?? 0) * menuItemHeight,
      zIndex: this.zIndex,
      width: menuWidth,
    };
  }

  get menuConfig() {
    return validateMenuConfig(this.initOptions.menuConfig);
  }

  get showCheckmarks(): boolean {
    return this.menuConfig.some((item) => item.checked !== undefined);
  }

  get showSubmenuCheckmarks(): boolean {
    if (!this.activeMenu?.submenu) {
      return false;
    }
    return this.activeMenu.submenu.some((group) => group.some((item) => item.checked !== undefined));
  }

  private _activeIndex: number | null = null;
  private _activeSubmenuIndex: number | null = null;
  private _isSubmenuOpen: boolean = false;

  get activeIndex(): number | null {
    return this._activeIndex;
  }

  get activeSubmenuIndex(): number | null {
    return this._activeSubmenuIndex;
  }

  get isSubmenuOpen(): boolean {
    return this._isSubmenuOpen;
  }

  get activeMenu(): IMenuConfig | null {
    if (this._activeIndex === null) return null;
    return this.menuConfig[this._activeIndex] ?? null;
  }

  get canMoveDown(): boolean {
    if (this._isSubmenuOpen && this.activeMenu?.submenu) {
      const totalSubItems = this.activeMenu.submenu.reduce((acc, group) => acc + group.length, 0);
      return this._activeSubmenuIndex !== null && this._activeSubmenuIndex < totalSubItems - 1;
    }
    return this._activeIndex !== null && this._activeIndex < this.menuConfig.length - 1;
  }

  get canMoveUp(): boolean {
    if (this._isSubmenuOpen && this.activeMenu?.submenu) {
      return this._activeSubmenuIndex !== null && this._activeSubmenuIndex > 0;
    }
    return this._activeIndex !== null && this._activeIndex > 0;
  }

  get hasSubmenu(): boolean {
    return this.activeMenu?.submenu !== undefined && this.activeMenu.submenu.length > 0;
  }

  constructor(
    private option: OverlayInitOptions,
    private initOptions: DesktopMenuOptions,
    @IWorkbenchOverlayService private workbenchOverlayService: IWorkbenchOverlayService,
    @IContextKeyService contextKeyService: IContextKeyService
  ) {
    this._desktopMenuFocusContext = DesktopMenuFocus.bindTo(contextKeyService);
    this._desktopMenuCanMoveDownContext = DesktopMenuCanMoveDown.bindTo(contextKeyService);
    this._desktopMenuCanMoveUpContext = DesktopMenuCanMoveUp.bindTo(contextKeyService);
    this._desktopMenuHasSubmenuContext = DesktopMenuHasSubmenu.bindTo(contextKeyService);
    this._desktopMenuIsSubmenuOpenContext = DesktopMenuIsSubmenuOpen.bindTo(contextKeyService);

    if (this.menuConfig.length > 0) {
      this._activeIndex = 0;
    }

    this._desktopMenuFocusContext.set(true);
    this.updateContextKeys();
  }

  fireStatusChange() {
    this._onStatusChange.fire();
  }

  private updateContextKeys() {
    this._desktopMenuCanMoveDownContext.set(this.canMoveDown);
    this._desktopMenuCanMoveUpContext.set(this.canMoveUp);
    this._desktopMenuHasSubmenuContext.set(this.hasSubmenu);
    this._desktopMenuIsSubmenuOpenContext.set(this.isSubmenuOpen);
  }

  setActiveIndex(index: number) {
    this._activeIndex = index;
    this._isSubmenuOpen = false;
    this._activeSubmenuIndex = null;

    if (this.activeMenu?.submenu && this.activeMenu.submenu.length > 0) {
      this.openSubmenu();
    }

    this.updateContextKeys();
    this.fireStatusChange();
  }

  setActiveSubmenuIndex(index: number) {
    this._activeSubmenuIndex = index;
    this.updateContextKeys();
    this.fireStatusChange();
  }

  moveDown() {
    if (this._isSubmenuOpen && this.activeMenu?.submenu) {
      const totalSubItems = this.activeMenu.submenu.reduce((acc, group) => acc + group.length, 0);
      if (this._activeSubmenuIndex !== null && this._activeSubmenuIndex < totalSubItems - 1) {
        this._activeSubmenuIndex++;
        this.updateContextKeys();
        this.fireStatusChange();
      }
    } else {
      if (this._activeIndex !== null && this._activeIndex < this.menuConfig.length - 1) {
        this._activeIndex++;
        this.updateContextKeys();
        this.fireStatusChange();
      }
    }
  }

  moveUp() {
    if (this._isSubmenuOpen && this.activeMenu?.submenu) {
      if (this._activeSubmenuIndex !== null && this._activeSubmenuIndex > 0) {
        this._activeSubmenuIndex--;
        this.updateContextKeys();
        this.fireStatusChange();
      }
    } else {
      if (this._activeIndex !== null && this._activeIndex > 0) {
        this._activeIndex--;
        this.updateContextKeys();
        this.fireStatusChange();
      }
    }
  }

  openSubmenu() {
    if (this.hasSubmenu && !this._isSubmenuOpen) {
      this._isSubmenuOpen = true;
      this._activeSubmenuIndex = 0;
      this.updateContextKeys();
      this.fireStatusChange();
    }
  }

  closeSubmenu() {
    if (this._isSubmenuOpen) {
      this._isSubmenuOpen = false;
      this._activeSubmenuIndex = null;
      this.updateContextKeys();
      this.fireStatusChange();
    }
  }

  selectCurrent() {
    if (this._isSubmenuOpen && this.activeMenu?.submenu && this._activeSubmenuIndex !== null) {
      let currentIndex = 0;
      for (const group of this.activeMenu.submenu) {
        if (this._activeSubmenuIndex < currentIndex + group.length) {
          const subItem = group[this._activeSubmenuIndex - currentIndex];
          this.handleItemClick(subItem);
          return;
        }
        currentIndex += group.length;
      }
    } else if (this._activeIndex !== null) {
      const menu = this.menuConfig[this._activeIndex];
      if (menu.submenu && menu.submenu.length > 0) {
        this.openSubmenu();
      } else {
        this.handleItemClick(menu);
      }
    }
  }

  dispose(): void {
    this.workbenchOverlayService.removeOverlay(this.option.instanceId);
    this._onStatusChange.dispose();

    this._desktopMenuFocusContext.reset();
    this._desktopMenuCanMoveDownContext.reset();
    this._desktopMenuCanMoveUpContext.reset();
    this._desktopMenuHasSubmenuContext.reset();
    this._desktopMenuIsSubmenuOpenContext.reset();
  }

  handleItemClick(item: IMenuConfig | IMenuSubmenuConfig) {
    if ('submenu' in item && item.submenu && item.submenu.length > 0) {
      this.openSubmenu();
    } else if (item.onSelect) {
      item.onSelect();
      this.dispose();
    }
  }
}
