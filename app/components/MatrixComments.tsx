// app/components/MatrixComments.tsx
'use client';
import React from 'react';
import Giscus from '@giscus/react';

export default function MatrixComments() {
  return (
    <div className="w-full border-t border-[#00ff00]/30 pt-8 mt-8">
      <Giscus
        repo="mmulqu/re-wake"
        repoId="R_kgDONaHjWA"
        category="General"
        categoryId="DIC_kwDONaHjWM4ClAFi"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="1"
        inputPosition="bottom"
        theme="transparent_dark"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}