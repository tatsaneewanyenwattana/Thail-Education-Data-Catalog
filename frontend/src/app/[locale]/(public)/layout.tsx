import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";

type PublicLayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale } = params;

  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <Navbar variant="public" />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
