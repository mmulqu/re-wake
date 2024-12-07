import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClerkProviderWrapper from './components/auth/ClerkProviderWrapper';
import AuthHeader from './components/auth/AuthHeader';
import SplitLayout from './components/SplitLayout';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap',
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Re-wakening",
  description: "A Finnegans Wake text generation experiment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: 'black' }}>
      <body 
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ backgroundColor: 'black', color: '#00ff00', minHeight: '100vh' }}
      >
        <div style={{ backgroundColor: 'black', minHeight: '100vh' }}>
          <ClerkProviderWrapper>
            <AuthHeader />
            <SplitLayout>
              {children}
            </SplitLayout>
          </ClerkProviderWrapper>
        </div>
      </body>
    </html>
  );
}