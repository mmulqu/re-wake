'use client';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import type { Contribution } from '@/app/types/database';

export default function AdminPage() {
  const { user } = useUser();
  const [pendingContributions, setPendingContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingContributions();
  }, []);

  const fetchPendingContributions = async () => {
    try {
      const response = await fetch('/api/admin/pending-contributions');
      const data = await response.json();
      setPendingContributions(data);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contributionId: number) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributionId: contributionId.toString() }),
      });
      if (response.ok) {
        fetchPendingContributions();
      }
    } catch (error) {
      console.error('Error approving contribution:', error);
    }
  };

  const handleReject = async (contributionId: number) => {
    try {
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributionId: contributionId.toString() }),
      });
      if (response.ok) {
        fetchPendingContributions();
      }
    } catch (error) {
      console.error('Error rejecting contribution:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#00ff00] p-8">
      <h1 className="text-3xl font-mono mb-8">Admin Dashboard</h1>
      
      <div className="space-y-6">
        <h2 className="text-xl font-mono">Pending Contributions</h2>
        {loading ? (
          <div>Loading...</div>
        ) : pendingContributions.length === 0 ? (
          <div className="text-[#00ff00]/70">No pending contributions</div>
        ) : (
          pendingContributions.map((contribution) => (
            <div 
              key={contribution.id}
              className="border border-[#00ff00]/30 rounded-lg p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-[#00ff00]/70">
                    Page {contribution.page_number} • Submitted by {contribution.author_name || contribution.user_id}
                  </div>
                  <div className="mt-1 text-xs text-[#00ff00]/50">
                    {new Date(contribution.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(contribution.id)}
                    className="px-3 py-1 bg-[#00ff00] text-black rounded-md
                             hover:bg-[#00ff00]/90 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(contribution.id)}
                    className="px-3 py-1 border border-[#00ff00]/30 rounded-md
                             hover:bg-[#00ff00]/10 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
              
              <div className="font-mono border border-[#00ff00]/20 rounded-lg p-4">
                {contribution.text}
              </div>

              {contribution.themes?.length > 0 && (
                <div className="text-sm">
                  <span className="text-[#00ff00]/70">Themes: </span>
                  {contribution.themes.join(', ')}
                </div>
              )}
              
              {contribution.cultural_references?.length > 0 && (
                <div className="text-sm">
                  <span className="text-[#00ff00]/70">Cultural References: </span>
                  {contribution.cultural_references.join(', ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 