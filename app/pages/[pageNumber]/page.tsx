'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import MatrixComments from '@/app/components/MatrixComments';
import { useState, useEffect } from 'react';
import type { MasterText, Contribution } from '@/app/types/database';
import Head from 'next/head';

export default function PageContent() {
  const { user } = useUser();
  const params = useParams();
  const pageNumber = parseInt(params.pageNumber as string);
  const [approvedContent, setApprovedContent] = useState<MasterText[]>([]);
  const [pendingContributions, setPendingContributions] = useState<Contribution[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch both approved content and pending contributions
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch approved content
        const contentRes = await fetch(`/api/pages/${pageNumber}/content`);
        const contentData = await contentRes.json();
        console.log('Fetched content:', {
          pageNumber,
          contentData,
          status: contentRes.status
        });
        setApprovedContent(contentData);

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
    if (!user || !editText.trim()) {
      setError("Please enter some text to contribute");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting contribution...', {
        text: editText,
        pageNumber,
        userId: user.id,
      });

      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editText,
          pageNumber,
          userId: user.id,
          themes: [],
          cultural_references: [],
          historical_context: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit contribution');
      }

      // Add the new contribution to the pending list
      setPendingContributions(prev => [...prev, {
        id: data.id,
        text: editText,
        user_id: user.id,
        page_number: pageNumber,
        author_name: user.username || user.id,
        created_at: new Date(),
        themes: [],
        cultural_references: [],
        historical_context: '',
        is_approved: false,
      }]);

      setIsEditing(false);
      setEditText('');
    } catch (error) {
      console.error('Error submitting contribution:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Re-Wake Page {pageNumber}</title>
        <meta property="og:title" content={`Re-Wake Page ${pageNumber}`} />
      </Head>
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

          {/* Page content */}
          <div className="prose prose-invert">
            <h1 className="text-3xl font-mono text-[#00ff00] mb-8">
              Page {pageNumber}
            </h1>

            {/* Approved Content */}
            <div className="space-y-6">
              {approvedContent.length > 0 ? (
                approvedContent.map((content, index) => (
                  <div 
                    key={content.id}
                    className="font-mono text-[#00ff00] border border-[#00ff00]/20 rounded-lg p-6"
                  >
                    <div className="text-xs text-[#00ff00]/50 mb-2">
                      Added by {content.author_name}
                      {content.approver_name && (
                        <span className="ml-2">• Approved by {content.approver_name}</span>
                      )}
                      <span className="ml-2">
                        {new Date(content.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">{content.text}</div>
                  </div>
                ))
              ) : (
                <div className="text-[#00ff00]/50 italic">
                  No approved content yet...
                </div>
              )}
            </div>

            {/* Pending Contributions */}
            {pendingContributions.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-mono text-red-500 mb-4">
                  Pending Contributions
                </h2>
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
                    <div className="font-mono text-red-500 whitespace-pre-wrap">
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

                  {error && (
                    <div className="mb-4 p-3 border border-red-500/30 rounded bg-red-500/10 text-red-500">
                      {error}
                    </div>
                  )}

                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Paste your generated text here..."
                    className="w-full h-64 bg-black border border-[#00ff00]/30 rounded-lg p-4
                             text-[#00ff00] font-mono focus:border-[#00ff00] mb-4"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-[#00ff00]/30 rounded-md
                               text-[#00ff00] hover:bg-[#00ff00]/10"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleContribute}
                      disabled={isSubmitting || !editText.trim()}
                      className={`bg-[#00ff00] text-black px-4 py-2 rounded-md
                               hover:bg-[#00ff00]/90 flex items-center gap-2
                               ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          Submitting...
                        </>
                      ) : (
                        'Submit for Review'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <MatrixComments pageNumber={pageNumber} />
        </div>
      </div>
    </>
  );
} 