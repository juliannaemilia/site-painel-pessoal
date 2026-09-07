export interface AuthUser {
  id: string;
  /** Nome de usuário único usado para login — o app não usa e-mail. */
  username: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpValues {
  username: string;
  fullName: string;
  password: string;
}

export interface UpdateProfileValues {
  fullName: string;
}

export interface UpdatePasswordValues {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (values: SignUpValues) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (values: UpdateProfileValues) => Promise<void>;
  updatePassword: (values: UpdatePasswordValues) => Promise<void>;
  isAuthenticated: boolean;
}
