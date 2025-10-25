'use client';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import MoodTracker from './components/MoodTracker';
import BreathingExercise from './components/BreathingExercise';
import Journal from './components/Journal';
import UserProfile from './components/UserProfile';

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Mental Wellness Hub
              </h1>
              <p className="mt-2 text-gray-600">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'friend'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'mood', label: 'Mood Tracker', icon: '😊' },
              { id: 'breathing', label: 'Breathing', icon: '🌬️' },
              { id: 'journal', label: 'Journal', icon: '📝' },
              { id: 'profile', label: 'Profile', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Wellness Journey</h2>
              <p className="text-gray-600 text-lg mb-6">
                Take a moment for yourself. This is your safe space to track your mood, practice mindfulness,
                and reflect on your thoughts.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <button
                  onClick={() => setActiveTab('mood')}
                  className="bg-white border-2 border-gray-200 text-gray-800 p-6 rounded-lg hover:border-indigo-600 hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-2">😊</div>
                  <h3 className="font-bold text-xl mb-2">Track Your Mood</h3>
                  <p className="text-sm text-gray-600">Monitor how you&apos;re feeling throughout the day</p>
                </button>
                <button
                  onClick={() => setActiveTab('breathing')}
                  className="bg-white border-2 border-gray-200 text-gray-800 p-6 rounded-lg hover:border-indigo-600 hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-2">🌬️</div>
                  <h3 className="font-bold text-xl mb-2">Breathing Exercises</h3>
                  <p className="text-sm text-gray-600">Calm your mind with guided breathing</p>
                </button>
                <button
                  onClick={() => setActiveTab('journal')}
                  className="bg-white border-2 border-gray-200 text-gray-800 p-6 rounded-lg hover:border-indigo-600 hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-2">📝</div>
                  <h3 className="font-bold text-xl mb-2">Daily Journal</h3>
                  <p className="text-sm text-gray-600">Express your thoughts and feelings</p>
                </button>
              </div>
            </div>

            {/* Mental Health Resources */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Mental Health Resources</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">Crisis Support</h3>
                  <p className="text-gray-600 mb-2">National Suicide Prevention Lifeline</p>
                  <a href="tel:988" className="text-indigo-600 font-bold text-xl">988</a>
                  <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">Crisis Text Line</h3>
                  <p className="text-gray-600 mb-2">Text HOME to</p>
                  <a href="sms:741741" className="text-indigo-600 font-bold text-xl">741741</a>
                  <p className="text-sm text-gray-500 mt-2">Free, 24/7 support</p>
                </div>
              </div>
            </div>

            {/* Daily Tips */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Wellness Tips</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-2xl mr-3">💧</span>
                  <div>
                    <h3 className="font-semibold">Stay Hydrated</h3>
                    <p className="text-gray-600">Drink water throughout the day to support your mental clarity</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🚶</span>
                  <div>
                    <h3 className="font-semibold">Move Your Body</h3>
                    <p className="text-gray-600">Even a short walk can boost your mood</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">😴</span>
                  <div>
                    <h3 className="font-semibold">Prioritize Sleep</h3>
                    <p className="text-gray-600">Aim for 7-9 hours of quality sleep each night</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🤝</span>
                  <div>
                    <h3 className="font-semibold">Connect with Others</h3>
                    <p className="text-gray-600">Reach out to friends or family members</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'mood' && <MoodTracker />}
        {activeTab === 'breathing' && <BreathingExercise />}
        {activeTab === 'journal' && <Journal />}
        {activeTab === 'profile' && <UserProfile />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-gray-600">
          <p className="mb-2">Remember: You are not alone. Professional help is available.</p>
          <p className="text-sm">This website is for wellness support and is not a substitute for professional mental health care.</p>
        </div>
      </footer>
    </div>
  );
}
