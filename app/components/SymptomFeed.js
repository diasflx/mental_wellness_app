'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SimilarSymptoms from './SimilarSymptoms';
import PostDetails from './PostDetails';

export default function SymptomFeed({ refreshTrigger }) {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, my_posts, open, resolved
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [selectedSymptomForSimilar, setSelectedSymptomForSimilar] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // ID of symptom to delete
  const [deleting, setDeleting] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchSymptoms = useCallback(async (force = false) => {
    // Simple cache: only refetch if forced or more than 30 seconds have passed
    const now = Date.now();
    if (!force && symptoms.length > 0 && (now - lastFetch) < 30000) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('symptoms')
        .select(`
          *,
          solutions (
            id,
            solution_text,
            created_at,
            solution_votes (
              vote_type
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (filter === 'my_posts') {
        query = query.eq('user_id', user.id);
      } else if (filter === 'open') {
        query = query.eq('status', 'open');
      } else if (filter === 'resolved') {
        query = query.eq('status', 'resolved');
      }

      const { data, error } = await query;

      if (error) throw error;

      setSymptoms(data || []);
      setLastFetch(now);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, user.id, symptoms.length, lastFetch]);

  useEffect(() => {
    // Force fetch when filter or refreshTrigger changes
    fetchSymptoms(true);
  }, [filter, refreshTrigger]);

  const getStatusBadge = (status) => {
    const styles = {
      open: { bg: '#EEF2FF', color: '#6366F1' },
      resolved: { bg: '#D1FAE5', color: '#059669' },
      see_specialist: { bg: '#FEF3C7', color: '#D97706' }
    };

    const labels = {
      open: 'Open',
      resolved: 'Resolved',
      see_specialist: 'See Specialist'
    };

    return (
      <span
        style={{
          background: styles[status].bg,
          color: styles[status].color,
          fontFamily: 'Rubik',
          fontWeight: 500,
          fontSize: '13px',
          padding: '4px 12px',
          borderRadius: '12px'
        }}
      >
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async (symptomId) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', symptomId)
        .eq('user_id', user.id); // Ensure only owner can delete

      if (error) throw error;

      // Remove from local state
      setSymptoms(symptoms.filter(s => s.id !== symptomId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting symptom:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading symptom posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Posts' },
          { id: 'my_posts', label: 'My Posts' },
          { id: 'open', label: 'Open' },
          { id: 'resolved', label: 'Resolved' }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            style={{
              background: filter === filterOption.id ? 'var(--primary)' : 'var(--card-bg)',
              color: filter === filterOption.id ? 'white' : 'var(--foreground)',
              border: filter === filterOption.id ? 'none' : '1px solid var(--border)',
              fontFamily: 'Rubik',
              fontWeight: 500,
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: filter === filterOption.id ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
            }}
            className="transition-all hover:opacity-90"
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Symptom Cards */}
      {symptoms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">No symptom posts found.</p>
          <p className="text-gray-500 text-sm mt-2">
            {filter === 'my_posts'
              ? 'You haven\'t posted any symptoms yet.'
              : 'Be the first to share your symptoms!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {symptoms.map((symptom) => (
            <div
              key={symptom.id}
              onClick={() => setSelectedSymptom(symptom)}
              className="card-hover cursor-pointer"
              style={{
                background: 'var(--card-bg)',
                borderRadius: '8px',
                padding: '20px 24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                border: '1px solid var(--border)',
                borderLeft: symptom.status === 'resolved' ? '3px solid var(--success)' : symptom.status === 'open' ? '3px solid var(--primary)' : '3px solid var(--warning)'
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 style={{fontFamily: 'Rubik', fontWeight: 600, fontSize: '20px', color: 'var(--foreground)', letterSpacing: '-0.01em'}} className="flex-1">{symptom.title}</h3>
                {getStatusBadge(symptom.status)}
              </div>

              <p style={{fontFamily: 'Rubik', fontSize: '16px', lineHeight: '1.6', color: 'var(--muted)'}} className="mb-4 line-clamp-3">{symptom.description}</p>

              {/* Solution Preview */}
              {symptom.solutions && symptom.solutions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800 font-semibold mb-1">Solution Found:</p>
                  <p className="text-sm text-green-700 line-clamp-2 mb-2">
                    {symptom.solutions[0].solution_text}
                  </p>
                  {/* Vote counts */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-green-700">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      <span>{symptom.solutions[0].solution_votes?.filter(v => v.vote_type === 'like').length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-700">
                      <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      <span>{symptom.solutions[0].solution_votes?.filter(v => v.vote_type === 'dislike').length || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center" style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)'}}>
                <span style={{fontFamily: 'Rubik', fontSize: '13px', color: 'var(--muted)'}}>{formatDate(symptom.created_at)}</span>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSymptomForSimilar(symptom);
                    }}
                    style={{
                      color: 'var(--primary)',
                      fontFamily: 'Rubik',
                      fontWeight: 500,
                      fontSize: '14px'
                    }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    View Similar Cases →
                  </button>
                  {symptom.user_id === user.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(symptom.id);
                      }}
                      style={{
                        color: 'var(--error)',
                        fontFamily: 'Rubik',
                        fontWeight: 500,
                        fontSize: '14px'
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Details Modal - Clicking on card */}
      {selectedSymptom && (
        <PostDetails
          symptom={selectedSymptom}
          onClose={() => setSelectedSymptom(null)}
          onRefresh={() => fetchSymptoms(true)}
        />
      )}

      {/* Similar Symptoms Modal - Clicking "View Similar Cases" button */}
      {selectedSymptomForSimilar && (
        <SimilarSymptoms
          symptom={selectedSymptomForSimilar}
          onClose={() => setSelectedSymptomForSimilar(null)}
          onRefresh={() => fetchSymptoms(true)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Post?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this symptom post? This action cannot be undone and will also delete any associated solutions and comments.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
