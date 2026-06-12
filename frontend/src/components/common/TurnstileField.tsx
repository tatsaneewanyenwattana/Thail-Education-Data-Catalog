"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

type TurnstileFieldProps = {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  resetKey?: number;
};

export default function TurnstileField({
  onSuccess,
  onExpire,
  onError,
  resetKey = 0,
}: TurnstileFieldProps) {
  const ref = useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex justify-center" key={resetKey}>
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        options={{ theme: "light", size: "normal" }}
        onSuccess={onSuccess}
        onExpire={() => {
          onExpire?.();
          ref.current?.reset();
        }}
        onError={() => {
          onError?.();
          ref.current?.reset();
        }}
      />
    </div>
  );
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
