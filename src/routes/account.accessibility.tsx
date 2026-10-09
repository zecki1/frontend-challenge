import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { requireAuthBeforeLoad } from "@/features/auth/require-auth";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccessibilityPanel } from "@/components/account/accessibility-panel";

export const Route = createFileRoute("/account/accessibility")({
  beforeLoad: requireAuthBeforeLoad,
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-content px-6 py-6">
      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar active="acessibilidade" />
        <div className="min-w-0 flex-1 lg:max-w-[862px]">
          <h1 className="text-[17px] font-bold text-kurio-cream">
            {t("account.accessibility")}
          </h1>
          <p className="mt-2 text-sm leading-[15px] text-kurio-sand">
            {t("account.accessibilitySubtitle")}
          </p>

          <div className="mt-6 rounded-[3px] border border-kurio-surface bg-kurio-surface2 p-5">
            <AccessibilityPanel />
          </div>
        </div>
      </div>
    </div>
  );
}