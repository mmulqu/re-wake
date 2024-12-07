'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import MatrixComments from '@/app/components/MatrixComments';
import { useState, useEffect } from 'react';
import type { MasterText, Contribution } from '@/app/types/database';

export default function PageContent() {
  const { user } = useUser();
  const params = useParams();
  const pageNumber = parseInt(params.pageNumber as string);
  const [content, setContent] = useState<MasterText | null>(null);
  const [pendingContributions, setPendingContributions] = useState<Contribution[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  // Fetch both approved content and pending contributions
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch approved content
        const contentRes = await fetch(`/api/pages/${pageNumber}/content`);
        const contentData = await contentRes.json();
        setContent(contentData);

        // Fetch pending contributions
        const pendingRes = await fetch(`/api/pages/${pageNumber}/pending`);
        const pendingData = await pendingRes.json();
        setPendingContributions(pendingData);
      } catch (error) {
        console.error('Error fetching page data:', error);
      }
    };
    fetchContent();
  }, [pageNumber]);

  const handleContribute = async () => {
    if (!user || !editText.trim()) return;

    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editText,
          pageNumber,
          userId: user.id,
          themes: [], // You could get these from the generator
          cultural_references: [],
          historical_context: '',
        }),
      });

      if (!response.ok) throw new Error('Failed to submit contribution');

      // Add the new contribution to the pending list
      const newContribution = await response.json();
      setPendingContributions(prev => [...prev, {
        ...newContribution,
        text: editText,
        user_id: user.id,
        author_name: user.username || user.id,
        created_at: new Date(),
      }]);

      setIsEditing(false);
      setEditText('');
    } catch (error) {
      console.error('Error submitting contribution:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between mb-8 text-[#00ff00]/70">
          <Link href="/pages" className="hover:text-[#00ff00]">← All Pages</Link>
          <div className="flex gap-4 items-center">
            <span className="text-[#00ff00]">Page {pageNumber}</span>
            {user && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-[#00ff00] text-black px-3 py-1 rounded-md
                         hover:bg-[#00ff00]/90 transition-colors text-sm"
              >
                Contribute
              </button>
            )}
          </div>
        </div>

        {/* Page content with sections */}
        <div className="prose prose-invert">
          <h1 className="text-3xl font-mono text-[#00ff00] mb-8">
            Page {pageNumber}
          </h1>

          {/* Approved Content */}
          <div className="space-y-6 font-mono text-[#00ff00]">
            {content?.text || 'This page is open for contribution...'}
          </div>

          {/* Pending Contributions */}
          {pendingContributions.length > 0 && (
            <div className="mt-8 space-y-4">
              {pendingContributions.map((contribution) => (
                <div 
                  key={contribution.id}
                  className="border border-red-500/30 rounded-lg p-4"
                >
                  <div className="text-xs text-red-500/70 mb-2">
                    Pending Review • Submitted by {contribution.author_name || contribution.user_id}
                    <span className="ml-2">
                      {new Date(contribution.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="font-mono text-red-500">
                    {contribution.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Editing Interface */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
              <div className="bg-black border border-[#00ff00]/30 rounded-lg p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[#00ff00] text-xl font-mono">Submit Contribution</h2>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="text-[#00ff00]/70 hover:text-[#00ff00]"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Paste your generated text here..."
                  className="w-full h-64 bg-black border border-[#00ff00]/30 rounded-lg p-4
                           text-[#00ff00] font-mono focus:border-[#00ff00] mb-4"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[#00ff00]/30 rounded-md
                             text-[#00ff00] hover:bg-[#00ff00]/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContribute}
                    className="bg-[#00ff00] text-black px-4 py-2 rounded-md
                             hover:bg-[#00ff00]/90"
                  >
                    Submit for Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <MatrixComments pageNumber={pageNumber} />
      </div>
    </div>
  );
} 