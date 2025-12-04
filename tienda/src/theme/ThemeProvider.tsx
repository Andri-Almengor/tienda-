import { createContext, useContext, PropsWithChildren, useMemo } from "react";
import { useColorScheme } from "react-native";
import { tokens } from "./tokens";

type Theme = typeof tokens & { mode: "light" | "dark"; palette: typeof tokens.colors };

const ThemeCtx = createContext<Theme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren<{ forceMode?: "light"|"dark" }>) {
  const sys = useColorScheme();
  const mode: "light"|"dark" = (sys ?? "light");
  const val = useMemo(() => ({
    ...tokens,
    mode,
    palette: mode === "light" ? tokens.colors : tokens.dark
  }), [mode]);

  return <ThemeCtx.Provider value={val}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
