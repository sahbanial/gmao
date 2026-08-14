import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

interface DataTableProps<TData> {
  readonly table: Table<TData>;
  readonly emptyLabel: string;
}

export function DataTable<TData>({ table, emptyLabel }: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;

  return (
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={table.getAllColumns().length} className="p-md text-center text-on-surface-variant">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-outline-variant ${index % 2 === 1 ? "bg-surface-bright" : ""}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={cell.column.id === "name" ? "p-0" : "p-md"}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}