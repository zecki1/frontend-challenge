import { Terminal } from "lucide-react";
import { SettingsMenu } from "@/components/settings-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Text } from "@/components/providers/preferences-provider";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from  "@/components/ui/avatar";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                {/* Logo Area */}
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary rounded-lg shadow-sm">
                        <Terminal className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg hidden md:inline-block">
                        Super<span className="text-primary">Template</span>
                    </span>
                </div>

                {/* Navigation (Usando âncoras para Single Page) */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <a href="#" className="hover:text-primary transition-colors">
                        <Text pt="Início" en="Home" es="Inicio" />
                    </a>
                    <a href="#components" className="hover:text-primary transition-colors">
                        <Text pt="Componentes" en="Components" es="Componentes" />
                    </a>
                    <a href="#docs" className="hover:text-primary transition-colors">
                        <Text pt="Documentação" en="Docs" es="Documentación" />
                    </a>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <SettingsMenu />
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Avatar className="h-8 w-8 cursor-pointer border hover:border-primary transition-colors">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}