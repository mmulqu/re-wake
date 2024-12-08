'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SplitLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isGeneratorPage = pathname === '/';
  const isPagesSection = pathname.startsWith('/pages');

  const handleClosePagesView = () => {
    router.push('/');
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left side - Generator */}
      <div className={`${isGeneratorPage ? 'w-full' : 'w-1/2'} overflow-y-auto border-r border-[#00ff00]/30`}>
        {isGeneratorPage ? children : (
          <iframe src="/" className="w-full h-full border-0" />
        )}

        {/* Keep View Pages button visible always */}
        <Link 
          href="/pages" 
          className="fixed bottom-4 right-4 bg-[#00ff00] text-black px-4 py-2 rounded-md
                     hover:bg-[#00ff00]/90 transition-colors font-mono"
        >
          View Pages →
        </Link>
      </div>

      {/* Right side - Pages */}
      {!isGeneratorPage && (
        <div className="w-1/2 overflow-y-auto relative">
          {/* Close button */}
          <button
            onClick={handleClosePagesView}
            className="absolute top-4 right-4 bg-[#00ff00]/10 text-[#00ff00] px-3 py-1 
                     rounded-md hover:bg-[#00ff00]/20 transition-colors font-mono text-sm
                     border border-[#00ff00]/30"
          >
            Close Pages View ✕
          </button>
          {children}
        </div>
      )}
    </div>
  );
} 