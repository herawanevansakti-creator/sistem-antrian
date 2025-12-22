import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Queue System | Sistem Antrean Wawancara Real-time",
  description: "Sistem manajemen antrean wawancara real-time dengan fitur auto-assign dan notifikasi langsung untuk kandidat dan pewawancara.",
  keywords: ["interview", "queue", "realtime", "recruitment", "wawancara", "antrean"],
  authors: [{ name: "Interview Queue System" }],
  openGraph: {
    title: "Interview Queue System",
    description: "Sistem manajemen antrean wawancara real-time",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#f97316",
          colorBackground: "#0f172a",
          colorInputBackground: "#1e293b",
          colorInputText: "#f8fafc",
          colorTextOnPrimaryBackground: "#ffffff",
        },
        elements: {
          card: "bg-slate-800 border-slate-700",
          headerTitle: "text-white",
          headerSubtitle: "text-slate-400",
          socialButtonsBlockButton: "bg-slate-700 border-slate-600 hover:bg-slate-600",
          formButtonPrimary: "bg-orange-500 hover:bg-orange-600",
          footerActionLink: "text-orange-400 hover:text-orange-300",
        }
      }}
    >
      <html lang="id">
        <body className="antialiased">
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: '#f8fafc',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
