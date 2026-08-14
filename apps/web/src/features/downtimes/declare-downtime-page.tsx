import { type FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../shared/api/http-client";

interface MachineDetail {
  readonly id: string;
  readonly code: string;
  readonly components: ReadonlyArray<{ readonly id: string; readonly name: string }>;
}

const DOWNTIME_TYPES = [
  { value: "MECHANICAL_FAILURE", label: "Panne mécanique" },
  { value: "VORSCHUB_ADJUSTMENT", label: "Réglage Vorschub" },
  { value: "SERIES_CHANGE", label: "Changement de série" },
  { value: "ELECTRICAL_FAILURE", label: "Panne électrique" },
  { value: "QUALITY_STOP", label: "Arrêt qualité" },
  { value: "PLANNED_STOP", label: "Arrêt planifié" },
  { value: "OTHER", label: "Autre" },
] as const;

export function DeclareDowntimePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const machineCode = params.get("machine") ?? "MA03";
  const machineQuery = useQuery({
    queryKey: ["machine", machineCode],
    queryFn: () => apiRequest<MachineDetail>(`/machines/${machineCode}`),
  });
  const [type, setType] = useState("");
  const [componentId, setComponentId] = useState("");
  const [cause, setCause] = useState("");
  const [error, setError] = useState<string | null>(null);

  const components = useMemo(
    () => machineQuery.data?.components ?? [],
    [machineQuery.data],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!machineQuery.data) throw new Error("Machine introuvable");
      if (!type || !componentId) throw new Error("Type et composant requis");
      return apiRequest("/downtimes", {
        method: "POST",
        body: JSON.stringify({
          machineId: machineQuery.data.id,
          type,
          componentId,
          cause: cause || undefined,
        }),
      });
    },
    onSuccess: () => navigate("/", { replace: true }),
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    mutation.mutate();
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-[var(--color-primary)]">
        ← Retour
      </Link>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold">Déclaration de Panne / Arrêt</h1>
        <span className="badge badge-danger">CHRONO</span>
      </div>
      <p className="text-sm text-[var(--color-on-surface-variant)]">
        Renseignez les détails de l&apos;arrêt pour {machineCode}. Ces informations
        sont cruciales pour le suivi TRG.
      </p>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="type">Type d&apos;arrêt *</label>
          <select
            id="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            required
          >
            <option value="">Sélectionner le type...</option>
            {DOWNTIME_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="component">Composant concerné *</label>
          <select
            id="component"
            value={componentId}
            onChange={(event) => setComponentId(event.target.value)}
            required
          >
            <option value="">Sélectionner le composant...</option>
            {components.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cause">Cause (5 Pourquoi)</label>
          <textarea
            id="cause"
            rows={4}
            value={cause}
            onChange={(event) => setCause(event.target.value)}
            placeholder="Décrire la cause racine si connue..."
          />
        </div>
        <div className="mb-4 rounded border border-dashed border-[var(--color-outline)] p-4 text-center text-sm text-[var(--color-on-surface-variant)]">
          Preuve visuelle — upload photo (Phase ultérieure)
        </div>
        {error ? <p className="mb-3 text-sm text-[var(--color-error)]">{error}</p> : null}
        <button className="btn-danger mb-3" type="submit" disabled={mutation.isPending}>
          VALIDER ET DÉMARRER LE CHRONO
        </button>
        <Link className="btn-outline" to="/">
          ANNULER
        </Link>
      </form>
    </div>
  );
}
