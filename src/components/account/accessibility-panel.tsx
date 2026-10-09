import { usePreferences, Text } from "@/components/providers/preferences-provider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
    Type as TypeIcon,
    Eye,
    RotateCcw,
    Palette,
    Hand
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Definindo o tipo localmente para garantir a tipagem correta no cast
type AccessibilityMode = "none" | "monochrome" | "protanopia" | "deuteranopia" | "tritanopia";

/**
 * Controles de acessibilidade e aparência (fonte, tema, daltonismo).
 * Reutilizado no Sheet do SettingsMenu e na página Meu perfil → Acessibilidade.
 */
export function AccessibilityPanel() {
    const { 
        accessibilityMode, setAccessibilityMode,
        fontSize, setFontSize,
        fontFamily, setFontFamily,
        theme, setTheme,
        vlibras, setVlibras
    } = usePreferences();

    const resetSettings = () => {
        setAccessibilityMode("none");
        setFontSize(16);
        setFontFamily("default");
        setTheme("system");
        setVlibras(false);
    };

    return (
        <div className="py-2 space-y-8">
            {/* SEÇÃO FONTE */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <TypeIcon className="h-4 w-4" />
                    <Text pt="Tipografia" en="Typography" es="Tipografía" />
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dyslexic">OpenDyslexic</Label>
                        <Switch
                            id="dyslexic"
                            checked={fontFamily === "dyslexic"}
                            onCheckedChange={(checked) => setFontFamily(checked ? "dyslexic" : "default")}
                        />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label><Text pt="Tamanho" en="Size" es="Tamaño" /></Label>
                            <span className="text-xs text-muted-foreground">{fontSize}px</span>
                        </div>
                        <Slider
                            value={[fontSize]}
                            onValueChange={(val) => setFontSize(val[0])}
                            min={12} max={24} step={2}
                        />
                    </div>
                </div>
            </div>

            {/* SEÇÃO CORES */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <Palette className="h-4 w-4" />
                    <Text pt="Aparência" en="Appearance" es="Apariencia" />
                </div>
                <div className="rounded-lg border p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {(['light', 'dark', 'system'] as const).map((mode) => (
                            <Button
                                key={mode}
                                variant={theme === mode ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTheme(mode)}
                                className="capitalize"
                            >
                                {mode}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3 rounded-lg border p-4">
                    <Label className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4" />
                        <Text pt="Daltônismo" en="Color Blindness" es="Daltonismo" />
                    </Label>
                    <RadioGroup
                        value={accessibilityMode}
                        onValueChange={(val) => setAccessibilityMode(val as AccessibilityMode)}
                    >
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: "none", l: "Normal" },
                                { id: "monochrome", l: "Monochrome" },
                                { id: "protanopia", l: "Protanopia" },
                                { id: "deuteranopia", l: "Deuteranopia" },
                                { id: "tritanopia", l: "Tritanopia" }
                            ].map((m) => (
                                <div key={m.id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={m.id} id={m.id} />
                                    <Label htmlFor={m.id} className="font-normal cursor-pointer w-full">{m.l}</Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>
            </div>

            {/* SEÇÃO LIBRAS */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <Hand className="h-4 w-4" />
                    <Text pt="Libras" en="LIBRAS (Brazilian Sign Language)" es="Libras (Lengua de Señas Brasileña)" />
                </div>
                <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="vlibras" className="font-medium">VLibras</Label>
                            <p className="text-xs text-muted-foreground">
                                <Text pt="Tradução para Língua Brasileira de Sinais em todas as páginas." en="Brazilian Sign Language translation on every page." es="Traducción a Lengua de Señas Brasileña en todas las páginas." />
                            </p>
                        </div>
                        <Switch
                            id="vlibras"
                            checked={vlibras}
                            onCheckedChange={setVlibras}
                        />
                    </div>
                </div>
            </div>

            <Button variant="destructive" className="w-full" onClick={resetSettings}>
                <RotateCcw className="mr-2 h-4 w-4" />
                <Text pt="Resetar" en="Reset" es="Reiniciar" />
            </Button>
        </div>
    );
}