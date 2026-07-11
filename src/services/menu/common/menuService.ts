import { createDecorator } from '@hamsterbase/foundation/instantiation';

export interface IMenuService {
  readonly _serviceBrand: undefined;
  updateMenu(): Promise<void>;
}

export const IMenuService = createDecorator<IMenuService>('menuService');
