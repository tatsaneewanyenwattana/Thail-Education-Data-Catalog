"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TurnstileField, {
  isTurnstileConfigured,
} from "@/components/common/TurnstileField";
import { AgencyIcon, EyeIcon } from "@/components/common/auth/AuthIcons";
import PasswordStrengthIndicator from "@/components/common/auth/PasswordStrength";
import SliderCaptcha from "@/components/common/auth/SliderCaptcha";
import apiClient from "@/services/api";
import { toast } from "@/stores/toastStore";

const TERMS_VERSION = "1.0";
const PDPA_VERSION = "1.0";
const MAX_VERIFICATION_DOC_BYTES = 10 * 1024 * 1024;

const AGENCY_TYPES = [
  "central",
  "regional",
  "local",
  "educational",
  "other",
] as const;

const TH_PHONE_RE = /^(0[689]\d-\d{3}-\d{4}|0[2-57]-\d{3}-\d{4})$/;

type AgencyType = (typeof AGENCY_TYPES)[number];

type RegisterFormValues = {
  agency_name: string;
  agency_name_en: string;
  agency_type: AgencyType | "";
  agency_code: string;
  agency_website: string;
  contact_name: string;
  contact_position: string;
  contact_phone: string;
  email: string;
  password: string;
  confirm_password: string;
  verification_doc: File | null;
  terms_consent: boolean;
  pdpa_consent: boolean;
};


export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const params = useParams();
  const locale = (params.locale as string) || "th";

  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const turnstileEnabled = isTurnstileConfigured();

  const registerSchema = useMemo(
    () =>
      z
        .object({
          agency_name: z
            .string()
            .min(1, t("agencyNameRequired"))
            .min(3, t("agencyNameMin")),
          agency_name_en: z.string(),
          agency_type: z
            .string()
            .min(1, t("agencyTypeRequired"))
            .refine(
              (value): value is AgencyType =>
                AGENCY_TYPES.includes(value as AgencyType),
              { message: t("agencyTypeRequired") }
            ),
          agency_code: z.string(),
          agency_website: z.string(),
          contact_name: z
            .string()
            .min(1, t("contactNameRequired"))
            .min(3, t("contactNameMin")),
          contact_position: z.string(),
          contact_phone: z
            .string()
            .min(1, t("contactPhoneRequired"))
            .regex(TH_PHONE_RE, t("contactPhoneInvalid")),
          email: z
            .string()
            .min(1, t("emailRequired"))
            .email(t("emailInvalid")),
          password: z
            .string()
            .min(1, t("passwordRequired"))
            .min(8, t("passwordMin"))
            .regex(/[a-z]/, t("passwordLowercase"))
            .regex(/[A-Z]/, t("passwordUppercase"))
            .regex(/[0-9]/, t("passwordNumber"))
            .regex(/[!@#$%^&*]/, t("passwordSpecial")),
          confirm_password: z.string().min(1, t("confirmPasswordRequired")),
          verification_doc: z
            .custom<File | null>(() => true)
            .refine(
              (file) =>
                !file ||
                file.type === "application/pdf" ||
                file.name.toLowerCase().endsWith(".pdf"),
              { message: t("verificationDocInvalid") }
            )
            .refine(
              (file) => !file || file.size <= MAX_VERIFICATION_DOC_BYTES,
              { message: t("verificationDocTooLarge") }
            ),
          terms_consent: z.boolean().refine((value) => value === true, {
            message: t("termsRequired"),
          }),
          pdpa_consent: z.boolean().refine((value) => value === true, {
            message: t("pdpaRequired"),
          }),
        })
        .refine((data) => data.password === data.confirm_password, {
          message: t("confirmPasswordMismatch"),
          path: ["confirm_password"],
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      agency_name: "",
      agency_name_en: "",
      agency_type: "",
      agency_code: "",
      agency_website: "",
      contact_name: "",
      contact_position: "",
      contact_phone: "",
      email: "",
      password: "",
      confirm_password: "",
      verification_doc: null,
      terms_consent: false,
      pdpa_consent: false,
    },
  });

  const passwordValue = watch("password");

  const mutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const metadata = {
        agency_name: values.agency_name.trim(),
        agency_name_en: values.agency_name_en.trim() || undefined,
        agency_type: values.agency_type,
        agency_code: values.agency_code.trim() || undefined,
        agency_website: values.agency_website.trim() || undefined,
        contact_name: values.contact_name.trim(),
        contact_position: values.contact_position.trim() || undefined,
        contact_phone: values.contact_phone.trim(),
        email: values.email.trim(),
        password: values.password,
        terms_version: TERMS_VERSION,
        pdpa_version: PDPA_VERSION,
        terms_consent: true,
        pdpa_consent: true,
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(metadata));
      if (values.verification_doc) {
        formData.append("verification_doc", values.verification_doc);
      }
      if (turnstileEnabled) {
        formData.append("turnstile_token", turnstileToken);
      }

      await apiClient.post("/auth/register", formData);
    },
    onSuccess: () => {
      setRegistered(true);
    },
    onError: (error) => {
      setTurnstileToken("");
      setTurnstileResetKey((prev) => prev + 1);
      toast.error(error instanceof Error ? error.message : t("errorDefault"));
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    if (turnstileEnabled && !turnstileToken) {
      toast.error(t("turnstileRequired"));
      return;
    }
    mutation.mutate(values);
  };

  const inputClass = (hasError: boolean) =>
    `h-11 w-full rounded-xl border bg-gray-50 px-4 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20 transition-all ${
      hasError ? "border-status-error" : "border-gray-200"
    }`;

  const selectClass = (hasError: boolean) =>
    `h-11 w-full rounded-xl border bg-gray-50 px-4 font-sarabun text-body-md text-text-primary focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20 transition-all ${
      hasError ? "border-status-error" : "border-gray-200"
    }`;

  return (
    <>
      <div className="w-full max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:p-spacing-6 rounded-2xl border border-white/80 bg-white shadow-md sm:max-w-[560px] sm:p-10">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Thai EduData Insight" className="mx-auto mb-3 h-[60px] w-[60px] object-contain" />
          <h1 className="font-kanit text-heading-2 text-primary-dark">
            {t("title")}
          </h1>
          <p className="mt-2 font-sarabun text-body-md text-text-secondary">
            {t("subtitle")}
          </p>
        </div>

        {registered ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-success-bg font-kanit text-heading-2 text-status-success">
              ✓
            </div>
            <div>
              <h2 className="font-kanit text-heading-2 text-primary-dark">
                {t("successTitle")}
              </h2>
              <p className="mt-2 font-sarabun text-body-md text-text-secondary">
                {t("successMessage")}
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href={`/${locale}/login`}
                className="flex h-11 w-full items-center justify-center rounded-full bg-primary-dark font-sarabun text-label font-medium text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
              >
                {t("goToLogin")}
              </Link>
              <Link
                href={`/${locale}/register-status`}
                className="flex h-11 w-full items-center justify-center rounded-full border border-gray-200 bg-white font-sarabun text-label font-medium text-primary-dark transition-all hover:bg-gray-50 hover:shadow-md"
              >
                {t("checkStatus")}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="agency_name"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("agencyName")}
            </label>
            <input
              id="agency_name"
              type="text"
              autoComplete="organization"
              placeholder={t("agencyNamePlaceholder")}
              className={inputClass(!!errors.agency_name)}
              {...register("agency_name")}
            />
            {errors.agency_name && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.agency_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="agency_name_en"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("agencyNameEn")}
            </label>
            <input
              id="agency_name_en"
              type="text"
              placeholder={t("agencyNameEnPlaceholder")}
              className={inputClass(!!errors.agency_name_en)}
              {...register("agency_name_en")}
            />
          </div>

          <div>
            <label
              htmlFor="agency_type"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("agencyType")}
            </label>
            <select
              id="agency_type"
              className={selectClass(!!errors.agency_type)}
              {...register("agency_type")}
            >
              <option value="">{t("agencyTypePlaceholder")}</option>
              {AGENCY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`agencyType_${type}`)}
                </option>
              ))}
            </select>
            {errors.agency_type && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.agency_type.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="agency_code"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("agencyCode")}
            </label>
            <input
              id="agency_code"
              type="text"
              placeholder={t("agencyCodePlaceholder")}
              className={inputClass(!!errors.agency_code)}
              {...register("agency_code")}
            />
          </div>

          <div>
            <label
              htmlFor="agency_website"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("agencyWebsite")}
            </label>
            <input
              id="agency_website"
              type="url"
              placeholder={t("agencyWebsitePlaceholder")}
              className={inputClass(!!errors.agency_website)}
              {...register("agency_website")}
            />
          </div>

          <div>
            <label
              htmlFor="contact_name"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("contactName")}
            </label>
            <input
              id="contact_name"
              type="text"
              placeholder={t("contactNamePlaceholder")}
              className={inputClass(!!errors.contact_name)}
              {...register("contact_name")}
            />
            {errors.contact_name && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.contact_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact_position"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("contactPosition")}
            </label>
            <input
              id="contact_position"
              type="text"
              placeholder={t("contactPositionPlaceholder")}
              className={inputClass(!!errors.contact_position)}
              {...register("contact_position")}
            />
          </div>

          <div>
            <label
              htmlFor="contact_phone"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("contactPhone")}
            </label>
            <input
              id="contact_phone"
              type="tel"
              placeholder={t("contactPhonePlaceholder")}
              className={inputClass(!!errors.contact_phone)}
              {...register("contact_phone")}
            />
            {errors.contact_phone && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.contact_phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className={inputClass(!!errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`${inputClass(!!errors.password)} pr-10`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-dark"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
            <PasswordStrengthIndicator
              password={passwordValue}
              labels={{
                length: t("passwordCheckLength"),
                lower: t("passwordCheckLower"),
                upper: t("passwordCheckUpper"),
                number: t("passwordCheckNumber"),
                special: t("passwordCheckSpecial"),
              }}
            />
            {errors.password && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("confirmPassword")}
            </label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass(!!errors.confirm_password)}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="verification_doc"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("verificationDoc")}
            </label>
            {watch("verification_doc") ? (
              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3">
                <svg className="h-5 w-5 shrink-0 text-blue-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-3 4h4v2h-4v-2zm0 4h4v2h-4v-2z" />
                </svg>
                <span className="min-w-0 flex-1 truncate font-sarabun text-label text-text-primary">
                  {watch("verification_doc")!.name}
                </span>
                <span className="shrink-0 font-sarabun text-caption text-text-muted">
                  {(watch("verification_doc")!.size / (1024 * 1024)).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setValue("verification_doc", null, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    const input = document.getElementById("verification_doc") as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                  className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-red-100 hover:text-red-600"
                  aria-label="Remove file"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            ) : (
              <input
                id="verification_doc"
                type="file"
                accept="application/pdf,.pdf"
                className={inputClass(!!errors.verification_doc)}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setValue("verification_doc", file, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
            )}
            <p className="mt-1 font-sarabun text-caption text-text-muted">
              {t("verificationDocHint")}
            </p>
            {errors.verification_doc && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.verification_doc.message}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 py-1">
            <input
              id="terms_consent"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-dark focus:ring-primary-dark/20"
              {...register("terms_consent")}
            />
            <label
              htmlFor="terms_consent"
              className="font-sarabun text-caption leading-snug text-text-secondary"
            >
              {t("termsConsent")}
            </label>
          </div>
          {errors.terms_consent && (
            <p className="-mt-3 font-sarabun text-caption text-status-error">
              {errors.terms_consent.message}
            </p>
          )}

          <div className="flex items-start gap-3 py-1">
            <input
              id="pdpa_consent"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-dark focus:ring-primary-dark/20"
              {...register("pdpa_consent")}
            />
            <label
              htmlFor="pdpa_consent"
              className="font-sarabun text-caption leading-snug text-text-secondary"
            >
              {t("pdpa")}{" "}
              <Link
                href={`/${locale}/privacy-policy`}
                className="text-primary-dark hover:underline"
              >
                {t("pdpaPolicy")}
              </Link>{" "}
              {t("pdpaAnd")}{" "}
              <Link
                href={`/${locale}/privacy-policy`}
                className="text-primary-dark hover:underline"
              >
                {t("pdpaLink")}
              </Link>
            </label>
          </div>
          {errors.pdpa_consent && (
            <p className="-mt-3 font-sarabun text-caption text-status-error">
              {errors.pdpa_consent.message}
            </p>
          )}

          {watch("terms_consent") && watch("pdpa_consent") && (
            <div className="space-y-4">
              <SliderCaptcha onVerify={(ok) => setCaptchaVerified(ok)} />
              <TurnstileField
                resetKey={turnstileResetKey}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={
                !isValid ||
                !captchaVerified ||
                mutation.isPending ||
                (turnstileEnabled && !turnstileToken)
              }
              className="flex h-12 w-full items-center justify-center rounded-2xl font-sarabun text-body-md font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #0045bc 0%, #2979ff 100%)" }}
            >
              {mutation.isPending ? `${t("submit")}...` : t("submit")}
            </button>
            <p className="mt-3 text-center font-sarabun text-caption italic text-text-muted">
              {t("pendingNote")}
            </p>
          </div>
          </form>
        )}

        {!registered && (
          <div className="mt-8 border-t border-border-default pt-6 text-center">
            <p className="font-sarabun text-body-md text-text-secondary">
              {t("hasAccount")}{" "}
              <Link
                href={`/${locale}/login`}
                className="font-medium text-primary-dark hover:underline"
              >
                {t("loginLink")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
