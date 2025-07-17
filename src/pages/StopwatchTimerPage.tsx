import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, Plus, X, Flag, Clock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface LapTime {
  lapNumber: number;
  lapTime: number;
  totalTime: number;
  timestamp: Date;
}

interface TimerSession {
  id: string;
  name: string;
  duration: number;
  timeLeft: number;
  isActive: boolean;
  createdAt: Date;
  completedAt?: Date;
}

interface StopwatchSession {
  id: string;
  name: string;
  totalTime: number;
  laps: LapTime[];
  createdAt: Date;
  completedAt?: Date;
}

const StopwatchTimerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'timer'>('stopwatch');
  
  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<LapTime[]>([]);
  
  // Timer state
  const [timers, setTimers] = useState<TimerSession[]>([]);
  const [showAddTimer, setShowAddTimer] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerHours, setNewTimerHours] = useState(0);
  const [newTimerMinutes, setNewTimerMinutes] = useState(5);
  const [newTimerSeconds, setNewTimerSeconds] = useState(0);
  
  // Storage
  const [stopwatchHistory, setStopwatchHistory] = useLocalStorage<StopwatchSession[]>(
    STORAGE_KEYS.stopwatchHistory, 
    []
  );
  const [timerHistory, setTimerHistory] = useLocalStorage<TimerSession[]>(
    STORAGE_KEYS.timerHistory, 
    []
  );
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>(
    STORAGE_KEYS.timerSoundEnabled, 
    true
  );

  const { showSuccess, showInfo, showError } = useToast();
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.7;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stopwatch logic
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(time => time + 10); // Update every 10ms for precision
      }, 10);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    }

    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isStopwatchRunning]);

  // Timer logic
  useEffect(() => {
    timers.forEach(timer => {
      if (timer.isActive && timer.timeLeft > 0) {
        if (!timerIntervalsRef.current.has(timer.id)) {
          const interval = setInterval(() => {
            setTimers(prev => prev.map(t => {
              if (t.id === timer.id) {
                const newTimeLeft = Math.max(0, t.timeLeft - 1);
                if (newTimeLeft === 0) {
                  handleTimerComplete(t);
                }
                return { ...t, timeLeft: newTimeLeft };
              }
              return t;
            }));
          }, 1000);
          timerIntervalsRef.current.set(timer.id, interval);
        }
      } else {
        const interval = timerIntervalsRef.current.get(timer.id);
        if (interval) {
          clearInterval(interval);
          timerIntervalsRef.current.delete(timer.id);
        }
      }
    });

    // Cleanup intervals for removed timers
    timerIntervalsRef.current.forEach((interval, id) => {
      if (!timers.find(t => t.id === id)) {
        clearInterval(interval);
        timerIntervalsRef.current.delete(id);
      }
    });

    return () => {
      timerIntervalsRef.current.forEach(interval => clearInterval(interval));
      timerIntervalsRef.current.clear();
    };
  }, [timers]);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      // Create a notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    }
  }, [soundEnabled]);

  const handleTimerComplete = useCallback((timer: TimerSession) => {
    playNotificationSound();
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Timer Complete: ${timer.name}`, {
        body: `${timer.name} timer has finished!`,
        icon: '/favicon.svg'
      });
    }
    
    // Update timer state
    setTimers(prev => prev.map(t => 
      t.id === timer.id 
        ? { ...t, isActive: false, completedAt: new Date() }
        : t
    ));
    
    // Save to history
    setTimerHistory(prev => [{
      ...timer,
      completedAt: new Date(),
      isActive: false
    }, ...prev.slice(0, 49)]);
    
    showSuccess(`Timer "${timer.name}" completed!`);
    trackToolUsage('stopwatch-timer', 'timer-complete', { duration: timer.duration });
  }, [playNotificationSound, showSuccess, setTimerHistory]);

  // Stopwatch functions
  const toggleStopwatch = () => {
    setIsStopwatchRunning(!isStopwatchRunning);
    trackToolUsage('stopwatch-timer', isStopwatchRunning ? 'stopwatch-pause' : 'stopwatch-start');
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    
    // Save session if there was meaningful time
    if (stopwatchTime > 1000) {
      const session: StopwatchSession = {
        id: Date.now().toString(),
        name: `Session ${new Date().toLocaleString()}`,
        totalTime: stopwatchTime,
        laps,
        createdAt: new Date(),
        completedAt: new Date(),
      };
      setStopwatchHistory(prev => [session, ...prev.slice(0, 49)]);
    }
    
    setStopwatchTime(0);
    setLaps([]);
    trackToolUsage('stopwatch-timer', 'stopwatch-reset', { totalTime: stopwatchTime, laps: laps.length });
  };

  const addLap = () => {
    if (stopwatchTime > 0) {
      const lapTime = laps.length > 0 ? stopwatchTime - laps[laps.length - 1].totalTime : stopwatchTime;
      const newLap: LapTime = {
        lapNumber: laps.length + 1,
        lapTime,
        totalTime: stopwatchTime,
        timestamp: new Date(),
      };
      setLaps(prev => [...prev, newLap]);
      trackToolUsage('stopwatch-timer', 'lap-added', { lapNumber: newLap.lapNumber });
    }
  };

  // Timer functions
  const addTimer = () => {
    if (!newTimerName.trim()) {
      showError('Please enter a timer name');
      return;
    }

    const totalSeconds = (newTimerHours * 3600) + (newTimerMinutes * 60) + newTimerSeconds;
    if (totalSeconds <= 0) {
      showError('Please set a valid duration');
      return;
    }

    const newTimer: TimerSession = {
      id: Date.now().toString(),
      name: newTimerName.trim(),
      duration: totalSeconds,
      timeLeft: totalSeconds,
      isActive: false,
      createdAt: new Date(),
    };

    setTimers(prev => [...prev, newTimer]);
    setNewTimerName('');
    setNewTimerHours(0);
    setNewTimerMinutes(5);
    setNewTimerSeconds(0);
    setShowAddTimer(false);
    showSuccess(`Timer "${newTimer.name}" added`);
    trackToolUsage('stopwatch-timer', 'timer-added', { duration: totalSeconds });
  };

  const toggleTimer = (timerId: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === timerId 
        ? { ...timer, isActive: !timer.isActive }
        : timer
    ));
  };

  const resetTimer = (timerId: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === timerId 
        ? { ...timer, timeLeft: timer.duration, isActive: false }
        : timer
    ));
  };

  const removeTimer = (timerId: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== timerId));
    const interval = timerIntervalsRef.current.get(timerId);
    if (interval) {
      clearInterval(interval);
      timerIntervalsRef.current.delete(timerId);
    }
  };

  // Utility functions
  const formatTime = (milliseconds: number, showMilliseconds: boolean = false) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    if (hours > 0) {
      return showMilliseconds 
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
        : `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return showMilliseconds 
      ? `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimerTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerProgress = (timer: TimerSession) => {
    return ((timer.duration - timer.timeLeft) / timer.duration) * 100;
  };

  const getBestLap = () => {
    if (laps.length === 0) return null;
    return laps.reduce((best, lap) => lap.lapTime < best.lapTime ? lap : best);
  };

  const getWorstLap = () => {
    if (laps.length === 0) return null;
    return laps.reduce((worst, lap) => lap.lapTime > worst.lapTime ? lap : worst);
  };

  const bestLap = getBestLap();
  const worstLap = getWorstLap();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="Stopwatch & Timer - BrainDead"
        description="Precise stopwatch with lap times and multiple countdown timers. Perfect for workouts, cooking, and time management."
        canonical="/stopwatch-timer"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${
          activeTab === 'stopwatch' ? 'from-green-500 to-teal-600' : 'from-orange-500 to-red-600'
        } rounded-2xl mb-6 shadow-lg`}>
          {activeTab === 'stopwatch' ? (
            <Timer className="w-8 h-8 text-white" />
          ) : (
            <Timer className="w-8 h-8 text-white" />
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent mb-4">
          Stopwatch & Timer
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Time things because time is money (apparently).
          <span className="text-green-400"> Precision timing without the Olympic pressure!</span>
        </p>
        
        {/* Tab Selector */}
        <div className="flex justify-center mt-6">
          <div className="bg-gray-800/50 rounded-xl p-1 border border-gray-700">
            <button
              onClick={() => setActiveTab('stopwatch')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'stopwatch'
                  ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stopwatch
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'timer'
                  ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Timer
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'stopwatch' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Stopwatch */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8">
              {/* Stopwatch Display */}
              <div className="text-center mb-8">
                <div className="text-6xl md:text-8xl font-mono font-bold text-white mb-4">
                  {formatTime(stopwatchTime, true)}
                </div>
                
                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={toggleStopwatch}
                    className={`flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg ${
                      isStopwatchRunning
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
                        : 'bg-gradient-to-br from-green-500 to-teal-600 text-white'
                    }`}
                  >
                    {isStopwatchRunning ? (
                      <>
                        <Pause className="w-6 h-6 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-2" />
                        Start
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={addLap}
                    disabled={stopwatchTime === 0}
                    className="flex items-center px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Flag className="w-5 h-5 mr-2" />
                    Lap
                  </button>
                  
                  <button
                    onClick={resetStopwatch}
                    className="flex items-center px-6 py-4 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 font-semibold transition-all hover:scale-105"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Lap Statistics */}
              {laps.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="text-green-400 text-sm font-semibold mb-1">Best Lap</div>
                    <div className="text-white font-mono text-lg">
                      Lap {bestLap?.lapNumber}: {formatTime(bestLap?.lapTime || 0, true)}
                    </div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="text-red-400 text-sm font-semibold mb-1">Slowest Lap</div>
                    <div className="text-white font-mono text-lg">
                      Lap {worstLap?.lapNumber}: {formatTime(worstLap?.lapTime || 0, true)}
                    </div>
                  </div>
                </div>
              )}

              {/* Lap Times */}
              {laps.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-bold text-white mb-4">Lap Times</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {laps.slice().reverse().map((lap, index) => (
                      <div
                        key={lap.lapNumber}
                        className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                          lap === bestLap ? 'bg-green-500/10 border border-green-500/20' :
                          lap === worstLap ? 'bg-red-500/10 border border-red-500/20' :
                          'bg-gray-800/50'
                        }`}
                      >
                        <span className="text-gray-400">Lap {lap.lapNumber}</span>
                        <div className="text-right">
                          <div className="text-white font-mono">{formatTime(lap.lapTime, true)}</div>
                          <div className="text-gray-500 text-xs">{formatTime(lap.totalTime, true)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stopwatch History */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                Recent Sessions
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stopwatchHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No sessions yet.<br />
                    <span className="text-sm">Start timing to see history!</span>
                  </p>
                ) : (
                  stopwatchHistory.slice(0, 10).map((session, index) => (
                    <div
                      key={session.id}
                      className="bg-gray-800/50 rounded-lg p-3 text-sm hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-mono">{formatTime(session.totalTime, true)}</span>
                        <span className="text-green-400 text-xs">{session.laps.length} laps</span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(session.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {stopwatchHistory.length > 0 && (
                <button
                  onClick={() => setStopwatchHistory([])}
                  className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Timers */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8">
              {/* Add Timer Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Active Timers</h2>
                <button
                  onClick={() => setShowAddTimer(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-br from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-400 hover:to-red-500 transition-all hover:scale-105 shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Timer
                </button>
              </div>

              {/* Timers Grid */}
              {timers.length === 0 ? (
                <div className="text-center py-12">
                  <Timer className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No timers yet</h3>
                  <p className="text-gray-500 mb-6">
                    Add some timers to start counting down
                  </p>
                  <button
                    onClick={() => setShowAddTimer(true)}
                    className="px-6 py-3 bg-gradient-to-br from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-400 hover:to-red-500 transition-all hover:scale-105 shadow-lg"
                  >
                    Add Your First Timer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {timers.map((timer) => (
                    <div
                      key={timer.id}
                      className={`bg-gray-800/50 border rounded-2xl p-6 transition-all ${
                        timer.isActive ? 'border-orange-500/50 bg-orange-500/5' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{timer.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {formatTimerTime(timer.duration)} total
                          </p>
                        </div>
                        <button
                          onClick={() => removeTimer(timer.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress Ring */}
                      <div className="relative mb-4">
                        <svg className="w-32 h-32 mx-auto transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-gray-700"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - getTimerProgress(timer) / 100)}`}
                            className={`transition-all duration-1000 ease-out ${
                              timer.timeLeft <= 10 ? 'text-red-400' : 'text-orange-400'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-2xl font-mono font-bold mb-1 ${
                              timer.timeLeft <= 10 ? 'text-red-400' : 'text-white'
                            }`}>
                              {formatTimerTime(timer.timeLeft)}
                            </div>
                            <div className={`text-xs ${
                              timer.isActive ? 'text-orange-400' : 'text-gray-500'
                            }`}>
                              {timer.isActive ? 'Running' : 'Paused'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timer Controls */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleTimer(timer.id)}
                          className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg font-semibold text-sm transition-all hover:scale-105 ${
                            timer.isActive
                              ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400'
                              : 'bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400'
                          }`}
                        >
                          {timer.isActive ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => resetTimer(timer.id)}
                          className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg text-gray-300 text-sm transition-all hover:scale-105"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timer Settings & History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Settings */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-white text-sm">Sound notifications</span>
              </label>
            </div>

            {/* Timer History */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-400" />
                Recent Timers
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {timerHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No completed timers yet.
                  </p>
                ) : (
                  timerHistory.slice(0, 10).map((timer, index) => (
                    <div
                      key={timer.id}
                      className="bg-gray-800/50 rounded-lg p-3 text-sm hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white font-semibold">{timer.name}</span>
                        <span className="text-orange-400 text-xs">{formatTimerTime(timer.duration)}</span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {timer.completedAt && new Date(timer.completedAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {timerHistory.length > 0 && (
                <button
                  onClick={() => setTimerHistory([])}
                  className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Timer Modal */}
      {showAddTimer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Timer</h2>
              <button
                onClick={() => setShowAddTimer(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Timer Name
                </label>
                <input
                  type="text"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  placeholder="e.g., Workout, Cooking, Break"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Hours</label>
                    <input
                      type="number"
                      value={newTimerHours}
                      onChange={(e) => setNewTimerHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      min="0"
                      max="23"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Minutes</label>
                    <input
                      type="number"
                      value={newTimerMinutes}
                      onChange={(e) => setNewTimerMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      min="0"
                      max="59"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Seconds</label>
                    <input
                      type="number"
                      value={newTimerSeconds}
                      onChange={(e) => setNewTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      min="0"
                      max="59"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddTimer(false)}
                  className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={addTimer}
                  className="flex-1 px-4 py-3 bg-gradient-to-br from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-400 hover:to-red-500 transition-all hover:scale-105 shadow-lg"
                >
                  Add Timer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopwatchTimerPage;