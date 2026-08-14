import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiRequest } from "../../shared/api/http-client";
import type { DowntimeRow, MachineDetail } from "../../shared/api/types";
import { Icon } from "../../shared/ui/icon";
import { DataTable } from "../../shared/ui/data-table";

type DowntimeTableRow = DowntimeRow;

const columnHelper = createColumnHelper<DowntimeTableRow>();

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
}

export function DowntimeHistoryPage() {
  const machineQuery = useQuery({
    queryKey: ["machine", "MA03"],
    queryFn: () => apiRequest<MachineDetail>("/machines/MA03"),
  });

  const downtimesQuery = useQuery({
    queryKey: ["downtimes", "MA03"],
    queryFn: async () => {
      const machine = await apiRequest<MachineDetail>("/machines/MA03");
      return apiRequest<DowntimeRow[]>(`/downtimes?machineId=${machine.id}`);
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("startedAt", {
        header: "Début",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("endedAt", {
        header: "Fin",
        cell: (info) => {
          const endedAt = info.getValue();
          if (endedAt === null) {
            return (
              <span className="inline-flex items-center gap-xs rounded px-2 py-1 bg-error-container text-on-error-container font-label-caps text-[11px] uppercase tracking-wider">
                <Icon name="schedule" className="text-[14px]" />
                EN COURS
              </span>
            );
          }
          return formatDate(endedAt);
        },
      }),
      columnHelper.accessor("durationMin", {
        header: "Durée (min)",
        cell: (info) => formatDuration(info.getValue()),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <span className="text-on-surface">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("component", {
        header: "Composant",
        cell: (info) => {
          const component = info.getValue();
          return component ? component.name : "—";
        },
      }),
      columnHelper.accessor("cause", {
        header: "Cause",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.accessor("declarant", {
        header: "Déclarant",
        cell: (info) => {
          const declarant = info.getValue();
          return `${declarant.firstName} ${declarant.lastName}`;
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: downtimesQuery.data ? [...downtimesQuery.data] : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (machineQuery.isLoading || downtimesQuery.isLoading) {
    return <p className="p-margin-mobile text-on-surface-variant">Chargement historique des arrêts...</p>;
  }
  
  if (machineQuery.isError || !machineQuery.data || downtimesQuery.isError) {
    return <p className="p-margin-mobile text-error">Impossible de charger l'historique des arrêts.</p>;
  }

  const machine = machineQuery.data;

  return (
    <div className="mx-auto max-w-7xl px-margin-mobile py-lg md:px-margin-desktop">
      <div className="mb-lg flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-sm">
            <Link 
              to="/" 
              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="arrow_back" className="text-[18px]" />
            </Link>
            <h1 className="text-headline-lg font-semibold text-on-surface">
              Historique des arrêts — {machine.code}
            </h1>
          </div>
          <p className="mt-xs text-body-lg text-on-surface-variant">
            {machine.designation}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant bg-[#F3F4F6] px-md py-sm">
          <h2 className="text-[18px] font-semibold text-on-surface">Historique des arrêts</h2>
          <Icon name="schedule" className="text-on-surface-variant" />
        </div>
        <DataTable table={table} emptyLabel="Aucun arrêt enregistré." />
      </div>
    </div>
  );
}