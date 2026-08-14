import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth/login-page";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { DeclareDowntimePage } from "./features/downtimes/declare-downtime-page";
import { MachineDetailPage } from "./features/machines/machine-detail-page";
import { AppShell } from "./shared/layout/app-shell";
import { ProtectedRoute } from "./shared/routing/protected-route";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="/machines/MA03" element={<MachineDetailPage />} />
              <Route path="/downtimes/new" element={<DeclareDowntimePage />} />
              <Route
                path="/report"
                element={<p>Analyse Pareto & AMDEC — Phase 3</p>}
              />
              <Route path="/tasks" element={<p>Interventions — Phase 2</p>} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
