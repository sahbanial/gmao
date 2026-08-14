import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../shared/api/http-client";
import type { AuthResult } from "../../shared/api/types";
import { saveAuthSession } from "../../shared/auth/auth-session";
import { Icon } from "../../shared/ui/icon";
import { LoginField } from "./login-field";

const MACHINE_LABEL = "INSERTER MA03 — GRUNER El Fajja";
const AUTHOR_CREDIT = "Réalisé par Jawher Araibi";

function BrandMark() {
  return (
    <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-on-primary">
      <Icon className="text-headline-md" name="precision_manufacturing" />
    </div>
  );
}

function LoginBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-primary text-on-primary md:flex md:h-full md:w-[min(44%,32rem)] md:shrink-0 md:flex-col md:justify-between md:px-margin-desktop md:py-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "2rem 2rem",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-12 size-56 rounded-[2rem] border-2 border-on-primary/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-2 -bottom-4 size-32 rounded-xl bg-on-primary/10"
      />
      <div className="relative flex items-center gap-sm">
        <div className="flex size-14 items-center justify-center rounded-xl bg-on-primary/15 text-on-primary">
          <Icon className="text-headline-md" name="precision_manufacturing" />
        </div>
        <span className="text-headline-md font-bold">IndustriOS</span>
      </div>
      <div className="relative">
        <p className="font-label-caps text-label-caps text-primary-fixed-dim">GMAO atelier</p>
        <p className="mt-sm text-headline-lg font-bold">Connexion poste</p>
        <p className="mt-sm text-body-md text-primary-fixed">{MACHINE_LABEL}</p>
      </div>
      <div className="relative flex flex-col gap-xs text-body-sm text-primary-fixed-dim">
        <p>Poste fixe et tablette — session 8 h</p>
        <p>{AUTHOR_CREDIT}</p>
      </div>
    </aside>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("operator@gmao.local");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasError = Boolean(error);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest<AuthResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveAuthSession(result.accessToken, result.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-y-auto bg-background text-on-background antialiased md:h-dvh md:flex-row md:overflow-hidden">
      <LoginBrandPanel />
      <main className="flex min-h-dvh min-w-0 flex-1 flex-col items-center px-[max(1rem,env(safe-area-inset-left,0px))] pt-[max(1.5rem,env(safe-area-inset-top,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:h-full md:justify-center md:px-margin-desktop md:py-xl">
        <header className="mb-xl flex w-full flex-col items-center gap-sm md:hidden">
          <BrandMark />
          <p className="text-headline-md font-bold text-primary">IndustriOS</p>
        </header>
        <form
          className="flex w-full max-w-login flex-col gap-md md:rounded-xl md:border-2 md:border-outline-variant md:bg-surface-container-lowest md:p-xl"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center gap-sm md:items-start md:gap-xs">
            <h1 className="text-headline-lg-mobile font-bold md:text-headline-lg">Connexion</h1>
            <p className="rounded-lg bg-surface-container px-sm py-xs text-center text-body-sm font-semibold text-on-surface-variant md:hidden">
              {MACHINE_LABEL}
            </p>
            <p className="hidden text-body-md text-on-surface-variant md:block">
              Identifiez-vous pour ouvrir la session atelier.
            </p>
          </div>
          <LoginField
            autoComplete="username"
            hasError={hasError}
            icon="mail"
            id="email"
            label="Email"
            onChange={setEmail}
            type="email"
            value={email}
          />
          <LoginField
            autoComplete="current-password"
            hasError={hasError}
            icon="lock"
            id="password"
            label="Mot de passe"
            onChange={setPassword}
            type="password"
            value={password}
          />
          {error ? (
            <p
              className="flex items-start gap-sm rounded-lg bg-error-container px-md py-sm text-body-sm text-on-error-container"
              role="alert"
            >
              <Icon className="mt-px shrink-0" name="error" />
              <span>{error}</span>
            </p>
          ) : null}
          <button
            className="mt-xs flex h-12 w-full items-center justify-center gap-sm rounded-xl bg-primary font-label-caps text-label-caps tracking-wider text-on-primary transition-opacity active:opacity-90 disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <Icon className="animate-spin" name="progress_activity" />
                Connexion...
              </>
            ) : (
              <>
                Se connecter
                <Icon filled={false} name="arrow_forward" />
              </>
            )}
          </button>
        </form>
        <footer className="mt-auto flex w-full flex-col items-center gap-xs pt-lg text-center text-body-sm text-on-surface-variant md:hidden">
          <p>Poste atelier — session 8 h</p>
          <p>{AUTHOR_CREDIT}</p>
        </footer>
      </main>
    </div>
  );
}
