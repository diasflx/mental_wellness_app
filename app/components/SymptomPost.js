'use client';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function SymptomPost({ onPostCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isDemoUser = user?.email === 'demo@localhost.dev';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Extract keywords using Gemini API
      const response = await fetch('/api/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      const { keywords } = await response.json();

      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('symptoms')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            symptoms_keywords: keywords,
            status: 'open'
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      setTitle('');
      setDescription('');

      // Notify parent component
      if (onPostCreated) {
        onPostCreated(data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Post Your Symptoms</h2>
      <p className="text-gray-600 mb-6">
        Share your symptoms to get matched with similar cases and find solutions from the community.
      </p>

      {isDemoUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Demo Mode Limitation: You cannot post symptoms in demo mode. Please sign up for a real account to share posts and access the full community.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary (e.g., 'Persistent headache for 3 days')"
            required
            maxLength={200}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your symptoms in detail: what you're experiencing, when it started, severity, any patterns you've noticed..."
            required
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Be as detailed as possible to help us find similar cases
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Your symptom post has been created successfully! We&apos;re finding similar cases...
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isDemoUser}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDemoUser ? 'Sign Up Required' : loading ? 'Posting...' : 'Post Symptoms'}
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> This platform is for sharing experiences and finding similar cases.
            It is not a substitute for professional medical advice. Always consult with a healthcare
            provider for medical concerns.
          </p>
        </div>
      </form>
    </div>
  );
}
