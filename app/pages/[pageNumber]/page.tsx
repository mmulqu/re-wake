'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import MatrixComments from '@/app/components/MatrixComments';
import { useState, useEffect } from 'react';
import type { MasterText, EditHistory } from '@/app/types/database';

export default function PageContent() {
  const { user } = useUser();
  const params = useParams();
  const pageNumber = parseInt(params.pageNumber as string);
  const [content, setContent] = useState<MasterText | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    // Fetch page content from your API
    // This is where you'd get the MasterText for this page
  }, [pageNumber]);

  const handleSaveEdit = async () => {
    if (!user) return;
    
    // Save edit to database
    // Create new contribution
    // Update edit history
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between mb-8 text-[#00ff00]/70">
          <Link href="/pages" className="hover:text-[#00ff00]">← All Pages</Link>
          <div className="flex gap-4">
            <span className="text-[#00ff00]">Page {pageNumber}</span>
            {user && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[#00ff00] hover:text-[#00ff00]/80"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="prose prose-invert">
          <h1 className="text-3xl font-mono text-[#00ff00] mb-8">
            Page {pageNumber}
          </h1>
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-64 bg-black border border-[#00ff00]/30 rounded-lg p-4
                         text-[#00ff00] font-mono focus:border-[#00ff00]"
              />
              <button
                onClick={handleSaveEdit}
                className="bg-[#00ff00] text-black px-4 py-2 rounded-md hover:bg-[#00ff00]/90"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="font-mono text-[#00ff00] min-h-[200px] border border-[#00ff00]/20 rounded-lg p-6">
              {content?.text || 'This page is open for contribution...'}
            </div>
          )}
        </div>
        
        <MatrixComments />
      </div>
    </div>
  );
} 