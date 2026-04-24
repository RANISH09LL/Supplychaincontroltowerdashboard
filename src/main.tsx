import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App.tsx";
import "./styles/index.css";
import { DashboardProvider } from "./app/DashboardContext.tsx";

createRoot(document.getElementById("root")!).render(
  <DashboardProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </DashboardProvider>
);