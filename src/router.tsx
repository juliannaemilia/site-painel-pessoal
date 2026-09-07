import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  PublicFilesPage,
  DashboardOverviewPage,
  QuickLinksPage,
  SpreadsheetsPage,
  FilesPage,
  PublicItemsPage,
  SettingsPage,
} from "@/pages";

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignUpPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/visitante" element={<PublicFilesPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="links-rapidos" element={<QuickLinksPage />} />
        <Route path="planilhas" element={<SpreadsheetsPage />} />
        <Route path="arquivos" element={<FilesPage />} />
        <Route path="publicos" element={<PublicItemsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
