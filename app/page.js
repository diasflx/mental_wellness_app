'use client';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import SymptomPost from './components/SymptomPost';
import SymptomFeed from './components/SymptomFeed';
import UserProfile from './components/UserProfile';
import UsernamePrompt from './components/UsernamePrompt';

export default function Home() {
  const { user, username, loading, hasUsername, signOut, handleUsernameCreated } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background)'}}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold" style={{color: 'var(--foreground)', fontFamily: 'Rubik'}}>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Show username prompt if user doesn't have a username
  if (!hasUsername && user?.email !== 'demo@localhost.dev') {
    return <UsernamePrompt userId={user.id} onUsernameCreated={handleUsernameCreated} />;
  }

  const isDemoUser = user?.email === 'demo@localhost.dev';

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      {/* Demo Mode Warning */}
      {isDemoUser && (
        <div style={{background: '#FEF3C7', borderBottom: '2px solid var(--warning)'}} className="px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <span style={{color: '#92400E', fontFamily: 'Rubik', fontWeight: 500, fontSize: '14px'}}>
              Demo Mode: Limited functionality. Posts and data won&apos;t be saved. Sign up for full access!
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{background: 'var(--card-bg)', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)'}}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 style={{fontFamily: 'Rubik', fontWeight: 600, fontSize: '28px', color: 'var(--foreground)', letterSpacing: '-0.02em'}}>
                Symptm
              </h1>
              <p style={{marginTop: '6px', color: 'var(--muted)', fontFamily: 'Rubik', fontSize: '14px'}}>
                Welcome back, {username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'friend'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p style={{fontSize: '13px', color: 'var(--muted)', fontFamily: 'Rubik'}}>{user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  fontFamily: 'Rubik',
                  fontWeight: 500,
                  fontSize: '14px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                className="hover:opacity-90 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{background: 'var(--card-bg)', borderBottom: '1px solid var(--border)'}} className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'home', label: 'Home' },
              { id: 'post', label: 'Post Symptoms' },
              { id: 'feed', label: 'Community Feed' },
              { id: 'profile', label: 'Profile' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                  fontFamily: 'Rubik',
                  fontWeight: 500,
                  fontSize: '15px',
                  transition: 'all 0.2s'
                }}
                className="hover:opacity-80"
              >
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
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Symptm</h2>
              <p className="text-gray-600 text-lg mb-6">
                Share your symptoms, find similar cases, and discover solutions from the community.
                Our AI-powered matching helps connect you with others who have experienced similar health concerns.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setActiveTab('post')}
                  className="bg-white border-2 border-gray-200 text-gray-800 p-6 rounded-lg hover:border-indigo-600 hover:shadow-lg transition-all"
                >
                  <h3 className="font-bold text-xl mb-2">Post Your Symptoms</h3>
                  <p className="text-sm text-gray-600">Share what you&apos;re experiencing and get matched with similar cases</p>
                </button>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="bg-white border-2 border-gray-200 text-gray-800 p-6 rounded-lg hover:border-indigo-600 hover:shadow-lg transition-all"
                >
                  <h3 className="font-bold text-xl mb-2">Browse Community</h3>
                  <p className="text-sm text-gray-600">Explore symptoms and solutions shared by others</p>
                </button>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">1️⃣</div>
                  <h3 className="font-bold text-lg mb-2">Post Symptoms</h3>
                  <p className="text-gray-600 text-sm">
                    Describe your symptoms in detail. Our AI extracts key information.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">2️⃣</div>
                  <h3 className="font-bold text-lg mb-2">Get Matches</h3>
                  <p className="text-gray-600 text-sm">
                    AI matches your symptoms with similar cases from the community.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">3️⃣</div>
                  <h3 className="font-bold text-lg mb-2">Find Solutions</h3>
                  <p className="text-gray-600 text-sm">
                    Review solutions that worked for others or consult a specialist.
                  </p>
                </div>
              </div>
            </div>

            {/* Health Resources */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Emergency Health Resources</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">Emergency Services</h3>
                  <p className="text-gray-600 mb-2">For life-threatening emergencies</p>
                  <a href="tel:911" className="text-red-600 font-bold text-xl">911</a>
                  <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">Poison Control</h3>
                  <p className="text-gray-600 mb-2">For poisoning emergencies</p>
                  <a href="tel:1-800-222-1222" className="text-indigo-600 font-bold text-xl">1-800-222-1222</a>
                  <p className="text-sm text-gray-500 mt-2">Free, confidential support</p>
                </div>
              </div>
            </div>

            {/* Important Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-yellow-900 mb-2 flex items-center">
                <span className="mr-2">⚠️</span>
                Important Medical Disclaimer
              </h3>
              <p className="text-sm text-yellow-800">
                This platform is designed for sharing experiences and finding community support.
                It is NOT a substitute for professional medical advice, diagnosis, or treatment.
                Always consult with qualified healthcare providers for medical concerns.
                If you are experiencing a medical emergency, call 911 immediately.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'post' && (
          <SymptomPost
            onPostCreated={() => {
              setRefreshTrigger(prev => prev + 1);
              setActiveTab('feed');
            }}
          />
        )}
        {activeTab === 'feed' && <SymptomFeed refreshTrigger={refreshTrigger} />}
        {activeTab === 'profile' && <UserProfile />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-gray-600">
          <p className="mb-2">Remember: This platform is for community support and information sharing.</p>
          <p className="text-sm">Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment.</p>
        </div>
      </footer>
    </div>
  );
}
