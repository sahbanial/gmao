import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../shared/api/http-client";
import type { MachineDetail } from "../../shared/api/types";
import { Icon } from "../../shared/ui/icon";

interface DashboardMachine {
  status: "DOWN" | "RUNNING";
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

function formatElapsed(seconds: number): string {
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function DeclareDowntimePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const machineCode = params.get("machine") ?? "MA03";
  const [elapsed, setElapsed] = useState(0);
  const [type, setType] = useState("");
  const [componentId, setComponentId] = useState("");
  const [cause, setCause] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const machineQuery = useQuery({
    queryKey: ["machine", machineCode],
    queryFn: () => apiRequest<MachineDetail>(`/machines/${machineCode}`),
  });
  const components = useMemo(
    () => machineQuery.data?.components ?? [],
    [machineQuery.data],
  );

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", machineCode],
    queryFn: () => apiRequest<DashboardMachine>(`/dashboard/${machineCode}`),
  });

  const isDown = dashboardQuery.data?.status === "DOWN";

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
    <div className="container mx-auto flex max-w-3xl flex-col gap-lg p-margin-mobile md:p-margin-desktop">
      <div>
        <div className="mb-sm flex items-start justify-between">
          <h2 className="text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
            Déclaration de Panne / Arrêt
          </h2>
          <div className="flex animate-pulse items-center gap-2 rounded bg-error px-3 py-1 text-on-error shadow-sm">
            <Icon name="timer" className="text-[20px]" />
            <span className="font-bold tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
        </div>
        <p className="text-body-md text-on-surface-variant">
          Renseignez les détails de l&apos;arrêt pour {machineCode}. Ces informations
          sont cruciales pour le suivi TRG.
        </p>
      </div>

      {isDown ? (
        <div className="rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex flex-col gap-md p-md md:p-lg">
            <div className="flex items-center gap-3 rounded-lg bg-error-container p-4">
              <Icon name="warning" className="text-[24px] text-on-error-container" />
              <p className="text-body-md text-on-error-container">
                Un arrêt est déjà en cours sur {machineCode}.
              </p>
            </div>
            <div className="flex justify-center">
              <Link
                className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-label-caps text-label-caps font-bold tracking-wider text-on-primary shadow-sm transition-all hover:bg-primary-hover"
                to="/"
              >
                <Icon name="play_arrow" />
                Remettre en marche
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-md p-md md:p-lg">
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface" htmlFor="typeArret">
              Type d&apos;arrêt <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                className="h-12 w-full cursor-pointer appearance-none rounded-md border-2 border-outline bg-surface px-4 pr-10 text-body-md text-on-surface shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-container"
                id="typeArret"
                required
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option disabled value="">
                  Sélectionner le type...
                </option>
                {DOWNTIME_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <Icon
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant"
                name="expand_more"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface" htmlFor="composant">
              Composant concerné <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                className="h-12 w-full cursor-pointer appearance-none rounded-md border-2 border-outline bg-surface px-4 pr-10 text-body-md text-on-surface shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-container"
                id="composant"
                required
                value={componentId}
                onChange={(event) => setComponentId(event.target.value)}
              >
                <option disabled value="">
                  Sélectionner le composant...
                </option>
                {components.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <Icon
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant"
                name="expand_more"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface" htmlFor="cause">
              Cause (5 Pourquoi)
            </label>
            <textarea
              className="resize-none rounded-md border-2 border-outline bg-surface p-4 text-body-md text-on-surface shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-container"
              id="cause"
              placeholder="Décrire la cause racine si connue..."
              rows={4}
              value={cause}
              onChange={(event) => setCause(event.target.value)}
            />
          </div>

          <div className="mt-sm flex flex-col gap-xs">
            <span className="font-label-caps text-label-caps text-on-surface">Preuve visuelle</span>
            <button
              className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
              type="button"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant group-hover:text-primary">
                <Icon name="add_a_photo" className="text-[28px]" />
              </div>
              <span className="text-body-sm font-medium text-on-surface-variant group-hover:text-primary">
                Prendre une photo de la panne
              </span>
            </button>
          </div>
          {error ? <p className="text-body-sm text-error">{error}</p> : null}
        </div>

        <div className="mt-auto flex flex-col-reverse gap-md border-t border-outline-variant bg-surface-container-lowest p-md md:flex-row md:p-lg">
          <Link
            className="flex min-h-12 flex-1 items-center justify-center rounded-lg border-2 border-outline font-label-caps text-label-caps font-bold tracking-wider text-on-surface hover:bg-surface-container-low md:min-h-14"
            to="/"
          >
            Annuler
          </Link>
            <button
              className="flex min-h-14 flex-[2] items-center justify-center gap-2 rounded-lg bg-error font-label-caps text-[14px] font-bold tracking-wider text-on-error shadow-sm transition-all hover:bg-[#a3000b] active:scale-[0.98]"
              disabled={mutation.isPending}
              type="submit"
            >
              <Icon name="play_arrow" />
              Valider et Démarrer le chrono
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
