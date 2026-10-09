import { Text } from "@/components/providers/preferences-provider";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Accessibility,
} from "lucide-react";
import { AccessibilityPanel } from "@/components/account/accessibility-panel";

interface SettingsMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Quando false, renderiza só o Sheet sem o botão trigger (sheet controlado) */
  showTrigger?: boolean
}

export const SettingsMenu = ({ open, onOpenChange, showTrigger = true }: SettingsMenuProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {showTrigger ? (
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <Accessibility className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                </SheetTrigger>
            ) : null}
            <SheetContent className="w-[350px] sm:w-[400px] overflow-y-auto px-4">
                <SheetHeader>
                    <SheetTitle><Text pt="Acessibilidade & Aparência" en="Accessibility & Appearance" es="Accesibilidad y Apariencia" /></SheetTitle>
                    <SheetDescription>
                        <Text pt="Personalize sua experiência." en="Customize your experience." es="Personaliza tu experiencia." />
                    </SheetDescription>
                </SheetHeader>
                <AccessibilityPanel />
            </SheetContent>
        </Sheet>
    );
};