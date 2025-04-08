import React from 'react';
import { IInstantiationService } from 'vscf/platform/instantiation/common';

export interface GlobalContext {
  instantiationService: IInstantiationService;
}

export const GlobalContext = React.createContext<GlobalContext | null>(null);
