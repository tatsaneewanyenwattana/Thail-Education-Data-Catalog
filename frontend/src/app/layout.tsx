import "./globals.css";
import { ToastContainer } from "@/components/common/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="font-sarabun bg-surface-page" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(location.hostname==='localhost'){location.replace(location.href.replace('//localhost','//127.0.0.1'));}",
          }}
        />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
