import LoginForm from "@/components/common/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative w-full px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-surface-page"
        aria-hidden
      />
      <div className="mx-auto flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
