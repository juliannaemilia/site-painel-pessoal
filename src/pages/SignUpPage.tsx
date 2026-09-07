import { Navigate } from "react-router-dom";
import { PanelLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SignUpForm } from "@/features/auth/SignUpForm";
import { StarfieldBackground } from "@/components/backgrounds/StarfieldBackground";
import { useAuth } from "@/hooks/useAuth";

export function SignUpPage(): JSX.Element {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      {/* Fundo decorativo — ajuste cores/quantidade/velocidade via props aqui. */}
      <StarfieldBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <PanelLeft className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar conta</h1>
          <p className="mt-1 text-sm text-slate-300">Só usuário e senha — sem e-mail necessário</p>
        </div>

        <Card className="p-6 shadow-2xl sm:p-8">
          <SignUpForm />
        </Card>
      </div>
    </div>
  );
}
