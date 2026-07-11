import React from 'react';
import { IInstantiationService } from '@hamsterbase/foundation/instantiation';

export interface GlobalContext {
  instantiationService: IInstantiationService;
}

export const GlobalContext = React.createContext<GlobalContext | null>(null);
