import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiRequest } from "../../shared/api/http-client";

interface DashboardResponse {
  readonly machine: {
    readonly code: string;
    readonly designation: string;
    readonly line: string;
    readonly status: "RUNNING" | "DOWN";
  };
  readonly updatedAt: string;
  readonly kpis: {
    readonly trs: { readonly value: number; readonly target: number };
    readonly availability: { readonly value: number; readonly target: number };
    readonly mtbfHours: number;
    readonly mttrMinutes: number;
  };
  readonly production: {
    readonly workOrderCode: string | null;
    readonly quantityGood: number;
    readonly quantityProduced: number;
  } | null;
  readonly recentActivity: ReadonlyArray<{
    readonly id: string;
    readonly type: string;
    readonly label: string;
    readonly at: string;
  }>;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function DashboardPage() {
  const query = useQuery({
    queryKey: ["dashboard", "MA03"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard/MA03"),
    refetchInterval: 15_000,
  });

  if (query.isLoading) return <p>Chargement du dashboard...</p>;
  if (query.isError || !query.data) {
    return <p className="text-[var(--color-error)]">Impossible de charger le dashboard.</p>;
  }

  const data = query.data;
  const productionRatio =
    data.production && data.production.quantityProduced > 0
      ? data.production.quantityGood / data.production.quantityProduced
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          className={`badge ${data.machine.status === "RUNNING" ? "badge-success" : "badge-danger"}`}
        >
          {data.machine.status}
        </span>
        <span className="text-xs font-bold tracking-wide text-[var(--color-on-surface-variant)]">
          {data.machine.line}
        </span>
      </div>
      <div>
        <h1 className="text-xl font-semibold">
          Machine: {data.machine.code} - {data.machine.designation}
        </h1>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Dernière mise à jour: {new Date(data.updatedAt).toLocaleString("fr-FR")}
        </p>
      </div>
      <Link className="btn-danger" to="/downtimes/new?machine=MA03">
        DÉCLARER UN ARRÊT
      </Link>
      <div className="card border-l-4 border-l-[var(--color-secondary-container)]">
        <div className="text-xs font-bold tracking-wide">TRS (OEE)</div>
        <div className="text-sm">Cible: {formatPercent(data.kpis.trs.target)}</div>
        <div className="text-3xl font-bold">{formatPercent(data.kpis.trs.value)}</div>
      </div>
      <div className="card border-l-4 border-l-[var(--color-primary-container)]">
        <div className="text-xs font-bold tracking-wide">Disponibilité</div>
        <div className="text-sm">
          Cible: {formatPercent(data.kpis.availability.target)}
        </div>
        <div className="text-3xl font-bold">
          {formatPercent(data.kpis.availability.value)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="text-xs font-bold tracking-wide">MTBF</div>
          <div className="text-2xl font-bold">{data.kpis.mtbfHours.toFixed(1)}h</div>
        </div>
        <div className="card">
          <div className="text-xs font-bold tracking-wide">MTTR</div>
          <div className="text-2xl font-bold">{data.kpis.mttrMinutes.toFixed(0)}m</div>
        </div>
      </div>
      {data.production ? (
        <div className="card">
          <div className="text-xs font-bold tracking-wide">
            Production {data.production.workOrderCode ?? ""}
          </div>
          <div className="text-2xl font-bold">
            {data.production.quantityGood} / {data.production.quantityProduced} u
          </div>
          <div className="text-sm text-[var(--color-on-surface-variant)]">
            Quantité conforme - {(productionRatio * 100).toFixed(0)}% complété
          </div>
        </div>
      ) : null}
      <div className="card">
        <h2 className="mb-3 font-semibold">Activité Récente</h2>
        <ul className="space-y-3">
          {data.recentActivity.map((item) => (
            <li key={item.id} className="border-b border-[var(--color-outline)] pb-2 last:border-0">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-[var(--color-on-surface-variant)]">
                {item.type} · {new Date(item.at).toLocaleString("fr-FR")}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
