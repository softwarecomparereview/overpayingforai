import { useState } from "react";
import { track } from "@/utils/analytics";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LeadCapture({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setSuccess(false);
      return;
    }
    setError("");
    onSubmit(email);
    setSuccess(true);
    track("lead_capture_submitted", { source: "savings_report", emailDomain: email.split("@")[1] ?? "" });
  };

  return (
    <div className="border border-border rounded-xl p-5 bg-muted/20 no-print" data-testid="lead-capture">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">Email this report to yourself</h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">We’ll use this to send your report and occasional pricing updates.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="sr-only" htmlFor="lead-email">Email address</label>
          <input
            id="lead-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(false); }}
            placeholder="you@example.com"
            className="w-full border border-border rounded-lg px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            data-testid="lead-email-input"
          />
        </div>
        <button
          type="submit"
          onClick={() => track("lead_capture_clicked", { source: "savings_report" })}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
          data-testid="lead-submit-btn"
        >
          Email me this report
        </button>
        {error && <p className="text-xs text-red-600 dark:text-red-400" data-testid="lead-error">{error}</p>}
        {success && <p className="text-xs text-green-600 dark:text-green-400" data-testid="lead-success">Thanks — we’ll follow up with your report.</p>}
      </form>
    </div>
  );
}
