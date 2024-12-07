// app/pages/1/page.tsx
import MatrixComments from '@/components/MatrixComments';

export default function Page1() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between mb-8 text-[#00ff00]/70">
          <a href="/pages" className="hover:text-[#00ff00]">← All Pages</a>
          <div className="flex gap-4">
            <span className="text-[#00ff00]">Page 1</span>
            <a href="/pages/2" className="hover:text-[#00ff00]">Next →</a>
          </div>
        </div>

        {/* Page content */}
        <div className="prose prose-invert">
          <h1 className="text-3xl font-mono text-[#00ff00] mb-8">Page 3</h1>
          <div className="font-mono text-[#00ff00] min-h-[200px] border border-[#00ff00]/20 rounded-lg p-6">
            This page is open for discussion...
          </div>
        </div>
        
        {/* Comments section */}
        <MatrixComments />
      </div>
    </div>
  );
}