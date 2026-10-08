import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

// Tipagens
type Language = "pt" | "en" | "es";
type AccessibilityMode = "none" | "monochrome" | "protanopia" | "deuteranopia" | "tritanopia";
type FontFamily = "default" | "dyslexic";

interface PreferencesContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    accessibilityMode: AccessibilityMode;
    setAccessibilityMode: (mode: AccessibilityMode) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    fontFamily: FontFamily;
    setFontFamily: (font: FontFamily) => void;
    theme: string | undefined;
    setTheme: (theme: string) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Wrapper interno que usa o contexto
function PreferencesProviderContent({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useNextTheme();

    // Estados
    const [language, setLanguageState] = useState<Language>("pt");
    const [accessibilityMode, setAccessibilityModeState] = useState<AccessibilityMode>("none");
    const [fontSize, setFontSizeState] = useState<number>(16);
    const [fontFamily, setFontFamilyState] = useState<FontFamily>("default");
    const [mounted, setMounted] = useState(false);

    // Carregamento inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            const savedLang = localStorage.getItem("pref-lang") as Language;
            const savedMode = localStorage.getItem("pref-mode") as AccessibilityMode;
            const savedSize = localStorage.getItem("pref-size");
            const savedFont = localStorage.getItem("pref-font") as FontFamily;

            if (savedLang) setLanguageState(savedLang);
            if (savedMode) setAccessibilityModeState(savedMode);
            if (savedSize) setFontSizeState(Number(savedSize));
            if (savedFont) setFontFamilyState(savedFont);

            setMounted(true);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    // Aplicação de efeitos no DOM
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        const body = document.body;

        // 1. Aplicar Fonte
        if (fontFamily === "dyslexic") body.classList.add("font-dyslexic");
        else body.classList.remove("font-dyslexic");

        // 2. Aplicar Tamanho
        root.style.fontSize = `${fontSize}px`;

        // 3. Aplicar Filtros de Cor
        body.classList.remove("mode-monochrome", "mode-protanopia", "mode-deuteranopia", "mode-tritanopia");
        if (accessibilityMode !== "none") body.classList.add(`mode-${accessibilityMode}`);

    }, [fontFamily, fontSize, accessibilityMode, mounted]);

    // Setters
    const setLanguage = (l: Language) => { setLanguageState(l); localStorage.setItem("pref-lang", l); };
    const setAccessibilityMode = (m: AccessibilityMode) => { setAccessibilityModeState(m); localStorage.setItem("pref-mode", m); };
    const setFontSize = (s: number) => { setFontSizeState(s); localStorage.setItem("pref-size", s.toString()); };
    const setFontFamily = (f: FontFamily) => { setFontFamilyState(f); localStorage.setItem("pref-font", f); };

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    return (
        <PreferencesContext.Provider value={{
            language, setLanguage,
            accessibilityMode, setAccessibilityMode,
            fontSize, setFontSize,
            fontFamily, setFontFamily,
            theme, setTheme
        }}>
            {children}
        </PreferencesContext.Provider>
    );
}

// Wrapper Principal que inclui o ThemeProvider
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <PreferencesProviderContent>
                {children}
            </PreferencesProviderContent>
        </NextThemesProvider>
    );
}
// eslint-disable-next-line react-refresh/only-export-components
export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (!context) throw new Error("usePreferences must be used within a PreferencesProvider");
    return context;
}

export function Text({ pt, en, es, className }: { pt: string; en?: string; es?: string; className?: string }) {
    const { language } = usePreferences();
    const content = language === "en" ? (en || pt) : language === "es" ? (es || pt) : pt;
    return <span className={className}>{content}</span>;
}