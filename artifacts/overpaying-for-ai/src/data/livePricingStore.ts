import type { PricingSnapshot } from "@/types/pricing";
import { CURRENT_MODELS } from "./modelsPricing";

const DEFAULT_SNAPSHOT: PricingSnapshot = {
  models: CURRENT_MODELS,
  lastUpdated: new Date().toISOString(),
};

let _currentSnapshot: PricingSnapshot = { ...DEFAULT_SNAPSHOT };
let _previousSnapshot: PricingSnapshot | null = null;

export function getLivePricingSnapshot(): PricingSnapshot {
  return _currentSnapshot;
}

export function setLivePricingSnapshot(snapshot: PricingSnapshot): void {
  _currentSnapshot = snapshot;
}

export function getPreviousPricingSnapshot(): PricingSnapshot | null {
  return _previousSnapshot;
}

export function setPreviousPricingSnapshot(snapshot: PricingSnapshot): void {
  _previousSnapshot = snapshot;
}

export function getLastRefreshTimestamp(): string {
  return _currentSnapshot.lastUpdated;
}

export function initializePricingStore(): void {
  if (_currentSnapshot.models.length === 0) {
    _currentSnapshot = { ...DEFAULT_SNAPSHOT };
  }
}
