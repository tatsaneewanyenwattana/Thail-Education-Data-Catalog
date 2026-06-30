import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import AuthInitializer from "@/components/common/AuthInitializer";
import FaqChatbot from "@/components/common/FaqChatbot";
import PageViewBar from "@/components/common/PageViewBar";
import SettingPopup from "@/components/common/SettingPopup";
import PublicRouteGuard from "@/components/common/PublicRouteGuard";

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
      <AuthInitializer />
      <PublicRouteGuard />
      <SettingPopup />
      <Navbar variant="public" />
      <main className="flex-1">{children}</main>
      <PageViewBar />
      <Footer locale={locale} />
      <FaqChatbot />
    </div>
  );
}
