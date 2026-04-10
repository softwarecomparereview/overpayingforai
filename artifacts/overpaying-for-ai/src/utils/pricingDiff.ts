import type { AIModel } from "@/engine/types";

export type DiffStatus = "unchanged" | "changed" | "added" | "removed";

export interface FieldDiff {
  field: string;
  label: string;
  oldValue: string | number | null;
  newValue: string | number | null;
}

export interface ModelDiffRow {
  id: string;
  name: string;
  provider: string;
  status: DiffStatus;
  current: AIModel | null;
  candidate: AIModel | null;
  fieldDiffs: FieldDiff[];
}

export interface ChangelogEntry {
  date: string;
  reviewedBy: string;
  approvedChanges: {
    id: string;
    name: string;
    provider: string;
    status: DiffStatus;
    changedFields: { field: string; from: unknown; to: unknown }[];
  }[];
  reviewedUnchanged: { id: string; name: string; provider: string }[];
  summary: string;
}

const COMPARED_FIELDS: Array<{ key: keyof AIModel; label: string }> = [
  { key: "inputCostPer1k", label: "Input $/1k tokens" },
  { key: "outputCostPer1k", label: "Output $/1k tokens" },
  { key: "monthlySubscriptionCostIfAny", label: "Monthly subscription $" },
  { key: "source", label: "Source URL" },
  { key: "last_updated", label: "Last updated" },
  { key: "notes", label: "Notes" },
  { key: "qualityScore", label: "Quality score" },
  { key: "costScore", label: "Cost score" },
];

function fmtVal(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export function computePricingDiff(
  current: AIModel[],
  candidates: AIModel[]
): ModelDiffRow[] {
  const currentMap = new Map(current.map((m) => [m.id, m]));
  const candidateMap = new Map(candidates.map((m) => [m.id, m]));
  const allIds = new Set([...currentMap.keys(), ...candidateMap.keys()]);

  return Array.from(allIds).map((id) => {
    const cur = currentMap.get(id) ?? null;
    const cand = candidateMap.get(id) ?? null;

    if (!cur && cand) {
      return {
        id,
        name: cand.name,
        provider: cand.provider,
        status: "added" as DiffStatus,
        current: null,
        candidate: cand,
        fieldDiffs: [],
      };
    }
    if (cur && !cand) {
      return {
        id,
        name: cur.name,
        provider: cur.provider,
        status: "removed" as DiffStatus,
        current: cur,
        candidate: null,
        fieldDiffs: [],
      };
    }
    if (!cur || !cand) {
      return {
        id,
        name: id,
        provider: "",
        status: "unchanged" as DiffStatus,
        current: null,
        candidate: null,
        fieldDiffs: [],
      };
    }

    const fieldDiffs: FieldDiff[] = [];
    for (const { key, label } of COMPARED_FIELDS) {
      const oldV = (cur[key] as unknown) ?? null;
      const newV = (cand[key] as unknown) ?? null;
      if (fmtVal(oldV) !== fmtVal(newV)) {
        fieldDiffs.push({
          field: key,
          label,
          oldValue: oldV as string | number | null,
          newValue: newV as string | number | null,
        });
      }
    }

    return {
      id,
      name: cur.name,
      provider: cur.provider,
      status: fieldDiffs.length > 0 ? ("changed" as DiffStatus) : ("unchanged" as DiffStatus),
      current: cur,
      candidate: cand,
      fieldDiffs,
    };
  });
}

export function applyApprovedDiffs(
  current: AIModel[],
  diffRows: ModelDiffRow[],
  approvedIds: Set<string>,
  reviewedIds: Set<string>,
  today: string
): AIModel[] {
  const candidateMap = new Map(
    diffRows.filter((r) => r.candidate).map((r) => [r.id, r.candidate!])
  );
  const removedApprovedIds = new Set(
    diffRows
      .filter((r) => r.status === "removed" && approvedIds.has(r.id))
      .map((r) => r.id)
  );

  const updated: AIModel[] = current
    .filter((m) => !removedApprovedIds.has(m.id))
    .map((m) => {
      if (approvedIds.has(m.id) && candidateMap.has(m.id)) {
        return { ...candidateMap.get(m.id)!, last_updated: today };
      }
      if (reviewedIds.has(m.id)) {
        return { ...m, last_updated: today };
      }
      return m;
    });

  const added: AIModel[] = diffRows
    .filter((r) => r.status === "added" && approvedIds.has(r.id))
    .map((r) => ({ ...r.candidate!, last_updated: today }));

  return [...updated, ...added];
}

export function generateChangelogEntry(
  diffRows: ModelDiffRow[],
  approvedIds: Set<string>,
  reviewedIds: Set<string>,
  today: string
): ChangelogEntry {
  const approvedChanges = diffRows.filter(
    (r) =>
      approvedIds.has(r.id) &&
      (r.status === "changed" || r.status === "added" || r.status === "removed")
  );
  const reviewedOnly = diffRows.filter(
    (r) => reviewedIds.has(r.id) && r.status === "unchanged"
  );

  return {
    date: today,
    reviewedBy: "maintainer",
    approvedChanges: approvedChanges.map((r) => ({
      id: r.id,
      name: r.name,
      provider: r.provider,
      status: r.status,
      changedFields: r.fieldDiffs.map((d) => ({
        field: d.label,
        from: d.oldValue,
        to: d.newValue,
      })),
    })),
    reviewedUnchanged: reviewedOnly.map((r) => ({
      id: r.id,
      name: r.name,
      provider: r.provider,
    })),
    summary: `${approvedChanges.length} model(s) updated, ${reviewedOnly.length} model(s) confirmed current.`,
  };
}

export function generateSampleCandidates(current: AIModel[]): AIModel[] {
  return current.map((m, i) => {
    if (i === 0) {
      return { ...m, inputCostPer1k: +(m.inputCostPer1k * 1.1).toFixed(6), source: "https://openai.com/api/pricing", last_updated: new Date().toISOString().split("T")[0] };
    }
    if (i === 2) {
      return { ...m, monthlySubscriptionCostIfAny: m.monthlySubscriptionCostIfAny !== null ? m.monthlySubscriptionCostIfAny + 2 : null, source: "https://openai.com/chatgpt/pricing", last_updated: new Date().toISOString().split("T")[0] };
    }
    if (i === 4) {
      return { ...m, inputCostPer1k: +(m.inputCostPer1k * 0.9).toFixed(6), outputCostPer1k: +(m.outputCostPer1k * 0.9).toFixed(6), source: "https://www.anthropic.com/pricing", last_updated: new Date().toISOString().split("T")[0] };
    }
    return { ...m };
  });
}
