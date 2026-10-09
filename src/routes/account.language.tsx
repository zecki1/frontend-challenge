import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { requireAuthBeforeLoad } from "@/features/auth/require-auth";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { setLanguage, supportedLanguages, languageLabels, type SupportedLanguage } from "@/i18n";

export const Route = createFileRoute("/account/language")({
  beforeLoad: requireAuthBeforeLoad,
  component: LanguagePage,
});

function LanguagePage() {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "pt-BR") as SupportedLanguage;

  return (
    <div className="mx-auto max-w-content px-6 py-6">
      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar active="idioma" />
        <div className="min-w-0 flex-1 lg:max-w-[862px]">
          <h1 className="text-[17px] font-bold text-kurio-cream">
            {t("account.language")}
          </h1>
          <p className="mt-2 text-sm leading-[15px] text-kurio-sand">
            {t("account.languageSubtitle")}
          </p>

          <ul className="mt-6 space-y-2">
            {supportedLanguages.map((language) => {
              const selected = current === language;
              return (
                <li key={language}>
                  <button
                    type="button"
                    onClick={() => setLanguage(language)}
                    aria-pressed={selected}
                    className="flex w-full items-center justify-between rounded-[3px] border border-kurio-surface bg-kurio-surface2 px-4 py-3 text-[15px] text-kurio-cream transition-colors hover:border-kurio-copper"
                  >
                    <span>{languageLabels[language]}</span>
                    {selected ? (
                      <Check className="h-4 w-4 text-kurio-copper" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}