// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <SignIn appearance={{
        elements: {
          formButtonPrimary: 'bg-[#00ff00] hover:bg-[#00ff00]/90 text-black',
          footerActionLink: 'text-[#00ff00] hover:text-[#00ff00]/90',
          card: 'bg-black border border-[#00ff00]/30',
          headerTitle: 'text-[#00ff00]',
          headerSubtitle: 'text-[#00ff00]/80',
          formFieldLabel: 'text-[#00ff00]',
          formFieldInput: 'bg-black border-[#00ff00]/30 text-[#00ff00]',
        }
      }}/>
    </div>
  );
}