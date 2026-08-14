import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiRequest } from "../../shared/api/http-client";
import type { DashboardResponse, MachineDetail } from "../../shared/api/types";
import { Icon } from "../../shared/ui/icon";

type ComponentRow = MachineDetail["components"][number];

const columnHelper = createColumnHelper<ComponentRow>();
const MACHINE_PHOTO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCY8uxTP21pNNuoT6QPP9luSL65jRZqFG5x4H5NJlZLxMx-Eaaq-WCjSn7zMZjcLWciTQFvMLMrvcUHPtFvMq_ZZ1O3LTapZBHTIpu-pyuReRCEyfyyKkV0mXmR6YnytQ7DlVwJ8nEITToYDhn36jg_Ve2brUQqLZdTqyGluf4GBrmVqofk2XFt-X5l1z_wZ2T16jemG54iSrZl8aX4C2yREim7mxDAoCmPpXoSfvtMSVVh0tipkRFLEw";

function criticalityBadge(level: ComponentRow["level"], criticality: number) {
  if (level === "HIGH") {
    return {
      bar: "bg-error",
      badge: "bg-error text-on-error",
      icon: "warning",
      label: `C=${criticality} (Critical)`,
      action: "Requires weekly inspection.",
    };
  }
  if (level === "MEDIUM") {
    return {
      bar: "bg-secondary-container",
      badge: "bg-secondary-container text-on-secondary-container",
      icon: "info",
      label: `C=${criticality} (Medium)`,
      action: "Monthly calibration required.",
    };
  }
  return {
    bar: "bg-tertiary-container",
    badge: "bg-tertiary-container text-on-tertiary-container",
    icon: "check_circle",
    label: `C=${criticality} (Negligible)`,
    action: "Annual brush check.",
  };
}

export function MachineDetailPage() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["machine", "MA03"],
    queryFn: () => apiRequest<MachineDetail>("/machines/MA03"),
  });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "MA03"],
    queryFn: () => apiRequest<DashboardResponse>("/dashboard/MA03"),
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

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Component",
        cell: (info) => {
          const visual = criticalityBadge(info.row.original.level, info.row.original.criticality);
          return (
            <div className="relative py-md pl-lg font-medium text-on-surface">
              <div className={`absolute bottom-0 left-0 top-0 w-1 ${visual.bar}`} />
              {info.getValue()}
            </div>
          );
        },
      }),
      columnHelper.accessor("criticality", {
        header: "Criticality (C)",
        cell: (info) => {
          const visual = criticalityBadge(info.row.original.level, info.getValue());
          return (
            <div className={`inline-flex items-center gap-xs rounded px-2 py-1 font-label-caps text-[11px] uppercase tracking-wider ${visual.badge}`}>
              <Icon name={visual.icon} className="text-[14px]" />
              {visual.label}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "status",
        header: "Status/Action",
        cell: ({ row }) => (
          <span className="text-on-surface-variant">
            {criticalityBadge(row.original.level, row.original.criticality).action}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: query.data?.components ? [...query.data.components] : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (query.isLoading || dashboardQuery.isLoading) {
    return <p className="p-margin-mobile text-on-surface-variant">Chargement fiche machine...</p>;
  }
  if (query.isError || !query.data || dashboardQuery.isError || !dashboardQuery.data) {
    return <p className="p-margin-mobile text-error">Fiche machine indisponible.</p>;
  }

  const machine = query.data;
  const dashboard = dashboardQuery.data;
  const commissioned = machine.commissionedAt ? new Date(machine.commissionedAt) : null;
  const isDown = dashboard.machine.status === "DOWN";

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-lg px-margin-mobile py-lg md:px-margin-desktop lg:grid-cols-12">
      <div className="col-span-1 space-y-md lg:col-span-12">
        <div className="flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-headline-lg font-semibold text-on-surface">
              Fiche Technique: {machine.code} - {machine.designation}
            </h2>
            <p className="mt-xs text-body-lg text-on-surface-variant">
              Primary Automated Insertion Unit
            </p>
          </div>
          <div className="flex gap-sm">
            <button className="flex h-12 items-center gap-sm rounded border-2 border-outline bg-surface px-lg font-label-caps text-label-caps uppercase text-on-surface hover:bg-surface-variant" type="button">
              <Icon name="print" className="text-[18px]" />
              Print Label
            </button>
            {!isDown ? (
              <Link
                className="flex h-12 items-center gap-sm rounded bg-error px-lg font-label-caps text-label-caps uppercase text-on-error shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] hover:bg-error/80"
                to="/downtimes/new?machine=MA03"
              >
                <Icon name="block" className="text-[18px]" />
                Stop Machine
              </Link>
            ) : (
              <button
                className="flex h-12 items-center gap-sm rounded bg-tertiary-container px-lg font-label-caps text-label-caps uppercase text-on-tertiary-container shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] hover:bg-tertiary-container/80 disabled:opacity-60 disabled:pointer-events-none"
                onClick={() => dashboard.openDowntime && endMutation.mutate(dashboard.openDowntime.id)}
                disabled={endMutation.isPending}
              >
                <Icon name="play_arrow" className="text-[18px]" />
                {endMutation.isPending ? "Clôture..." : "Remettre en marche"}
              </button>
            )}
          </div>
        </div>
        <div className="mt-md grid grid-cols-1 gap-md md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Mise en service</span>
            <span className="mt-xs text-display-kpi text-on-surface">
              {commissioned ? commissioned.getFullYear() : "—"}
            </span>
            <span className="text-body-sm text-on-surface-variant">
              {commissioned
                ? commissioned.toLocaleDateString("en-US", { month: "long", day: "numeric" })
                : ""}
            </span>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Atelier</span>
            <span className="mt-xs text-display-kpi text-on-surface">{machine.workshop}</span>
            <span className="text-body-sm text-on-surface-variant">Montage Principal</span>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Ligne</span>
            <span className="mt-xs text-display-kpi text-on-surface">{machine.line}</span>
            <span className="text-body-sm text-on-surface-variant">Insertion Automatique</span>
          </div>
        </div>
      </div>

      <div className="col-span-1 space-y-lg lg:col-span-8">
        <div className="relative flex items-start gap-md overflow-hidden rounded-lg border-2 border-primary bg-surface-container-low p-md">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
          <Icon name="calendar_clock" className="mt-xs text-[32px] text-primary" />
          <div>
            <h3 className="text-headline-md text-on-surface">Prochain préventif: 15/10/2023</h3>
            <p className="text-body-md text-on-surface-variant">
              Contrôle usure outil SPAN et lubrification de l&apos;axe Z.
            </p>
          </div>
          <button
            className="ml-auto h-12 rounded bg-primary px-md font-label-caps text-label-caps uppercase text-on-primary opacity-60 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]"
            disabled
            type="button"
          >
            Create WO
          </button>
        </div>

        <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-outline-variant bg-[#F3F4F6] px-md py-sm">
            <h3 className="text-[18px] font-semibold text-on-surface">Critical Components (AMDEC)</h3>
            <Icon name="precision_manufacturing" className="text-on-surface-variant" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-outline-variant bg-surface-bright font-label-caps text-label-caps uppercase text-on-surface-variant">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="p-md font-bold">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="text-body-sm">
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-neutral-100 ${index % 2 === 1 ? "bg-surface-bright" : ""}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cell.column.id === "name" ? "p-0" : "p-md"}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-span-1 space-y-md lg:col-span-4">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
          <div className="mb-md flex items-center gap-sm border-b border-outline-variant pb-sm">
            <Icon name="menu_book" className="text-primary" />
            <h3 className="text-[18px] font-semibold text-on-surface">Documentation</h3>
          </div>
          <ul className="space-y-sm">
            {[
              { name: "Procédure SMED", icon: "picture_as_pdf", action: "download", color: "text-error" },
              { name: "Guide de réglage cales", icon: "picture_as_pdf", action: "download", color: "text-error" },
              { name: "Historique des pannes", icon: "description", action: "open_in_new", color: "text-primary" },
            ].map((doc) => (
              <li key={doc.name}>
                <div className="flex items-center justify-between rounded-lg p-sm">
                  <div className="flex items-center gap-sm">
                    <Icon name={doc.icon} className={`${doc.color} text-[20px]`} />
                    <span className="text-body-sm text-on-surface">{doc.name}</span>
                  </div>
                  <Icon name={doc.action} className="text-[16px] text-on-surface-variant" />
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-md flex h-10 w-full items-center justify-center gap-xs rounded-lg border-2 border-outline font-label-caps text-label-caps uppercase text-on-surface" type="button">
            <Icon name="add" className="text-[16px]" />
            Upload Doc
          </button>
        </div>
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
          <img alt="Vue d'ensemble MA03" className="h-48 w-full object-cover" src={MACHINE_PHOTO} />
          <div className="bg-[#F3F4F6] p-sm text-center font-label-caps text-label-caps text-on-surface-variant">
            Vue d&apos;ensemble - MA03
          </div>
        </div>
      </div>
    </div>
  );
}
