import { History } from "lucide-react";

type AuditEntry = {
  _id: string;
  action: string;
  field: string;
  previousValue: string;
  newValue: string;
  changedByEmail: string;
  changedAt: string;
};

export function AuditTrail({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <History className="size-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-900">
          Audit Trail
        </h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">
          No changes have been made to this request yet.
        </p>
      ) : (
        <ol className="space-y-4">
          {entries.map((entry) => (
            <li
              key={entry._id}
              className="border-l-2 border-slate-200 pl-4"
            >
              <p className="text-sm text-slate-900">
                <span className="font-medium">{entry.changedByEmail}</span>{" "}
                changed <span className="font-medium">{entry.field}</span>{" "}
                from{" "}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                  {entry.previousValue || "(empty)"}
                </span>{" "}
                to{" "}
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
                  {entry.newValue}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(entry.changedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
