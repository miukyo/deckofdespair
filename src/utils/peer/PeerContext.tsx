import { createContext, useContext } from "react";
import { PeerContextType } from "./types";

export const PeerContext = createContext({} as PeerContextType);

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within a PeerProvider");
  }
  return context;
};
