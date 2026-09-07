import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, CategoryBadge } from "@/components/ui/Badge";
import { EditableTagRow } from "@/components/shared/EditableTagRow";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { useAuth } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";

export function SettingsPage(): JSX.Element {
  const { user, updateProfile, updatePassword, signOut } = useAuth();
  const {
    categories,
    addCategory,
    renameCategory,
    removeCategory,
    isCategoriesLoading,
    platforms,
    addPlatform,
    renamePlatform,
    removePlatform,
    isPlatformsLoading,
  } = useAppData();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [username] = useState(user?.username ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [newPlatform, setNewPlatform] = useState("");
  const [isSavingPlatform, setIsSavingPlatform] = useState(false);
  const [platformError, setPlatformError] = useState<string | null>(null);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileSaved(false);
    setProfileError(null);
    try {
      await updateProfile({ fullName });
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Não foi possível salvar o perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSavingPassword(true);
    setPasswordSaved(false);
    setPasswordError(null);
    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Não foi possível atualizar a senha.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleAddCategory(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    if (categories.some((category) => category.name.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryError("Você já tem uma categoria com esse nome.");
      return;
    }

    setCategoryError(null);
    setIsSavingCategory(true);
    try {
      await addCategory({ name: trimmed });
      setNewCategory("");
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleRenameCategory(id: string, name: string): Promise<void> {
    if (categories.some((category) => category.id !== id && category.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    await renameCategory(id, name);
  }

  async function handleAddPlatform(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmed = newPlatform.trim();
    if (!trimmed) return;

    if (platforms.some((platform) => platform.name.toLowerCase() === trimmed.toLowerCase())) {
      setPlatformError("Você já tem uma plataforma com esse nome.");
      return;
    }

    setPlatformError(null);
    setIsSavingPlatform(true);
    try {
      await addPlatform({ name: trimmed });
      setNewPlatform("");
    } finally {
      setIsSavingPlatform(false);
    }
  }

  async function handleRenamePlatform(id: string, name: string): Promise<void> {
    if (platforms.some((platform) => platform.id !== id && platform.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    await renamePlatform(id, name);
  }

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold text-foreground">Configurações</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Gerencie seu perfil, categorias, plataformas, segurança e preferências
      </p>

      <div className="flex flex-col gap-6">
        <AppearanceSettings />

        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => void handleProfileSubmit(event)} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar fullName={fullName || "Usuário"} avatarUrl={user?.avatarUrl} size="lg" />
                <div className="text-sm text-muted-foreground">
                  Avatar gerado a partir das iniciais do nome.
                </div>
              </div>

              <Input
                label="Nome completo"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
              <Input label="Usuário" value={username} disabled />

              {profileError && <p className="text-sm text-destructive">{profileError}</p>}

              <div className="flex items-center gap-3">
                <Button type="submit" isLoading={isSavingProfile}>
                  Salvar alterações
                </Button>
                {profileSaved && <span className="text-sm text-success">Perfil atualizado.</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>
              Crie, renomeie e remova categorias para organizar seus links, planilhas e arquivos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isCategoriesLoading ? (
              <p className="text-sm text-muted-foreground">Carregando categorias…</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você ainda não criou nenhuma categoria.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <EditableTagRow
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    itemKind="categoria"
                    renderBadge={(name) => <CategoryBadge category={name} />}
                    onRename={handleRenameCategory}
                    onRemove={(id) => void removeCategory(id)}
                  />
                ))}
              </div>
            )}

            <form onSubmit={(event) => void handleAddCategory(event)} className="flex items-end gap-2">
              <Input
                label="Nova categoria"
                placeholder="Ex: Receitas, Viagens, Finanças…"
                value={newCategory}
                onChange={(event) => {
                  setNewCategory(event.target.value);
                  setCategoryError(null);
                }}
                error={categoryError ?? undefined}
                className="max-w-xs"
              />
              <Button type="submit" size="md" isLoading={isSavingCategory}>
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plataformas</CardTitle>
            <CardDescription>
              Crie, renomeie e remova as plataformas usadas nas suas planilhas (Google Sheets, Excel...)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isPlatformsLoading ? (
              <p className="text-sm text-muted-foreground">Carregando plataformas…</p>
            ) : platforms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você ainda não criou nenhuma plataforma.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <EditableTagRow
                    key={platform.id}
                    id={platform.id}
                    name={platform.name}
                    itemKind="plataforma"
                    renderBadge={(name) => <Badge tone="neutral">{name}</Badge>}
                    onRename={handleRenamePlatform}
                    onRemove={(id) => void removePlatform(id)}
                  />
                ))}
              </div>
            )}

            <form onSubmit={(event) => void handleAddPlatform(event)} className="flex items-end gap-2">
              <Input
                label="Nova plataforma"
                placeholder="Ex: Airtable, Coda…"
                value={newPlatform}
                onChange={(event) => {
                  setNewPlatform(event.target.value);
                  setPlatformError(null);
                }}
                error={platformError ?? undefined}
                className="max-w-xs"
              />
              <Button type="submit" size="md" isLoading={isSavingPlatform}>
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Altere sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => void handlePasswordSubmit(event)} className="flex flex-col gap-4">
              <Input
                label="Senha atual"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
              <Input
                label="Nova senha"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                required
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              <div className="flex items-center gap-3">
                <Button type="submit" isLoading={isSavingPassword}>
                  Atualizar senha
                </Button>
                {passwordSaved && <span className="text-sm text-success">Senha atualizada.</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Encerrar a sessão atual neste dispositivo</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => void signOut()}>
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
