import React from "react";

export type AppContextType = {
  hasUserProvidedInput: boolean;
  userHasProvidedInput: () => void;
};

let hasUserProvidedInput = false;

export const DefaultAppContextValue = {
  hasUserProvidedInput,
  userHasProvidedInput: () => hasUserProvidedInput = true
};

const AppContext = React.createContext<AppContextType>(DefaultAppContextValue);

export const AppContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [hasUserProvidedInput,userHasProvidedInput] = React.useState(false);
  return (<AppContext.Provider value={{
    hasUserProvidedInput,
    userHasProvidedInput: () => userHasProvidedInput(true)
  }}>{children}</AppContext.Provider>);
};

export default AppContext;