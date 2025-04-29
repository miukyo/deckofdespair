import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.css";
import App from "./App.tsx";
import PeerProvider from "./utils/PeerProvider.tsx";
import { ToastProvider } from "./components/ui/toast.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider position="bottom-center">
      <PeerProvider>
        <App />
      </PeerProvider>
    </ToastProvider>
  </StrictMode>
);
