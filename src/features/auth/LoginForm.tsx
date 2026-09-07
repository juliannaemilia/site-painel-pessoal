import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm(): JSX.Element {
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    try {
      await signIn({ username, password, rememberMe });
      // Login bem-sucedido: navega para a rota que o usuário tentava acessar
      // (guardada pelo ProtectedRoute em location.state.from) ou para o dashboard.
      const state = location.state as { from?: { pathname: string } } | null;
      const redirectTo = state?.from?.pathname ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível entrar. Tente novamente.");
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
      <Input
        label="Usuário"
        type="text"
        name="username"
        placeholder="seu.usuario"
        icon={<User className="h-4 w-4" />}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />

      <Input
        label="Senha"
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="••••••••"
        icon={<Lock className="h-4 w-4" />}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-between">
        <Checkbox
          label="Lembrar de mim"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />
        <Link to="/esqueci-senha" className="text-sm font-medium text-primary hover:underline">
          Esqueceu a senha?
        </Link>
      </div>

      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
        Entrar
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link to="/cadastro" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>

      <Link
        to="/visitante"
        className="text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
      >
        Entrar como visitante (ver itens públicos)
      </Link>
    </form>
  );
}
