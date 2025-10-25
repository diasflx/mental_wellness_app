'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SimilarSymptoms({ symptom, onClose, onRefresh }) {
  const { user } = useAuth();
  const [similarCases, setSimilarCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [solutionText, setSolutionText] = useState('');
  const [resolving, setResolving] = useState(false);
  const isOwnPost = symptom.user_id === user.id;

  // Define AI suggestions function first
  const fetchAiSuggestions = useCallback(async (cases) => {
    try {
      const response = await fetch('/api/generate-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptom.description,
          similarCases: cases.filter(c => c.solutions && c.solutions.length > 0)
        })
      });

      if (!response.ok) {
        console.error('Failed to generate suggestions:', response.status);
        return;
      }

      const data = await response.json();
      setAiSuggestions(data.suggestions || '');
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    }
  }, [symptom.description]);

  // Fetch similar cases and then AI suggestions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch ALL symptoms except the current one (bidirectional - includes both older and newer posts)
        const { data, error } = await supabase
          .from('symptoms')
          .select(`
            *,
            solutions (
              id,
              solution_text,
              created_at
            )
          `)
          .neq('id', symptom.id)
          .order('created_at', { ascending: false }); // Get all, ordered by newest first

        if (error) throw error;

        console.log(`Fetched ${data?.length || 0} symptoms to compare against`);

        // Call API endpoint to use AI-powered matching
        const response = await fetch('/api/match-symptoms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentSymptom: symptom,
            allSymptoms: data || []
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to match symptoms');
        }

        const { matches } = await response.json();
        console.log(`Received ${matches?.length || 0} matches from AI`);

        setSimilarCases(matches || []);

        // Fetch AI suggestions after getting matches
        fetchAiSuggestions(matches || []);
      } catch (error) {
        console.error('Error fetching similar cases:', error);
        setSimilarCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symptom, fetchAiSuggestions]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{symptom.title}</h2>
            <p className="text-gray-600 text-sm">{symptom.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Suggestions */}
          {aiSuggestions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center">
                <span className="mr-2">🤖</span>
                AI-Generated Suggestions
              </h3>
              <div className="text-sm text-blue-800 whitespace-pre-line">
                {aiSuggestions}
              </div>
            </div>
          )}

          {/* Similar Cases */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Similar Cases ({similarCases.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-gray-600">Finding similar cases...</p>
              </div>
            ) : similarCases.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-gray-600">No similar cases found yet.</p>
                <p className="text-gray-500 text-sm mt-1">
                  You might be the first with these symptoms!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {similarCases.map((similar) => (
                  <div
                    key={similar.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{similar.title}</h4>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-semibold">
                        {Math.round(similar.similarityScore * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {similar.description}
                    </p>

                    {/* AI Match Reasoning */}
                    {similar.matchReasoning && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                        <p className="text-xs font-semibold text-blue-800 mb-1">
                          Why this matches:
                        </p>
                        <p className="text-xs text-blue-700">
                          {similar.matchReasoning}
                        </p>
                      </div>
                    )}

                    {/* Solution if available */}
                    {similar.solutions && similar.solutions.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                        <p className="text-xs font-semibold text-green-800 mb-1">
                          Solution:
                        </p>
                        <p className="text-xs text-green-700">
                          {similar.solutions[0].solution_text}
                        </p>
                      </div>
                    )}

                    {similar.status === 'see_specialist' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                        <p className="text-xs text-yellow-800">
                          This user consulted with a specialist
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                    ✅ Mark as Resolved with Solution
                  </button>
                  <button
                    onClick={() => handleResolve(true)}
                    disabled={resolving}
                    className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50"
                  >
                    👨‍⚕️ I Consulted a Specialist
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
    </div>
  );
}
