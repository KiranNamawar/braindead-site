import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Timer, Coffee, Target, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface PomodoroSession {
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: Date;
  interrupted: boolean;
}

interface PomodoroStats {
  totalSessions: number;
  totalWorkTime: number;
  totalBreakTime: number;
  longestStreak: number;
  currentStreak: number;
  todaySessions: number;
  weekSessions: number;
}

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  notificationsEnabled: true,
};

const PomodoroTimerPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
    STORAGE_KEYS.pomodoroSettings, 
    DEFAULT_SETTINGS
  );
  const [history, setHistory] = useLocalStorage<PomodoroSession[]>(
    STORAGE_KEYS.pomodoroHistory, 
    []
  );
  const [stats, setStats] = useLocalStorage<PomodoroStats>(
    STORAGE_KEYS.pomodoroStats,
    {
      totalSessions: 0,
      totalWorkTime: 0,
      totalBreakTime: 0,
      longestStreak: 0,
      currentStreak: 0,
      todaySessions: 0,
      weekSessions: 0,
    }
  );

  const { showSuccess, showInfo, showError } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
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
  }, [isActive, timeLeft]);

  // Update document title with timer
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const sessionType = currentSession === 'work' ? '🍅' : '☕';
    document.title = `${sessionType} ${timeString} - Pomodoro Timer`;

    return () => {
      document.title = 'BrainDead - Pomodoro Timer';
    };
  }, [timeLeft, currentSession]);

  const playNotificationSound = useCallback(() => {
    if (settings.soundEnabled && audioRef.current) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = currentSession === 'work' ? 800 : 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  }, [settings.soundEnabled, currentSession]);

  const showNotification = useCallback((title: string, body: string) => {
    if (settings.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.svg' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.svg' });
          }
        });
      }
    }
  }, [settings.notificationsEnabled]);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
    playNotificationSound();

    const session: PomodoroSession = {
      type: currentSession,
      duration: getCurrentSessionDuration(),
      completedAt: new Date(),
      interrupted: false,
    };

    setHistory(prev => [session, ...prev.slice(0, 99)]); // Keep last 100 sessions

    // Update stats
    const newStats = { ...stats };
    newStats.totalSessions++;
    
    if (currentSession === 'work') {
      newStats.totalWorkTime += getCurrentSessionDuration();
      newStats.currentStreak++;
      newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak);
      setCompletedSessions(prev => prev + 1);
      
      showNotification('Work Session Complete!', 'Time for a well-deserved break!');
      showSuccess('Work session completed! Time for a break.');
    } else {
      newStats.totalBreakTime += getCurrentSessionDuration();
      showNotification('Break Complete!', 'Ready to get back to work?');
      showSuccess('Break completed! Ready for another work session?');
    }

    // Update daily/weekly stats
    const today = new Date().toDateString();
    const lastSessionDate = history[0]?.completedAt ? new Date(history[0].completedAt).toDateString() : '';
    if (today !== lastSessionDate) {
      newStats.todaySessions = 1;
    } else {
      newStats.todaySessions++;
    }

    setStats(newStats);

    // Auto-transition to next session
    if (currentSession === 'work') {
      const isLongBreak = completedSessions > 0 && (completedSessions + 1) % settings.longBreakInterval === 0;
      const nextSession = isLongBreak ? 'longBreak' : 'shortBreak';
      setCurrentSession(nextSession);
      setTimeLeft(getSessionDuration(nextSession));
      
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsActive(true), 1000);
      }
    } else {
      setCurrentSession('work');
      setTimeLeft(getSessionDuration('work'));
      
      if (settings.autoStartWork) {
        setTimeout(() => setIsActive(true), 1000);
      }
    }

    trackToolUsage('pomodoro-timer', 'session-complete', {
      sessionType: currentSession,
      duration: getCurrentSessionDuration(),
      completedSessions: completedSessions + (currentSession === 'work' ? 1 : 0),
    });
  }, [currentSession, completedSessions, settings, stats, history, playNotificationSound, showNotification, showSuccess]);

  const getCurrentSessionDuration = () => {
    switch (currentSession) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
      default: return settings.workDuration;
    }
  };

  const getSessionDuration = (session: 'work' | 'shortBreak' | 'longBreak') => {
    switch (session) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
      default: return settings.workDuration * 60;
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      trackToolUsage('pomodoro-timer', 'start', { sessionType: currentSession });
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getSessionDuration(currentSession));
    
    if (isActive) {
      // Mark as interrupted if timer was running
      const session: PomodoroSession = {
        type: currentSession,
        duration: getCurrentSessionDuration() - Math.floor(timeLeft / 60),
        completedAt: new Date(),
        interrupted: true,
      };
      setHistory(prev => [session, ...prev.slice(0, 99)]);
    }
    
    trackToolUsage('pomodoro-timer', 'reset', { sessionType: currentSession });
  };

  const switchSession = (session: 'work' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setCurrentSession(session);
    setTimeLeft(getSessionDuration(session));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work': return 'from-red-500 to-orange-600';
      case 'shortBreak': return 'from-green-500 to-teal-600';
      case 'longBreak': return 'from-blue-500 to-purple-600';
      default: return 'from-red-500 to-orange-600';
    }
  };

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work': return Timer;
      case 'shortBreak': return Coffee;
      case 'longBreak': return Target;
      default: return Timer;
    }
  };

  const SessionIcon = getSessionIcon();
  const progress = ((getSessionDuration(currentSession) - timeLeft) / getSessionDuration(currentSession)) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="Pomodoro Timer - BrainDead"
        description="Boost productivity with the Pomodoro Technique. Customizable work/break cycles, session tracking, and focus statistics."
        canonical="/pomodoro-timer"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getSessionColor()} rounded-2xl mb-6 shadow-lg`}>
          <SessionIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
          Pomodoro Timer
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Procrastinate more efficiently with the Pomodoro Technique.
          <span className="text-red-400"> 25 minutes of focus, 5 minutes of guilt-free scrolling!</span>
        </p>
        
        {/* Session Info */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
            <span>Session {completedSessions + 1}</span>
          </div>
          <div className="flex items-center text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>{stats.todaySessions} completed today</span>
          </div>
          <div className="flex items-center text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>Streak: {stats.currentStreak}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8">
            {/* Session Selector */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => switchSession('work')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                  currentSession === 'work'
                    ? 'bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                Work ({settings.workDuration}m)
              </button>
              <button
                onClick={() => switchSession('shortBreak')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                  currentSession === 'shortBreak'
                    ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                Short Break ({settings.shortBreakDuration}m)
              </button>
              <button
                onClick={() => switchSession('longBreak')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                  currentSession === 'longBreak'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                Long Break ({settings.longBreakDuration}m)
              </button>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                {/* Progress Ring */}
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className={`transition-all duration-1000 ease-out ${
                      currentSession === 'work' ? 'text-red-400' :
                      currentSession === 'shortBreak' ? 'text-green-400' : 'text-blue-400'
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Time Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-mono font-bold text-white mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className={`text-lg font-semibold capitalize ${
                      currentSession === 'work' ? 'text-red-400' :
                      currentSession === 'shortBreak' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {currentSession === 'shortBreak' ? 'Short Break' : 
                       currentSession === 'longBreak' ? 'Long Break' : 'Work'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={toggleTimer}
                className={`flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg ${
                  isActive
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white'
                    : `bg-gradient-to-br ${getSessionColor()} text-white`
                }`}
              >
                {isActive ? (
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
                onClick={resetTimer}
                className="flex items-center px-6 py-4 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 font-semibold transition-all hover:scale-105"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center px-6 py-4 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 font-semibold transition-all hover:scale-105"
              >
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50 mb-6">
                <h3 className="text-xl font-bold text-white mb-6">Timer Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Work Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.workDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                      min="1"
                      max="60"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Short Break (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 5 }))}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                      min="1"
                      max="30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Long Break (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      min="1"
                      max="60"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Long Break Interval
                    </label>
                    <input
                      type="number"
                      value={settings.longBreakInterval}
                      onChange={(e) => setSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) || 4 }))}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      min="2"
                      max="10"
                    />
                    <p className="text-gray-400 text-xs mt-1">Work sessions before long break</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                      className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-white text-sm">Auto-start breaks</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoStartWork}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartWork: e.target.checked }))}
                      className="w-4 h-4 text-red-500 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-white text-sm">Auto-start work</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                      className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-white text-sm">Sound notifications</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notificationsEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                      className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-white text-sm">Browser notifications</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats & History */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Productivity Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Total Sessions:</span>
                <span className="text-white font-bold">{stats.totalSessions}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Focus Time:</span>
                <span className="text-red-400 font-bold">{formatDuration(stats.totalWorkTime)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Break Time:</span>
                <span className="text-green-400 font-bold">{formatDuration(stats.totalBreakTime)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Current Streak:</span>
                <span className="text-blue-400 font-bold">{stats.currentStreak}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Best Streak:</span>
                <span className="text-purple-400 font-bold">{stats.longestStreak}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Today:</span>
                <span className="text-yellow-400 font-bold">{stats.todaySessions}</span>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
              Recent Sessions
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No sessions yet.<br />
                  <span className="text-sm">Start your first Pomodoro!</span>
                </p>
              ) : (
                history.slice(0, 10).map((session, index) => (
                  <div
                    key={index}
                    className={`bg-gray-800/50 rounded-lg p-3 text-sm border-l-4 ${
                      session.type === 'work' ? 'border-red-400' :
                      session.type === 'shortBreak' ? 'border-green-400' : 'border-blue-400'
                    } ${session.interrupted ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold capitalize ${
                        session.type === 'work' ? 'text-red-400' :
                        session.type === 'shortBreak' ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {session.type === 'shortBreak' ? 'Short Break' : 
                         session.type === 'longBreak' ? 'Long Break' : 'Work'}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatDuration(session.duration)}
                        {session.interrupted && ' (interrupted)'}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(session.completedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🍅 Pomodoro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• <strong>Focus:</strong> Single-task during work sessions</li>
              <li>• <strong>Breaks:</strong> Step away from your screen</li>
              <li>• <strong>Distractions:</strong> Write them down for later</li>
              <li>• <strong>Interruptions:</strong> Reset and start fresh</li>
              <li>• <strong>Long breaks:</strong> Take a walk or stretch</li>
              <li>• <strong>Consistency:</strong> Same time, same place</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimerPage;