import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import i18n from "./i18n";

const container = document.getElementById("root")!;

function renderApp() {
  createRoot(container).render(<App />);
}

if (i18n.isInitialized) {
  renderApp();
} else {
  i18n.on("initialized", renderApp);
}
