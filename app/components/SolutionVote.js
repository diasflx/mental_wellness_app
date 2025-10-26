'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SolutionVote({ solutionId }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null); // null, 'like', or 'dislike'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solutionId, user]);

  const fetchVotes = async () => {
    try {
      // Fetch all votes for this solution
      const { data: votes, error } = await supabase
        .from('solution_votes')
        .select('vote_type, user_id')
        .eq('solution_id', solutionId);

      if (error) throw error;

      // Count likes and dislikes
      const likeCount = votes?.filter(v => v.vote_type === 'like').length || 0;
      const dislikeCount = votes?.filter(v => v.vote_type === 'dislike').length || 0;

      setLikes(likeCount);
      setDislikes(dislikeCount);

      // Check if current user has voted
      if (user) {
        const userVoteRecord = votes?.find(v => v.user_id === user.id);
        setUserVote(userVoteRecord?.vote_type || null);
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    try {
      // If clicking the same vote type, remove the vote
      if (userVote === voteType) {
        const { error } = await supabase
          .from('solution_votes')
          .delete()
          .eq('solution_id', solutionId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        if (voteType === 'like') {
          setLikes(likes - 1);
        } else {
          setDislikes(dislikes - 1);
        }
        setUserVote(null);
      } else {
        // If user already voted differently, update the vote
        if (userVote) {
          const { error } = await supabase
            .from('solution_votes')
            .update({ vote_type: voteType })
            .eq('solution_id', solutionId)
            .eq('user_id', user.id);

          if (error) throw error;

          // Update local state
          if (userVote === 'like') {
            setLikes(likes - 1);
            setDislikes(dislikes + 1);
          } else {
            setLikes(likes + 1);
            setDislikes(dislikes - 1);
          }
        } else {
          // Insert new vote
          const { error } = await supabase
            .from('solution_votes')
            .insert([
              {
                solution_id: solutionId,
                user_id: user.id,
                vote_type: voteType
              }
            ]);

          if (error) throw error;

          // Update local state
          if (voteType === 'like') {
            setLikes(likes + 1);
          } else {
            setDislikes(dislikes + 1);
          }
        }
        setUserVote(voteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="text-gray-400">Loading votes...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Like Button */}
      <button
        onClick={() => handleVote('like')}
        className={`flex items-center gap-1.5 transition-colors ${
          userVote === 'like'
            ? 'text-green-600'
            : 'text-gray-400 hover:text-green-600'
        }`}
        title="Like this solution"
      >
        <svg
          className="w-5 h-5"
          fill={userVote === 'like' ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
          />
        </svg>
        <span className="font-medium">{likes}</span>
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => handleVote('dislike')}
        className={`flex items-center gap-1.5 transition-colors ${
          userVote === 'dislike'
            ? 'text-red-600'
            : 'text-gray-400 hover:text-red-600'
        }`}
        title="Dislike this solution"
      >
        <svg
          className="w-5 h-5 rotate-180"
          fill={userVote === 'dislike' ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
          />
        </svg>
        <span className="font-medium">{dislikes}</span>
      </button>
    </div>
  );
}
