'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SplitLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGeneratorPage = pathname === '/';
  const isPagesSection = pathname.startsWith('/pages');

  return (
    <div className="flex h-[calc(100vh-64px)]"> {/* Adjust 64px based on your header height */}
      {/* Left side - Generator */}
      <div className={`${isGeneratorPage ? 'w-full' : 'w-1/2'} overflow-y-auto border-r border-[#00ff00]/30`}>
        {isGeneratorPage ? children : (
          <iframe src="/" className="w-full h-full border-0" />
        )}
      </div>

      {/* Right side - Pages */}
      {!isGeneratorPage && (
        <div className="w-1/2 overflow-y-auto">
          {children}
        </div>
      )}

      {/* Fixed navigation button */}
      {isGeneratorPage && (
        <Link 
          href="/pages" 
          className="fixed bottom-4 right-4 bg-[#00ff00] text-black px-4 py-2 rounded-md
                     hover:bg-[#00ff00]/90 transition-colors font-mono"
        >
          View Pages →
        </Link>
      )}
    </div>
  );
} 