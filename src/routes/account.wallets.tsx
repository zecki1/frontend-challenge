import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useWatch, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { queryKeys, walletsApi } from "@/api";
import type { NetworkId } from "@/api/types";
import { ApiError } from "@/lib/api-error";
import { requireAuthBeforeLoad } from "@/features/auth/require-auth";
import { AccountSidebar } from "@/components/account/account-sidebar";
import {
  AccountField,
  FieldError,
  accountInputClass,
  accountSelectClass,
} from "@/components/account/account-field";

const NETWORK_IDS = ["ethereum", "polygon", "base"] as const;

const walletSchema = z.object({
  label: z.string().min(2, "Informe um nome de exibição."),
  nickname: z.string().min(2, "Informe um apelido."),
  networkId: z
    .string()
    .refine(
      (value) => (NETWORK_IDS as readonly string[]).includes(value),
      "Selecione uma rede.",
    ),
  profileName: z.string().min(2, "Informe um nome de perfil."),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Endereço inválido."),
  secondary: z.string().optional(),
  walletType: z.string().min(1, "Selecione um tipo."),
  referralCode: z.string().optional(),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  ens: z.string().optional(),
});

type WalletForm = z.infer<typeof walletSchema>;

const emptyValues: WalletForm = {
  label: "",
  nickname: "",
  networkId: "",
  profileName: "",
  address: "",
  secondary: "",
  walletType: "",
  referralCode: "",
  email: "",
  ens: "",
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const Route = createFileRoute("/account/wallets")({
  beforeLoad: requireAuthBeforeLoad,
  component: WalletsPage,
});

function WalletsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [sameAsMain, setSameAsMain] = useState(false);
  const [secondaryError, setSecondaryError] = useState<string | null>(null);

  const { data: wallets, isLoading } = useQuery({
    queryKey: queryKeys.wallets,
    queryFn: ({ signal }) => walletsApi.list(signal),
  });

  const { data: networks } = useQuery({
    queryKey: queryKeys.networks,
    queryFn: ({ signal }) => walletsApi.networks(signal),
  });

  const primary = wallets?.[0];
  const secondary = wallets?.[1];

  const saveWallet = useMutation({
    mutationFn: (payload: {
      label: string;
      address: string;
      networkId: NetworkId;
    }) =>
      primary
        ? walletsApi.update(primary.id, payload)
        : walletsApi.create(payload),
    onSuccess: (wallet) => {
      form.reset({
        ...form.getValues(),
        label: wallet.label,
        address: wallet.address,
        networkId: wallet.networkId,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
    },
  });

  const hydratedRef = useRef(false);

  const form = useForm<WalletForm>({
    resolver: zodResolver(walletSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (primary && !hydratedRef.current) {
      hydratedRef.current = true;
      form.reset({
        ...emptyValues,
        label: primary.label,
        nickname: primary.label,
        networkId: primary.networkId,
        address: primary.address,
      });
    }
  }, [primary, form]);

  const addSecondary = useMutation({
    mutationFn: () => {
      const values = form.getValues();
      return walletsApi.create({
        label: t("account.walletSecondary"),
        address: values.address,
        networkId: values.networkId as NetworkId,
      });
    },
    onSuccess: () => {
      setSecondaryError(null);
      setSameAsMain(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallets });
    },
    onError: (error) => {
      setSecondaryError(
        error instanceof ApiError ? error.message : t("common.error"),
      );
    },
  });

  const networkValue = useWatch({ control: form.control, name: "networkId" });
  const walletTypeValue = useWatch({
    control: form.control,
    name: "walletType",
  });

  function onSubmit(values: WalletForm) {
    saveWallet.mutate({
      label: values.label,
      address: values.address,
      networkId: values.networkId as NetworkId,
    });
  }

  function onAddNew(event: FormEvent) {
    event.preventDefault();
    form.reset(emptyValues);
    void form.setFocus("label");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content px-6 py-6">
        <div className="h-8 w-48 skeleton rounded bg-kurio-surface" />
      </div>
    );
  }

  const errors = form.formState.errors;

  return (
    <div className="mx-auto max-w-content px-6 py-6">
      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar active="wallets" />
        <div className="min-w-0 flex-1 lg:max-w-[862px]">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-[17px] font-bold text-kurio-cream">
              {t("account.walletMain")}
            </h1>
            <button
              type="button"
              onClick={onAddNew}
              className="text-[16px] font-medium text-kurio-copper transition-colors hover:text-kurio-copperLight"
            >
              {t("account.add")}
            </button>
          </div>
          <p className="mt-2 text-sm leading-[15px] text-kurio-sand">
            {t("account.walletsSubtitle")}
          </p>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="mt-8"
          >
            <div className="grid grid-cols-1 gap-x-7 gap-y-6 sm:grid-cols-2">
              <AccountField
                label={t("account.displayName")}
                htmlFor="w-label"
                required
              >
                <input
                  id="w-label"
                  type="text"
                  className={accountInputClass}
                  {...form.register("label")}
                />
                <FieldError message={errors.label?.message} />
              </AccountField>

              <AccountField
                label={t("account.walletNickname")}
                htmlFor="w-nickname"
                required
              >
                <input
                  id="w-nickname"
                  type="text"
                  className={accountInputClass}
                  {...form.register("nickname")}
                />
                <FieldError message={errors.nickname?.message} />
              </AccountField>

              <AccountField
                label={t("checkout.networkLabel")}
                htmlFor="w-network"
                required
              >
                <div className="relative">
                  <select
                    id="w-network"
                    className={`${accountSelectClass} ${networkValue ? "" : "text-kurio-bronze"}`}
                    {...form.register("networkId")}
                  >
                    <option value="">{t("checkout.selectNetwork")}</option>
                    {(networks ?? []).map((network) => (
                      <option key={network.id} value={network.id}>
                        {network.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2 top-1/2 size-5 -translate-y-1/2 text-kurio-cream"
                    aria-hidden
                  />
                </div>
                <FieldError message={errors.networkId?.message} />
              </AccountField>

              <AccountField
                label={t("checkout.profileName")}
                htmlFor="w-profile"
                required
              >
                <input
                  id="w-profile"
                  type="text"
                  className={accountInputClass}
                  {...form.register("profileName")}
                />
                <FieldError message={errors.profileName?.message} />
              </AccountField>

              <AccountField
                label={t("checkout.walletAddress")}
                htmlFor="w-address"
                required
              >
                <input
                  id="w-address"
                  type="text"
                  placeholder={t("checkout.walletAddressPlaceholder")}
                  className={accountInputClass}
                  {...form.register("address")}
                />
                <FieldError message={errors.address?.message} />
              </AccountField>

              <AccountField
                label={t("checkout.ensSecondary")}
                htmlFor="w-secondary"
                hideLabel
              >
                <input
                  id="w-secondary"
                  type="text"
                  placeholder={t("checkout.ensSecondary")}
                  className={accountInputClass}
                  {...form.register("secondary")}
                />
              </AccountField>

              <AccountField
                label={t("checkout.walletType")}
                htmlFor="w-type"
                required
              >
                <div className="relative">
                  <select
                    id="w-type"
                    className={`${accountSelectClass} ${walletTypeValue ? "" : "text-kurio-bronze"}`}
                    {...form.register("walletType")}
                  >
                    <option value="">{t("checkout.selectWallet")}</option>
                    <option value="metamask">MetaMask</option>
                    <option value="walletconnect">WalletConnect</option>
                    <option value="coinbase">Coinbase Wallet</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2 top-1/2 size-5 -translate-y-1/2 text-kurio-cream"
                    aria-hidden
                  />
                </div>
                <FieldError message={errors.walletType?.message} />
              </AccountField>

              <AccountField
                label={t("checkout.referral")}
                htmlFor="w-referral"
                required
              >
                <input
                  id="w-referral"
                  type="text"
                  className={accountInputClass}
                  {...form.register("referralCode")}
                />
              </AccountField>

              <AccountField label={t("auth.email")} htmlFor="w-email" required>
                <input
                  id="w-email"
                  type="email"
                  className={accountInputClass}
                  {...form.register("email")}
                />
                <FieldError message={errors.email?.message} />
              </AccountField>

              <AccountField
                label={t("checkout.ensName")}
                htmlFor="w-ens"
                required
              >
                <div className="flex gap-[10px]">
                  <div className="relative w-[78px] shrink-0">
                    <select
                      className={accountSelectClass}
                      defaultValue=".eth"
                      aria-label={t("checkout.ensName")}
                    >
                      <option value=".eth">.eth</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-[5px] top-1/2 size-5 -translate-y-1/2 text-kurio-cream"
                      aria-hidden
                    />
                  </div>
                  <input
                    id="w-ens"
                    type="text"
                    className={accountInputClass}
                    {...form.register("ens")}
                  />
                </div>
              </AccountField>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={saveWallet.isPending}
                className="h-10 w-[131px] rounded-[3px] bg-kurio-copper text-[14px] font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
              >
                {t("account.saveWallet")}
              </button>
              {saveWallet.isError ? (
                <p role="alert" className="mt-2 text-sm text-kurio-coral">
                  {saveWallet.error instanceof ApiError
                    ? saveWallet.error.message
                    : t("common.error")}
                </p>
              ) : null}
              {saveWallet.isSuccess ? (
                <p role="status" className="mt-2 text-sm text-kurio-copper">
                  {t("account.walletSaved")}
                </p>
              ) : null}
            </div>
          </form>

          <section className="mt-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-[17px] font-bold text-kurio-cream">
                {t("account.walletSecondary")}
              </h2>
              {secondary ? null : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={sameAsMain}
                    aria-label={t("account.sameAsMain")}
                    onClick={() => setSameAsMain((value) => !value)}
                    className={`size-4 shrink-0 rounded-full border-[1.5px] border-kurio-copper transition-colors ${
                      sameAsMain ? "bg-kurio-copper" : "bg-transparent"
                    }`}
                  />
                  <span className="text-sm text-kurio-cream">
                    {t("account.sameAsMain")}
                  </span>
                  <button
                    type="button"
                    disabled={!sameAsMain || !primary || addSecondary.isPending}
                    onClick={() => addSecondary.mutate()}
                    className="ml-2 text-[16px] font-medium text-kurio-copper transition-colors hover:text-kurio-copperLight disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("account.add")}
                  </button>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm leading-[15px] text-kurio-sand">
              {secondary
                ? `${secondary.label} · ${shortAddress(secondary.address)}`
                : t("account.secondaryEmpty")}
            </p>
            {secondaryError ? (
              <p role="alert" className="mt-2 text-sm text-kurio-coral">
                {secondaryError}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
