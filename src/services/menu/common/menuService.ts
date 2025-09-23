import { createDecorator } from 'vscf/platform/instantiation/common';

export interface IMenuService {
  readonly _serviceBrand: undefined;
  updateMenu(): Promise<void>;
}

export const IMenuService = createDecorator<IMenuService>('menuService');
