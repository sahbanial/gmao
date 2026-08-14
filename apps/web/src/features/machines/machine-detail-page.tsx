import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../shared/api/http-client";

interface ComponentRow {
  readonly id: string;
  readonly name: string;
  readonly criticality: number;
  readonly level: "NEGLIGIBLE" | "MEDIUM" | "HIGH";
}

interface MachineDetail {
  readonly code: string;
  readonly designation: string;
  readonly workshop: string;
  readonly line: string;
  readonly commissionedAt: string | null;
  readonly components: readonly ComponentRow[];
}

const columnHelper = createColumnHelper<ComponentRow>();

function levelClass(level: ComponentRow["level"]): string {
  if (level === "HIGH") return "badge-danger";
  if (level === "MEDIUM") return "badge-warning";
  return "badge-success";
}

export function MachineDetailPage() {
  const query = useQuery({
    queryKey: ["machine", "MA03"],
    queryFn: () => apiRequest<MachineDetail>("/machines/MA03"),
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: "Component" }),
      columnHelper.accessor("criticality", {
        header: "Criticality (C)",
        cell: (info) => (
          <span className={`badge ${levelClass(info.row.original.level)}`}>
            C={info.getValue()} ({info.row.original.level})
          </span>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status/Action",
        cell: ({ row }) =>
          row.original.level === "HIGH"
            ? "Requires weekly inspection."
            : row.original.level === "MEDIUM"
              ? "Monthly calibration required."
              : "Annual brush check.",
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: query.data?.components ? [...query.data.components] : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (query.isLoading) return <p>Chargement fiche machine...</p>;
  if (query.isError || !query.data) {
    return <p className="text-[var(--color-error)]">Fiche machine indisponible.</p>;
  }

  const machine = query.data;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          Fiche Technique: {machine.code} - {machine.designation}
        </h1>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Primary Automated Insertion Unit
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="btn-outline" type="button">
          PRINT LABEL
        </button>
        <button className="btn-danger" type="button" disabled title="Phase 2">
          STOP MACHINE
        </button>
      </div>
      <div className="card">
        <div className="text-xs font-bold tracking-wide">MISE EN SERVICE</div>
        <div className="text-2xl font-bold">
          {machine.commissionedAt
            ? new Date(machine.commissionedAt).getFullYear()
            : "—"}
        </div>
      </div>
      <div className="card">
        <div className="text-xs font-bold tracking-wide">ATELIER</div>
        <div className="text-2xl font-bold">{machine.workshop}</div>
      </div>
      <div className="card">
        <div className="text-xs font-bold tracking-wide">LIGNE</div>
        <div className="text-2xl font-bold">{machine.line}</div>
      </div>
      <div className="card border-[var(--color-primary-container)]">
        <div className="font-semibold">Prochain préventif</div>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Planification préventive — Phase 2
        </p>
        <button className="btn-primary mt-3" type="button" disabled>
          CREATE WO
        </button>
      </div>
      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-semibold">Critical Components (AMDEC)</h2>
        <table className="w-full text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[var(--color-outline)]">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-2 pr-2 font-semibold">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={index % 2 === 0 ? "bg-[var(--color-background)]" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2 pr-2 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2 className="mb-2 font-semibold">Documentation</h2>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Procédures SMED / guides — Phase 3
        </p>
      </div>
    </div>
  );
}
