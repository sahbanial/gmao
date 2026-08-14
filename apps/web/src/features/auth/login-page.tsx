import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../shared/api/http-client";
import type { AuthResult } from "../../shared/api/types";
import { saveAuthSession } from "../../shared/auth/auth-session";
import { Icon } from "../../shared/ui/icon";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("operator@gmao.local");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-background antialiased">
      <header className="flex h-16 items-center gap-sm border-b-2 border-outline-variant bg-surface px-margin-mobile">
        <Icon name="precision_manufacturing" className="text-primary" />
        <span className="text-headline-md font-bold text-primary">IndustriOS</span>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-margin-mobile">
        <h1 className="text-headline-lg-mobile font-bold text-on-surface">Connexion atelier</h1>
        <p className="mt-xs mb-lg text-body-md text-on-surface-variant">
          Machine INSERTER MA03 — GRUNER El Fajja
        </p>
        <form
          className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface p-lg shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface" htmlFor="email">
              Email
            </label>
            <input
              className="h-12 rounded-lg border-2 border-outline bg-surface px-4 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-caps text-label-caps text-on-surface" htmlFor="password">
              Mot de passe
            </label>
            <input
              className="h-12 rounded-lg border-2 border-outline bg-surface px-4 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-container"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-body-sm text-error">{error}</p> : null}
          <button
            className="flex h-12 items-center justify-center rounded-xl bg-primary-container font-label-caps text-label-caps tracking-wider text-on-primary"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </main>
    </div>
  );
}
