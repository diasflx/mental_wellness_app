'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMoods: 0,
    totalEntries: 0,
    joinDate: '',
    streak: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');

    // Calculate streak (days with entries in the last week)
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentDates = new Set();
    [...moods, ...entries].forEach(item => {
      const itemDate = new Date(item.timestamp || item.createdAt);
      if (itemDate > weekAgo) {
        recentDates.add(itemDate.toDateString());
      }
    });

    setStats({
      totalMoods: moods.length,
      totalEntries: entries.length,
      joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
      streak: recentDates.size
    });
  }, [user]);

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
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-sm p-6">
          <div className="text-4xl mb-2">😊</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalMoods}</div>
          <div className="text-gray-600 text-sm">Mood Entries</div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg shadow-sm p-6">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalEntries}</div>
          <div className="text-gray-600 text-sm">Journal Entries</div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm p-6">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-gray-900">{stats.streak}</div>
          <div className="text-gray-600 text-sm">Day Streak</div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg shadow-sm p-6">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalMoods + stats.totalEntries}</div>
          <div className="text-gray-600 text-sm">Total Activities</div>
        </div>
      </div>

      {/* Wellness Tips */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Wellness Journey</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <span className="text-2xl">🎉</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Keep it up!</h4>
              <p className="text-gray-600 text-sm">You've logged {stats.totalMoods + stats.totalEntries} activities. Consistency is key to understanding your mental health patterns.</p>
            </div>
          </div>

          {stats.streak >= 3 && (
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <span className="text-2xl">⭐</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Great streak!</h4>
                <p className="text-gray-600 text-sm">You've been active for {stats.streak} days this week. You're building a healthy habit!</p>
              </div>
            </div>
          )}

          {stats.totalEntries < 3 && (
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">Try journaling</h4>
                <p className="text-gray-600 text-sm">Writing down your thoughts can help you process emotions and gain clarity.</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-4 bg-pink-50 rounded-lg">
            <span className="text-2xl">🌱</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Self-care reminder</h4>
              <p className="text-gray-600 text-sm">Remember to take breaks, stay hydrated, and be kind to yourself today.</p>
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
