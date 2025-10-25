'use client';
import { useState, useEffect } from 'react';

export default function MoodTracker() {
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');

  const moodOptions = [
    { emoji: '�', label: 'Great', value: 5, color: 'bg-green-500' },
    { emoji: '�', label: 'Good', value: 4, color: 'bg-blue-500' },
    { emoji: '�', label: 'Okay', value: 3, color: 'bg-yellow-500' },
    { emoji: '�', label: 'Not Good', value: 2, color: 'bg-orange-500' },
    { emoji: '�', label: 'Bad', value: 1, color: 'bg-red-500' }
  ];

  useEffect(() => {
    const savedMoods = localStorage.getItem('moods');
    if (savedMoods) {
      setMoods(JSON.parse(savedMoods));
    }
  }, []);

  const saveMood = () => {
    if (!selectedMood) return;

    const newMood = {
      ...selectedMood,
      note,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    const updatedMoods = [newMood, ...moods];
    setMoods(updatedMoods);
    localStorage.setItem('moods', JSON.stringify(updatedMoods));
    setSelectedMood(null);
    setNote('');
  };

  const deleteMood = (id) => {
    const updatedMoods = moods.filter(mood => mood.id !== id);
    setMoods(updatedMoods);
    localStorage.setItem('moods', JSON.stringify(updatedMoods));
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAverageMood = () => {
    if (moods.length === 0) return 0;
    const sum = moods.reduce((acc, mood) => acc + mood.value, 0);
    return (sum / moods.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Mood Selection */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How are you feeling today?</h2>
        <div className="grid grid-cols-5 gap-4 mb-6">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood)}
              className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedMood?.value === mood.value
                  ? 'border-indigo-600 bg-indigo-50 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-5xl mb-2">{mood.emoji}</div>
              <div className="text-sm font-semibold text-gray-700">{mood.label}</div>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                rows="3"
              />
            </div>
            <button
              onClick={saveMood}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Save Mood Entry
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {moods.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Mood Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
              <div className="text-sm text-indigo-700 font-medium">Total Entries</div>
              <div className="text-3xl font-bold text-indigo-900">{moods.length}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">Average Mood</div>
              <div className="text-3xl font-bold text-blue-900">{getAverageMood()}/5</div>
            </div>
          </div>
        </div>
      )}

      {/* Mood History */}
      {moods.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Mood History</h3>
          <div className="space-y-3">
            {moods.map((mood) => (
              <div
                key={mood.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">{mood.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">{mood.label}</span>
                      <span className="text-sm text-gray-500">{formatDate(mood.timestamp)}</span>
                    </div>
                    {mood.note && (
                      <p className="text-gray-600 mt-1">{mood.note}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMood(mood.id)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
