import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "petroleum" | "orange" | "pink";
type ResolvedThemeMode = Exclude<ThemeMode, "system">;

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  accentColor: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (accentColor: AccentColor) => void;
}

const MODE_STORAGE_KEY = "painel-theme-mode";
const ACCENT_STORAGE_KEY = "painel-theme-accent";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function isAccentColor(value: string | null): value is AccentColor {
  return value === "petroleum" || value === "orange" || value === "pink";
}

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
  return isThemeMode(stored) ? stored : "system";
}

function getInitialAccent(): AccentColor {
  if (typeof window === "undefined") return "petroleum";
  const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
  return isAccentColor(stored) ? stored : "petroleum";
}

function getSystemMode(): ResolvedThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [accentColor, setAccentColorState] = useState<AccentColor>(getInitialAccent);
  const [systemMode, setSystemMode] = useState<ResolvedThemeMode>(getSystemMode);

  const resolvedMode: ResolvedThemeMode = mode === "system" ? systemMode : mode;

  useEffect(() => {
    const media = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => {
      setSystemMode(event.matches ? "dark" : "light");
    };

    setSystemMode(media.matches ? "dark" : "light");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedMode === "dark");
    root.dataset.mode = resolvedMode;
    root.dataset.themeMode = mode;
    root.dataset.accent = accentColor;
    root.style.colorScheme = resolvedMode;
  }, [accentColor, mode, resolvedMode]);

  const setMode = useCallback((nextMode: ThemeMode): void => {
    setModeState(nextMode);
    window.localStorage.setItem(MODE_STORAGE_KEY, nextMode);
  }, []);

  const setAccentColor = useCallback((nextAccent: AccentColor): void => {
    setAccentColorState(nextAccent);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, nextAccent);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedMode, accentColor, setMode, setAccentColor }),
    [accentColor, mode, resolvedMode, setAccentColor, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  }
  return context;
}
