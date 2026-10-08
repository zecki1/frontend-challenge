// src/App.tsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useReward } from 'react-rewards';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Ícones
import {
  LayoutDashboard, Component, Database, FormInput,
  BellRing, Loader2, Check, Zap, Shield, Globe, Star
} from "lucide-react";

import { FaReact, FaStripe, FaDocker, FaGithub } from "react-icons/fa";
import { SiTailwindcss, SiNextdotjs, SiTypescript, SiFirebase } from "react-icons/si";

// Componentes Locais (Layout e Providers)
import { Text } from "@/components/providers/preferences-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Componentes UI (Shadcn)
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function App() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  // Inicializar AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      // offset: 50, // Opcional: ajusta o gatilho da animação
    });
  }, []);

  const { reward: confettiReward, isAnimating: isConfettiAnimating } = useReward('confettiReward', 'confetti', {
    elementCount: 100,
    spread: 70,
  });

  const { reward: balloonsReward, isAnimating: isBalloonsAnimating } = useReward('balloonsReward', 'balloons');

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      balloonsReward();
      toast.success("Operação realizada com sucesso!");
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground">
      {/* Toast Notification Wrapper */}
      <Toaster />

      {/* Header Fixo */}
      <SiteHeader />

      {/* Conteúdo Principal (flex-1 empurra o footer para baixo) */}
      <main className="flex-1 w-full">

        {/* =========================================
            BLOCK 1: HERO SECTION
        ========================================= */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-background">
          <div className="container mx-auto px-4 relative z-10 text-center">

            <div data-aos="fade-down">
              <Badge variant="outline" className="mb-6 py-1.5 px-4 text-sm border-primary/20 text-primary bg-primary/5 rounded-full">
                <span className="mr-2">🚀</span>
                <Text pt="Template V3.0: Agora com Animações" en="Template V3.0: Now with Animations" es="Template V3.0: Ahora con Animaciones" />
              </Badge>
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent max-w-4xl mx-auto" data-aos="zoom-in" data-aos-delay="200">
              <Text
                pt="O Guia Definitivo para seus Templates."
                en="The Ultimate Guide for your Templates."
                es="La Guía Definitiva para su Templates."
              />
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed" data-aos="fade-up" data-aos-delay="400">
              <Text
                pt="Vite + React, Tailwind, Shadcn, React Icons, AOS e Rewards. Tudo configurado e pronto para copiar e colar."
                en="Vite + React, Tailwind, Shadcn, React Icons, AOS and Rewards. Everything setup and ready to copy paste."
                es="Vite + React, Tailwind, Shadcn, React Icons, AOS y Rewards. Todo configurado y listo para copiar y pegar."
              />
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4" data-aos="fade-up" data-aos-delay="600">
              <div className="relative">
                <span id="confettiReward" className="absolute left-1/2 top-1/2" />
                <Button
                  size="lg"
                  className="h-12 px-8 text-base rounded-full w-full sm:w-auto shadow-xl shadow-primary/20 transition-transform hover:scale-105"
                  onClick={confettiReward}
                  disabled={isConfettiAnimating}
                >
                  <Text pt="Clique para Celebrar" en="Click to Celebrate" es="Clic para Celebrar" />
                  <Star className="ml-2 h-4 w-4 fill-current" />
                </Button>
              </div>

              <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full w-full sm:w-auto">
                <FaGithub className="mr-2 h-5 w-5" />
                Github Repo
              </Button>
            </div>

            {/* Tech Stack */}
            <div className="mt-16 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500" data-aos="fade-up" data-aos-delay="800">
              <p className="text-sm text-muted-foreground mb-4 font-medium">POWERED BY</p>
              <div className="flex flex-wrap justify-center gap-8 items-center text-3xl text-foreground/80">
                <SiNextdotjs className="hover:text-black dark:hover:text-white transition-colors" title="Next.js (Converted)" />
                <FaReact className="hover:text-[#61DAFB] transition-colors" title="React" />
                <SiTailwindcss className="hover:text-[#06B6D4] transition-colors" title="Tailwind" />
                <SiTypescript className="hover:text-[#3178C6] transition-colors" title="TypeScript" />
                <SiFirebase className="hover:text-[#FFCA28] transition-colors" title="Firebase" />
                <FaStripe className="hover:text-[#008CDD] transition-colors text-5xl" title="Stripe" />
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* =========================================
            BLOCK 2: FEATURES
        ========================================= */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                <Text pt="Stack Moderna & Completa" en="Modern & Complete Stack" es="Stack Moderno y Completo" />
              </h2>
              <p className="text-muted-foreground text-lg">
                <Text
                  pt="Integração perfeita das melhores bibliotecas do mercado."
                  en="Seamless integration of the best libraries on the market."
                  es="Integración perfecta de las mejores bibliotecas del mercado."
                />
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Feature 1 */}
              <Card className="md:col-span-2 bg-background border-none shadow-sm hover:shadow-md transition-shadow" data-aos="fade-right">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>AOS Animations</CardTitle>
                  <CardDescription>
                    <Text pt="Animações de scroll configuradas." en="Scroll animations configured." es="Animaciones de desplazamiento configuradas." />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
                    <code className="text-sm bg-background p-2 rounded border">data-aos=&quot;fade-up&quot;</code>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow" data-aos="fade-left" data-aos-delay="100">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                    <Globe className="h-6 w-6" />
                  </div>
                  <CardTitle>i18n Nativo</CardTitle>
                  <CardDescription>PT / EN / ES</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Preferences Provider</div>
                    <div className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Auto Persistência</div>
                    <div className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Componente {'<Text />'}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow" data-aos="fade-up">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>Acessibilidade</CardTitle>
                  <CardDescription>VLibras + Daltonismo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Menu de configurações completo com filtros para daltonismo (Protanopia, Deuteranopia...) e fontes amigáveis para dislexia.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="md:col-span-2 bg-background border-none shadow-sm hover:shadow-md transition-shadow" data-aos="fade-up" data-aos-delay="100">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                    <FaReact className="h-6 w-6" />
                  </div>
                  <CardTitle>React Ecosystem</CardTitle>
                  <CardDescription>
                    React Icons + React Rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 items-center">
                  <Button variant="outline" size="sm"><FaGithub className="mr-2" /> GitHub Icon</Button>
                  <Button variant="outline" size="sm"><FaDocker className="mr-2" /> Docker Icon</Button>

                  <div className="relative inline-block">
                    <span id="balloonsReward" className="absolute left-1/2 top-1/2" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={balloonsReward}
                      disabled={isBalloonsAnimating}
                    >
                      Testar Rewards (Balões)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* =========================================
            BLOCK 3: PRICING SECTION
        ========================================= */}
        <section className="py-24 container mx-auto px-4">
          <div className="text-center mb-16" data-aos="zoom-in">
            <h2 className="text-3xl font-bold mb-4">
              <Text pt="Planos Flexíveis" en="Flexible Pricing" es="Precios Flexibles" />
            </h2>
            <p className="text-muted-foreground">
              <Text pt="Escale seu negócio com nossa infraestrutura." en="Scale your business with our infrastructure." es="Escala tu negocio con nuestra infraestructura." />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <Card data-aos="fade-up" data-aos-delay="0" className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>Hobby</CardTitle>
                <div className="text-3xl font-bold mt-2">$0 <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <CardDescription>Para desenvolvedores indie.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 1 Projeto</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Componentes Shadcn</li>
                  <li className="flex items-center text-muted-foreground"><Check className="mr-2 h-4 w-4" /> Suporte Comunitário</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Começar Grátis</Button>
              </CardFooter>
            </Card>

            {/* Plan 2 */}
            <Card className="border-primary shadow-2xl relative scale-105 z-10" data-aos="fade-up" data-aos-delay="100">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-primary hover:bg-primary px-3 py-1">Mais Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold mt-2">$29 <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <CardDescription>Para startups e times.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> 10 Projetos</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Analytics Avançado</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Remoção de Marca d&apos;água</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Suporte Prioritário</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full shadow-lg shadow-primary/25">Assinar Pro</Button>
              </CardFooter>
            </Card>

            {/* Plan 3 */}
            <Card data-aos="fade-up" data-aos-delay="200" className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="text-3xl font-bold mt-2">$99 <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <CardDescription>Para grandes escalas.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Projetos Ilimitados</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> SSO & Auditoria</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> SLA 99.9%</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Gerente de Conta</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Contatar Vendas</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* =========================================
            BLOCK 4: FAQ SECTION
        ========================================= */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-center mb-10">
              <Text pt="Perguntas Frequentes" en="Frequently Asked Questions" es="Preguntas Frecuentes" />
            </h2>
            <Accordion type="single" collapsible className="w-full bg-background rounded-xl border px-4 shadow-sm">
              <AccordionItem value="item-1">
                <AccordionTrigger><Text pt="As animações afetam a performance?" en="Do animations affect performance?" es="¿Las animaciones afectan el rendimiento?" /></AccordionTrigger>
                <AccordionContent>
                  <Text
                    pt="Não. Usamos a biblioteca AOS que é extremamente leve e otimizada, ativando animações apenas quando o elemento entra na tela."
                    en="No. We use the AOS library which is extremely lightweight and optimized, triggering animations only when the element enters the viewport."
                    es="No. Usamos la biblioteca AOS que es extremadamente ligera y optimizada, activando animaciones solo cuando el elemento entra en la pantalla."
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger><Text pt="Como adiciono mais ícones?" en="How do I add more icons?" es="¿Cómo añado más iconos?" /></AccordionTrigger>
                <AccordionContent>
                  <Text
                    pt="Basta instalar o pacote 'react-icons' e importar de 'react-icons/fa', 'react-icons/fi', etc. Temos milhares disponíveis."
                    en="Just install the 'react-icons' package and import from 'react-icons/fa', 'react-icons/fi', etc. We have thousands available."
                    es="Simplemente instale el paquete 'react-icons' e importe desde 'react-icons/fa', 'react-icons/fi', etc. Tenemos miles disponibles."
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-0">
                <AccordionTrigger><Text pt="É fácil mudar o esquema de cores?" en="Is it easy to change the color scheme?" es="¿Es fácil cambiar el esquema de colores?" /></AccordionTrigger>
                <AccordionContent>
                  <Text
                    pt="Sim! Tudo é baseado em variáveis CSS no arquivo globals.css. Mude a variável '--primary' e todo o site atualiza."
                    en="Yes! Everything is based on CSS variables in the globals.css file. Change the '--primary' variable and the whole site updates."
                    es="¡Sí! Todo se basa en variables CSS en el archivo globals.css. Cambie la variable '--primary' y todo el sitio se actualiza."
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* =========================================
            BLOCK 5: CTA SECTION
        ========================================= */}
        <section className="py-24 container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-3xl p-12 text-center relative overflow-hidden" data-aos="zoom-in-up">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <Text pt="Pronto para o próximo nível?" en="Ready for the next level?" es="¿Listo para el siguiente nivel?" />
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                <Text
                  pt="Não perca tempo configurando lint, typescript ou temas. Foque no seu produto."
                  en="Don't waste time setting up lint, typescript or themes. Focus on your product."
                  es="No pierdas tiempo configurando lint, typescript o temas. Concéntrese en su producto."
                />
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="secondary" size="lg" className="rounded-full px-8 font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Text pt="Download Template" en="Download Template" es="Descargar Plantilla" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            BLOCK 6: TECH DEMO GALLERY
        ========================================= */}
        <section className="py-16 bg-muted/20 border-t" id="components">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8" data-aos="fade-right">
              <h2 className="text-2xl font-bold tracking-tight">
                <Text pt="Galeria de Componentes (Tech Demo)" en="Component Gallery (Tech Demo)" es="Galería de Componentes (Demo)" />
              </h2>
            </div>

            <Tabs defaultValue="forms" className="space-y-8" data-aos="fade-up">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/50 p-1">
                <TabsTrigger value="forms" className="gap-2"><FormInput className="h-4 w-4" /> <Text pt="Formulários" en="Forms" es="Formularios" /></TabsTrigger>
                <TabsTrigger value="interactive" className="gap-2"><Component className="h-4 w-4" /> <Text pt="Interativo" en="Interactive" es="Interactivo" /></TabsTrigger>
                <TabsTrigger value="data" className="gap-2"><Database className="h-4 w-4" /> <Text pt="Dados" en="Data" es="Datos" /></TabsTrigger>
                <TabsTrigger value="layout" className="gap-2"><LayoutDashboard className="h-4 w-4" /> <Text pt="Layout" en="Layout" es="Diseño" /></TabsTrigger>
              </TabsList>

              {/* TAB: FORMULÁRIOS */}
              <TabsContent value="forms" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader><CardTitle>Login Example</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input placeholder="user@exemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label><Text pt="Senha" en="Password" es="Contraseña" /></Label>
                      <Input type="password" />
                    </div>
                    <Button className="w-full" onClick={onSubmit} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Text pt="Entrar" en="Sign In" es="Entrar" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="airplane-mode">Notificações</Label>
                      <Switch id="airplane-mode" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms">Newsletter</Label>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Volume</Label>
                      <Slider defaultValue={[75]} max={100} step={1} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Selects</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Stack</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="next">Next.js</SelectItem>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="vue">Vue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <RadioGroup defaultValue="comfortable">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="r1" />
                        <Label htmlFor="r1">Default</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="r2" />
                        <Label htmlFor="r2">Comfortable</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: INTERATIVO */}
              <TabsContent value="interactive" className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Dialogs & Popovers</CardTitle>
                    <CardDescription>Overlays para interação.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4">
                    <Dialog>
                      <DialogTrigger asChild><Button variant="outline">Open Dialog</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmação</DialogTitle>
                          <DialogDescription>Tem certeza que deseja continuar?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter><Button>Confirmar</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Popover>
                      <PopoverTrigger asChild><Button variant="secondary">Open Popover</Button></PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Dimensões</h4>
                            <p className="text-sm text-muted-foreground">Defina a largura.</p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status & Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <BellRing className="h-4 w-4" />
                      <AlertTitle>Info</AlertTitle>
                      <AlertDescription>Sistema atualizado com sucesso.</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: DADOS */}
              <TabsContent value="data" className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Data Table</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">INV001</TableCell>
                          <TableCell><Badge variant="outline">Pago</Badge></TableCell>
                          <TableCell className="text-right">$250.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">INV002</TableCell>
                          <TableCell><Badge variant="secondary">Pendente</Badge></TableCell>
                          <TableCell className="text-right">$150.00</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Data Picker</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center border rounded-lg p-2 bg-card">
                      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>66%</span>
                      </div>
                      <Progress value={66} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: LAYOUT */}
              <TabsContent value="layout" className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader><CardTitle>Card Padrão</CardTitle></CardHeader>
                  <CardContent>Conteúdo básico.</CardContent>
                </Card>
                <Card className="bg-muted/50 border-dashed">
                  <CardHeader><CardTitle>Card Tracejado</CardTitle></CardHeader>
                  <CardContent>Para áreas de drop.</CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader><CardTitle>Card Destaque</CardTitle></CardHeader>
                  <CardContent>Ênfase visual.</CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

      </main>

      {/* Footer Fixo */}
      <SiteFooter />
    </div>
  );
}