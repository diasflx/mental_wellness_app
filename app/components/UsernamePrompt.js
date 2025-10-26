'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function UsernamePrompt({ userId, onUsernameCreated }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(value);
    setError('');
  };

  const checkAvailability = async () => {
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (username.length > 20) {
      setError('Username must be 20 characters or less');
      return false;
    }

    setChecking(true);
    try {
      const { data, error: checkError } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (data) {
        setError('Username already taken. Please choose another.');
        return false;
      }
      return true;
    } catch (err) {
      // If error is "no rows", username is available
      if (err.code === 'PGRST116') {
        return true;
      }
      setError('Error checking availability');
      return false;
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isAvailable = await checkAvailability();
    if (!isAvailable) return;

    setCreating(true);
    try {
      console.log('Creating username for userId:', userId, 'username:', username);

      const { data, error: insertError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            username: username.toLowerCase()
          }
        ])
        .select();

      console.log('Insert result:', { data, error: insertError });

      if (insertError) {
        setError(`Failed to create username: ${insertError.message}`);
        console.error('Error creating username:', insertError);
        return;
      }

      console.log('Username created successfully!');
      onUsernameCreated();
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
      console.error('Exception:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Username</h2>
        <p className="text-gray-600 mb-6">
          To continue using the app, please create a unique username.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9]+"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lowercase letters and numbers only, 3-20 characters
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={checking || creating || username.length < 3}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : checking ? 'Checking...' : 'Create Username'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your username is used for internal tracking only and helps us provide you with a personalized experience.
        </p>
      </div>
    </div>
  );
}
