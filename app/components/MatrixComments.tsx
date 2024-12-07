// app/components/MatrixComments.tsx
'use client';
import React from 'react';
import Giscus from '@giscus/react';
import { useUser } from '@clerk/nextjs';

interface MatrixCommentsProps {
  pageNumber: number;
}

export default function MatrixComments({ pageNumber }: MatrixCommentsProps) {
  const { user } = useUser();
  
  return (
    <div className="w-full border-t border-[#00ff00]/30 pt-8 mt-8">
      <Giscus
        id={`comments-${pageNumber}`}
        repo="mmulqu/re-wake"
        repoId="R_kgDONaHjWA"
        category="General"
        categoryId="DIC_kwDONaHjWM4ClAFi"
        mapping="specific"
        term={`page-${pageNumber}`}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="1"
        inputPosition="top"
        theme="transparent_dark"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}