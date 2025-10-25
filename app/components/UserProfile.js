'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function UserProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSymptoms: 0,
    totalSolutions: 0,
    joinDate: '',
    resolvedCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchUserStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user's symptoms
      const { data: symptoms, error: symptomsError } = await supabase
        .from('symptoms')
        .select('id, status')
        .eq('user_id', user.id);

      if (symptomsError) throw symptomsError;

      // Fetch user's solutions
      const { data: solutions, error: solutionsError } = await supabase
        .from('solutions')
        .select('id')
        .eq('user_id', user.id);

      if (solutionsError) throw solutionsError;

      const resolvedSymptoms = symptoms?.filter(s => s.status === 'resolved').length || 0;

      setStats({
        totalSymptoms: symptoms?.length || 0,
        totalSolutions: solutions?.length || 0,
        joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
        resolvedCount: resolvedSymptoms
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback to zero stats if there's an error
      setStats({
        totalSymptoms: 0,
        totalSolutions: 0,
        joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
        resolvedCount: 0
      });
    } finally {
      setLoading(false);
    }
  }, [user.id, user?.created_at]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-4xl text-white font-bold">
            {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800">
              {user?.user_metadata?.full_name || 'Welcome'}
            </h2>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-2">Member since {stats.joinDate}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">Loading your stats...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-sm p-6">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalSymptoms}</div>
            <div className="text-gray-600 text-sm">Symptom Posts</div>
          </div>
          <div className="bg-white border-2 border-purple-200 rounded-lg shadow-sm p-6">
            <div className="text-4xl mb-2">💡</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalSolutions}</div>
            <div className="text-gray-600 text-sm">Solutions Shared</div>
          </div>
          <div className="bg-white border-2 border-green-200 rounded-lg shadow-sm p-6">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-gray-900">{stats.resolvedCount}</div>
            <div className="text-gray-600 text-sm">Cases Resolved</div>
          </div>
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm p-6">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalSymptoms + stats.totalSolutions}</div>
            <div className="text-gray-600 text-sm">Total Contributions</div>
          </div>
        </div>
      )}

      {/* Community Activity */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Community Activity</h3>
        <div className="space-y-4">
          {stats.totalSymptoms > 0 && (
            <div className="flex items-start space-x-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <span className="text-2xl">🎉</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Great participation!</h4>
                <p className="text-gray-600 text-sm">You&apos;ve shared {stats.totalSymptoms} symptom {stats.totalSymptoms === 1 ? 'post' : 'posts'} with the community. Your experiences help others!</p>
              </div>
            </div>
          )}

          {stats.resolvedCount > 0 && (
            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-2xl">⭐</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Solutions found!</h4>
                <p className="text-gray-600 text-sm">You&apos;ve resolved {stats.resolvedCount} {stats.resolvedCount === 1 ? 'case' : 'cases'}. That&apos;s wonderful progress!</p>
              </div>
            </div>
          )}

          {stats.totalSolutions > 0 && (
            <div className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Helping others!</h4>
                <p className="text-gray-600 text-sm">You&apos;ve shared {stats.totalSolutions} {stats.totalSolutions === 1 ? 'solution' : 'solutions'}. Your insights are valuable to the community!</p>
              </div>
            </div>
          )}

          {stats.totalSymptoms === 0 && (
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-2xl">🌟</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Get started</h4>
                <p className="text-gray-600 text-sm">Share your first symptom post to connect with the community and find helpful solutions.</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-4 bg-pink-50 border border-pink-200 rounded-lg">
            <span className="text-2xl">🌱</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Health reminder</h4>
              <p className="text-gray-600 text-sm">Remember: This platform is for community support. Always consult healthcare professionals for medical advice.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Account Information</h3>
        <div className="space-y-3 text-gray-600">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium">Account Created</span>
            <span>{stats.joinDate}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium">Email Verified</span>
            <span className={user?.email_confirmed_at ? 'text-green-600' : 'text-orange-600'}>
              {user?.email_confirmed_at ? '✓ Verified' : '⚠ Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
