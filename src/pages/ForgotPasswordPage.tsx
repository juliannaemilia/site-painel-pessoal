import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StarfieldBackground } from "@/components/backgrounds/StarfieldBackground";

/**
 * Como o app não coleta e-mail dos usuários (login é só por username), a
 * recuperação de senha não pode ser autoatendida por link de e-mail. Este
 * fluxo registra a solicitação para um administrador redefinir a senha
 * manualmente (ex: via Supabase Dashboard > Authentication > Users).
 */
export function ForgotPasswordPage(): JSX.Element {
  const [username, setUsername] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    // TODO: substituir por uma chamada real (ex: função Edge que notifica um
    // administrador, já que não há e-mail para enviar um link de reset direto).
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
    setIsSubmitted(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Fundo decorativo — ajuste cores/quantidade/velocidade via props aqui. */}
      <StarfieldBackground />

      <div className="relative z-10 w-full max-w-md">
        <Card className="p-6 shadow-2xl sm:p-8">
          <h1 className="text-xl font-bold text-foreground">Recuperar senha</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Informe seu usuário. Como o app não usa e-mail, um administrador vai analisar o
            pedido e redefinir sua senha manualmente.
          </p>

          {isSubmitted ? (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              Solicitação registrada para o usuário <strong>{username}</strong>. Um administrador
              vai entrar em contato para redefinir sua senha.
            </p>
          ) : (
            <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
              <Input
                label="Usuário"
                icon={<User className="h-4 w-4" />}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <Button type="submit" isLoading={isLoading} className="w-full">
                Solicitar redefinição
              </Button>
            </form>
          )}

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para o login
          </Link>
        </Card>
      </div>
    </div>
  );
}
