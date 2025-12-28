import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecruitFlow Pro | Smart Queue Management System",
  description: "Sistem manajemen antrean wawancara real-time dengan fitur QR Check-in, Interview Timer, dan Advanced Analytics.",
  keywords: ["interview", "queue", "realtime", "recruitment", "wawancara", "antrean", "recruitflow"],
  authors: [{ name: "RecruitFlow Pro" }],
  openGraph: {
    title: "RecruitFlow Pro",
    description: "Smart Queue Management System untuk rekrutmen",
    type: "website",
  },
};

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      dynamic
      appearance={{
        variables: {
          colorPrimary: "#4f46e5",
          colorBackground: "#ffffff",
          colorInputBackground: "#f8fafc",
          colorInputText: "#1e293b",
          colorText: "#1e293b",
          colorTextSecondary: "#64748b",
          colorTextOnPrimaryBackground: "#ffffff",
          colorNeutral: "#64748b",
          colorDanger: "#ef4444",
          colorSuccess: "#22c55e",
          colorWarning: "#eab308",
          borderRadius: "12px",
        },
        elements: {
          rootBox: "w-full",
          card: "bg-white border border-gray-200 shadow-2xl rounded-[32px]",
          headerTitle: "text-gray-900 font-bold",
          headerSubtitle: "text-gray-500",
          socialButtonsBlockButton: "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
          socialButtonsBlockButtonText: "text-gray-900 font-medium",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-400",
          formFieldLabel: "text-gray-700 font-medium",
          formFieldInput: "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400",
          formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-600",
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold",
          formButtonReset: "text-gray-500 hover:text-gray-700",
          footerActionLink: "text-indigo-600 hover:text-indigo-700 font-medium",
          footerActionText: "text-gray-500",
          identityPreviewText: "text-gray-900",
          identityPreviewEditButton: "text-indigo-600 hover:text-indigo-700",
          formFieldAction: "text-indigo-600 hover:text-indigo-700",
          formFieldHintText: "text-gray-400",
          formFieldSuccessText: "text-green-600",
          formFieldErrorText: "text-red-500",
          otpCodeFieldInput: "bg-gray-50 border-gray-200 text-gray-900",
          alertText: "text-gray-700",
          userButtonPopoverCard: "bg-white border-gray-200",
          userButtonPopoverActionButton: "text-gray-700 hover:bg-gray-50",
          userButtonPopoverActionButtonText: "text-gray-700",
          userButtonPopoverFooter: "hidden",
        }
      }}
    >
      <html lang="id" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
          <style>{`
            .material-symbols-outlined {
              font-family: 'Material Symbols Outlined';
              font-weight: normal;
              font-style: normal;
              font-size: 24px;
              line-height: 1;
              letter-spacing: normal;
              text-transform: none;
              display: inline-block;
              white-space: nowrap;
              word-wrap: normal;
              direction: ltr;
              -webkit-font-smoothing: antialiased;
            }
            .material-symbols-outlined.filled {
              font-variation-settings: 'FILL' 1;
            }
          `}</style>
        </head>
        <body className="antialiased bg-slate-50 font-[Inter,sans-serif]">
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
