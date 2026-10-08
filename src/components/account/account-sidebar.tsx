import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  AlertTriangle,
  Download,
  Heart,
  LogOut,
  MapPin,
  ShoppingBag,
  User,
} from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";

type SidebarItemId =
  | "profile"
  | "wallets"
  | "activity"
  | "watchlist"
  | "offers"
  | "downloads"
  | "support";

const items: {
  id: SidebarItemId;
  key: string;
  icon: typeof User;
  size: string;
  to?: "/account/profile" | "/account/wallets";
}[] = [
  {
    id: "profile",
    key: "profileDetails",
    icon: User,
    size: "size-[18px]",
    to: "/account/profile",
  },
  {
    id: "wallets",
    key: "walletsTitle",
    icon: MapPin,
    size: "size-5",
    to: "/account/wallets",
  },
  { id: "activity", key: "activity", icon: ShoppingBag, size: "size-[18px]" },
  { id: "watchlist", key: "watchlist", icon: Heart, size: "size-4" },
  { id: "offers", key: "offers", icon: Activity, size: "size-[18px]" },
  { id: "downloads", key: "downloads", icon: Download, size: "size-[18px]" },
  { id: "support", key: "support", icon: AlertTriangle, size: "size-[18px]" },
];

export function AccountSidebar({ active }: { active: SidebarItemId }) {
  const { t } = useTranslation();
  const { logout } = useAuth();

  return (
    <aside className="shrink-0 bg-kurio-surface pb-2 lg:w-[310px] lg:self-start">
      <div className="mt-2 flex h-9 items-center px-2.5">
        <p className="text-[18px] font-bold leading-4 text-kurio-cream2">
          {t("account.myProfile")}
        </p>
      </div>
      <nav
        className="flex overflow-x-auto lg:block lg:overflow-visible"
        aria-label={t("account.myProfile")}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          const className = [
            "flex h-[45px] shrink-0 items-center gap-3 whitespace-nowrap border px-4 text-[15px] transition-colors",
            isActive ? "border-kurio-copper" : "border-transparent",
            "text-kurio-copperLight",
          ].join(" ");
          const label = t(`account.${item.key}`);
          if (item.to) {
            return (
              <Link key={item.id} to={item.to} className={className}>
                <Icon className={item.size} aria-hidden />
                {label}
              </Link>
            );
          }
          return (
            <span key={item.id} className={className} title="Fora do escopo">
              <Icon className={item.size} aria-hidden />
              {label}
            </span>
          );
        })}
        <div className="hidden border-t-[0.3px] border-kurio-copper lg:block" />
        <button
          type="button"
          onClick={() => void logout()}
          className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap px-4 text-[15px] font-bold text-kurio-copperLight lg:w-full"
        >
          <LogOut className="size-5" aria-hidden />
          {t("nav.sair")}
        </button>
      </nav>
    </aside>
  );
}
