import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar variant="public" />
      <main>{children}</main>
      <Footer />
    </>
  );
}
