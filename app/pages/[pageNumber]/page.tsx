'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import MatrixComments from '@/app/components/MatrixComments';
import { useState, useEffect } from 'react';
import type { MasterText, Contribution } from '@/app/types/database';
import Head from 'next/head';
import type { UserResource } from '@clerk/types';
import type { UserMetadata } from '@/app/types/database';

interface ApprovalMenuProps {
  text: string;
  onApprove: () => Promise<void>;
  onReject: () => void;
}

interface PreviewProps {
  contribution: Contribution;
  existingText: MasterText[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

interface DraggableProps {
  contribution: Contribution;
  onPositionChange: (newPosition: {
    previousTextId: number | null;
    position: number;
  }) => void;
}

interface PreviewPosition {
  x: number;
  y: number;
  previousTextId: number | null;
  position: number;
}

const approveContribution = async (contributionId: number) => {
  try {
    const response = await fetch(`/api/contributions/${contributionId}/approve`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to approve contribution');
    return response.json();
  } catch (error) {
    console.error('Error approving contribution:', error);
    throw error;
  }
};

const rejectContribution = async (contributionId: number) => {
  try {
    const response = await fetch(`/api/contributions/${contributionId}/reject`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to reject contribution');
    return response.json();
  } catch (error) {
    console.error('Error rejecting contribution:', error);
    throw error;
  }
};

const ApprovalMenu: React.FC<ApprovalMenuProps> = ({ text, onApprove, onReject }) => (
  <div className="absolute bg-black border border-[#00ff00]/30 rounded-md p-2 shadow-lg">
    <button 
      onClick={onApprove}
      className="block w-full text-left px-3 py-1 hover:bg-[#00ff00]/10 text-[#00ff00]"
    >
      Approve
    </button>
    <button 
      onClick={onReject}
      className="block w-full text-left px-3 py-1 hover:bg-red-500/10 text-red-500"
    >
      Reject
    </button>
  </div>
);

const InsertionCursor = ({ position }: { position: { x: number; y: number } }) => (
  <div 
    className="fixed w-0.5 h-5 bg-[#00ff00] animate-pulse"
    style={{ 
      left: position.x,
      top: position.y,
      transform: 'translateX(-50%)'
    }}
  />
);

const InsertionPreview = ({ 
  position: { x, y }, 
  text, 
  beforeText, 
  afterText 
}: {
  position: { x: number; y: number };
  text: string;
  beforeText?: string;
  afterText?: string;
}) => (
  <div 
    className="fixed bg-black/90 border border-[#00ff00]/30 rounded-lg p-4 max-w-md"
    style={{ 
      left: x,
      top: y + 20,
      transform: 'translateX(-50%)'
    }}
  >
    <div className="text-xs text-[#00ff00]/50 mb-2">Preview</div>
    <div className="font-mono text-[#00ff00]/70">
      {beforeText && <span>{beforeText}</span>}
      <span className="text-[#00ff00] bg-[#00ff00]/10 px-1 rounded">
        {text}
      </span>
      {afterText && <span>{afterText}</span>}
    </div>
  </div>
);

const PreviewMode: React.FC<PreviewProps> = ({
  contribution,
  existingText,
  onConfirm,
  onCancel
}) => {
  const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);

  return (
    <div className="relative">
      {existingText.map((text, index) => (
        <div 
          key={text.id}
          className="font-mono text-[#00ff00]/70 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const position = e.clientX - rect.left;
            setPreviewPosition({
              x: e.clientX,
              y: rect.top,
              previousTextId: text.id,
              position
            });
          }}
        >
          {text.text}
          {previewPosition?.previousTextId === text.id && (
            <InsertionPreview
              position={{ x: previewPosition.x, y: previewPosition.y }}
              text={contribution.text}
              beforeText={text.text.slice(0, previewPosition.position)}
              afterText={text.text.slice(previewPosition.position)}
            />
          )}
        </div>
      ))}
      <div className="mt-4 flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-red-500/10 text-red-500 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1 bg-[#00ff00]/10 text-[#00ff00] rounded"
          disabled={!previewPosition}
        >
          Confirm Position
        </button>
      </div>
    </div>
  );
};

const DraggableContribution: React.FC<DraggableProps> = ({
  contribution,
  onPositionChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', contribution.id.toString());
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="font-mono text-[#00ff00] p-4 border border-[#00ff00]/30 rounded">
        {contribution.text}
      </div>
    </div>
  );
};

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
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [insertionPoint, setInsertionPoint] = useState<{
    position: number;
    previousTextId: number | null;
  } | null>(null);

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
    if (!user || !editText.trim() || !insertionPoint) {
      setError("Please select where to insert the text and enter your contribution");
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
          insertionPoint: insertionPoint.position,
          previousTextId: insertionPoint.previousTextId,
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

  const isAdmin = (user as UserResource & { publicMetadata: UserMetadata })?.publicMetadata?.role === 'admin';

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
                  <div key={content.id} className="relative">
                    <div className="font-mono text-[#00ff00] border border-[#00ff00]/20 rounded-lg p-6 cursor-text">
                      <div className="text-xs text-[#00ff00]/50 mb-2">
                        Added by {content.author_name}
                      </div>
                      <div className="whitespace-pre-wrap relative">
                        {content.text}
                        
                        {/* Show pending contributions that would be inserted after this content */}
                        {pendingContributions
                          .filter(pc => pc.previousTextId === content.id || 
                            // If no previousTextId is set, show at the end of the first content block
                            (pc.previousTextId === null && index === 0))
                          .map(contribution => (
                            <div key={contribution.id} className="relative mt-2 pl-4 border-l-2 border-orange-500/30">
                              <div className="text-xs text-orange-500/70 mb-1">
                                Pending • By {contribution.author_name}
                                {isAdmin && (
                                  <div className="absolute right-0 top-0 flex gap-2">
                                    <button
                                      onClick={() => approveContribution(contribution.id)}
                                      className="px-2 py-0.5 text-xs bg-[#00ff00]/10 text-[#00ff00] rounded"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => rejectContribution(contribution.id)}
                                      className="px-2 py-0.5 text-xs bg-red-500/10 text-red-500 rounded"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="font-mono text-orange-500">
                                {contribution.text}
                              </div>
                              {/* Show insertion cursor */}
                              <div className="absolute left-0 top-0 w-0.5 h-full bg-orange-500/30 animate-pulse" />
                            </div>
                          ))}

                        {/* Show insertion point cursor */}
                        {insertionPoint?.previousTextId === content.id && (
                          <div 
                            className="absolute w-0.5 h-full bg-[#00ff00]/30 animate-pulse"
                            style={{ 
                              left: `${(insertionPoint.position / content.text.length) * 100}%`,
                              top: 0
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#00ff00]/50 italic">
                  No approved content yet...
                </div>
              )}
            </div>

            {/* Show pending edits */}
            {(user && (pendingContributions.length > 0) && (isAdmin || pendingContributions.some(c => c.user_id === user.id))) && (
              <div className="mt-8">
                <h2 className="text-xl font-mono text-[#00ff00]/70 mb-4">
                  Pending Edits {isAdmin && <span className="text-sm">({pendingContributions.length} total)</span>}
                </h2>
                {pendingContributions.map((contribution) => (
                  <div 
                    key={contribution.id}
                    className={`relative border rounded-lg p-4 mb-4 ${
                      contribution.user_id === user.id 
                        ? 'border-[#00ff00]/30 text-[#00ff00]'
                        : isAdmin 
                          ? 'border-yellow-500/30 text-yellow-500'
                          : 'hidden'
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-2">
                      By {contribution.author_name}
                    </div>
                    <div 
                      className="whitespace-pre-wrap"
                      onMouseUp={(e) => {
                        if (isAdmin) {
                          const selection = window.getSelection()?.toString();
                          if (selection) {
                            setSelectedText(selection);
                            // Position menu near mouse
                            const menu = document.createElement('div');
                            menu.style.position = 'absolute';
                            menu.style.left = `${e.clientX}px`;
                            menu.style.top = `${e.clientY}px`;
                            document.body.appendChild(menu);
                            setTimeout(() => menu.remove(), 100);
                          }
                        }
                      }}
                    >
                      {contribution.text}
                    </div>
                    {selectedText && (
                      <div className="absolute top-0 right-0 mt-2 mr-2">
                        <ApprovalMenu 
                          text={selectedText}
                          onApprove={async () => {
                            await approveContribution(contribution.id);
                            // Refresh both lists
                            const [contentRes, pendingRes] = await Promise.all([
                              fetch(`/api/pages/${pageNumber}/content`),
                              fetch(`/api/pages/${pageNumber}/pending`)
                            ]);
                            const [contentData, pendingData] = await Promise.all([
                              contentRes.json(),
                              pendingRes.json()
                            ]);
                            setApprovedContent(contentData);
                            setPendingContributions(pendingData);
                            setSelectedText(null);
                          }}
                          onReject={() => setSelectedText(null)}
                        />
                      </div>
                    )}
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