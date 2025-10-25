'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SimilarSymptoms from './SimilarSymptoms';

export default function SymptomFeed({ refreshTrigger }) {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, my_posts, open, resolved
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // ID of symptom to delete
  const [deleting, setDeleting] = useState(false);

  const fetchSymptoms = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('symptoms')
        .select(`
          *,
          solutions (
            id,
            solution_text,
            created_at
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
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, user.id]);

  useEffect(() => {
    fetchSymptoms();
  }, [filter, refreshTrigger, fetchSymptoms]);

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      see_specialist: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
      open: 'Open',
      resolved: 'Resolved',
      see_specialist: 'See Specialist'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
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
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-gray-600">Loading symptom posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Posts', icon: '📋' },
          { id: 'my_posts', label: 'My Posts', icon: '👤' },
          { id: 'open', label: 'Open', icon: '🔓' },
          { id: 'resolved', label: 'Resolved', icon: '✅' }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === filterOption.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{filterOption.icon}</span>
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Symptom Cards */}
      {symptoms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
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
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800 flex-1">{symptom.title}</h3>
                {getStatusBadge(symptom.status)}
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">{symptom.description}</p>

              {/* Solution Preview */}
              {symptom.solutions && symptom.solutions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800 font-semibold mb-1">Solution Found:</p>
                  <p className="text-sm text-green-700 line-clamp-2">
                    {symptom.solutions[0].solution_text}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{formatDate(symptom.created_at)}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedSymptom(symptom)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View Similar Cases →
                  </button>
                  {symptom.user_id === user.id && (
                    <button
                      onClick={() => setDeleteConfirm(symptom.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
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

      {/* Similar Symptoms Modal */}
      {selectedSymptom && (
        <SimilarSymptoms
          symptom={selectedSymptom}
          onClose={() => setSelectedSymptom(null)}
          onRefresh={fetchSymptoms}
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
