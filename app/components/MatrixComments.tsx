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
        <div className="min-h-[600px] bg-black/50 rounded-lg p-4">
          <Giscus
            repo="mmulqu/re-wake"
            repoId="R_kgDONaHjWA"
            category="Ideas"
            categoryId="DIC_kwDONaHjWM4ClAFi"
            mapping="pathname"
            strict="0"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="bottom"
            theme="dark"
            lang="en"
          />
        </div>
      )}
    </div>
  );
}