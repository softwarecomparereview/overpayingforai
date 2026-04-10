type AnalyticsPayload = Record<string, unknown>;

const ALLOWED_EVENTS = new Set([
  "calculator_started",
  "scenario_selected",
  "calculator_completed",
  "report_generated",
  "lead_capture_clicked",
  "lead_capture_submitted",
  "affiliate_clicked",
]);

export function track(eventName: string, payload: AnalyticsPayload = {}): void {
  if (!ALLOWED_EVENTS.has(eventName)) return;
  if (typeof window !== "undefined") {
    const provider = (window as typeof window & { analytics?: { track?: (event: string, props?: AnalyticsPayload) => void } }).analytics;
    provider?.track?.(eventName, payload);
  }
  console.log("analytics", eventName, payload);
}
