// app/components/MatrixComments.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Giscus from '@giscus/react';

interface MatrixCommentsProps {
  pageNumber: number;
}

export default function MatrixComments({ pageNumber }: MatrixCommentsProps) {
  const [showDiscussions, setShowDiscussions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (showDiscussions) {
      console.log('Loading discussions for Page', pageNumber);
      // Add a timeout to check if Giscus loads
      const timer = setTimeout(() => {
        const giscusFrame = document.querySelector('iframe.giscus-frame');
        console.log('Giscus frame found:', !!giscusFrame);
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showDiscussions, pageNumber]);

  return (
    <div className="w-full border-t border-[#00ff00]/30 pt-8 mt-8">
      <button
        onClick={() => setShowDiscussions(!showDiscussions)}
        className="mb-4 px-4 py-2 bg-[#00ff00]/10 text-[#00ff00] rounded-md 
                   hover:bg-[#00ff00]/20 transition-colors font-mono text-sm
                   border border-[#00ff00]/30"
      >
        {showDiscussions ? 'Hide Discussions' : 'Show Discussions'} 
        ({pageNumber ? `Page ${pageNumber}` : 'General'})
      </button>

      {showDiscussions && (
        <div className="min-h-[600px] bg-black/50 rounded-lg p-4">
          {isLoading && (
            <div className="text-[#00ff00] mb-4">
              Loading discussions for Page {pageNumber}...
            </div>
          )}
          <Giscus
            repo="mmulqu/re-wake"
            repoId="R_kgDONaHjWA"
            category="Ideas"
            categoryId="DIC_kwDONaHjWM4ClAFi"
            mapping="specific"
            term={`Page ${pageNumber}`}
            theme="dark"
            lang="en"
          />
        </div>
      )}
    </div>
  );
}