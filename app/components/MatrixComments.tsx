// app/components/MatrixComments.tsx
'use client';
import React, { useState } from 'react';
import Giscus from '@giscus/react';

interface MatrixCommentsProps {
  pageNumber: number;
}

export default function MatrixComments({ pageNumber }: MatrixCommentsProps) {
  const [showDiscussions, setShowDiscussions] = useState(false);

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
        <div className="min-h-[600px] rounded-lg p-4 bg-transparent">
          <Giscus
            repo="mmulqu/re-wake"
            repoId="R_kgDONaHjWA"
            categoryId="DIC_kwDONaHjWM4ClAFi"
            mapping="og:title"
            strict="0"
            reactionsEnabled="1"
            emitMetadata="1"
            inputPosition="top"
            theme="transparent_dark"
            lang="en"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}