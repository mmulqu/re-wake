'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function AuthHeader() {
  return (
    <header className="fixed top-4 right-4 z-50">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="py-2 px-6 rounded-md shadow-lg text-base 
                          font-mono text-black bg-[#00ff00] hover:bg-[#00ff00]/90 
                          border-2 border-[#00ff00] transition-all duration-300
                          hover:shadow-[#00ff00]/30 hover:shadow-lg">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton 
          appearance={{
            elements: {
              rootBox: "hover:opacity-80",
              userButtonAvatarBox: "border-2 border-[#00ff00]",
              userButtonTrigger: "focus:shadow-none",
            }
          }}
          afterSignOutUrl="/"
        />
      </SignedIn>
    </header>
  );
} 