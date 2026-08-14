import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { buildShopTasks } from "@gmao/shared";
import type { ShopTask, ShopTaskKind } from "@gmao/shared";
import { apiRequest } from "../../shared/api/http-client";
import type { DowntimeRow, MachineDetail } from "../../shared/api/types";
import { Icon } from "../../shared/ui/icon";
import { DataTable } from "../../shared/ui/data-table";

const MACHINE_CODE = "MA03";
const columnHelper = createColumnHelper<ShopTask>();
const FILTER_LABELS: Readonly<Record<"all" | ShopTaskKind, string>> = {
  all: "Toutes",
  CURATIVE: "Curatif",
  INSPECTION: "AMDEC",
};
const KIND_LABELS: Readonly<Record<ShopTaskKind, string>> = {
  CURATIVE: "Curatif",
  INSPECTION: "Contrôle AMDEC",
};
const TYPE_LABELS: Readonly<Record<string, string>> = {
  MECHANICAL_FAILURE: "Panne mécanique",
  VORSCHUB_ADJUSTMENT: "Réglage Vorschub",
  SERIES_CHANGE: "Changement de série",
  ELECTRICAL_FAILURE: "Panne électrique",
  QUALITY_STOP: "Arrêt qualité",
  PLANNED_STOP: "Arrêt planifié",
  OTHER: "Autre",
};

type TaskFilter = keyof typeof FILTER_LABELS;

function resolveTitle(row: DowntimeRow): string {
  if (row.cause) return row.cause;
  return TYPE_LABELS[row.type] ?? row.type;
}

function formatSince(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function kindTone(kind: ShopTaskKind): string {
  if (kind === "CURATIVE") return "bg-error-container text-on-error-container";
  return "bg-secondary-container text-on-secondary-container";
}

export function TasksPage() {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const queryClient = useQueryClient();
  const machineQuery = useQuery({
    queryKey: ["machine", MACHINE_CODE],
    queryFn: () => apiRequest<MachineDetail>(`/machines/${MACHINE_CODE}`),
  });
  const downtimesQuery = useQuery({
    queryKey: ["downtimes", MACHINE_CODE],
    queryFn: () => apiRequest<DowntimeRow[]>(`/downtimes?machineCode=${MACHINE_CODE}`),
    refetchInterval: 15_000,
  });
  const endMutation = useMutation({
    mutationFn: (downtimeId: string) =>
      apiRequest(`/downtimes/${downtimeId}/end`, {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["downtimes", MACHINE_CODE] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard", MACHINE_CODE] });
    },
  });
  const tasks = useMemo(() => {
    const openDowntimes = (downtimesQuery.data ?? [])
      .filter((row) => row.endedAt === null)
      .map((row) => ({
        id: row.id,
        type: row.type,
        startedAt: row.startedAt,
        cause: resolveTitle(row),
        componentName: row.component?.name ?? null,
      }));
    const highComponents = (machineQuery.data?.components ?? [])
      .filter((item) => item.level === "HIGH")
      .map((item) => ({
        id: item.id,
        name: item.name,
        criticality: item.criticality,
      }));
    return buildShopTasks({ openDowntimes, highComponents });
  }, [downtimesQuery.data, machineQuery.data]);
  const visibleTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.kind === filter);
  }, [filter, tasks]);
  const columns = useMemo(
    () => [
      columnHelper.accessor("kind", {
        header: "Type",
        cell: (info) => (
          <span className={`inline-flex rounded px-2 py-1 font-label-caps text-label-caps ${kindTone(info.getValue())}`}>
            {KIND_LABELS[info.getValue()]}
          </span>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Tâche",
        cell: (info) => (
          <div>
            <div className="font-semibold text-on-surface">{info.getValue()}</div>
            <div className="text-body-sm text-on-surface-variant">
              {info.row.original.componentName ?? MACHINE_CODE}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("startedAt", {
        header: "Depuis",
        cell: (info) => (
          <span className="text-tabular-nums tabular-nums">{formatSince(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("criticality", {
        header: "C",
        cell: (info) => {
          const value = info.getValue();
          if (value == null) return "—";
          return <span className="font-bold text-error">{value}</span>;
        },
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => {
          const task = info.row.original;
          const downtimeId = task.downtimeId;
          if (task.kind === "CURATIVE" && downtimeId) {
            return (
              <button
                className="whitespace-nowrap rounded bg-tertiary-container px-sm py-xs font-label-caps text-label-caps text-on-tertiary-container disabled:opacity-60"
                disabled={endMutation.isPending}
                onClick={() => endMutation.mutate(downtimeId)}
                type="button"
              >
                {endMutation.isPending ? "Clôture..." : "CLÔTURER"}
              </button>
            );
          }
          return (
            <Link
              className="font-label-caps text-label-caps text-primary hover:underline"
              to={`/machines/${MACHINE_CODE}`}
            >
              REVOIR
            </Link>
          );
        },
      }),
    ],
    [endMutation.isPending, endMutation.mutate],
  );
  const table = useReactTable({
    data: [...visibleTasks],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const curativeCount = tasks.filter((task) => task.kind === "CURATIVE").length;
  const inspectionCount = tasks.filter((task) => task.kind === "INSPECTION").length;
  if (machineQuery.isLoading || downtimesQuery.isLoading) {
    return <p className="p-margin-mobile text-body-md text-on-surface-variant">Chargement des interventions...</p>;
  }
  if (machineQuery.isError || downtimesQuery.isError) {
    return <p className="p-margin-mobile text-body-md text-error">Impossible de charger les interventions.</p>;
  }
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1440px] p-margin-mobile md:p-margin-desktop">
      <div className="mb-lg flex flex-col gap-md md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
            Interventions
          </h1>
          <p className="mt-xs text-body-md text-on-surface-variant">
            File d&apos;attente atelier {MACHINE_CODE} — arrêts ouverts et contrôles AMDEC.
          </p>
        </div>
        <div className="flex flex-wrap gap-sm">
          {(["all", "CURATIVE", "INSPECTION"] as const).map((key) => (
            <button
              key={key}
              className={`h-11 shrink-0 rounded-full px-md font-label-caps text-label-caps ${
                filter === key
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest"
              }`}
              onClick={() => setFilter(key)}
              type="button"
            >
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-2 lg:max-w-3xl">
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-surface p-md">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-error" />
          <div className="break-words pl-sm font-label-caps text-label-caps leading-snug text-on-surface-variant">
            Arrêts ouverts
          </div>
          <div className="mt-sm pl-sm text-headline-lg text-error md:text-display-kpi">{curativeCount}</div>
        </div>
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-surface p-md">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-secondary-container" />
          <div className="break-words pl-sm font-label-caps text-label-caps leading-snug text-on-surface-variant">
            Contrôles AMDEC
          </div>
          <div className="mt-sm pl-sm text-headline-lg text-secondary md:text-display-kpi">{inspectionCount}</div>
        </div>
      </div>
      <div className="min-w-0 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
        <div className="relative flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-md">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
          <h2 className="pl-sm text-headline-md text-on-surface">File d&apos;attente</h2>
          <Icon className="text-on-surface-variant" name="build" />
        </div>
        <DataTable emptyLabel="Aucune tâche en attente." table={table} />
      </div>
    </div>
  );
}
