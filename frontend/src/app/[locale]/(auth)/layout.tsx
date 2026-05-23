import Navbar from "@/components/common/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <Navbar variant="auth" />
      <main className="flex flex-1 items-center justify-center bg-surface-page">
        <div className="flex min-h-screen w-full flex-1 items-center justify-center bg-surface-page">
          {children}
        </div>
      </main>
    </div>
  );
}
