import { createContext, useContext } from 'react';

export interface AppContext {
  basename?: string;
}
export const AppContext = createContext<AppContext>({});

export const AppProvider = AppContext.Provider;

export const useAppContext = () => useContext(AppContext);
