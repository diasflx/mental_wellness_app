'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SimilarSymptoms from './SimilarSymptoms';
import SolutionVote from './SolutionVote';

export default function PostDetails({ symptom, onClose, onRefresh }) {
  const { user } = useAuth();
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [solutionText, setSolutionText] = useState('');
  const [resolving, setResolving] = useState(false);
  const [showSimilarCases, setShowSimilarCases] = useState(false);
  const isOwnPost = symptom.user_id === user.id;

  const handleResolve = async (withSpecialist = false) => {
    if (!withSpecialist && !solutionText.trim()) {
      alert('Please enter a solution description');
      return;
    }

    setResolving(true);
    try {
      // Update symptom status
      const { error: updateError } = await supabase
        .from('symptoms')
        .update({
          status: withSpecialist ? 'see_specialist' : 'resolved'
        })
        .eq('id', symptom.id);

      if (updateError) throw updateError;

      // If resolved with solution, add solution
      if (!withSpecialist && solutionText.trim()) {
        const { error: solutionError } = await supabase
          .from('solutions')
          .insert([
            {
              symptom_id: symptom.id,
              user_id: user.id,
              solution_text: solutionText
            }
          ]);

        if (solutionError) throw solutionError;
      }

      // Refresh and close
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Error resolving symptom:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setResolving(false);
    }
  };

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
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{symptom.title}</h2>
              {getStatusBadge(symptom.status)}
            </div>
            <p className="text-sm text-gray-500">{formatDate(symptom.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{symptom.description}</p>
          </div>

          {/* Solutions */}
          {symptom.solutions && symptom.solutions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Solutions</h3>
              <div className="space-y-3">
                {symptom.solutions.map((solution) => (
                  <div key={solution.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 whitespace-pre-line">{solution.solution_text}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-600">
                        {formatDate(solution.created_at)}
                      </p>
                      <SolutionVote solutionId={solution.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {symptom.status === 'see_specialist' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Status:</strong> This user consulted with a healthcare specialist for this symptom.
              </p>
            </div>
          )}

          {/* View Similar Cases Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowSimilarCases(true)}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              View Similar Cases →
            </button>
          </div>

          {/* Resolution Section - Only for own posts */}
          {isOwnPost && symptom.status === 'open' && (
            <div className="border-t border-gray-200 pt-6">
              {!showResolveForm ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Have you found a solution?
                  </h3>
                  <button
                    onClick={() => setShowResolveForm(true)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Mark as Resolved with Solution
                  </button>
                  <button
                    onClick={() => handleResolve(true)}
                    disabled={resolving}
                    className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50"
                  >
                    I Consulted a Specialist
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    Share Your Solution
                  </h3>
                  <p className="text-sm text-gray-600">
                    Help others with similar symptoms by sharing what worked for you.
                  </p>
                  <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Describe what helped resolve your symptoms..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(false)}
                      disabled={resolving}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {resolving ? 'Saving...' : 'Save Solution'}
                    </button>
                    <button
                      onClick={() => setShowResolveForm(false)}
                      className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Medical Disclaimer:</strong> The information provided here is for
              informational purposes only and is not a substitute for professional medical
              advice, diagnosis, or treatment. Always seek the advice of your physician or
              other qualified health provider with any questions you may have regarding a
              medical condition.
            </p>
          </div>
        </div>
      </div>

      {/* Similar Symptoms Modal - Only shown when button is clicked */}
      {showSimilarCases && (
        <SimilarSymptoms
          symptom={symptom}
          onClose={() => setShowSimilarCases(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
