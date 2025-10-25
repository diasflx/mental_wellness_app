'use client';
import { useState, useEffect } from 'react';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const saveEntry = () => {
    if (!currentEntry.trim()) return;

    if (editingId) {
      // Update existing entry
      const updatedEntries = entries.map(entry =>
        entry.id === editingId
          ? { ...entry, title: title || 'Untitled', content: currentEntry, updatedAt: new Date().toISOString() }
          : entry
      );
      setEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setEditingId(null);
    } else {
      // Create new entry
      const newEntry = {
        id: Date.now(),
        title: title || 'Untitled',
        content: currentEntry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    }

    setCurrentEntry('');
    setTitle('');
  };

  const deleteEntry = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
  };

  const editEntry = (entry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setCurrentEntry(entry.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setCurrentEntry('');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const prompts = [
    "What are three things you're grateful for today?",
    "What challenged you today and how did you handle it?",
    "What made you smile today?",
    "What's something you learned about yourself recently?",
    "How are you really feeling right now?",
    "What do you need to let go of?",
    "What would you tell your past self?",
    "What are you looking forward to?"
  ];

  const [randomPrompt, setRandomPrompt] = useState('');

  useEffect(() => {
    setRandomPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNewPrompt = () => {
    setRandomPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  return (
    <div className="space-y-6">
      {/* Writing Area */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {editingId ? 'Edit Entry' : 'New Journal Entry'}
        </h2>

        {/* Journal Prompt */}
        <div className="bg-indigo-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-indigo-800 font-medium mb-1">Journal Prompt:</p>
              <p className="text-gray-700 italic">{randomPrompt}</p>
            </div>
            <button
              onClick={getNewPrompt}
              className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              � New
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your thoughts
            </label>
            <textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="Write your thoughts here... There's no right or wrong way to journal."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              rows="10"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={saveEntry}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your entries..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>
      )}

      {/* Stats */}
      {entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
              <div className="text-sm text-indigo-700 font-medium">Total Entries</div>
              <div className="text-3xl font-bold text-indigo-900">{entries.length}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">Words Written</div>
              <div className="text-3xl font-bold text-blue-900">
                {entries.reduce((acc, entry) => acc + entry.content.split(' ').length, 0)}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
              <div className="text-sm text-purple-700 font-medium">This Week</div>
              <div className="text-3xl font-bold text-purple-900">
                {entries.filter(entry => {
                  const entryDate = new Date(entry.createdAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return entryDate > weekAgo;
                }).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past Entries */}
      {filteredEntries.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Past Entries</h3>
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{entry.title}</h4>
                    <p className="text-sm text-gray-500">{formatDate(entry.createdAt)}</p>
                    {entry.updatedAt !== entry.createdAt && (
                      <p className="text-xs text-gray-400">Edited: {formatDate(entry.updatedAt)}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editEntry(entry)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">Start Your Journaling Journey</h3>
          <p className="text-gray-600">
            Begin by writing your first entry above. Journaling can help you process emotions,
            track your progress, and gain insights into your mental health.
          </p>
        </div>
      )}
    </div>
  );
}
