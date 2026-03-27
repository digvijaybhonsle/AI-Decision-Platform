import { createContext, useContext, useState } from "react";

const MLContext = createContext();

export const MLProvider = ({ children }) => {
  const [mlLoading, setMLLoading] = useState(false);

  return (
    <MLContext.Provider value={{ mlLoading, setMLLoading }}>
      {children}
    </MLContext.Provider>
  );
};

export const useML = () => useContext(MLContext);