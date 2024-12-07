'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

export default function ClerkProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#00ff00',
          colorBackground: '#000000',
          colorText: '#00ff00',
          colorTextOnPrimaryBackground: '#000000',
        },
        elements: {
          formButtonPrimary: 
            "bg-[#00ff00] hover:bg-[#00ff00]/90 text-black font-mono",
          footerActionLink: 
            "text-[#00ff00] hover:text-[#00ff00]/90",
          card: 
            "bg-black border border-[#00ff00]/20",
          headerTitle: 
            "text-[#00ff00]",
          headerSubtitle: 
            "text-[#00ff00]/80",
          formFieldLabel: 
            "text-[#00ff00]",
          formFieldInput: 
            "bg-black border-[#00ff00]/20 text-[#00ff00]",
          dividerText: 
            "text-[#00ff00]/60",
          formFieldInputShowPasswordButton: 
            "text-[#00ff00]/60 hover:text-[#00ff00]",
          footer: 
            "hidden",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
} 