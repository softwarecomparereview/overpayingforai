import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializePricingStore } from "./data/livePricingStore";
import { shouldRefreshPricing, refreshPricing } from "./utils/pricingRefresher";
import { getLivePricingSnapshot } from "./data/livePricingStore";
import { appendHistoryFromSnapshot } from "./data/modelPriceHistory";

initializePricingStore();

const snapshot = getLivePricingSnapshot();
if (shouldRefreshPricing(snapshot.lastUpdated, 6)) {
  refreshPricing()
    .then((fresh) => {
      appendHistoryFromSnapshot(fresh.models);
    })
    .catch(() => {});
} else {
  appendHistoryFromSnapshot(snapshot.models);
}

createRoot(document.getElementById("root")!).render(<App />);
