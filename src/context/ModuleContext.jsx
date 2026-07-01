import { createContext, useContext } from 'react';

const ModuleContext = createContext(null);

export const ModuleProvider = ({ moduleCode, children }) => (
  <ModuleContext.Provider value={moduleCode}>
    {children}
  </ModuleContext.Provider>
);

export const useModuleCode = () => useContext(ModuleContext);