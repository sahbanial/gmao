import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../../shared/api/http-client";
import type { DashboardResponse } from "../../shared/api/types";
import { Icon } from "../../shared/ui/icon";

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return isToday ? `Aujourd'hui, ${time}` : date.toLocaleString("fr-FR");
}

function formatRelative(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 60) return `Il y a ${Math.max(1, diffMin)} min`;
  if (diffMin < 1440) return `Il y a ${Math.round(diffMin / 60)}h`;
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function activityIcon(type: string): { icon: string; wrap: string; color: string } {
  if (type.includes("MECHANICAL") || type.includes("ELECTRICAL")) {
    return { icon: "build", wrap: "bg-error-container", color: "text-on-error-container" };
  }
  if (type.includes("SERIES")) {
    return { icon: "settings", wrap: "bg-surface-container", color: "text-on-surface-variant" };
  }
  return { icon: "check_circle", wrap: "bg-surface-container", color: "text-on-surface-variant" };
}

function formatElapsed(seconds: number): string {
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function DashboardPage() {
  const [elapsed, setElapsed] = useState(0);
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["dashboard", "MA03"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard/MA03"),
    refetchInterval: 15_000,
  });

  const endMutation = useMutation({
    mutationFn: (downtimeId: string) =>
      apiRequest(`/downtimes/${downtimeId}/end`, {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "MA03"] });
    },
  });

  if (query.isLoading) {
    return <p className="p-margin-mobile text-body-md text-on-surface-variant">Chargement du dashboard...</p>;
  }
  if (query.isError || !query.data) {
    return <p className="p-margin-mobile text-body-md text-error">Impossible de charger le dashboard.</p>;
  }

  const data = query.data;
  const trsPct = data.kpis.trs.value * 100;
  const availPct = data.kpis.availability.value * 100;
  const isDown = data.machine.status === "DOWN";
  const productionRatio =
    data.production && data.production.quantityProduced > 0
      ? data.production.quantityGood / data.production.quantityProduced
      : 0;

  // Live elapsed timer for downtime
  useEffect(() => {
    if (!isDown || !data.openDowntime) return;
    
    const startTime = new Date(data.openDowntime.startedAt).getTime();
    const updateElapsed = () => {
      const nowTime = Date.now();
      const diffSeconds = Math.floor((nowTime - startTime) / 1000);
      setElapsed(diffSeconds);
    };
    
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [isDown, data.openDowntime?.startedAt]);

  return (
    <div className="mx-auto w-full max-w-[1440px] p-margin-mobile md:p-margin-desktop">
      <section className="mb-xl flex flex-col justify-between gap-md md:flex-row md:items-end">
        <div>
          <div className="mb-xs flex items-center gap-sm">
            <span
              className={`flex items-center gap-xs rounded-sm px-2 py-1 font-label-caps text-label-caps ${
                isDown
                  ? "bg-error-container text-on-error-container"
                  : "bg-tertiary-container text-on-tertiary-container"
              }`}
            >
              <span
                className={`h-2 w-2 animate-pulse rounded-full ${isDown ? "bg-error" : "bg-tertiary-fixed"}`}
              />
              {data.machine.status}
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {data.machine.line}
            </span>
          </div>
          <h2 className="text-headline-lg-mobile font-semibold md:text-headline-lg">
            Machine: {data.machine.code} - {data.machine.designation}
          </h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Dernière mise à jour: {formatUpdatedAt(data.updatedAt)}
          </p>
        </div>
        {!isDown ? (
          <Link
            className="flex h-12 min-w-[200px] items-center justify-center gap-sm whitespace-nowrap rounded-lg bg-error px-lg font-label-caps text-label-caps tracking-wider text-on-error shadow-sm transition-all hover:bg-on-error-container active:scale-95"
            to="/downtimes/new?machine=MA03"
          >
            <Icon name="warning" />
            DÉCLARER UN ARRÊT
          </Link>
        ) : (
          <button
            className="flex h-12 min-w-[200px] items-center justify-center gap-sm whitespace-nowrap rounded-lg bg-tertiary-container px-lg font-label-caps text-label-caps tracking-wider text-on-tertiary-container shadow-sm transition-all hover:bg-tertiary-container/80 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
            onClick={() => data.openDowntime && endMutation.mutate(data.openDowntime.id)}
            disabled={endMutation.isPending}
          >
            <Icon name="play_arrow" />
            {endMutation.isPending ? "Clôture..." : "REMETTRE EN MARCHE"}
          </button>
        )}
      </section>

      {/* Downtime Banner */}
      {isDown && data.openDowntime && (
        <div className="mb-lg relative overflow-hidden rounded-xl border border-outline-variant bg-error-container p-md">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-error" />
          <div className="flex items-center gap-sm">
            <Icon name="schedule" className="text-on-error-container" />
            <span className="text-body-md text-on-error-container">
              Arrêt en cours depuis {formatElapsed(elapsed)}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-md md:grid-cols-12 md:gap-lg">
        <div className="grid grid-cols-2 gap-sm md:col-span-8 md:grid-cols-4 md:gap-md">
          <div className="relative col-span-2 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface p-md">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#f59e0b]" />
            <div className="mb-sm flex items-start justify-between">
              <h3 className="flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant">
                <Icon name="data_usage" className="text-[16px]" />
                TRS (OEE)
              </h3>
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Cible: {formatPercent(data.kpis.trs.target)}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <div className="text-display-kpi text-[#f59e0b]">{formatPercent(data.kpis.trs.value)}</div>
              <progress className="progress-warning mt-xs h-2 w-full overflow-hidden rounded-full" max={100} value={trsPct} />
            </div>
            <p className="mt-sm text-body-sm text-on-surface-variant">
              {trsPct < data.kpis.trs.target * 100
                ? "Nécessite attention - Sous l'objectif"
                : "Objectif atteint"}
            </p>
          </div>

          <div className="relative col-span-2 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface p-md">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-surface-tint" />
            <div className="mb-sm flex items-start justify-between">
              <h3 className="flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant">
                <Icon name="schedule" className="text-[16px]" />
                Disponibilité
              </h3>
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Cible: {formatPercent(data.kpis.availability.target)}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <div className="text-display-kpi text-surface-tint">{formatPercent(data.kpis.availability.value)}</div>
              <progress className="progress-info mt-xs h-2 w-full overflow-hidden rounded-full" max={100} value={availPct} />
            </div>
            <p className="mt-sm text-body-sm text-on-surface-variant">Performance moyenne</p>
          </div>

          <div className="relative col-span-1 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface p-md">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#10b981]" />
            <h3 className="mb-auto flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant">
              <Icon name="timer" className="text-[16px]" />
              MTBF
            </h3>
            <div className="mt-sm text-headline-lg text-[#10b981]">{data.kpis.mtbfHours.toFixed(0)}h</div>
            <p className="mt-xs text-body-sm text-on-surface-variant">Stable</p>
          </div>

          <div className="relative col-span-1 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface p-md">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#10b981]" />
            <h3 className="mb-auto flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant">
              <Icon name="build_circle" className="text-[16px]" />
              MTTR
            </h3>
            <div className="mt-sm text-headline-lg text-[#10b981]">{data.kpis.mttrMinutes.toFixed(0)}m</div>
            <p className="mt-xs text-body-sm text-on-surface-variant">Amélioré</p>
          </div>

          <div className="relative col-span-2 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface p-md">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
            <h3 className="mb-sm flex items-center gap-xs font-label-caps text-label-caps text-on-surface-variant">
              <Icon name="inventory_2" className="text-[16px]" />
              Production {data.production?.workOrderCode ? `OF ${data.production.workOrderCode}` : "OF —"}
            </h3>
            <div className="mb-xs flex items-baseline justify-between">
              <span className="text-headline-md font-semibold text-on-surface">
                {data.production?.quantityGood ?? 0}
              </span>
              <span className="text-body-md text-on-surface-variant">
                / {data.production?.quantityProduced ?? 0} u
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, productionRatio * 100)}%` }} />
            </div>
            <p className="mt-sm text-body-sm text-on-surface-variant">
              Quantité conforme - {(productionRatio * 100).toFixed(0)}% complété
            </p>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-outline-variant bg-surface md:col-span-4">
          <div className="flex items-center justify-between rounded-t-xl border-b border-outline-variant bg-surface-bright p-sm">
            <h3 className="px-sm font-label-caps text-label-caps text-on-surface">Activité Récente</h3>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container" type="button">
              <Icon name="more_vert" className="text-[18px]" />
            </button>
          </div>
          <div className="flex max-h-[400px] flex-1 flex-col gap-xs overflow-y-auto p-sm">
            {data.recentActivity.map((item) => {
              const visual = activityIcon(item.type);
              return (
                <div key={item.id} className="flex cursor-pointer items-start gap-sm rounded-lg border border-transparent p-sm hover:border-outline-variant hover:bg-surface-container-low">
                  <div className={`mt-xs flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${visual.wrap}`}>
                    <Icon name={visual.icon} className={`text-[16px] ${visual.color}`} />
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-on-surface">{item.label}</p>
                    <p className="text-body-sm text-on-surface-variant">{item.type}</p>
                    <p className="mt-1 font-label-caps text-label-caps text-outline">
                      {formatRelative(item.at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-outline-variant p-sm">
            <Link 
              to="/downtimes" 
              className="block w-full rounded-lg py-2 text-center font-label-caps text-label-caps text-primary hover:bg-surface-container-low"
            >
              VOIR TOUT L&apos;HISTORIQUE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
