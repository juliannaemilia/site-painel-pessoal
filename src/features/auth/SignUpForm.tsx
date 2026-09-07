import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, UserCircle, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { isValidUsername } from "@/lib/utils";

export function SignUpForm(): JSX.Element {
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    if (!isValidUsername(username)) {
      setFormError("Usuário deve ter 3–32 caracteres: letras, números, ponto, hífen ou underline.");
      return;
    }
    if (password.length < 8) {
      setFormError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    try {
      await signUp({ username, fullName, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível criar a conta. Tente novamente.");
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
      <Input
        label="Nome completo"
        type="text"
        name="fullName"
        placeholder="Seu nome"
        icon={<UserCircle className="h-4 w-4" />}
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        autoComplete="name"
        required
      />

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
        placeholder="Mínimo 8 caracteres"
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
        autoComplete="new-password"
        minLength={8}
        required
      />

      <Input
        label="Confirmar senha"
        type={showPassword ? "text" : "password"}
        name="confirmPassword"
        placeholder="Repita a senha"
        icon={<Lock className="h-4 w-4" />}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        autoComplete="new-password"
        minLength={8}
        required
      />

      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
        Criar conta
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
