import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { aggregatePareto, resolveReportPeriod } from "@gmao/shared";
import type { ParetoBar, ReportPeriodKey } from "@gmao/shared";
import { apiRequest } from "../../shared/api/http-client";
import type { DowntimeRow, MachineDetail } from "../../shared/api/types";
import { Icon } from "../../shared/ui/icon";
import { DataTable } from "../../shared/ui/data-table";

type ComponentRow = MachineDetail["components"][number];

const MACHINE_CODE = "MA03";
const columnHelper = createColumnHelper<ComponentRow>();
const PERIOD_OPTIONS: ReadonlyArray<{ value: ReportPeriodKey; label: string }> = [
  { value: "month", label: "Mois en cours" },
  { value: "quarter", label: "Trimestre" },
  { value: "ytd", label: "Année en cours" },
];
const TYPE_LABELS: Readonly<Record<string, string>> = {
  MECHANICAL_FAILURE: "Panne mécanique",
  VORSCHUB_ADJUSTMENT: "Réglage Vorschub",
  SERIES_CHANGE: "Changement de série",
  ELECTRICAL_FAILURE: "Panne électrique",
  QUALITY_STOP: "Arrêt qualité",
  PLANNED_STOP: "Arrêt planifié",
  OTHER: "Autre",
};

function resolveDurationMin(row: DowntimeRow, now: Date): number {
  if (row.durationMin != null) return row.durationMin;
  return Math.max(0, Math.round((now.getTime() - new Date(row.startedAt).getTime()) / 60_000));
}

function levelTone(level: ComponentRow["level"]): string {
  if (level === "HIGH") return "bg-error";
  if (level === "MEDIUM") return "bg-secondary-container";
  return "bg-tertiary-container";
}

function criticiteClass(level: ComponentRow["level"]): string {
  if (level === "HIGH") return "font-bold text-error bg-error-container/20";
  if (level === "MEDIUM") return "font-bold text-secondary bg-surface-bright";
  return "font-bold text-tertiary-container bg-surface-bright";
}

function barTone(index: number, isVital: boolean): string {
  if (index === 0) return "bg-primary-fixed";
  if (isVital) return "bg-surface-tint";
  return "bg-surface-dim";
}

function PeriodSelect({
  value,
  onChange,
}: {
  readonly value: ReportPeriodKey;
  readonly onChange: (value: ReportPeriodKey) => void;
}) {
  return (
    <select
      className="h-11 rounded border-2 border-outline bg-surface px-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
      value={value}
      onChange={(event) => onChange(event.target.value as ReportPeriodKey)}
    >
      {PERIOD_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ReportPage() {
  const [period, setPeriod] = useState<ReportPeriodKey>("month");
  const machineQuery = useQuery({
    queryKey: ["machine", MACHINE_CODE],
    queryFn: () => apiRequest<MachineDetail>(`/machines/${MACHINE_CODE}`),
  });
  const downtimesQuery = useQuery({
    queryKey: ["downtimes", MACHINE_CODE, period],
    queryFn: () => {
      const range = resolveReportPeriod(period, new Date());
      return apiRequest<DowntimeRow[]>(
        `/downtimes?machineCode=${MACHINE_CODE}&from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
      );
    },
  });
  const now = useMemo(() => new Date(), [downtimesQuery.dataUpdatedAt]);
  const bars = useMemo(() => {
    const rows = downtimesQuery.data ?? [];
    return aggregatePareto(
      rows.map((row) => ({
        label: row.component?.name ?? TYPE_LABELS[row.type] ?? row.type,
        durationMin: resolveDurationMin(row, now),
      })),
    );
  }, [downtimesQuery.data, now]);
  const components = machineQuery.data?.components ?? [];
  const highComponents = components.filter((item) => item.level === "HIGH");
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Composant",
        cell: (info) => (
          <div className="flex items-center gap-sm p-md">
            <span className={`h-2 w-2 rounded-full ${levelTone(info.row.original.level)}`} />
            <span className="text-body-sm font-semibold text-on-surface">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("severity", {
        header: "G",
        cell: (info) => <span className="text-tabular-nums tabular-nums">{info.getValue()}</span>,
      }),
      columnHelper.accessor("frequency", {
        header: "F",
        cell: (info) => <span className="text-tabular-nums tabular-nums">{info.getValue()}</span>,
      }),
      columnHelper.accessor("detection", {
        header: "D",
        cell: (info) => <span className="text-tabular-nums tabular-nums">{info.getValue()}</span>,
      }),
      columnHelper.accessor("criticality", {
        header: "Criticité (C)",
        cell: (info) => (
          <span className={`text-tabular-nums tabular-nums ${criticiteClass(info.row.original.level)}`}>
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [],
  );
  const table = useReactTable({
    data: [...components],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const polyline = bars
    .map((bar, index) => {
      const x = ((index + 0.5) / bars.length) * 100;
      const y = 100 - bar.cumulativeShare * 100;
      return `${x},${y}`;
    })
    .join(" ");
  if (machineQuery.isLoading || downtimesQuery.isLoading) {
    return <p className="p-margin-mobile text-body-md text-on-surface-variant">Chargement de l&apos;analyse...</p>;
  }
  if (machineQuery.isError || downtimesQuery.isError) {
    return <p className="p-margin-mobile text-body-md text-error">Impossible de charger Pareto & AMDEC.</p>;
  }
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-outline-variant bg-surface px-margin-desktop py-lg md:flex">
        <div className="flex items-center gap-sm">
          <h1 className="text-headline-lg text-primary">Analyse Pareto & AMDEC</h1>
          <span className="ml-md rounded bg-surface-container-high px-sm py-xs font-label-caps text-label-caps text-on-surface-variant">
            Module 7
          </span>
        </div>
        <div className="flex items-center gap-md">
          <PeriodSelect value={period} onChange={setPeriod} />
          <button
            className="flex h-11 items-center gap-sm rounded bg-primary px-lg font-semibold text-on-primary opacity-50"
            disabled
            title="Export PDF — à venir"
            type="button"
          >
            <Icon name="picture_as_pdf" />
            Exporter le rapport (PDF)
          </button>
        </div>
      </header>
      <div className="sticky top-16 z-30 flex items-center justify-between border-b border-outline-variant bg-surface-bright p-margin-mobile md:hidden">
        <PeriodSelect value={period} onChange={setPeriod} />
        <button
          className="ml-md flex h-11 shrink-0 items-center justify-center rounded border-2 border-outline p-sm text-primary opacity-50"
          disabled
          title="Export PDF — à venir"
          type="button"
        >
          <Icon name="picture_as_pdf" />
        </button>
      </div>
      <div className="flex-1 space-y-lg overflow-y-auto bg-surface-bright p-margin-mobile md:space-y-xl md:p-margin-desktop">
        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          <ParetoCard bars={bars} polyline={polyline} />
          <div className="flex flex-col gap-lg">
            <div className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
              <div className="mb-sm font-label-caps text-label-caps text-on-surface-variant">
                ACTIFS CRITIQUES
              </div>
              <div className="flex items-baseline gap-sm text-display-kpi text-error">
                {highComponents.length}{" "}
                <span className="text-body-md text-on-surface-variant">/ {components.length}</span>
              </div>
              <p className="mt-sm text-body-sm text-on-surface-variant">
                Composants AMDEC de criticité élevée (C ≥ 14) sur {MACHINE_CODE}.
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
              <div className="mb-md font-label-caps text-label-caps text-on-surface-variant">ACTION REQUISE</div>
              <ActionList bars={bars} highComponents={highComponents} />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="relative flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-md">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
            <h2 className="pl-sm text-headline-md text-on-surface">Synthèse AMDEC</h2>
          </div>
          <DataTable emptyLabel="Aucun composant AMDEC." table={table} />
        </div>
      </div>
    </div>
  );
}

function ParetoCard({
  bars,
  polyline,
}: {
  readonly bars: readonly ParetoBar[];
  readonly polyline: string;
}) {
  return (
    <div className="flex min-h-[350px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm xl:col-span-2">
      <div className="relative flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-md">
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-secondary-container" />
        <h2 className="pl-sm text-headline-md text-on-surface">Principales causes d&apos;arrêt</h2>
        <Icon className="text-on-surface-variant" name="bar_chart" />
      </div>
      {bars.length === 0 ? (
        <p className="flex flex-1 items-center justify-center p-md text-body-sm text-on-surface-variant">
          Aucun arrêt sur la période.
        </p>
      ) : (
        <div className="relative min-h-[350px] flex-1 p-md">
          <div className="absolute inset-x-md bottom-xl top-md flex items-end gap-sm md:gap-md">
            <div className="absolute left-0 right-0 top-[20%] z-10 flex items-center border-t-2 border-dashed border-error">
              <span className="absolute -top-6 right-0 bg-surface px-1 font-label-caps text-label-caps text-error">
                80% CUMULÉ
              </span>
            </div>
            <svg
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <polyline fill="none" points={polyline} stroke="#fd761a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            {bars.map((bar, index) => (
              <div key={bar.label} className="group flex h-full flex-1 flex-col items-center justify-end">
                <div
                  className={`relative z-10 w-full rounded-t-sm border border-primary-container/20 ${barTone(index, bar.isVital)}`}
                  style={{ height: `${bar.heightPercent}%` }}
                >
                  <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-inverse-surface px-2 py-1 text-body-sm text-inverse-on-surface opacity-0 group-hover:opacity-100">
                    {bar.hours.toFixed(1)} h
                  </div>
                </div>
                <div className="mt-sm w-full truncate text-center font-label-caps text-label-caps text-on-surface-variant">
                  {bar.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionList({
  bars,
  highComponents,
}: {
  readonly bars: readonly ParetoBar[];
  readonly highComponents: readonly ComponentRow[];
}) {
  const items = highComponents.length > 0
    ? highComponents.map((item) => item.name)
    : bars.filter((bar) => bar.isVital).slice(0, 3).map((bar) => bar.label);
  if (items.length === 0) {
    return <p className="text-body-sm text-on-surface-variant">Aucune action critique sur la période.</p>;
  }
  return (
    <ul className="space-y-sm">
      {items.map((name, index) => (
        <li
          key={name}
          className={`flex items-center justify-between rounded border p-sm ${
            index === 0 ? "border-error-container bg-error-container/20" : "border-outline-variant bg-surface-container"
          }`}
        >
          <div className="flex items-center gap-sm">
            <Icon className={index === 0 ? "text-lg text-error" : "text-lg text-secondary"} name={index === 0 ? "warning" : "info"} />
            <span className="text-body-sm font-semibold text-on-surface">{name}</span>
          </div>
          <Link className="font-label-caps text-label-caps text-primary hover:underline" to={`/machines/${MACHINE_CODE}`}>
            REVOIR
          </Link>
        </li>
      ))}
    </ul>
  );
}
