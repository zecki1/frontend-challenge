import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { profileApi, queryKeys } from "@/api";
import { ApiError } from "@/lib/api-error";
import { requireAuthBeforeLoad } from "@/features/auth/require-auth";
import { AccountSidebar } from "@/components/account/account-sidebar";
import {
  AccountField,
  AccountPassword,
  FieldError,
  accountInputClass,
  accountSelectClass,
} from "@/components/account/account-field";

const profileSchema = z.object({
  name: z.string().min(2, "Informe um nome com pelo menos 2 caracteres."),
  username: z.string().min(3, "Informe um nome de usuário."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  ens: z.string().optional(),
  nickname: z.string().min(2, "Informe um apelido."),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export const Route = createFileRoute("/account/profile")({
  beforeLoad: requireAuthBeforeLoad,
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: ({ signal }) => profileApi.get(signal),
  });

  const updateProfile = useMutation({
    mutationFn: (payload: { name: string; email: string }) =>
      profileApi.update(payload),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.profile, data),
  });

  const changePassword = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(payload),
  });

  const hydratedRef = useRef(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", username: "", email: "", ens: "", nickname: "" },
  });

  useEffect(() => {
    if (profile && !hydratedRef.current) {
      hydratedRef.current = true;
      profileForm.reset({
        name: profile.name,
        username: profile.name.toLowerCase().replace(/\s+/g, ""),
        email: profile.email,
        ens: "",
        nickname: "",
      });
    }
  }, [profile, profileForm]);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const passwordTouched = Boolean(
      passwordForm.getValues("currentPassword") ||
      passwordForm.getValues("newPassword") ||
      passwordForm.getValues("confirmPassword"),
    );
    const [profileOk, passwordOk] = await Promise.all([
      profileForm.trigger(),
      passwordTouched ? passwordForm.trigger() : Promise.resolve(true),
    ]);
    if (!profileOk || !passwordOk) return;

    const values = profileForm.getValues();
    await updateProfile
      .mutateAsync({ name: values.name, email: values.email })
      .catch(() => null);

    if (passwordTouched) {
      const passwordValues = passwordForm.getValues();
      const changed = await changePassword
        .mutateAsync({
          currentPassword: passwordValues.currentPassword,
          newPassword: passwordValues.newPassword,
        })
        .then(() => true)
        .catch(() => false);
      if (changed) passwordForm.reset();
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content px-6 py-6">
        <div className="h-8 w-48 skeleton rounded bg-kurio-surface" />
      </div>
    );
  }

  const errors = profileForm.formState.errors;

  return (
    <div className="mx-auto max-w-content px-6 py-6">
      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar active="profile" />
        <form
          onSubmit={onSubmit}
          noValidate
          className="min-w-0 flex-1 lg:max-w-[862px]"
        >
          <h1 className="text-[16px] font-bold text-kurio-cream">
            {t("account.profileTitle")}
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-x-7 gap-y-6 sm:grid-cols-2">
            <AccountField
              variant="profile"
              label={t("account.displayName")}
              htmlFor="p-name"
              required
            >
              <input
                id="p-name"
                type="text"
                className={accountInputClass}
                {...profileForm.register("name")}
              />
              <FieldError message={errors.name?.message} />
            </AccountField>

            <AccountField
              variant="profile"
              label={t("account.username")}
              htmlFor="p-username"
              required
            >
              <input
                id="p-username"
                type="text"
                className={accountInputClass}
                {...profileForm.register("username")}
              />
              <FieldError message={errors.username?.message} />
            </AccountField>

            <AccountField
              variant="profile"
              label={t("auth.email")}
              htmlFor="p-email"
              required
            >
              <input
                id="p-email"
                type="email"
                className={accountInputClass}
                {...profileForm.register("email")}
              />
              <FieldError message={errors.email?.message} />
            </AccountField>

            <AccountField
              variant="profile"
              label={t("checkout.ensName")}
              htmlFor="p-ens"
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
                  id="p-ens"
                  type="text"
                  className={accountInputClass}
                  {...profileForm.register("ens")}
                />
              </div>
            </AccountField>

            <AccountField
              variant="profile"
              label={t("account.walletNickname")}
              htmlFor="p-nickname"
              required
            >
              <input
                id="p-nickname"
                type="text"
                className={accountInputClass}
                {...profileForm.register("nickname")}
              />
              <FieldError message={errors.nickname?.message} />
            </AccountField>

            <AccountField
              variant="profile"
              label={t("account.avatar")}
              htmlFor="p-avatar"
            >
              <div className="flex h-[50px] items-center">
                <div
                  id="p-avatar"
                  className="flex size-[50px] items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2"
                >
                  <ImageIcon className="size-6 text-kurio-cream" aria-hidden />
                </div>
                <span
                  className="ml-6 flex h-10 w-[98px] cursor-not-allowed items-center justify-center rounded-[3px] bg-kurio-copper text-[14px] font-bold text-kurio-bg"
                  title="Fora do escopo"
                >
                  {t("account.change")}
                </span>
                <span
                  className="ml-5 cursor-not-allowed text-[14px] text-kurio-cream"
                  title="Fora do escopo"
                >
                  {t("account.remove")}
                </span>
              </div>
            </AccountField>
          </div>

          <section className="mt-8">
            <h2 className="text-[16px] font-medium text-kurio-cream">
              {t("account.changePassword")}
            </h2>
            <div className="mt-6 max-w-[417px] space-y-6">
              <AccountField
                variant="password"
                label={t("auth.currentPassword")}
                htmlFor="p-current"
                required
              >
                <AccountPassword
                  id="p-current"
                  autoComplete="current-password"
                  {...passwordForm.register("currentPassword")}
                />
                <FieldError
                  message={
                    passwordForm.formState.errors.currentPassword?.message
                  }
                />
              </AccountField>

              <AccountField
                variant="password"
                label={t("auth.newPassword")}
                htmlFor="p-new"
                required
              >
                <AccountPassword
                  id="p-new"
                  autoComplete="new-password"
                  {...passwordForm.register("newPassword")}
                />
                <FieldError
                  message={passwordForm.formState.errors.newPassword?.message}
                />
              </AccountField>

              <AccountField
                variant="password"
                label={t("account.confirmNewPassword")}
                htmlFor="p-confirm"
                required
              >
                <AccountPassword
                  id="p-confirm"
                  autoComplete="new-password"
                  {...passwordForm.register("confirmPassword")}
                />
                <FieldError
                  message={
                    passwordForm.formState.errors.confirmPassword?.message
                  }
                />
              </AccountField>
            </div>
          </section>

          <div className="mt-8">
            <button
              type="submit"
              disabled={updateProfile.isPending || changePassword.isPending}
              className="h-10 w-[131px] rounded-[3px] bg-kurio-copper text-[14px] font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
            >
              {t("account.save")}
            </button>
            {updateProfile.isError ? (
              <p role="alert" className="mt-2 text-sm text-kurio-coral">
                {updateProfile.error instanceof ApiError
                  ? updateProfile.error.message
                  : t("common.error")}
              </p>
            ) : null}
            {changePassword.isError ? (
              <p role="alert" className="mt-2 text-sm text-kurio-coral">
                {changePassword.error instanceof ApiError
                  ? changePassword.error.message
                  : t("common.error")}
              </p>
            ) : null}
            {changePassword.isSuccess ? (
              <p role="status" className="mt-2 text-sm text-kurio-copper">
                {t("account.passwordChanged")}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
