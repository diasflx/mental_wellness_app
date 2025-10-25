'use client';
import { useState, useEffect, useRef } from 'react';

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
  const [count, setCount] = useState(4);
  const [duration, setDuration] = useState({ inhale: 4, hold: 4, exhale: 4 });
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount <= 1) {
            // Move to next phase
            setPhase((prevPhase) => {
              if (prevPhase === 'inhale') {
                return 'hold';
              } else if (prevPhase === 'hold') {
                return 'exhale';
              } else {
                setCycles((prev) => prev + 1);
                return 'inhale';
              }
            });
            return phase === 'inhale' ? duration.hold :
                   phase === 'hold' ? duration.exhale : duration.inhale;
          }
          return prevCount - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase, duration]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setCount(duration.inhale);
    setCycles(0);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(duration.inhale);
  };

  const resetExercise = () => {
    stopExercise();
    setCycles(0);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 to-blue-600';
      case 'hold':
        return 'from-purple-400 to-purple-600';
      case 'exhale':
        return 'from-pink-400 to-pink-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Breathe In';
    }
  };

  const getCircleSize = () => {
    if (!isActive) return 'scale-100';
    switch (phase) {
      case 'inhale':
        return 'scale-125';
      case 'hold':
        return 'scale-125';
      case 'exhale':
        return 'scale-75';
      default:
        return 'scale-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breathing Circle */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Breathing Exercise</h2>

        {/* Main Circle */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div
            className={`w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()}
              flex flex-col items-center justify-center transition-all duration-1000 ${getCircleSize()}
              shadow-2xl`}
          >
            <div className="text-white text-center">
              <div className="text-6xl font-bold mb-2">{count}</div>
              <div className="text-2xl font-semibold">{getPhaseText()}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <button
              onClick={startExercise}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Start Exercise
            </button>
          ) : (
            <>
              <button
                onClick={stopExercise}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Pause
              </button>
              <button
                onClick={resetExercise}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-gradient-to-br from-purple-100 to-purple-200 px-6 py-3 rounded-lg">
            <span className="text-purple-800 font-medium">Completed Cycles: </span>
            <span className="text-purple-900 font-bold text-xl">{cycles}</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Customize Your Breathing</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inhale Duration (seconds)
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={duration.inhale}
              onChange={(e) => setDuration({ ...duration, inhale: parseInt(e.target.value) })}
              disabled={isActive}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hold Duration (seconds)
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={duration.hold}
              onChange={(e) => setDuration({ ...duration, hold: parseInt(e.target.value) })}
              disabled={isActive}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exhale Duration (seconds)
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={duration.exhale}
              onChange={(e) => setDuration({ ...duration, exhale: parseInt(e.target.value) })}
              disabled={isActive}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Benefits of Breathing Exercises</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-2xl mr-3">�</span>
            <div>
              <h4 className="font-semibold">Reduces Stress & Anxiety</h4>
              <p className="text-gray-600">Activates the parasympathetic nervous system</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">❤</span>
            <div>
              <h4 className="font-semibold">Improves Heart Health</h4>
              <p className="text-gray-600">Helps lower blood pressure and heart rate</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">�</span>
            <div>
              <h4 className="font-semibold">Enhances Focus</h4>
              <p className="text-gray-600">Increases oxygen flow to the brain</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">�</span>
            <div>
              <h4 className="font-semibold">Better Sleep</h4>
              <p className="text-gray-600">Promotes relaxation and prepares body for rest</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
